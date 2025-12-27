import { describe, it, expect, vi, beforeEach } from 'vitest'
import { stateTracker } from '../../../../src/plugins/core/state-tracker'
import type { Kernel, MountEvent, StateChangeEvent } from '../../../../src/types'

describe('stateTracker plugin', () => {
  let plugin: ReturnType<typeof stateTracker>
  let mockKernel: Kernel

  beforeEach(() => {
    plugin = stateTracker()
    mockKernel = {
      register: vi.fn(),
      unregister: vi.fn(),
      emit: vi.fn(),
      getLogs: vi.fn(),
    } as unknown as Kernel
  })

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('state-tracker')
    })

    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0.0')
    })

    it('should be a core plugin', () => {
      expect(plugin.type).toBe('core')
    })
  })

  describe('install/uninstall', () => {
    it('should install plugin', () => {
      plugin.install(mockKernel)
    })

    it('should uninstall and clear data', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: {},
        initialState: { count: 0 },
      }
      plugin.hooks?.onMount?.(mountEvent)

      expect(plugin.api.getCurrentState('comp-1')).not.toBeNull()

      plugin.uninstall()

      expect(plugin.api.getCurrentState('comp-1')).toBeNull()
    })
  })

  describe('onMount hook', () => {
    it('should record initial state', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: {},
        initialState: { count: 0, name: 'test' },
      }
      plugin.hooks?.onMount?.(mountEvent)

      const state = plugin.api.getCurrentState('comp-1')
      expect(state).not.toBeNull()
      expect(state!.hooks).toHaveLength(2)
    })

    it('should handle empty initial state', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: {},
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      const state = plugin.api.getCurrentState('comp-1')
      expect(state).not.toBeNull()
      expect(state!.hooks).toHaveLength(0)
    })

    it('should handle non-object initial state', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: {},
        initialState: 'not-an-object' as unknown as Record<string, unknown>,
      }
      plugin.hooks?.onMount?.(mountEvent)

      const state = plugin.api.getCurrentState('comp-1')
      expect(state).not.toBeNull()
      expect(state!.hooks).toHaveLength(0)
    })

    it('should create initial history entry when state exists', () => {
      plugin.install(mockKernel)
      const timestamp = Date.now()

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp,
        props: {},
        initialState: { count: 0 },
      }
      plugin.hooks?.onMount?.(mountEvent)

      const history = plugin.api.getStateHistory('comp-1')
      expect(history).toHaveLength(1)
      expect(history[0].timestamp).toBe(timestamp)
    })

    it('should not create history entry when no initial state', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: {},
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      const history = plugin.api.getStateHistory('comp-1')
      expect(history).toHaveLength(0)
    })
  })

  describe('onStateChange hook', () => {
    it('should update hook state', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: {},
        initialState: { count: 0 },
      }
      plugin.hooks?.onMount?.(mountEvent)

      const stateChangeEvent: StateChangeEvent = {
        type: 'state-change',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        hookIndex: 0,
        hookType: 'useState',
        prevState: 0,
        nextState: 1,
      }
      plugin.hooks?.onStateChange?.(stateChangeEvent)

      expect(plugin.api.getHookState('comp-1', 0)).toBe(1)
    })

    it('should add new hook state', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: {},
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      const stateChangeEvent: StateChangeEvent = {
        type: 'state-change',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        hookIndex: 0,
        hookType: 'useState',
        prevState: null,
        nextState: 'initial',
      }
      plugin.hooks?.onStateChange?.(stateChangeEvent)

      expect(plugin.api.getHookState('comp-1', 0)).toBe('initial')
    })

    it('should increment change count', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: {},
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      expect(plugin.api.getStateChangeCount('comp-1')).toBe(0)

      for (let i = 0; i < 5; i++) {
        const stateChangeEvent: StateChangeEvent = {
          type: 'state-change',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          hookIndex: 0,
          hookType: 'useState',
          prevState: i,
          nextState: i + 1,
        }
        plugin.hooks?.onStateChange?.(stateChangeEvent)
      }

      expect(plugin.api.getStateChangeCount('comp-1')).toBe(5)
    })

    it('should add to history', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: {},
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      const stateChangeEvent: StateChangeEvent = {
        type: 'state-change',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        hookIndex: 0,
        hookType: 'useState',
        prevState: 0,
        nextState: 1,
      }
      plugin.hooks?.onStateChange?.(stateChangeEvent)

      const history = plugin.api.getStateHistory('comp-1')
      expect(history).toHaveLength(1)
      expect(history[0].hooks[0].value).toBe(1)
      expect(history[0].hooks[0].prevValue).toBe(0)
    })

    it('should handle useReducer hook type', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: {},
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      const stateChangeEvent: StateChangeEvent = {
        type: 'state-change',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        hookIndex: 0,
        hookType: 'useReducer',
        prevState: { count: 0 },
        nextState: { count: 1 },
      }
      plugin.hooks?.onStateChange?.(stateChangeEvent)

      const state = plugin.api.getCurrentState('comp-1')
      expect(state!.hooks[0].type).toBe('useReducer')
    })

    it('should ignore state change for unknown component', () => {
      plugin.install(mockKernel)

      const stateChangeEvent: StateChangeEvent = {
        type: 'state-change',
        componentId: 'unknown',
        componentName: 'Unknown',
        timestamp: Date.now(),
        hookIndex: 0,
        hookType: 'useState',
        prevState: 0,
        nextState: 1,
      }
      plugin.hooks?.onStateChange?.(stateChangeEvent)

      expect(plugin.api.getCurrentState('unknown')).toBeNull()
    })
  })

  describe('API methods', () => {
    describe('getCurrentState', () => {
      it('should return current state snapshot', () => {
        plugin.install(mockKernel)

        const mountEvent: MountEvent = {
          type: 'mount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          props: {},
          initialState: { count: 0, name: 'test' },
        }
        plugin.hooks?.onMount?.(mountEvent)

        const state = plugin.api.getCurrentState('comp-1')
        expect(state).not.toBeNull()
        expect(state!.hooks).toHaveLength(2)
        expect(state!.timestamp).toBeGreaterThan(0)
      })

      it('should return null for unknown component', () => {
        plugin.install(mockKernel)
        expect(plugin.api.getCurrentState('unknown')).toBeNull()
      })
    })

    describe('getStateHistory', () => {
      it('should return state history', () => {
        plugin.install(mockKernel)

        const mountEvent: MountEvent = {
          type: 'mount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          props: {},
          initialState: { count: 0 },
        }
        plugin.hooks?.onMount?.(mountEvent)

        const stateChangeEvent: StateChangeEvent = {
          type: 'state-change',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          hookIndex: 0,
          hookType: 'useState',
          prevState: 0,
          nextState: 1,
        }
        plugin.hooks?.onStateChange?.(stateChangeEvent)

        const history = plugin.api.getStateHistory('comp-1')
        expect(history).toHaveLength(2) // Initial + change
      })

      it('should return empty array for unknown component', () => {
        plugin.install(mockKernel)
        expect(plugin.api.getStateHistory('unknown')).toEqual([])
      })
    })

    describe('getHookState', () => {
      it('should return hook state by index', () => {
        plugin.install(mockKernel)

        const mountEvent: MountEvent = {
          type: 'mount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          props: {},
          initialState: { count: 42, name: 'hello' },
        }
        plugin.hooks?.onMount?.(mountEvent)

        expect(plugin.api.getHookState('comp-1', 0)).toBe(42)
        expect(plugin.api.getHookState('comp-1', 1)).toBe('hello')
      })

      it('should return undefined for unknown hook index', () => {
        plugin.install(mockKernel)

        const mountEvent: MountEvent = {
          type: 'mount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          props: {},
          initialState: { count: 0 },
        }
        plugin.hooks?.onMount?.(mountEvent)

        expect(plugin.api.getHookState('comp-1', 99)).toBeUndefined()
      })

      it('should return undefined for unknown component', () => {
        plugin.install(mockKernel)
        expect(plugin.api.getHookState('unknown', 0)).toBeUndefined()
      })
    })

    describe('getStateChangeCount', () => {
      it('should return state change count', () => {
        plugin.install(mockKernel)

        const mountEvent: MountEvent = {
          type: 'mount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          props: {},
          initialState: {},
        }
        plugin.hooks?.onMount?.(mountEvent)

        for (let i = 0; i < 3; i++) {
          const stateChangeEvent: StateChangeEvent = {
            type: 'state-change',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            hookIndex: 0,
            hookType: 'useState',
            prevState: i,
            nextState: i + 1,
          }
          plugin.hooks?.onStateChange?.(stateChangeEvent)
        }

        expect(plugin.api.getStateChangeCount('comp-1')).toBe(3)
      })

      it('should return 0 for unknown component', () => {
        plugin.install(mockKernel)
        expect(plugin.api.getStateChangeCount('unknown')).toBe(0)
      })
    })
  })
})
