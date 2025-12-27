import { describe, it, expect, vi, beforeEach } from 'vitest'
import { lifecycleLogger } from '../../../../src/plugins/core/lifecycle-logger'
import type { Kernel, MountEvent, UnmountEvent, UpdateEvent } from '../../../../src/types'

describe('lifecycleLogger plugin', () => {
  let plugin: ReturnType<typeof lifecycleLogger>
  let mockKernel: Kernel

  beforeEach(() => {
    plugin = lifecycleLogger()
    mockKernel = {
      register: vi.fn(),
      unregister: vi.fn(),
      emit: vi.fn(),
      getLogs: vi.fn(),
    } as unknown as Kernel
  })

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('lifecycle-logger')
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
      // Plugin installed successfully
    })

    it('should uninstall and clear data', () => {
      plugin.install(mockKernel)

      // Mount a component
      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        props: { foo: 'bar' },
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      expect(plugin.api.isCurrentlyMounted('comp-1')).toBe(true)

      // Uninstall
      plugin.uninstall()

      // Data should be cleared
      expect(plugin.api.isCurrentlyMounted('comp-1')).toBe(false)
    })
  })

  describe('onMount hook', () => {
    it('should record mount event', () => {
      plugin.install(mockKernel)
      const timestamp = Date.now()

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp,
        props: { foo: 'bar', baz: 123 },
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      expect(plugin.api.getMountTime('comp-1')).toBe(timestamp)
      expect(plugin.api.isCurrentlyMounted('comp-1')).toBe(true)
      expect(plugin.api.getUpdateCount('comp-1')).toBe(0)
    })

    it('should record mount with correct details', () => {
      plugin.install(mockKernel)
      const timestamp = Date.now()

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp,
        props: { a: 1, b: 2, c: 3 },
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      const history = plugin.api.getLifecycleHistory('comp-1')
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('mount')
      expect(history[0].details).toBe('Mounted with 3 props')
    })
  })

  describe('onUnmount hook', () => {
    it('should record unmount event', () => {
      plugin.install(mockKernel)
      const mountTime = Date.now()
      const unmountTime = mountTime + 1000

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: mountTime,
        props: {},
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      const unmountEvent: UnmountEvent = {
        type: 'unmount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: unmountTime,
        lifetime: 1000,
      }
      plugin.hooks?.onUnmount?.(unmountEvent)

      expect(plugin.api.getUnmountTime('comp-1')).toBe(unmountTime)
      expect(plugin.api.isCurrentlyMounted('comp-1')).toBe(false)
    })

    it('should add unmount to history', () => {
      plugin.install(mockKernel)
      const mountTime = Date.now()
      const unmountTime = mountTime + 500

      const mountEvent: MountEvent = {
        type: 'mount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: mountTime,
        props: {},
        initialState: {},
      }
      plugin.hooks?.onMount?.(mountEvent)

      const unmountEvent: UnmountEvent = {
        type: 'unmount',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: unmountTime,
        lifetime: 500,
      }
      plugin.hooks?.onUnmount?.(unmountEvent)

      const history = plugin.api.getLifecycleHistory('comp-1')
      expect(history).toHaveLength(2)
      expect(history[1].type).toBe('unmount')
      expect(history[1].details).toBe('Unmounted after 500ms')
    })

    it('should ignore unmount for unknown component', () => {
      plugin.install(mockKernel)

      const unmountEvent: UnmountEvent = {
        type: 'unmount',
        componentId: 'unknown',
        componentName: 'Unknown',
        timestamp: Date.now(),
        lifetime: 100,
      }
      plugin.hooks?.onUnmount?.(unmountEvent)

      expect(plugin.api.getUnmountTime('unknown')).toBeNull()
    })
  })

  describe('onUpdate hook', () => {
    it('should record update events', () => {
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

      const updateEvent: UpdateEvent = {
        type: 'update',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        renderCount: 1,
        reason: 'props-change',
      }
      plugin.hooks?.onUpdate?.(updateEvent)

      expect(plugin.api.getUpdateCount('comp-1')).toBe(1)
    })

    it('should increment update count', () => {
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

      for (let i = 0; i < 5; i++) {
        const updateEvent: UpdateEvent = {
          type: 'update',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          renderCount: i + 1,
          reason: 'state-change',
        }
        plugin.hooks?.onUpdate?.(updateEvent)
      }

      expect(plugin.api.getUpdateCount('comp-1')).toBe(5)
    })

    it('should add update to history with reason', () => {
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

      const updateEvent: UpdateEvent = {
        type: 'update',
        componentId: 'comp-1',
        componentName: 'TestComponent',
        timestamp: Date.now(),
        renderCount: 3,
        reason: 'props-change',
      }
      plugin.hooks?.onUpdate?.(updateEvent)

      const history = plugin.api.getLifecycleHistory('comp-1')
      expect(history).toHaveLength(2)
      expect(history[1].type).toBe('update')
      expect(history[1].details).toBe('Update #3 (props-change)')
    })

    it('should ignore update for unknown component', () => {
      plugin.install(mockKernel)

      const updateEvent: UpdateEvent = {
        type: 'update',
        componentId: 'unknown',
        componentName: 'Unknown',
        timestamp: Date.now(),
        renderCount: 1,
        reason: 'unknown',
      }
      plugin.hooks?.onUpdate?.(updateEvent)

      expect(plugin.api.getUpdateCount('unknown')).toBe(0)
    })
  })

  describe('API methods', () => {
    describe('getMountTime', () => {
      it('should return mount time for mounted component', () => {
        plugin.install(mockKernel)
        const timestamp = Date.now()

        const mountEvent: MountEvent = {
          type: 'mount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp,
          props: {},
          initialState: {},
        }
        plugin.hooks?.onMount?.(mountEvent)

        expect(plugin.api.getMountTime('comp-1')).toBe(timestamp)
      })

      it('should return null for unknown component', () => {
        plugin.install(mockKernel)
        expect(plugin.api.getMountTime('unknown')).toBeNull()
      })
    })

    describe('getUnmountTime', () => {
      it('should return null for currently mounted component', () => {
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

        expect(plugin.api.getUnmountTime('comp-1')).toBeNull()
      })

      it('should return null for unknown component', () => {
        plugin.install(mockKernel)
        expect(plugin.api.getUnmountTime('unknown')).toBeNull()
      })
    })

    describe('getLifetime', () => {
      it('should return lifetime for unmounted component', () => {
        plugin.install(mockKernel)
        const mountTime = Date.now()
        const unmountTime = mountTime + 1000

        const mountEvent: MountEvent = {
          type: 'mount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: mountTime,
          props: {},
          initialState: {},
        }
        plugin.hooks?.onMount?.(mountEvent)

        const unmountEvent: UnmountEvent = {
          type: 'unmount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: unmountTime,
          lifetime: 1000,
        }
        plugin.hooks?.onUnmount?.(unmountEvent)

        expect(plugin.api.getLifetime('comp-1')).toBe(1000)
      })

      it('should return current lifetime for mounted component', () => {
        plugin.install(mockKernel)
        const mountTime = Date.now() - 500

        const mountEvent: MountEvent = {
          type: 'mount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: mountTime,
          props: {},
          initialState: {},
        }
        plugin.hooks?.onMount?.(mountEvent)

        const lifetime = plugin.api.getLifetime('comp-1')
        expect(lifetime).toBeGreaterThanOrEqual(500)
      })

      it('should return null for unknown component', () => {
        plugin.install(mockKernel)
        expect(plugin.api.getLifetime('unknown')).toBeNull()
      })
    })

    describe('isCurrentlyMounted', () => {
      it('should return true for mounted component', () => {
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

        expect(plugin.api.isCurrentlyMounted('comp-1')).toBe(true)
      })

      it('should return false for unmounted component', () => {
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

        const unmountEvent: UnmountEvent = {
          type: 'unmount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          lifetime: 100,
        }
        plugin.hooks?.onUnmount?.(unmountEvent)

        expect(plugin.api.isCurrentlyMounted('comp-1')).toBe(false)
      })

      it('should return false for unknown component', () => {
        plugin.install(mockKernel)
        expect(plugin.api.isCurrentlyMounted('unknown')).toBe(false)
      })
    })

    describe('getLifecycleHistory', () => {
      it('should return complete lifecycle history', () => {
        plugin.install(mockKernel)

        const mountEvent: MountEvent = {
          type: 'mount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          props: { a: 1 },
          initialState: {},
        }
        plugin.hooks?.onMount?.(mountEvent)

        const updateEvent: UpdateEvent = {
          type: 'update',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          renderCount: 1,
          reason: 'state-change',
        }
        plugin.hooks?.onUpdate?.(updateEvent)

        const unmountEvent: UnmountEvent = {
          type: 'unmount',
          componentId: 'comp-1',
          componentName: 'TestComponent',
          timestamp: Date.now(),
          lifetime: 100,
        }
        plugin.hooks?.onUnmount?.(unmountEvent)

        const history = plugin.api.getLifecycleHistory('comp-1')
        expect(history).toHaveLength(3)
        expect(history[0].type).toBe('mount')
        expect(history[1].type).toBe('update')
        expect(history[2].type).toBe('unmount')
      })

      it('should return empty array for unknown component', () => {
        plugin.install(mockKernel)
        expect(plugin.api.getLifecycleHistory('unknown')).toEqual([])
      })
    })
  })
})
