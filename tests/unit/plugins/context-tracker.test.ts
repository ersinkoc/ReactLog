import { describe, it, expect, vi, beforeEach } from 'vitest'
import { contextTracker } from '../../../src/plugins/optional/context-tracker'
import type { Kernel, ContextChangeEvent } from '../../../src/types'

describe('contextTracker plugin', () => {
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
    const plugin = contextTracker()
    expect(plugin.name).toBe('context-tracker')
    expect(plugin.version).toBe('1.0.0')
    expect(plugin.type).toBe('optional')
  })

  it('should install and uninstall correctly', () => {
    const plugin = contextTracker()
    expect(() => plugin.install(mockKernel)).not.toThrow()
    expect(() => plugin.uninstall()).not.toThrow()
  })

  it('should track context changes with trackAll option', () => {
    const plugin = contextTracker({ trackAll: true })
    plugin.install(mockKernel)

    const event: ContextChangeEvent = {
      componentId: 'comp-1',
      componentName: 'TestComponent',
      contextName: 'ThemeContext',
      prevValue: 'light',
      nextValue: 'dark',
      timestamp: Date.now(),
    }

    plugin.hooks?.onContextChange?.(event)

    expect(plugin.api.getContextValue('comp-1', 'ThemeContext')).toBe('dark')
    expect(plugin.api.getTrackedContexts()).toContain('ThemeContext')
  })

  it('should track context history', () => {
    const plugin = contextTracker()
    plugin.install(mockKernel)

    const baseTimestamp = Date.now()

    plugin.hooks?.onContextChange?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      contextName: 'UserContext',
      prevValue: null,
      nextValue: { name: 'John' },
      timestamp: baseTimestamp,
    })

    plugin.hooks?.onContextChange?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      contextName: 'UserContext',
      prevValue: { name: 'John' },
      nextValue: { name: 'Jane' },
      timestamp: baseTimestamp + 100,
    })

    const history = plugin.api.getContextHistory('comp-1', 'UserContext')
    expect(history).toHaveLength(2)
    expect(history[0].prevValue).toBeNull()
    expect(history[0].nextValue).toEqual({ name: 'John' })
    expect(history[1].prevValue).toEqual({ name: 'John' })
    expect(history[1].nextValue).toEqual({ name: 'Jane' })
  })

  it('should respect specific contexts filter', () => {
    const plugin = contextTracker({
      trackAll: false,
      contexts: ['ThemeContext'],
    })
    plugin.install(mockKernel)

    plugin.hooks?.onContextChange?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      contextName: 'ThemeContext',
      prevValue: 'light',
      nextValue: 'dark',
      timestamp: Date.now(),
    })

    plugin.hooks?.onContextChange?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      contextName: 'UserContext',
      prevValue: null,
      nextValue: { name: 'John' },
      timestamp: Date.now(),
    })

    expect(plugin.api.getContextValue('comp-1', 'ThemeContext')).toBe('dark')
    expect(plugin.api.getContextValue('comp-1', 'UserContext')).toBeUndefined()
  })

  it('should return empty history for unknown component', () => {
    const plugin = contextTracker()
    plugin.install(mockKernel)

    expect(plugin.api.getContextHistory('unknown-comp', 'SomeContext')).toEqual([])
  })

  it('should return undefined for unknown context value', () => {
    const plugin = contextTracker()
    plugin.install(mockKernel)

    expect(plugin.api.getContextValue('comp-1', 'UnknownContext')).toBeUndefined()
  })

  it('should clear data on uninstall', () => {
    const plugin = contextTracker()
    plugin.install(mockKernel)

    plugin.hooks?.onContextChange?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      contextName: 'ThemeContext',
      prevValue: 'light',
      nextValue: 'dark',
      timestamp: Date.now(),
    })

    expect(plugin.api.getTrackedContexts()).toContain('ThemeContext')

    plugin.uninstall()

    expect(plugin.api.getTrackedContexts()).toEqual([])
  })
})
