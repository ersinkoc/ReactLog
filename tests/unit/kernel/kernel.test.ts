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
})
