import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PluginRegistry, createPluginRegistry } from '../../../src/kernel/plugin-registry'
import type { Plugin, Kernel } from '../../../src/types'

describe('PluginRegistry', () => {
  let registry: PluginRegistry
  let mockKernel: Kernel

  function createMockPlugin(name: string, type: 'core' | 'optional' = 'optional'): Plugin {
    return {
      name,
      version: '1.0.0',
      type,
      install: vi.fn(),
      uninstall: vi.fn(),
    }
  }

  beforeEach(() => {
    registry = new PluginRegistry()
    mockKernel = {
      register: vi.fn(),
      unregister: vi.fn(),
      emit: vi.fn(),
      getLogs: vi.fn(),
    } as unknown as Kernel
  })

  describe('setKernel', () => {
    it('should set kernel reference', () => {
      registry.setKernel(mockKernel)
      const plugin = createMockPlugin('test')
      registry.register(plugin)
      expect(plugin.install).toHaveBeenCalledWith(mockKernel)
    })
  })

  describe('register', () => {
    it('should register a plugin', () => {
      const plugin = createMockPlugin('test')
      registry.register(plugin)
      expect(registry.hasPlugin('test')).toBe(true)
    })

    it('should throw error for duplicate plugin', () => {
      const plugin = createMockPlugin('test')
      registry.register(plugin)
      expect(() => registry.register(plugin)).toThrow('Plugin "test" is already registered')
    })

    it('should install plugin if kernel is set', () => {
      registry.setKernel(mockKernel)
      const plugin = createMockPlugin('test')
      registry.register(plugin)
      expect(plugin.install).toHaveBeenCalledWith(mockKernel)
    })

    it('should handle install errors gracefully', () => {
      registry.setKernel(mockKernel)
      const plugin = createMockPlugin('error-plugin')
      plugin.install = vi.fn().mockImplementation(() => {
        throw new Error('Install failed')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      registry.register(plugin)

      expect(consoleSpy).toHaveBeenCalled()
      expect(registry.hasPlugin('error-plugin')).toBe(true)
      expect(registry.isPluginEnabled('error-plugin')).toBe(false)
    })
  })

  describe('unregister', () => {
    it('should unregister a plugin', () => {
      const plugin = createMockPlugin('test')
      registry.register(plugin)
      registry.unregister('test')
      expect(registry.hasPlugin('test')).toBe(false)
    })

    it('should call uninstall when unregistering', () => {
      const plugin = createMockPlugin('test')
      registry.register(plugin)
      registry.unregister('test')
      expect(plugin.uninstall).toHaveBeenCalled()
    })

    it('should handle uninstall errors gracefully', () => {
      const plugin = createMockPlugin('error-plugin')
      plugin.uninstall = vi.fn().mockImplementation(() => {
        throw new Error('Uninstall failed')
      })
      registry.register(plugin)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      registry.unregister('error-plugin')

      expect(consoleSpy).toHaveBeenCalled()
      expect(registry.hasPlugin('error-plugin')).toBe(false)
    })

    it('should do nothing for non-existent plugin', () => {
      expect(() => registry.unregister('nonexistent')).not.toThrow()
    })
  })

  describe('getPlugin', () => {
    it('should return plugin by name', () => {
      const plugin = createMockPlugin('test')
      registry.register(plugin)
      expect(registry.getPlugin('test')).toBe(plugin)
    })

    it('should return undefined for unknown plugin', () => {
      expect(registry.getPlugin('unknown')).toBeUndefined()
    })
  })

  describe('listPlugins', () => {
    it('should list all registered plugins', () => {
      registry.register(createMockPlugin('plugin1'))
      registry.register(createMockPlugin('plugin2', 'core'))

      const list = registry.listPlugins()
      expect(list).toHaveLength(2)
      expect(list[0]).toEqual({
        name: 'plugin1',
        version: '1.0.0',
        type: 'optional',
        enabled: true,
      })
    })
  })

  describe('enablePlugin', () => {
    it('should enable a disabled plugin', () => {
      registry.setKernel(mockKernel)
      const plugin = createMockPlugin('test')
      registry.register(plugin)
      registry.disablePlugin('test')
      expect(registry.isPluginEnabled('test')).toBe(false)

      registry.enablePlugin('test')
      expect(registry.isPluginEnabled('test')).toBe(true)
    })

    it('should call install when enabling', () => {
      registry.setKernel(mockKernel)
      const plugin = createMockPlugin('test')
      registry.register(plugin)
      registry.disablePlugin('test')

      vi.clearAllMocks()
      registry.enablePlugin('test')

      expect(plugin.install).toHaveBeenCalledWith(mockKernel)
    })

    it('should handle install errors gracefully', () => {
      registry.setKernel(mockKernel)
      const plugin = createMockPlugin('test')
      plugin.install = vi.fn()
        .mockImplementationOnce(() => {}) // First install succeeds
        .mockImplementationOnce(() => { throw new Error('Install failed') }) // Second install fails

      registry.register(plugin)
      registry.disablePlugin('test')

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      registry.enablePlugin('test')

      expect(consoleSpy).toHaveBeenCalled()
      expect(registry.isPluginEnabled('test')).toBe(false)
    })

    it('should do nothing for non-existent plugin', () => {
      expect(() => registry.enablePlugin('unknown')).not.toThrow()
    })

    it('should do nothing for already enabled plugin', () => {
      const plugin = createMockPlugin('test')
      registry.register(plugin)
      registry.enablePlugin('test')
      // No error should occur
    })
  })

  describe('disablePlugin', () => {
    it('should disable an enabled plugin', () => {
      const plugin = createMockPlugin('test')
      registry.register(plugin)
      registry.disablePlugin('test')
      expect(registry.isPluginEnabled('test')).toBe(false)
    })

    it('should call uninstall when disabling', () => {
      const plugin = createMockPlugin('test')
      registry.register(plugin)
      registry.disablePlugin('test')
      expect(plugin.uninstall).toHaveBeenCalled()
    })

    it('should handle uninstall errors gracefully', () => {
      const plugin = createMockPlugin('test')
      plugin.uninstall = vi.fn().mockImplementation(() => {
        throw new Error('Uninstall failed')
      })
      registry.register(plugin)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      registry.disablePlugin('test')

      expect(consoleSpy).toHaveBeenCalled()
      expect(registry.isPluginEnabled('test')).toBe(false)
    })

    it('should do nothing for non-existent plugin', () => {
      expect(() => registry.disablePlugin('unknown')).not.toThrow()
    })

    it('should do nothing for already disabled plugin', () => {
      const plugin = createMockPlugin('test')
      registry.register(plugin)
      registry.disablePlugin('test')
      registry.disablePlugin('test')
      // No error should occur
    })
  })

  describe('isPluginEnabled', () => {
    it('should return true for enabled plugin', () => {
      registry.register(createMockPlugin('test'))
      expect(registry.isPluginEnabled('test')).toBe(true)
    })

    it('should return false for disabled plugin', () => {
      registry.register(createMockPlugin('test'))
      registry.disablePlugin('test')
      expect(registry.isPluginEnabled('test')).toBe(false)
    })

    it('should return false for unknown plugin', () => {
      expect(registry.isPluginEnabled('unknown')).toBe(false)
    })
  })

  describe('getPluginsByHook', () => {
    it('should return plugins with specific hook', () => {
      const pluginWithHook = createMockPlugin('with-hook')
      pluginWithHook.hooks = { onMount: vi.fn() }

      const pluginWithoutHook = createMockPlugin('without-hook')

      registry.register(pluginWithHook)
      registry.register(pluginWithoutHook)

      const plugins = registry.getPluginsByHook('onMount')
      expect(plugins).toHaveLength(1)
      expect(plugins[0].name).toBe('with-hook')
    })

    it('should not return disabled plugins', () => {
      const plugin = createMockPlugin('test')
      plugin.hooks = { onMount: vi.fn() }

      registry.register(plugin)
      registry.disablePlugin('test')

      expect(registry.getPluginsByHook('onMount')).toHaveLength(0)
    })
  })

  describe('getEnabledPlugins', () => {
    it('should return only enabled plugins', () => {
      registry.register(createMockPlugin('enabled'))
      registry.register(createMockPlugin('disabled'))
      registry.disablePlugin('disabled')

      const enabled = registry.getEnabledPlugins()
      expect(enabled).toHaveLength(1)
      expect(enabled[0].name).toBe('enabled')
    })
  })

  describe('getPluginCount', () => {
    it('should return total plugin count', () => {
      registry.register(createMockPlugin('plugin1'))
      registry.register(createMockPlugin('plugin2'))
      expect(registry.getPluginCount()).toBe(2)
    })
  })

  describe('getEnabledPluginCount', () => {
    it('should return enabled plugin count', () => {
      registry.register(createMockPlugin('plugin1'))
      registry.register(createMockPlugin('plugin2'))
      registry.disablePlugin('plugin2')
      expect(registry.getEnabledPluginCount()).toBe(1)
    })
  })

  describe('hasPlugin', () => {
    it('should return true for registered plugin', () => {
      registry.register(createMockPlugin('test'))
      expect(registry.hasPlugin('test')).toBe(true)
    })

    it('should return false for unregistered plugin', () => {
      expect(registry.hasPlugin('unknown')).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all plugins', () => {
      registry.register(createMockPlugin('plugin1'))
      registry.register(createMockPlugin('plugin2'))
      registry.clear()
      expect(registry.getPluginCount()).toBe(0)
      expect(registry.getEnabledPluginCount()).toBe(0)
    })

    it('should call uninstall on all plugins', () => {
      const plugin1 = createMockPlugin('plugin1')
      const plugin2 = createMockPlugin('plugin2')
      registry.register(plugin1)
      registry.register(plugin2)
      registry.clear()
      expect(plugin1.uninstall).toHaveBeenCalled()
      expect(plugin2.uninstall).toHaveBeenCalled()
    })

    it('should handle uninstall errors gracefully', () => {
      const plugin = createMockPlugin('error-plugin')
      plugin.uninstall = vi.fn().mockImplementation(() => {
        throw new Error('Uninstall failed')
      })
      registry.register(plugin)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      registry.clear()

      expect(consoleSpy).toHaveBeenCalled()
      expect(registry.getPluginCount()).toBe(0)
    })
  })
})

describe('createPluginRegistry', () => {
  it('should create a new PluginRegistry instance', () => {
    const registry = createPluginRegistry()
    expect(registry).toBeInstanceOf(PluginRegistry)
  })
})
