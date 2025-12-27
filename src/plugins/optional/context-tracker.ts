import type {
  Plugin,
  Kernel,
  ContextChangeEvent,
  ContextTrackerOptions,
  ContextTrackerAPI,
  ContextRecord,
} from '../../types'

/**
 * Component context data
 */
interface ComponentContext {
  componentId: string
  componentName: string
  contexts: Map<string, unknown>
  history: Map<string, ContextRecord[]>
}

/**
 * Default options for context tracker
 */
const DEFAULT_OPTIONS: ContextTrackerOptions = {
  contexts: undefined,
  trackAll: true,
}

/**
 * Creates the context-tracker plugin
 * Tracks useContext value changes
 */
export function contextTracker(
  userOptions: Partial<ContextTrackerOptions> = {}
): Plugin & { api: ContextTrackerAPI } {
  const options: ContextTrackerOptions = { ...DEFAULT_OPTIONS, ...userOptions }
  const components = new Map<string, ComponentContext>()
  const trackedContexts = new Set<string>()

  // Initialize tracked contexts from options
  if (options.contexts) {
    for (const ctx of options.contexts) {
      trackedContexts.add(ctx)
    }
  }

  function shouldTrack(contextName: string): boolean {
    if (options.trackAll) return true
    return trackedContexts.has(contextName)
  }

  const api: ContextTrackerAPI = {
    getContextValue(componentId: string, contextName: string): unknown {
      const component = components.get(componentId)
      return component?.contexts.get(contextName)
    },

    getContextHistory(componentId: string, contextName: string): ContextRecord[] {
      const component = components.get(componentId)
      return component?.history.get(contextName) ?? []
    },

    getTrackedContexts(): string[] {
      return Array.from(trackedContexts)
    },
  }

  const plugin: Plugin = {
    name: 'context-tracker',
    version: '1.0.0',
    type: 'optional',

    install(_k: Kernel): void {
      // Plugin installed
    },

    uninstall(): void {
      components.clear()
      trackedContexts.clear()
    },

    hooks: {
      onContextChange(event: ContextChangeEvent): void {
        if (!shouldTrack(event.contextName)) return

        // Track context name
        trackedContexts.add(event.contextName)

        // Ensure component exists
        let component = components.get(event.componentId)
        if (!component) {
          component = {
            componentId: event.componentId,
            componentName: event.componentName,
            contexts: new Map(),
            history: new Map(),
          }
          components.set(event.componentId, component)
        }

        // Update current context value
        component.contexts.set(event.contextName, event.nextValue)

        // Add to history
        let contextHistory = component.history.get(event.contextName)
        if (!contextHistory) {
          contextHistory = []
          component.history.set(event.contextName, contextHistory)
        }

        contextHistory.push({
          timestamp: event.timestamp,
          contextName: event.contextName,
          prevValue: event.prevValue,
          nextValue: event.nextValue,
        })
      },
    },

    api: api as unknown as Record<string, unknown>,
  }

  return plugin as Plugin & { api: ContextTrackerAPI }
}
