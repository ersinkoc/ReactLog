import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Kernel, createKernel } from '../../../src/kernel/kernel'
import { createPlugin } from '../../../src/plugin-factory'
import type { MountEvent, Plugin } from '../../../src/types'

describe('Kernel', () => {
  let kernel: Kernel

  beforeEach(() => {
    kernel = createKernel()
  })

  const createMockEvent = (): MountEvent => ({
    type: 'mount',
    componentId: 'test-id',
    componentName: 'TestComponent',
    timestamp: Date.now(),
    props: { foo: 'bar' },
    initialState: {},
  })

  describe('creation', () => {
    it('should create with default options', () => {
      expect(kernel.isEnabled()).toBe(true)
    })

    it('should create with custom options', () => {
      const customKernel = createKernel({
        enabled: false,
        maxLogs: 500,
        logLevel: 'warn',
      })

      expect(customKernel.isEnabled()).toBe(false)
      expect(customKernel.getOptions().maxLogs).toBe(500)
      expect(customKernel.getOptions().logLevel).toBe('warn')
    })
  })

  describe('plugin management', () => {
    it('should register a plugin', () => {
      const plugin = createPlugin({
        name: 'test-plugin',
        version: '1.0.0',
      })

      kernel.register(plugin)

      expect(kernel.getPlugin('test-plugin')).toBeDefined()
    })

    it('should unregister a plugin', () => {
      const plugin = createPlugin({
        name: 'test-plugin',
        version: '1.0.0',
      })

      kernel.register(plugin)
      kernel.unregister('test-plugin')

      expect(kernel.getPlugin('test-plugin')).toBeUndefined()
    })

    it('should list all plugins', () => {
      kernel.register(createPlugin({ name: 'plugin-1', version: '1.0.0' }))
      kernel.register(createPlugin({ name: 'plugin-2', version: '1.0.0' }))

      const plugins = kernel.listPlugins()

      // Core plugins + 2 custom
      expect(plugins.length).toBeGreaterThanOrEqual(2)
      expect(plugins.some(p => p.name === 'plugin-1')).toBe(true)
      expect(plugins.some(p => p.name === 'plugin-2')).toBe(true)
    })
  })

  describe('event emission', () => {
    it('should emit events to handlers', () => {
      const handler = vi.fn()
      kernel.on('mount', handler)

      kernel.emit(createMockEvent())

      expect(handler).toHaveBeenCalled()
    })

    it('should call plugin hooks', () => {
      const onMount = vi.fn()
      const plugin = createPlugin({
        name: 'test-plugin',
        version: '1.0.0',
        hooks: { onMount },
      })

      kernel.register(plugin)
      kernel.emit(createMockEvent())

      expect(onMount).toHaveBeenCalled()
    })

    it('should not emit when disabled', () => {
      const handler = vi.fn()
      kernel.on('mount', handler)
      kernel.disable()

      kernel.emit(createMockEvent())

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('log management', () => {
    it('should add logs when events are emitted', () => {
      kernel.emit(createMockEvent())

      const logs = kernel.getLogs()
      expect(logs.entries.length).toBeGreaterThan(0)
    })

    it('should clear logs', () => {
      kernel.emit(createMockEvent())
      kernel.clearLogs()

      const logs = kernel.getLogs()
      expect(logs.entries.length).toBe(0)
    })

    it('should filter logs', () => {
      kernel.emit(createMockEvent())

      const filtered = kernel.filterLogs({ componentName: 'TestComponent' })
      expect(filtered.length).toBeGreaterThan(0)
    })
  })

  describe('configuration', () => {
    it('should enable/disable', () => {
      kernel.disable()
      expect(kernel.isEnabled()).toBe(false)

      kernel.enable()
      expect(kernel.isEnabled()).toBe(true)
    })

    it('should configure options', () => {
      kernel.configure({
        maxLogs: 200,
        logLevel: 'error',
      })

      expect(kernel.getOptions().maxLogs).toBe(200)
      expect(kernel.getOptions().logLevel).toBe('error')
    })
  })

  describe('log subscription', () => {
    it('should subscribe to log entries', () => {
      const handler = vi.fn()
      kernel.onLog(handler)

      kernel.emit(createMockEvent())

      expect(handler).toHaveBeenCalled()
    })

    it('should unsubscribe from log entries', () => {
      const handler = vi.fn()
      const unsubscribe = kernel.onLog(handler)

      unsubscribe()
      kernel.emit(createMockEvent())

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('destroy', () => {
    it('should clean up resources', () => {
      const handler = vi.fn()
      kernel.on('mount', handler)

      kernel.destroy()

      expect(kernel.isEnabled()).toBe(false)
      expect(kernel.listPlugins().length).toBe(0)
    })
  })

  describe('plugin onLog error handling', () => {
    it('should handle errors in plugin onLog hooks gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const plugin: Plugin = {
        name: 'error-plugin',
        version: '1.0.0',
        type: 'optional',
        install: vi.fn(),
        uninstall: vi.fn(),
        hooks: {
          onLog: () => {
            throw new Error('onLog error')
          },
        },
      }

      kernel.register(plugin)
      kernel.emit(createMockEvent())

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ReactLog] Plugin "error-plugin" onLog error:'),
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('configuration enabled option', () => {
    it('should configure enabled option', () => {
      expect(kernel.isEnabled()).toBe(true)

      kernel.configure({ enabled: false })
      expect(kernel.isEnabled()).toBe(false)

      kernel.configure({ enabled: true })
      expect(kernel.isEnabled()).toBe(true)
    })

    it('should handle plugin hook errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const plugin: Plugin = {
        name: 'error-hook-plugin',
        version: '1.0.0',
        type: 'optional',
        install: vi.fn(),
        uninstall: vi.fn(),
        hooks: {
          onMount: () => {
            throw new Error('Hook error')
          },
        },
      }

      kernel.register(plugin)
      kernel.emit(createMockEvent())

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ReactLog] Plugin "error-hook-plugin" hook error:'),
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('log level filtering', () => {
    it('should filter logs by log level', () => {
      const warnKernel = createKernel({ logLevel: 'warn' })

      // Mount events are 'debug' level, should not be logged
      warnKernel.emit(createMockEvent())

      expect(warnKernel.getLogs().entries.length).toBe(0)
    })
  })

  describe('off method', () => {
    it('should unsubscribe handler from event type', () => {
      const handler = vi.fn()
      kernel.on('mount', handler)
      kernel.off('mount', handler)

      kernel.emit(createMockEvent())

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('event type formatting', () => {
    it('should format error event', () => {
      kernel.emit({
        type: 'error',
        componentId: 'test-id',
        componentName: 'ErrorComponent',
        timestamp: Date.now(),
        error: new Error('Test error'),
        errorInfo: { componentStack: '' },
      })

      const logs = kernel.getLogs()
      expect(logs.entries.length).toBe(1)
      expect(logs.entries[0].formatted).toContain('ERROR')
    })

    it('should format effect-run event', () => {
      kernel.emit({
        type: 'effect-run',
        componentId: 'test-id',
        componentName: 'EffectComponent',
        timestamp: Date.now(),
        effectIndex: 0,
        dependencies: [],
      })

      const logs = kernel.getLogs()
      expect(logs.entries.length).toBe(1)
      expect(logs.entries[0].formatted).toContain('EFFECT RUN')
    })

    it('should format effect-cleanup event', () => {
      kernel.emit({
        type: 'effect-cleanup',
        componentId: 'test-id',
        componentName: 'CleanupComponent',
        timestamp: Date.now(),
        effectIndex: 0,
        reason: 'deps-changed',
      })

      const logs = kernel.getLogs()
      expect(logs.entries.length).toBe(1)
      expect(logs.entries[0].formatted).toContain('EFFECT CLEANUP')
    })

    it('should format context-change event', () => {
      kernel.emit({
        type: 'context-change',
        componentId: 'test-id',
        componentName: 'ContextComponent',
        timestamp: Date.now(),
        contextName: 'TestContext',
        prevValue: { old: true },
        nextValue: { new: true },
      })

      const logs = kernel.getLogs()
      expect(logs.entries.length).toBe(1)
      expect(logs.entries[0].formatted).toContain('CONTEXT')
    })

    it('should format unmount event', () => {
      kernel.emit({
        type: 'unmount',
        componentId: 'test-id',
        componentName: 'UnmountComponent',
        timestamp: Date.now(),
        lifetime: 1000,
      })

      const logs = kernel.getLogs()
      expect(logs.entries.length).toBe(1)
      expect(logs.entries[0].formatted).toContain('UNMOUNT')
      expect(logs.entries[0].formatted).toContain('lifetime')
    })

    it('should format update event', () => {
      kernel.emit({
        type: 'update',
        componentId: 'test-id',
        componentName: 'UpdateComponent',
        timestamp: Date.now(),
        reason: 'state-change',
        renderCount: 5,
      })

      const logs = kernel.getLogs()
      expect(logs.entries.length).toBe(1)
      expect(logs.entries[0].formatted).toContain('UPDATE')
      expect(logs.entries[0].formatted).toContain('render #5')
    })

    it('should format props-change event', () => {
      kernel.emit({
        type: 'props-change',
        componentId: 'test-id',
        componentName: 'PropsComponent',
        timestamp: Date.now(),
        changes: [{ key: 'prop1', prev: 'old', next: 'new' }],
      })

      const logs = kernel.getLogs()
      expect(logs.entries.length).toBe(1)
      expect(logs.entries[0].formatted).toContain('PROPS')
    })

    it('should format state-change event', () => {
      kernel.emit({
        type: 'state-change',
        componentId: 'test-id',
        componentName: 'StateComponent',
        timestamp: Date.now(),
        hookIndex: 0,
        hookType: 'useState',
        prevState: 'old',
        nextState: 'new',
      })

      const logs = kernel.getLogs()
      expect(logs.entries.length).toBe(1)
      expect(logs.entries[0].formatted).toContain('STATE')
    })
  })
})
