import type {
  Plugin,
  Kernel,
  MountEvent,
  PropsChangeEvent,
  PropsTrackerAPI,
  PropsSnapshot,
  PropChangeStats,
} from '../../types'

/**
 * Component props data
 */
interface ComponentProps {
  componentId: string
  componentName: string
  currentProps: Record<string, unknown>
  history: PropsSnapshot[]
  changeStats: Map<string, { count: number; lastChanged: number }>
}

/**
 * Creates the props-tracker plugin
 * Tracks all props changes with diff analysis
 */
export function propsTracker(): Plugin & { api: PropsTrackerAPI } {
  const components = new Map<string, ComponentProps>()
  let kernel: Kernel | null = null

  const api: PropsTrackerAPI = {
    getCurrentProps(componentId: string): Record<string, unknown> | null {
      return components.get(componentId)?.currentProps ?? null
    },

    getPropsHistory(componentId: string): PropsSnapshot[] {
      return components.get(componentId)?.history ?? []
    },

    getChangeCount(componentId: string): number {
      const component = components.get(componentId)
      if (!component) return 0
      return component.history.length - 1 // Subtract initial snapshot
    },

    getMostChangedProps(componentId: string, limit: number = 10): PropChangeStats[] {
      const component = components.get(componentId)
      if (!component) return []

      return Array.from(component.changeStats.entries())
        .map(([key, stats]) => ({
          key,
          changeCount: stats.count,
          lastChanged: stats.lastChanged,
        }))
        .sort((a, b) => b.changeCount - a.changeCount)
        .slice(0, limit)
    },
  }

  const plugin: Plugin = {
    name: 'props-tracker',
    version: '1.0.0',
    type: 'core',

    install(k: Kernel): void {
      kernel = k
    },

    uninstall(): void {
      kernel = null
      components.clear()
    },

    api: api as unknown as Record<string, unknown>,

    hooks: {
      onMount(event: MountEvent): void {
        const propsData: ComponentProps = {
          componentId: event.componentId,
          componentName: event.componentName,
          currentProps: { ...event.props },
          history: [
            {
              timestamp: event.timestamp,
              props: { ...event.props },
              changes: [],
            },
          ],
          changeStats: new Map(),
        }
        components.set(event.componentId, propsData)
      },

      onPropsChange(event: PropsChangeEvent): void {
        const component = components.get(event.componentId)
        if (!component) return

        // Update current props
        for (const change of event.changes) {
          if (change.nextValue === undefined) {
            delete component.currentProps[change.key]
          } else {
            component.currentProps[change.key] = change.nextValue
          }

          // Update change stats
          const stats = component.changeStats.get(change.key)
          if (stats) {
            stats.count++
            stats.lastChanged = event.timestamp
          } else {
            component.changeStats.set(change.key, {
              count: 1,
              lastChanged: event.timestamp,
            })
          }
        }

        // Add to history
        component.history.push({
          timestamp: event.timestamp,
          props: { ...component.currentProps },
          changes: event.changes,
        })
      },
    },
  }

  return plugin as Plugin & { api: PropsTrackerAPI }
}
