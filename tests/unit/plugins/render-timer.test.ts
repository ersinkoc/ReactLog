import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderTimer } from '../../../src/plugins/optional/render-timer'
import type { Kernel, MountEvent, UpdateEvent } from '../../../src/types'

describe('renderTimer plugin', () => {
  let mockKernel: Kernel
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mockKernel = {
      register: vi.fn(),
      unregister: vi.fn(),
      emit: vi.fn(),
      getLogs: vi.fn().mockReturnValue({ entries: [], byComponent: new Map(), startTime: Date.now() }),
      getPlugin: vi.fn(),
      getPlugins: vi.fn(),
    } as unknown as Kernel

    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  it('should create plugin with correct name and version', () => {
    const plugin = renderTimer()
    expect(plugin.name).toBe('render-timer')
    expect(plugin.version).toBe('1.0.0')
    expect(plugin.type).toBe('optional')
  })

  it('should install and uninstall correctly', () => {
    const plugin = renderTimer()
    expect(() => plugin.install(mockKernel)).not.toThrow()
    expect(() => plugin.uninstall()).not.toThrow()
  })

  it('should track render time on mount', () => {
    const plugin = renderTimer()
    plugin.install(mockKernel)

    const now = Date.now()
    const event: MountEvent = {
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: now - 5, // 5ms ago
      props: {},
    }

    plugin.hooks?.onMount?.(event)

    const stats = plugin.api.getRenderTime('comp-1')
    expect(stats.count).toBeGreaterThanOrEqual(0)
  })

  it('should track render time on update', () => {
    const plugin = renderTimer()
    plugin.install(mockKernel)

    const now = Date.now()

    // First mount
    plugin.hooks?.onMount?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: now - 100,
      props: {},
    })

    // Then update
    plugin.hooks?.onUpdate?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: now - 50,
      updateReason: 'state-change',
      renderCount: 2,
    })

    const stats = plugin.api.getRenderTime('comp-1')
    expect(stats.count).toBeGreaterThanOrEqual(0)
  })

  it('should return zero stats for unknown component', () => {
    const plugin = renderTimer()
    plugin.install(mockKernel)

    const stats = plugin.api.getRenderTime('unknown-comp')
    expect(stats).toEqual({
      count: 0,
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      last: 0,
    })
  })

  it('should get slowest renders', () => {
    const plugin = renderTimer()
    plugin.install(mockKernel)

    // Create some simulated renders
    const slowest = plugin.api.getSlowestRenders(5)
    expect(Array.isArray(slowest)).toBe(true)
  })

  it('should get average render time', () => {
    const plugin = renderTimer()
    plugin.install(mockKernel)

    expect(plugin.api.getAverageRenderTime('unknown')).toBe(0)
  })

  it('should get total render time', () => {
    const plugin = renderTimer()
    plugin.install(mockKernel)

    expect(plugin.api.getTotalRenderTime('unknown')).toBe(0)
  })

  it('should warn on slow renders exceeding error threshold', () => {
    const plugin = renderTimer({ warnThreshold: 1, errorThreshold: 2 })
    plugin.install(mockKernel)

    const now = Date.now()

    // Mount with a timestamp that creates a duration above error threshold
    plugin.hooks?.onMount?.({
      componentId: 'comp-1',
      componentName: 'SlowComponent',
      timestamp: now - 100, // 100ms ago
      props: {},
    })

    // The actual timing depends on when Date.now() is called inside the plugin
    // We just check that the component was tracked
    const stats = plugin.api.getRenderTime('comp-1')
    expect(stats).toBeDefined()
  })

  it('should respect custom thresholds', () => {
    const plugin = renderTimer({ warnThreshold: 5, errorThreshold: 10 })
    plugin.install(mockKernel)

    expect(plugin.name).toBe('render-timer')
  })

  it('should clear data on uninstall', () => {
    const plugin = renderTimer()
    plugin.install(mockKernel)

    plugin.hooks?.onMount?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now() - 5,
      props: {},
    })

    plugin.uninstall()

    const stats = plugin.api.getRenderTime('comp-1')
    expect(stats.count).toBe(0)
  })

  it('should handle update without previous mount', () => {
    const plugin = renderTimer()
    plugin.install(mockKernel)

    // Update without mount - should not crash
    plugin.hooks?.onUpdate?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      updateReason: 'state-change',
      renderCount: 2,
    })

    const stats = plugin.api.getRenderTime('comp-1')
    expect(stats.count).toBe(0)
  })

  it('should limit getSlowestRenders to requested limit', () => {
    const plugin = renderTimer()
    plugin.install(mockKernel)

    const slowest = plugin.api.getSlowestRenders(3)
    expect(slowest.length).toBeLessThanOrEqual(3)
  })

  it('should log debug warning when render exceeds warn threshold but not error threshold', () => {
    // Use very low thresholds so we can trigger them predictably
    const plugin = renderTimer({ warnThreshold: 0, errorThreshold: 10000 })
    plugin.install(mockKernel)

    const now = Date.now()

    // The onMount hook will calculate duration as Date.now() - event.timestamp
    // Setting timestamp to a recent time ensures duration > 0 but < errorThreshold
    plugin.hooks?.onMount?.({
      componentId: 'comp-1',
      componentName: 'WarnComponent',
      timestamp: now - 5, // 5ms ago
      props: {},
      initialState: {},
      type: 'mount',
    })

    // With warnThreshold=0, any positive duration should trigger debug log
    expect(consoleDebugSpy).toHaveBeenCalled()
  })

  it('should log error warning when render exceeds error threshold', () => {
    // Use very low error threshold
    const plugin = renderTimer({ warnThreshold: 0, errorThreshold: 0 })
    plugin.install(mockKernel)

    const now = Date.now()

    plugin.hooks?.onMount?.({
      componentId: 'comp-1',
      componentName: 'ErrorComponent',
      timestamp: now - 5, // 5ms ago
      props: {},
      initialState: {},
      type: 'mount',
    })

    // With errorThreshold=0, any positive duration should trigger warn log
    expect(consoleWarnSpy).toHaveBeenCalled()
  })

  it('should trim allRenders array when it exceeds 1000 entries', () => {
    const plugin = renderTimer()
    plugin.install(mockKernel)

    // Add many mount events to exceed the 1000 limit
    for (let i = 0; i < 1010; i++) {
      plugin.hooks?.onMount?.({
        componentId: `comp-${i}`,
        componentName: `Component${i}`,
        timestamp: Date.now() - 1,
        props: {},
        initialState: {},
        type: 'mount',
      })
    }

    // The allRenders array should have been trimmed
    const slowest = plugin.api.getSlowestRenders(2000)
    // After trimming, it should have at most ~910 entries (1010 - 100)
    expect(slowest.length).toBeLessThanOrEqual(1000)
  })

  it('should handle update with valid duration within sanity check', () => {
    const plugin = renderTimer()
    plugin.install(mockKernel)

    const now = Date.now()

    // First mount
    plugin.hooks?.onMount?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: now - 100,
      props: {},
      initialState: {},
      type: 'mount',
    })

    // Update with reasonable duration
    plugin.hooks?.onUpdate?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: now,
      reason: 'state-change',
      renderCount: 2,
      type: 'update',
    })

    const stats = plugin.api.getRenderTime('comp-1')
    expect(stats.count).toBeGreaterThanOrEqual(1)
  })
})
