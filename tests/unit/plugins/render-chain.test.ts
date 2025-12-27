import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderChain } from '../../../src/plugins/optional/render-chain'
import type { Kernel, MountEvent, UpdateEvent } from '../../../src/types'

describe('renderChain plugin', () => {
  let mockKernel: Kernel
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

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
  })

  it('should create plugin with correct name and version', () => {
    const plugin = renderChain()
    expect(plugin.name).toBe('render-chain')
    expect(plugin.version).toBe('1.0.0')
    expect(plugin.type).toBe('optional')
  })

  it('should install and uninstall correctly', () => {
    const plugin = renderChain()
    expect(() => plugin.install(mockKernel)).not.toThrow()
    expect(() => plugin.uninstall()).not.toThrow()
  })

  it('should track component mounts', () => {
    const plugin = renderChain()
    plugin.install(mockKernel)

    const now = Date.now()
    const event: MountEvent = {
      componentId: 'comp-1',
      componentName: 'ParentComponent',
      timestamp: now,
      props: {},
    }

    plugin.hooks?.onMount?.(event)

    const chain = plugin.api.getChain('comp-1')
    expect(chain).not.toBeNull()
    expect(chain?.componentName).toBe('ParentComponent')
  })

  it('should track render chains within time window', () => {
    const plugin = renderChain()
    plugin.install(mockKernel)

    const now = Date.now()

    // Parent mounts
    plugin.hooks?.onMount?.({
      componentId: 'parent',
      componentName: 'Parent',
      timestamp: now,
      props: {},
    })

    // Child mounts shortly after (within 50ms window)
    plugin.hooks?.onMount?.({
      componentId: 'child',
      componentName: 'Child',
      timestamp: now + 10,
      props: {},
    })

    const childChain = plugin.api.getChain('child')
    expect(childChain?.triggeredBy).toBe('parent')
  })

  it('should not link renders outside time window', () => {
    const plugin = renderChain()
    plugin.install(mockKernel)

    const now = Date.now()

    // Parent mounts
    plugin.hooks?.onMount?.({
      componentId: 'parent',
      componentName: 'Parent',
      timestamp: now,
      props: {},
    })

    // Child mounts after 100ms (outside 50ms window)
    plugin.hooks?.onMount?.({
      componentId: 'child',
      componentName: 'Child',
      timestamp: now + 100,
      props: {},
    })

    const childChain = plugin.api.getChain('child')
    expect(childChain?.triggeredBy).toBeNull()
  })

  it('should track updates', () => {
    const plugin = renderChain()
    plugin.install(mockKernel)

    const now = Date.now()

    plugin.hooks?.onMount?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: now,
      props: {},
    })

    plugin.hooks?.onUpdate?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: now + 10,
      updateReason: 'state-change',
      renderCount: 2,
    })

    const chain = plugin.api.getChain('comp-1')
    expect(chain?.timestamp).toBe(now + 10)
  })

  it('should get root cause of render chain', () => {
    const plugin = renderChain()
    plugin.install(mockKernel)

    const now = Date.now()

    plugin.hooks?.onMount?.({
      componentId: 'grandparent',
      componentName: 'GrandParent',
      timestamp: now,
      props: {},
    })

    plugin.hooks?.onMount?.({
      componentId: 'parent',
      componentName: 'Parent',
      timestamp: now + 10,
      props: {},
    })

    plugin.hooks?.onMount?.({
      componentId: 'child',
      componentName: 'Child',
      timestamp: now + 20,
      props: {},
    })

    const rootCause = plugin.api.getRootCause('child')
    expect(rootCause).toBe('grandparent')
  })

  it('should get children of a component', () => {
    const plugin = renderChain()
    plugin.install(mockKernel)

    const now = Date.now()

    plugin.hooks?.onMount?.({
      componentId: 'parent',
      componentName: 'Parent',
      timestamp: now,
      props: {},
    })

    // First child triggered by parent
    plugin.hooks?.onMount?.({
      componentId: 'child1',
      componentName: 'Child1',
      timestamp: now + 10,
      props: {},
    })

    // The algorithm links to the last rendered component (child1)
    // So child2's parent will be child1, not 'parent'
    const children = plugin.api.getChildren('parent')
    expect(children).toContain('child1')

    // To have child2 as a child of parent, they need separate render chains
    // Here child2 would be a child of child1
    plugin.hooks?.onMount?.({
      componentId: 'child2',
      componentName: 'Child2',
      timestamp: now + 100, // Outside chain window - starts new chain
      props: {},
    })

    // child2 is now a root since it's outside the time window
    expect(plugin.api.getParent('child2')).toBeNull()
  })

  it('should get parent of a component', () => {
    const plugin = renderChain()
    plugin.install(mockKernel)

    const now = Date.now()

    plugin.hooks?.onMount?.({
      componentId: 'parent',
      componentName: 'Parent',
      timestamp: now,
      props: {},
    })

    plugin.hooks?.onMount?.({
      componentId: 'child',
      componentName: 'Child',
      timestamp: now + 10,
      props: {},
    })

    const parent = plugin.api.getParent('child')
    expect(parent).toBe('parent')
  })

  it('should return null for unknown component chain', () => {
    const plugin = renderChain()
    plugin.install(mockKernel)

    expect(plugin.api.getChain('unknown')).toBeNull()
  })

  it('should return empty array for component with no children', () => {
    const plugin = renderChain()
    plugin.install(mockKernel)

    plugin.hooks?.onMount?.({
      componentId: 'lonely',
      componentName: 'LonelyComponent',
      timestamp: Date.now(),
      props: {},
    })

    expect(plugin.api.getChildren('lonely')).toEqual([])
  })

  it('should return null for component with no parent', () => {
    const plugin = renderChain()
    plugin.install(mockKernel)

    plugin.hooks?.onMount?.({
      componentId: 'root',
      componentName: 'RootComponent',
      timestamp: Date.now(),
      props: {},
    })

    expect(plugin.api.getParent('root')).toBeNull()
  })

  it('should visualize render chain', () => {
    const plugin = renderChain()
    plugin.install(mockKernel)

    // With no chains
    expect(plugin.api.visualizeChain()).toBe('No render chains recorded')

    const now = Date.now()

    plugin.hooks?.onMount?.({
      componentId: 'root',
      componentName: 'Root',
      timestamp: now,
      props: {},
    })

    plugin.hooks?.onMount?.({
      componentId: 'child',
      componentName: 'Child',
      timestamp: now + 10,
      props: {},
    })

    const visualization = plugin.api.visualizeChain()
    expect(visualization).toContain('Root')
  })

  it('should warn on deep render chains', () => {
    const plugin = renderChain({ maxDepth: 2 })
    plugin.install(mockKernel)

    const now = Date.now()

    for (let i = 0; i < 5; i++) {
      plugin.hooks?.onMount?.({
        componentId: `comp-${i}`,
        componentName: `Component${i}`,
        timestamp: now + i * 10,
        props: {},
      })
    }

    // Should have warned about deep chain
    expect(consoleWarnSpy).toHaveBeenCalled()
  })

  it('should clear data on uninstall', () => {
    const plugin = renderChain()
    plugin.install(mockKernel)

    plugin.hooks?.onMount?.({
      componentId: 'comp-1',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      props: {},
    })

    plugin.uninstall()

    expect(plugin.api.getChain('comp-1')).toBeNull()
  })
})
