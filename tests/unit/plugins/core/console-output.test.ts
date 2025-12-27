import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { consoleOutput } from '../../../../src/plugins/core/console-output'
import type { Kernel, LogEntry } from '../../../../src/types'

describe('consoleOutput plugin', () => {
  let plugin: ReturnType<typeof consoleOutput>
  let mockKernel: Kernel
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>
    group: ReturnType<typeof vi.spyOn>
    groupCollapsed: ReturnType<typeof vi.spyOn>
    groupEnd: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    plugin = consoleOutput()
    mockKernel = {
      register: vi.fn(),
      unregister: vi.fn(),
      emit: vi.fn(),
      getLogs: vi.fn(),
    } as unknown as Kernel

    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      group: vi.spyOn(console, 'group').mockImplementation(() => {}),
      groupCollapsed: vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {}),
      groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => {}),
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('console-output')
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

    it('should uninstall plugin', () => {
      plugin.install(mockKernel)
      plugin.uninstall()
    })
  })

  describe('API methods', () => {
    describe('configure', () => {
      it('should update options', () => {
        plugin.api.configure({ enabled: false })
        // Test by checking logs are not output
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'mount',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            props: {},
            initialState: {},
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).not.toHaveBeenCalled()
      })
    })

    describe('pause/resume', () => {
      it('should pause output', () => {
        plugin.api.pause()
        expect(plugin.api.isPaused()).toBe(true)

        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'mount',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            props: {},
            initialState: {},
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).not.toHaveBeenCalled()
      })

      it('should resume output', () => {
        plugin.api.pause()
        plugin.api.resume()
        expect(plugin.api.isPaused()).toBe(false)
      })
    })
  })

  describe('onLog hook', () => {
    describe('mount event', () => {
      it('should output mount event', () => {
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'mount',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            props: { foo: 'bar' },
            initialState: { count: 0 },
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).toHaveBeenCalled()
      })

      it('should not output mount when showProps is false', () => {
        plugin.api.configure({ showProps: false })
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'mount',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            props: {},
            initialState: {},
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).not.toHaveBeenCalled()
      })
    })

    describe('unmount event', () => {
      it('should output unmount event', () => {
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'unmount',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            lifetime: 1000,
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).toHaveBeenCalled()
      })
    })

    describe('update event', () => {
      it('should output update event', () => {
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'update',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            renderCount: 2,
            reason: 'props-change',
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).toHaveBeenCalled()
      })
    })

    describe('props-change event', () => {
      it('should output props-change with details', () => {
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'props-change',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            changes: [{ key: 'foo', prevValue: 'bar', nextValue: 'baz', isDeepEqual: false }],
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.groupCollapsed).toHaveBeenCalled()
        expect(consoleSpy.log).toHaveBeenCalled()
        expect(consoleSpy.groupEnd).toHaveBeenCalled()
      })

      it('should not output props-change when showProps is false', () => {
        plugin.api.configure({ showProps: false })
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'props-change',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            changes: [{ key: 'foo', prevValue: 'bar', nextValue: 'baz', isDeepEqual: false }],
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.groupCollapsed).not.toHaveBeenCalled()
      })
    })

    describe('state-change event', () => {
      it('should output state-change event', () => {
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'state-change',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            hookIndex: 0,
            hookType: 'useState',
            prevState: 0,
            nextState: 1,
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).toHaveBeenCalled()
      })

      it('should not output state-change when showState is false', () => {
        plugin.api.configure({ showState: false })
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'state-change',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            hookIndex: 0,
            hookType: 'useState',
            prevState: 0,
            nextState: 1,
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).not.toHaveBeenCalled()
      })
    })

    describe('effect events', () => {
      it('should output effect-run event', () => {
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'effect-run',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            effectIndex: 0,
            dependencies: [1, 2],
            dependenciesChanged: [0],
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).toHaveBeenCalled()
      })

      it('should output effect-cleanup event', () => {
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'effect-cleanup',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            effectIndex: 0,
            reason: 'unmount',
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).toHaveBeenCalled()
      })

      it('should not output effects when showEffects is false', () => {
        plugin.api.configure({ showEffects: false })
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'effect-run',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            effectIndex: 0,
            dependencies: [],
            dependenciesChanged: [],
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).not.toHaveBeenCalled()
      })
    })

    describe('context-change event', () => {
      it('should output context-change event', () => {
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'context-change',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            contextName: 'ThemeContext',
            prevValue: 'light',
            nextValue: 'dark',
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).toHaveBeenCalled()
      })
    })

    describe('error event', () => {
      it('should output error event', () => {
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'error',
          event: {
            type: 'error',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            error: new Error('Test error'),
            errorInfo: { componentStack: '' },
            recovered: false,
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).toHaveBeenCalled()
      })
    })

    describe('filtering', () => {
      it('should filter by component name string', () => {
        plugin.api.configure({
          filter: { componentName: 'TargetComponent' },
        })

        const entry1: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TargetComponent',
          level: 'info',
          event: {
            type: 'mount',
            componentId: 'comp-1',
            componentName: 'TargetComponent',
            timestamp: Date.now(),
            props: {},
            initialState: {},
          },
        }
        plugin.hooks?.onLog?.(entry1)
        expect(consoleSpy.log).toHaveBeenCalled()

        consoleSpy.log.mockClear()

        const entry2: LogEntry = {
          id: '2',
          timestamp: Date.now(),
          componentId: 'comp-2',
          componentName: 'OtherComponent',
          level: 'info',
          event: {
            type: 'mount',
            componentId: 'comp-2',
            componentName: 'OtherComponent',
            timestamp: Date.now(),
            props: {},
            initialState: {},
          },
        }
        plugin.hooks?.onLog?.(entry2)
        expect(consoleSpy.log).not.toHaveBeenCalled()
      })

      it('should filter by component name regex', () => {
        plugin.api.configure({
          filter: { componentName: /^Test/ },
        })

        const entry1: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'mount',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            props: {},
            initialState: {},
          },
        }
        plugin.hooks?.onLog?.(entry1)
        expect(consoleSpy.log).toHaveBeenCalled()

        consoleSpy.log.mockClear()

        const entry2: LogEntry = {
          id: '2',
          timestamp: Date.now(),
          componentId: 'comp-2',
          componentName: 'OtherComponent',
          level: 'info',
          event: {
            type: 'mount',
            componentId: 'comp-2',
            componentName: 'OtherComponent',
            timestamp: Date.now(),
            props: {},
            initialState: {},
          },
        }
        plugin.hooks?.onLog?.(entry2)
        expect(consoleSpy.log).not.toHaveBeenCalled()
      })

      it('should filter by event type (single)', () => {
        plugin.api.configure({
          filter: { eventType: 'mount' },
        })

        const entry1: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'mount',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            props: {},
            initialState: {},
          },
        }
        plugin.hooks?.onLog?.(entry1)
        expect(consoleSpy.log).toHaveBeenCalled()

        consoleSpy.log.mockClear()

        const entry2: LogEntry = {
          id: '2',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'unmount',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            lifetime: 100,
          },
        }
        plugin.hooks?.onLog?.(entry2)
        expect(consoleSpy.log).not.toHaveBeenCalled()
      })

      it('should filter by event type (array)', () => {
        plugin.api.configure({
          filter: { eventType: ['mount', 'unmount'] },
        })

        const entry1: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'mount',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            props: {},
            initialState: {},
          },
        }
        plugin.hooks?.onLog?.(entry1)
        expect(consoleSpy.log).toHaveBeenCalled()

        consoleSpy.log.mockClear()

        const entry2: LogEntry = {
          id: '2',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'update',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            renderCount: 1,
            reason: 'state-change',
          },
        }
        plugin.hooks?.onLog?.(entry2)
        expect(consoleSpy.log).not.toHaveBeenCalled()
      })

      it('should filter by level (single)', () => {
        plugin.api.configure({
          filter: { level: 'error' },
        })

        const entry1: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'error',
          event: {
            type: 'error',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            error: new Error('Test'),
            errorInfo: { componentStack: '' },
            recovered: false,
          },
        }
        plugin.hooks?.onLog?.(entry1)
        expect(consoleSpy.log).toHaveBeenCalled()

        consoleSpy.log.mockClear()

        const entry2: LogEntry = {
          id: '2',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'mount',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            props: {},
            initialState: {},
          },
        }
        plugin.hooks?.onLog?.(entry2)
        expect(consoleSpy.log).not.toHaveBeenCalled()
      })

      it('should filter by level (array)', () => {
        plugin.api.configure({
          filter: { level: ['info', 'warn'] },
        })

        const entry1: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'mount',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            props: {},
            initialState: {},
          },
        }
        plugin.hooks?.onLog?.(entry1)
        expect(consoleSpy.log).toHaveBeenCalled()
      })
    })

    describe('options', () => {
      it('should use group instead of groupCollapsed when collapsed is false', () => {
        plugin.api.configure({ collapsed: false })
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'props-change',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            changes: [{ key: 'foo', prevValue: 'bar', nextValue: 'baz', isDeepEqual: false }],
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.group).toHaveBeenCalled()
        expect(consoleSpy.groupCollapsed).not.toHaveBeenCalled()
      })

      it('should output plain text when colors is false', () => {
        plugin.api.configure({ colors: false })
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'mount',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            props: {},
            initialState: {},
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).toHaveBeenCalled()
        const call = consoleSpy.log.mock.calls[0]
        expect(call[0]).not.toContain('%c')
      })

      it('should output plain text details when colors is false', () => {
        plugin.api.configure({ colors: false, collapsed: false })
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'props-change',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            changes: [{ key: 'foo', prevValue: 'bar', nextValue: 'baz', isDeepEqual: false }],
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.group).toHaveBeenCalled()
      })

      it('should not include timestamp when timestamp is false', () => {
        plugin.api.configure({ timestamp: false })
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'mount',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
            props: {},
            initialState: {},
          },
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).toHaveBeenCalled()
      })
    })

    describe('unknown event type', () => {
      it('should handle unknown event type gracefully', () => {
        const entry: LogEntry = {
          id: '1',
          timestamp: Date.now(),
          componentId: 'comp-1',
          componentName: 'TestComponent',
          level: 'info',
          event: {
            type: 'unknown-type' as unknown as 'mount',
            componentId: 'comp-1',
            componentName: 'TestComponent',
            timestamp: Date.now(),
          } as unknown as LogEntry['event'],
        }
        plugin.hooks?.onLog?.(entry)
        expect(consoleSpy.log).not.toHaveBeenCalled()
      })
    })
  })
})
