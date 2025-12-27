import { describe, it, expect, vi, beforeEach } from 'vitest'
import { errorTracker } from '../../../src/plugins/optional/error-tracker'
import type { Kernel, ErrorEvent } from '../../../src/types'

describe('errorTracker plugin', () => {
  let mockKernel: Kernel

  beforeEach(() => {
    mockKernel = {
      register: vi.fn(),
      unregister: vi.fn(),
      emit: vi.fn(),
      getLogs: vi.fn().mockReturnValue({ entries: [], byComponent: new Map(), startTime: Date.now() }),
      getPlugin: vi.fn(),
      getPlugins: vi.fn(),
    } as unknown as Kernel
  })

  it('should create plugin with correct name and version', () => {
    const plugin = errorTracker()
    expect(plugin.name).toBe('error-tracker')
    expect(plugin.version).toBe('1.0.0')
    expect(plugin.type).toBe('optional')
  })

  it('should install and uninstall correctly', () => {
    const plugin = errorTracker()
    expect(() => plugin.install(mockKernel)).not.toThrow()
    expect(() => plugin.uninstall()).not.toThrow()
  })

  it('should track errors', () => {
    const plugin = errorTracker()
    plugin.install(mockKernel)

    const error = new Error('Test error')
    error.stack = 'Error: Test error\n    at TestComponent'

    const event: ErrorEvent = {
      componentId: 'comp-1',
      componentName: 'TestComponent',
      error,
      errorInfo: { componentStack: '    in TestComponent' },
      recovered: false,
      timestamp: Date.now(),
    }

    plugin.hooks?.onError?.(event)

    expect(plugin.api.getErrorCount()).toBe(1)
    expect(plugin.api.getErrors()).toHaveLength(1)
    expect(plugin.api.getErrors()[0].error.message).toBe('Test error')
  })

  it('should capture stack trace when captureStack is true', () => {
    const plugin = errorTracker({ captureStack: true })
    plugin.install(mockKernel)

    const error = new Error('Test error')
    error.stack = 'Error: Test error\n    at TestComponent'

    plugin.hooks?.onError?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      error,
      errorInfo: { componentStack: '' },
      recovered: false,
      timestamp: Date.now(),
    })

    expect(plugin.api.getLastError()?.stack).toBe('Error: Test error\n    at TestComponent')
  })

  it('should not capture stack trace when captureStack is false', () => {
    const plugin = errorTracker({ captureStack: false })
    plugin.install(mockKernel)

    const error = new Error('Test error')
    error.stack = 'Error: Test error\n    at TestComponent'

    plugin.hooks?.onError?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      error,
      errorInfo: { componentStack: '' },
      recovered: false,
      timestamp: Date.now(),
    })

    expect(plugin.api.getLastError()?.stack).toBeNull()
  })

  it('should get errors by component ID', () => {
    const plugin = errorTracker()
    plugin.install(mockKernel)

    plugin.hooks?.onError?.({
      componentId: 'comp-1',
      componentName: 'TestComponent1',
      error: new Error('Error 1'),
      errorInfo: { componentStack: '' },
      recovered: false,
      timestamp: Date.now(),
    })

    plugin.hooks?.onError?.({
      componentId: 'comp-2',
      componentName: 'TestComponent2',
      error: new Error('Error 2'),
      errorInfo: { componentStack: '' },
      recovered: false,
      timestamp: Date.now(),
    })

    expect(plugin.api.getErrors('comp-1')).toHaveLength(1)
    expect(plugin.api.getErrors('comp-1')[0].componentName).toBe('TestComponent1')
    expect(plugin.api.getErrors('comp-2')).toHaveLength(1)
    expect(plugin.api.getErrors('unknown')).toHaveLength(0)
  })

  it('should get last error', () => {
    const plugin = errorTracker()
    plugin.install(mockKernel)

    plugin.hooks?.onError?.({
      componentId: 'comp-1',
      componentName: 'TestComponent1',
      error: new Error('Error 1'),
      errorInfo: { componentStack: '' },
      recovered: false,
      timestamp: Date.now(),
    })

    plugin.hooks?.onError?.({
      componentId: 'comp-2',
      componentName: 'TestComponent2',
      error: new Error('Error 2'),
      errorInfo: { componentStack: '' },
      recovered: false,
      timestamp: Date.now(),
    })

    expect(plugin.api.getLastError()?.componentName).toBe('TestComponent2')
  })

  it('should return null when no errors', () => {
    const plugin = errorTracker()
    plugin.install(mockKernel)

    expect(plugin.api.getLastError()).toBeNull()
  })

  it('should clear errors', () => {
    const plugin = errorTracker()
    plugin.install(mockKernel)

    plugin.hooks?.onError?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      error: new Error('Test error'),
      errorInfo: { componentStack: '' },
      recovered: false,
      timestamp: Date.now(),
    })

    expect(plugin.api.getErrorCount()).toBe(1)

    plugin.api.clearErrors()

    expect(plugin.api.getErrorCount()).toBe(0)
  })

  it('should respect maxErrors limit', () => {
    const plugin = errorTracker({ maxErrors: 3 })
    plugin.install(mockKernel)

    for (let i = 0; i < 5; i++) {
      plugin.hooks?.onError?.({
        componentId: `comp-${i}`,
        componentName: `TestComponent${i}`,
        error: new Error(`Error ${i}`),
        errorInfo: { componentStack: '' },
        recovered: false,
        timestamp: Date.now(),
      })
    }

    expect(plugin.api.getErrorCount()).toBe(3)
    // Should keep the last 3 errors
    const errors = plugin.api.getErrors()
    expect(errors[0].componentName).toBe('TestComponent2')
    expect(errors[2].componentName).toBe('TestComponent4')
  })

  it('should track recovered errors', () => {
    const plugin = errorTracker()
    plugin.install(mockKernel)

    plugin.hooks?.onError?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      error: new Error('Recovered error'),
      errorInfo: { componentStack: '' },
      recovered: true,
      timestamp: Date.now(),
    })

    expect(plugin.api.getLastError()?.recovered).toBe(true)
  })

  it('should clear data on uninstall', () => {
    const plugin = errorTracker()
    plugin.install(mockKernel)

    plugin.hooks?.onError?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      error: new Error('Test error'),
      errorInfo: { componentStack: '' },
      recovered: false,
      timestamp: Date.now(),
    })

    expect(plugin.api.getErrorCount()).toBe(1)

    plugin.uninstall()

    expect(plugin.api.getErrorCount()).toBe(0)
  })
})
