import type {
  Plugin,
  Kernel,
  MountEvent,
  StateChangeEvent,
  StateTrackerAPI,
  StateSnapshot,
  HookState,
} from '../../types'

/**
 * Component state data
 */
interface ComponentState {
  componentId: string
  componentName: string
  currentHooks: Map<number, HookState>
  history: StateSnapshot[]
  changeCount: number
}

/**
 * Creates the state-tracker plugin
 * Tracks useState and useReducer changes
 */
export function stateTracker(): Plugin & { api: StateTrackerAPI } {
  const components = new Map<string, ComponentState>()
  let kernel: Kernel | null = null

  const api: StateTrackerAPI = {
    getCurrentState(componentId: string): StateSnapshot | null {
      const component = components.get(componentId)
      if (!component) return null

      return {
        timestamp: Date.now(),
        hooks: Array.from(component.currentHooks.values()),
      }
    },

    getStateHistory(componentId: string): StateSnapshot[] {
      return components.get(componentId)?.history ?? []
    },

    getHookState(componentId: string, hookIndex: number): unknown {
      const component = components.get(componentId)
      if (!component) return undefined
      return component.currentHooks.get(hookIndex)?.value
    },

    getStateChangeCount(componentId: string): number {
      return components.get(componentId)?.changeCount ?? 0
    },
  }

  const plugin: Plugin = {
    name: 'state-tracker',
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
        const stateData: ComponentState = {
          componentId: event.componentId,
          componentName: event.componentName,
          currentHooks: new Map(),
          history: [],
          changeCount: 0,
        }

        // Initialize with initial state if provided
        const initialState = event.initialState
        if (initialState && typeof initialState === 'object') {
          let hookIndex = 0
          for (const [key, value] of Object.entries(initialState)) {
            stateData.currentHooks.set(hookIndex, {
              index: hookIndex,
              type: 'useState',
              value,
              prevValue: null,
            })
            hookIndex++
          }

          // Record initial snapshot
          if (stateData.currentHooks.size > 0) {
            stateData.history.push({
              timestamp: event.timestamp,
              hooks: Array.from(stateData.currentHooks.values()),
            })
          }
        }

        components.set(event.componentId, stateData)
      },

      onStateChange(event: StateChangeEvent): void {
        const component = components.get(event.componentId)
        if (!component) return

        // Update current hook state
        component.currentHooks.set(event.hookIndex, {
          index: event.hookIndex,
          type: event.hookType,
          value: event.nextState,
          prevValue: event.prevState,
        })

        component.changeCount++

        // Add to history
        component.history.push({
          timestamp: event.timestamp,
          hooks: Array.from(component.currentHooks.values()),
        })
      },
    },
  }

  return plugin as Plugin & { api: StateTrackerAPI }
}
