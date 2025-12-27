import type {
  Plugin,
  Kernel,
  EffectRunEvent,
  EffectCleanupEvent,
  EffectTrackerAPI,
  EffectRecord,
} from '../../types'

/**
 * Component effect data
 */
interface ComponentEffects {
  componentId: string
  componentName: string
  activeEffects: Set<number>
  effectRunCounts: Map<number, number>
  effectDependencies: Map<number, unknown[]>
  history: EffectRecord[]
}

/**
 * Creates the effect-tracker plugin
 * Tracks useEffect and useLayoutEffect execution
 */
export function effectTracker(): Plugin & { api: EffectTrackerAPI } {
  const components = new Map<string, ComponentEffects>()
  let kernel: Kernel | null = null

  const api: EffectTrackerAPI = {
    getEffectHistory(componentId: string): EffectRecord[] {
      return components.get(componentId)?.history ?? []
    },

    getEffectRunCount(componentId: string, effectIndex: number): number {
      const component = components.get(componentId)
      if (!component) return 0
      return component.effectRunCounts.get(effectIndex) ?? 0
    },

    getActiveEffects(componentId: string): number[] {
      const component = components.get(componentId)
      if (!component) return []
      return Array.from(component.activeEffects)
    },

    getEffectDependencies(componentId: string, effectIndex: number): unknown[] {
      const component = components.get(componentId)
      if (!component) return []
      return component.effectDependencies.get(effectIndex) ?? []
    },
  }

  function ensureComponent(componentId: string, componentName: string): ComponentEffects {
    let component = components.get(componentId)
    if (!component) {
      component = {
        componentId,
        componentName,
        activeEffects: new Set(),
        effectRunCounts: new Map(),
        effectDependencies: new Map(),
        history: [],
      }
      components.set(componentId, component)
    }
    return component
  }

  const plugin: Plugin = {
    name: 'effect-tracker',
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
      onEffectRun(event: EffectRunEvent): void {
        const component = ensureComponent(event.componentId, event.componentName)

        // Update active effects
        component.activeEffects.add(event.effectIndex)

        // Update run count
        const currentCount = component.effectRunCounts.get(event.effectIndex) ?? 0
        component.effectRunCounts.set(event.effectIndex, currentCount + 1)

        // Update dependencies
        component.effectDependencies.set(event.effectIndex, event.dependencies)

        // Determine reason
        const isMount = currentCount === 0
        const reason = isMount ? 'mount' : 'deps-change'

        // Add to history
        component.history.push({
          timestamp: event.timestamp,
          effectIndex: event.effectIndex,
          action: 'run',
          dependencies: event.dependencies,
          dependenciesChanged: event.dependenciesChanged,
          reason,
        })
      },

      onEffectCleanup(event: EffectCleanupEvent): void {
        const component = components.get(event.componentId)
        if (!component) return

        // Remove from active effects
        component.activeEffects.delete(event.effectIndex)

        // Add to history
        component.history.push({
          timestamp: event.timestamp,
          effectIndex: event.effectIndex,
          action: 'cleanup',
          dependencies: component.effectDependencies.get(event.effectIndex) ?? [],
          dependenciesChanged: [],
          reason: event.reason,
        })
      },
    },
  }

  return plugin as Plugin & { api: EffectTrackerAPI }
}
