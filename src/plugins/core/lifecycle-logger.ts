import type {
  Plugin,
  Kernel,
  MountEvent,
  UnmountEvent,
  UpdateEvent,
  LifecycleLoggerAPI,
  LifecycleRecord,
} from '../../types'

/**
 * Component lifecycle data
 */
interface ComponentLifecycle {
  componentId: string
  componentName: string
  mountTime: number
  unmountTime: number | null
  updateCount: number
  history: LifecycleRecord[]
}

/**
 * Creates the lifecycle-logger plugin
 * Tracks mount, unmount, and update events for components
 */
export function lifecycleLogger(): Plugin & { api: LifecycleLoggerAPI } {
  const components = new Map<string, ComponentLifecycle>()
  let kernel: Kernel | null = null

  const api: LifecycleLoggerAPI = {
    getMountTime(componentId: string): number | null {
      return components.get(componentId)?.mountTime ?? null
    },

    getUnmountTime(componentId: string): number | null {
      return components.get(componentId)?.unmountTime ?? null
    },

    getLifetime(componentId: string): number | null {
      const component = components.get(componentId)
      if (!component) return null
      const endTime = component.unmountTime ?? Date.now()
      return endTime - component.mountTime
    },

    getUpdateCount(componentId: string): number {
      return components.get(componentId)?.updateCount ?? 0
    },

    isCurrentlyMounted(componentId: string): boolean {
      const component = components.get(componentId)
      return component !== undefined && component.unmountTime === null
    },

    getLifecycleHistory(componentId: string): LifecycleRecord[] {
      return components.get(componentId)?.history ?? []
    },
  }

  const plugin: Plugin = {
    name: 'lifecycle-logger',
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
        const lifecycle: ComponentLifecycle = {
          componentId: event.componentId,
          componentName: event.componentName,
          mountTime: event.timestamp,
          unmountTime: null,
          updateCount: 0,
          history: [
            {
              type: 'mount',
              timestamp: event.timestamp,
              details: `Mounted with ${Object.keys(event.props).length} props`,
            },
          ],
        }
        components.set(event.componentId, lifecycle)
      },

      onUnmount(event: UnmountEvent): void {
        const component = components.get(event.componentId)
        if (component) {
          component.unmountTime = event.timestamp
          component.history.push({
            type: 'unmount',
            timestamp: event.timestamp,
            details: `Unmounted after ${event.lifetime}ms`,
          })
        }
      },

      onUpdate(event: UpdateEvent): void {
        const component = components.get(event.componentId)
        if (component) {
          component.updateCount++
          component.history.push({
            type: 'update',
            timestamp: event.timestamp,
            details: `Update #${event.renderCount} (${event.reason})`,
          })
        }
      },
    },
  }

  return plugin as Plugin & { api: LifecycleLoggerAPI }
}
