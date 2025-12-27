import type {
  Plugin,
  Kernel,
  MountEvent,
  UpdateEvent,
  RenderTimerOptions,
  RenderTimerAPI,
  RenderTimeStats,
  RenderTimeRecord,
} from '../../types'

/**
 * Component render time data
 */
interface ComponentRenderData {
  componentId: string
  componentName: string
  renderTimes: number[]
  lastRenderStart: number
  stats: RenderTimeStats
}

/**
 * Default options for render timer
 */
const DEFAULT_OPTIONS: RenderTimerOptions = {
  warnThreshold: 16, // One frame at 60fps
  errorThreshold: 50,
}

/**
 * Creates the render-timer plugin
 * Measures render duration
 */
export function renderTimer(
  userOptions: Partial<RenderTimerOptions> = {}
): Plugin & { api: RenderTimerAPI } {
  const options: RenderTimerOptions = { ...DEFAULT_OPTIONS, ...userOptions }
  const components = new Map<string, ComponentRenderData>()
  const allRenders: RenderTimeRecord[] = []

  function updateStats(data: ComponentRenderData): void {
    const times = data.renderTimes
    if (times.length === 0) {
      data.stats = {
        count: 0,
        total: 0,
        average: 0,
        min: 0,
        max: 0,
        last: 0,
      }
      return
    }

    const total = times.reduce((sum, t) => sum + t, 0)
    const min = Math.min(...times)
    const max = Math.max(...times)
    const last = times[times.length - 1] ?? 0

    data.stats = {
      count: times.length,
      total,
      average: total / times.length,
      min,
      max,
      last,
    }
  }

  function recordRender(
    componentId: string,
    componentName: string,
    duration: number,
    timestamp: number
  ): void {
    let data = components.get(componentId)
    if (!data) {
      data = {
        componentId,
        componentName,
        renderTimes: [],
        lastRenderStart: 0,
        stats: {
          count: 0,
          total: 0,
          average: 0,
          min: 0,
          max: 0,
          last: 0,
        },
      }
      components.set(componentId, data)
    }

    data.renderTimes.push(duration)
    updateStats(data)

    // Keep global record
    allRenders.push({
      componentId,
      componentName,
      duration,
      timestamp,
    })

    // Trim global renders to prevent memory issues
    if (allRenders.length > 1000) {
      allRenders.splice(0, 100)
    }

    // Log warning if render is slow
    if (duration >= options.errorThreshold) {
      console.warn(
        `[ReactLog] Slow render: ${componentName} took ${duration.toFixed(2)}ms (threshold: ${options.errorThreshold}ms)`
      )
    } else if (duration >= options.warnThreshold) {
      console.debug(
        `[ReactLog] Render warning: ${componentName} took ${duration.toFixed(2)}ms (threshold: ${options.warnThreshold}ms)`
      )
    }
  }

  const api: RenderTimerAPI = {
    getRenderTime(componentId: string): RenderTimeStats {
      const data = components.get(componentId)
      return (
        data?.stats ?? {
          count: 0,
          total: 0,
          average: 0,
          min: 0,
          max: 0,
          last: 0,
        }
      )
    },

    getSlowestRenders(limit: number = 10): RenderTimeRecord[] {
      return [...allRenders].sort((a, b) => b.duration - a.duration).slice(0, limit)
    },

    getAverageRenderTime(componentId: string): number {
      return components.get(componentId)?.stats.average ?? 0
    },

    getTotalRenderTime(componentId: string): number {
      return components.get(componentId)?.stats.total ?? 0
    },
  }

  const plugin: Plugin = {
    name: 'render-timer',
    version: '1.0.0',
    type: 'optional',

    install(_k: Kernel): void {
      // Plugin installed
    },

    uninstall(): void {
      components.clear()
      allRenders.length = 0
    },

    hooks: {
      onMount(event: MountEvent): void {
        // Record render start time
        const data: ComponentRenderData = {
          componentId: event.componentId,
          componentName: event.componentName,
          renderTimes: [],
          lastRenderStart: event.timestamp,
          stats: {
            count: 0,
            total: 0,
            average: 0,
            min: 0,
            max: 0,
            last: 0,
          },
        }
        components.set(event.componentId, data)

        // Calculate initial render time (approximate)
        const duration = Date.now() - event.timestamp
        if (duration > 0) {
          recordRender(event.componentId, event.componentName, duration, event.timestamp)
        }
      },

      onUpdate(event: UpdateEvent): void {
        const data = components.get(event.componentId)
        if (data) {
          // Calculate render time from last render start
          const duration = Date.now() - (data.lastRenderStart || event.timestamp)
          data.lastRenderStart = event.timestamp

          if (duration > 0 && duration < 10000) {
            // Sanity check
            recordRender(event.componentId, event.componentName, duration, event.timestamp)
          }
        }
      },
    },

    api: api as unknown as Record<string, unknown>,
  }

  return plugin as Plugin & { api: RenderTimerAPI }
}
