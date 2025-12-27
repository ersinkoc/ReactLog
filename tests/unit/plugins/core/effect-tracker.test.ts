import { describe, it, expect, vi, beforeEach } from 'vitest'
import { effectTracker } from '../../../../src/plugins/core/effect-tracker'
import type { Kernel, EffectRunEvent, EffectCleanupEvent } from '../../../../src/types'

describe('effectTracker plugin', () => {
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
    const plugin = effectTracker()
    expect(plugin.name).toBe('effect-tracker')
    expect(plugin.version).toBe('1.0.0')
    expect(plugin.type).toBe('core')
  })

  it('should install and uninstall correctly', () => {
    const plugin = effectTracker()
    expect(() => plugin.install(mockKernel)).not.toThrow()
    expect(() => plugin.uninstall()).not.toThrow()
  })

  it('should track effect runs', () => {
    const plugin = effectTracker()
    plugin.install(mockKernel)

    const event: EffectRunEvent = {
      componentId: 'comp-1',
      componentName: 'TestComponent',
      effectIndex: 0,
      dependencies: [1, 2, 3],
      dependenciesChanged: [],
      timestamp: Date.now(),
    }

    plugin.hooks?.onEffectRun?.(event)

    const history = plugin.api.getEffectHistory('comp-1')
    expect(history).toHaveLength(1)
    expect(history[0].action).toBe('run')
    expect(history[0].effectIndex).toBe(0)
    expect(history[0].reason).toBe('mount')
  })

  it('should track subsequent effect runs as deps-change', () => {
    const plugin = effectTracker()
    plugin.install(mockKernel)

    // First run (mount)
    plugin.hooks?.onEffectRun?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      effectIndex: 0,
      dependencies: [1],
      dependenciesChanged: [],
      timestamp: Date.now(),
    })

    // Second run (deps-change)
    plugin.hooks?.onEffectRun?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      effectIndex: 0,
      dependencies: [2],
      dependenciesChanged: [0],
      timestamp: Date.now() + 100,
    })

    const history = plugin.api.getEffectHistory('comp-1')
    expect(history).toHaveLength(2)
    expect(history[0].reason).toBe('mount')
    expect(history[1].reason).toBe('deps-change')
  })

  it('should track effect cleanups', () => {
    const plugin = effectTracker()
    plugin.install(mockKernel)

    // First run the effect
    plugin.hooks?.onEffectRun?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      effectIndex: 0,
      dependencies: [1],
      dependenciesChanged: [],
      timestamp: Date.now(),
    })

    // Then cleanup
    const cleanupEvent: EffectCleanupEvent = {
      componentId: 'comp-1',
      componentName: 'TestComponent',
      effectIndex: 0,
      reason: 'unmount',
      timestamp: Date.now() + 100,
    }

    plugin.hooks?.onEffectCleanup?.(cleanupEvent)

    const history = plugin.api.getEffectHistory('comp-1')
    expect(history).toHaveLength(2)
    expect(history[1].action).toBe('cleanup')
    expect(history[1].reason).toBe('unmount')
  })

  it('should handle cleanup for unknown component', () => {
    const plugin = effectTracker()
    plugin.install(mockKernel)

    // Cleanup without run should not crash
    expect(() => {
      plugin.hooks?.onEffectCleanup?.({
        componentId: 'unknown',
        componentName: 'Unknown',
        effectIndex: 0,
        reason: 'unmount',
        timestamp: Date.now(),
      })
    }).not.toThrow()
  })

  it('should get effect run count', () => {
    const plugin = effectTracker()
    plugin.install(mockKernel)

    expect(plugin.api.getEffectRunCount('comp-1', 0)).toBe(0)

    plugin.hooks?.onEffectRun?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      effectIndex: 0,
      dependencies: [],
      dependenciesChanged: [],
      timestamp: Date.now(),
    })

    expect(plugin.api.getEffectRunCount('comp-1', 0)).toBe(1)

    plugin.hooks?.onEffectRun?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      effectIndex: 0,
      dependencies: [],
      dependenciesChanged: [],
      timestamp: Date.now() + 100,
    })

    expect(plugin.api.getEffectRunCount('comp-1', 0)).toBe(2)
  })

  it('should get active effects', () => {
    const plugin = effectTracker()
    plugin.install(mockKernel)

    expect(plugin.api.getActiveEffects('comp-1')).toEqual([])

    // Run two effects
    plugin.hooks?.onEffectRun?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      effectIndex: 0,
      dependencies: [],
      dependenciesChanged: [],
      timestamp: Date.now(),
    })

    plugin.hooks?.onEffectRun?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      effectIndex: 1,
      dependencies: [],
      dependenciesChanged: [],
      timestamp: Date.now(),
    })

    const activeEffects = plugin.api.getActiveEffects('comp-1')
    expect(activeEffects).toContain(0)
    expect(activeEffects).toContain(1)

    // Cleanup one effect
    plugin.hooks?.onEffectCleanup?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      effectIndex: 0,
      reason: 'deps-change',
      timestamp: Date.now(),
    })

    const activeAfterCleanup = plugin.api.getActiveEffects('comp-1')
    expect(activeAfterCleanup).not.toContain(0)
    expect(activeAfterCleanup).toContain(1)
  })

  it('should get effect dependencies', () => {
    const plugin = effectTracker()
    plugin.install(mockKernel)

    expect(plugin.api.getEffectDependencies('comp-1', 0)).toEqual([])

    plugin.hooks?.onEffectRun?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      effectIndex: 0,
      dependencies: ['a', 'b', 'c'],
      dependenciesChanged: [],
      timestamp: Date.now(),
    })

    expect(plugin.api.getEffectDependencies('comp-1', 0)).toEqual(['a', 'b', 'c'])
  })

  it('should return empty history for unknown component', () => {
    const plugin = effectTracker()
    plugin.install(mockKernel)

    expect(plugin.api.getEffectHistory('unknown')).toEqual([])
  })

  it('should clear data on uninstall', () => {
    const plugin = effectTracker()
    plugin.install(mockKernel)

    plugin.hooks?.onEffectRun?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      effectIndex: 0,
      dependencies: [],
      dependenciesChanged: [],
      timestamp: Date.now(),
    })

    expect(plugin.api.getEffectHistory('comp-1')).toHaveLength(1)

    plugin.uninstall()

    expect(plugin.api.getEffectHistory('comp-1')).toEqual([])
  })
})
