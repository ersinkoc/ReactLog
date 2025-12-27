import { describe, it, expect, vi, beforeEach } from 'vitest'
import { propsTracker } from '../../../../src/plugins/core/props-tracker'
import type { Kernel, MountEvent, PropsChangeEvent, PropChange } from '../../../../src/types'

describe('propsTracker plugin', () => {
  let plugin: ReturnType<typeof propsTracker>
  let mockKernel: Kernel

  beforeEach(() => {
    plugin = propsTracker()
    mockKernel = {
      register: vi.fn(),
      unregister: vi.fn(),
      emit: vi.fn(),
      getLogs: vi.fn(),
    } as unknown as Kernel
  })

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('props-tracker')
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
        props: { foo: 'bar' },
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      expect(plugin.api.getCurrentProps('comp-1')).not.toBeNull()

      plugin.uninstall()

      expect(plugin.api.getCurrentProps('comp-1')).toBeNull()
    })
  })

  describe('onMount hook', () => {
    it('should record initial props', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: { foo: 'bar', count: 42 },
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      const props = plugin.api.getCurrentProps('comp-1')
      expect(props).toEqual({ foo: 'bar', count: 42 })
    })

    it('should create initial history entry', () => {
      plugin.install(mockKernel)
      const timestamp = Date.now()

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp,
        props: { a: 1 },
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      const history = plugin.api.getPropsHistory('comp-1')
      expect(history).toHaveLength(1)
      expect(history[0].timestamp).toBe(timestamp)
      expect(history[0].props).toEqual({ a: 1 })
      expect(history[0].changes).toEqual([])
    })
  })

  describe('onPropsChange hook', () => {
    it('should update current props', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: { foo: 'bar', count: 1 },
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      const changes: PropChange[] = [{ key: 'count', prevValue: 1, nextValue: 2, isDeepEqual: false }]

      const propsChangeEvent: PropsChangeEvent = {
        type: 'props-change',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        changes,
      }
      plugin.hooks?.onPropsChange?.(propsChangeEvent)

      const props = plugin.api.getCurrentProps('comp-1')
      expect(props).toEqual({ foo: 'bar', count: 2 })
    })

    it('should add new props', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: { foo: 'bar' },
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      const changes: PropChange[] = [{ key: 'newProp', prevValue: undefined, nextValue: 'new', isDeepEqual: false }]

      const propsChangeEvent: PropsChangeEvent = {
        type: 'props-change',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        changes,
      }
      plugin.hooks?.onPropsChange?.(propsChangeEvent)

      const props = plugin.api.getCurrentProps('comp-1')
      expect(props).toEqual({ foo: 'bar', newProp: 'new' })
    })

    it('should remove props when nextValue is undefined', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: { foo: 'bar', toRemove: 'value' },
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      const changes: PropChange[] = [{ key: 'toRemove', prevValue: 'value', nextValue: undefined, isDeepEqual: false }]

      const propsChangeEvent: PropsChangeEvent = {
        type: 'props-change',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        changes,
      }
      plugin.hooks?.onPropsChange?.(propsChangeEvent)

      const props = plugin.api.getCurrentProps('comp-1')
      expect(props).toEqual({ foo: 'bar' })
      expect(props).not.toHaveProperty('toRemove')
    })

    it('should track change stats', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: { count: 0 },
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      // Change count 5 times
      for (let i = 1; i <= 5; i++) {
        const changes: PropChange[] = [{ key: 'count', prevValue: i - 1, nextValue: i, isDeepEqual: false }]
        const propsChangeEvent: PropsChangeEvent = {
          type: 'props-change',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now() + i,
          changes,
        }
        plugin.hooks?.onPropsChange?.(propsChangeEvent)
      }

      const mostChanged = plugin.api.getMostChangedProps('comp-1')
      expect(mostChanged).toHaveLength(1)
      expect(mostChanged[0].key).toBe('count')
      expect(mostChanged[0].changeCount).toBe(5)
    })

    it('should add to history', () => {
      plugin.install(mockKernel)

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: { foo: 'bar' },
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      const changes: PropChange[] = [{ key: 'foo', prevValue: 'bar', nextValue: 'baz', isDeepEqual: false }]

      const propsChangeEvent: PropsChangeEvent = {
        type: 'props-change',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        changes,
      }
      plugin.hooks?.onPropsChange?.(propsChangeEvent)

      const history = plugin.api.getPropsHistory('comp-1')
      expect(history).toHaveLength(2)
      expect(history[1].changes).toEqual(changes)
    })

    it('should ignore props change for unknown component', () => {
      plugin.install(mockKernel)

      const changes: PropChange[] = [{ key: 'foo', prevValue: 'bar', nextValue: 'baz', isDeepEqual: false }]

      const propsChangeEvent: PropsChangeEvent = {
        type: 'props-change',
        componentId: 'unknown',
        componentName: 'Unknown',
        timestamp: Date.now(),
        changes,
      }
      plugin.hooks?.onPropsChange?.(propsChangeEvent)

      expect(plugin.api.getCurrentProps('unknown')).toBeNull()
    })
  })

  describe('API methods', () => {
    describe('getCurrentProps', () => {
      it('should return current props', () => {
        plugin.install(mockKernel)

        const mountEvent: MountEvent = {
          type: 'mount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          props: { a: 1, b: 2 },
          initialState: {},
        }
        plugin.hooks?.onMount?.(mountEvent)

        expect(plugin.api.getCurrentProps('comp-1')).toEqual({ a: 1, b: 2 })
      })

      it('should return null for unknown component', () => {
        plugin.install(mockKernel)
        expect(plugin.api.getCurrentProps('unknown')).toBeNull()
      })
    })

    describe('getPropsHistory', () => {
      it('should return props history', () => {
        plugin.install(mockKernel)

        const mountEvent: MountEvent = {
          type: 'mount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          props: { count: 0 },
          initialState: {},
        }
        plugin.hooks?.onMount?.(mountEvent)

        const changes: PropChange[] = [{ key: 'count', prevValue: 0, nextValue: 1, isDeepEqual: false }]
        const propsChangeEvent: PropsChangeEvent = {
          type: 'props-change',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          changes,
        }
        plugin.hooks?.onPropsChange?.(propsChangeEvent)

        const history = plugin.api.getPropsHistory('comp-1')
        expect(history).toHaveLength(2)
      })

      it('should return empty array for unknown component', () => {
        plugin.install(mockKernel)
        expect(plugin.api.getPropsHistory('unknown')).toEqual([])
      })
    })

    describe('getChangeCount', () => {
      it('should return number of props changes', () => {
        plugin.install(mockKernel)

        const mountEvent: MountEvent = {
          type: 'mount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          props: { count: 0 },
          initialState: {},
        }
        plugin.hooks?.onMount?.(mountEvent)

        for (let i = 1; i <= 3; i++) {
          const changes: PropChange[] = [{ key: 'count', prevValue: i - 1, nextValue: i, isDeepEqual: false }]
          const propsChangeEvent: PropsChangeEvent = {
            type: 'props-change',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            changes,
          }
          plugin.hooks?.onPropsChange?.(propsChangeEvent)
        }

        expect(plugin.api.getChangeCount('comp-1')).toBe(3)
      })

      it('should return 0 for unknown component', () => {
        plugin.install(mockKernel)
        expect(plugin.api.getChangeCount('unknown')).toBe(0)
      })
    })

    describe('getMostChangedProps', () => {
      it('should return props sorted by change count', () => {
        plugin.install(mockKernel)

        const mountEvent: MountEvent = {
          type: 'mount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          props: { a: 0, b: 0, c: 0 },
          initialState: {},
        }
        plugin.hooks?.onMount?.(mountEvent)

        // Change 'a' 3 times
        for (let i = 1; i <= 3; i++) {
          const changes: PropChange[] = [{ key: 'a', prevValue: i - 1, nextValue: i, isDeepEqual: false }]
          const propsChangeEvent: PropsChangeEvent = {
            type: 'props-change',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            changes,
          }
          plugin.hooks?.onPropsChange?.(propsChangeEvent)
        }

        // Change 'b' 5 times
        for (let i = 1; i <= 5; i++) {
          const changes: PropChange[] = [{ key: 'b', prevValue: i - 1, nextValue: i, isDeepEqual: false }]
          const propsChangeEvent: PropsChangeEvent = {
            type: 'props-change',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            changes,
          }
          plugin.hooks?.onPropsChange?.(propsChangeEvent)
        }

        // Change 'c' 1 time
        const changes: PropChange[] = [{ key: 'c', prevValue: 0, nextValue: 1, isDeepEqual: false }]
        const propsChangeEvent: PropsChangeEvent = {
          type: 'props-change',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          changes,
        }
        plugin.hooks?.onPropsChange?.(propsChangeEvent)

        const mostChanged = plugin.api.getMostChangedProps('comp-1')
        expect(mostChanged[0].key).toBe('b')
        expect(mostChanged[0].changeCount).toBe(5)
        expect(mostChanged[1].key).toBe('a')
        expect(mostChanged[1].changeCount).toBe(3)
        expect(mostChanged[2].key).toBe('c')
        expect(mostChanged[2].changeCount).toBe(1)
      })

      it('should respect limit parameter', () => {
        plugin.install(mockKernel)

        const mountEvent: MountEvent = {
          type: 'mount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          props: { a: 0, b: 0, c: 0 },
          initialState: {},
        }
        plugin.hooks?.onMount?.(mountEvent)

        // Change each prop once
        const changeKeys = ['a', 'b', 'c']
        for (const key of changeKeys) {
          const changes: PropChange[] = [{ key, prevValue: 0, nextValue: 1, isDeepEqual: false }]
          const propsChangeEvent: PropsChangeEvent = {
            type: 'props-change',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            changes,
          }
          plugin.hooks?.onPropsChange?.(propsChangeEvent)
        }

        const mostChanged = plugin.api.getMostChangedProps('comp-1', 2)
        expect(mostChanged).toHaveLength(2)
      })

      it('should return empty array for unknown component', () => {
        plugin.install(mockKernel)
        expect(plugin.api.getMostChangedProps('unknown')).toEqual([])
      })
    })
  })
})
