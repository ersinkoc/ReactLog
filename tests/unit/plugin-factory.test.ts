import { describe, it, expect, vi } from 'vitest'
import { createPlugin, validatePlugin } from '../../src/plugin-factory'
import type { Kernel } from '../../src/types'

describe('createPlugin', () => {
  it('should create a plugin with required properties', () => {
    const plugin = createPlugin({
      name: 'test-plugin',
      version: '1.0.0',
    })

    expect(plugin.name).toBe('test-plugin')
    expect(plugin.version).toBe('1.0.0')
    expect(plugin.type).toBe('optional')
  })

  it('should create a plugin with custom type', () => {
    const plugin = createPlugin({
      name: 'core-plugin',
      version: '2.0.0',
      type: 'core',
    })

    expect(plugin.type).toBe('core')
  })

  it('should create a plugin with hooks', () => {
    const onMount = vi.fn()
    const plugin = createPlugin({
      name: 'hooked-plugin',
      version: '1.0.0',
      hooks: {
        onMount,
      },
    })

    expect(plugin.hooks?.onMount).toBe(onMount)
  })

  it('should create a plugin with api', () => {
    const api = {
      getData: () => 'test',
      setData: vi.fn(),
    }
    const plugin = createPlugin({
      name: 'api-plugin',
      version: '1.0.0',
      api,
    })

    expect(plugin.api).toBe(api)
  })

  it('should call onInstall when install is called', () => {
    const onInstall = vi.fn()
    const plugin = createPlugin({
      name: 'install-plugin',
      version: '1.0.0',
      onInstall,
    })

    const mockKernel = {} as Kernel
    plugin.install(mockKernel)

    expect(onInstall).toHaveBeenCalledWith(mockKernel)
  })

  it('should call onUninstall when uninstall is called', () => {
    const onUninstall = vi.fn()
    const plugin = createPlugin({
      name: 'uninstall-plugin',
      version: '1.0.0',
      onUninstall,
    })

    plugin.uninstall()

    expect(onUninstall).toHaveBeenCalled()
  })

  it('should throw error if name is missing', () => {
    expect(() =>
      createPlugin({
        name: '',
        version: '1.0.0',
      })
    ).toThrow('Plugin name is required and must be a string')
  })

  it('should throw error if name is not a string', () => {
    expect(() =>
      createPlugin({
        name: 123 as unknown as string,
        version: '1.0.0',
      })
    ).toThrow('Plugin name is required and must be a string')
  })

  it('should throw error if version is missing', () => {
    expect(() =>
      createPlugin({
        name: 'test',
        version: '',
      })
    ).toThrow('Plugin version is required and must be a string')
  })

  it('should throw error if version is not a string', () => {
    expect(() =>
      createPlugin({
        name: 'test',
        version: 123 as unknown as string,
      })
    ).toThrow('Plugin version is required and must be a string')
  })
})

describe('validatePlugin', () => {
  it('should validate a valid plugin', () => {
    const plugin = {
      name: 'test',
      version: '1.0.0',
      type: 'optional' as const,
      install: vi.fn(),
      uninstall: vi.fn(),
    }

    expect(validatePlugin(plugin)).toBe(true)
  })

  it('should throw error if plugin is not an object', () => {
    expect(() => validatePlugin(null)).toThrow('Plugin must be an object')
    expect(() => validatePlugin(undefined)).toThrow('Plugin must be an object')
    expect(() => validatePlugin('string')).toThrow('Plugin must be an object')
    expect(() => validatePlugin(123)).toThrow('Plugin must be an object')
  })

  it('should throw error if name is missing', () => {
    expect(() =>
      validatePlugin({
        version: '1.0.0',
        type: 'optional',
        install: vi.fn(),
        uninstall: vi.fn(),
      })
    ).toThrow('Plugin must have a name property of type string')
  })

  it('should throw error if name is not a string', () => {
    expect(() =>
      validatePlugin({
        name: 123,
        version: '1.0.0',
        type: 'optional',
        install: vi.fn(),
        uninstall: vi.fn(),
      })
    ).toThrow('Plugin must have a name property of type string')
  })

  it('should throw error if version is missing', () => {
    expect(() =>
      validatePlugin({
        name: 'test',
        type: 'optional',
        install: vi.fn(),
        uninstall: vi.fn(),
      })
    ).toThrow('Plugin must have a version property of type string')
  })

  it('should throw error if version is not a string', () => {
    expect(() =>
      validatePlugin({
        name: 'test',
        version: 123,
        type: 'optional',
        install: vi.fn(),
        uninstall: vi.fn(),
      })
    ).toThrow('Plugin must have a version property of type string')
  })

  it('should throw error if type is invalid', () => {
    expect(() =>
      validatePlugin({
        name: 'test',
        version: '1.0.0',
        type: 'invalid',
        install: vi.fn(),
        uninstall: vi.fn(),
      })
    ).toThrow('Plugin must have a type property of "core" or "optional"')
  })

  it('should throw error if type is missing', () => {
    expect(() =>
      validatePlugin({
        name: 'test',
        version: '1.0.0',
        install: vi.fn(),
        uninstall: vi.fn(),
      })
    ).toThrow('Plugin must have a type property of "core" or "optional"')
  })

  it('should throw error if install is not a function', () => {
    expect(() =>
      validatePlugin({
        name: 'test',
        version: '1.0.0',
        type: 'optional',
        install: 'not a function',
        uninstall: vi.fn(),
      })
    ).toThrow('Plugin must have an install method')
  })

  it('should throw error if uninstall is not a function', () => {
    expect(() =>
      validatePlugin({
        name: 'test',
        version: '1.0.0',
        type: 'optional',
        install: vi.fn(),
        uninstall: 'not a function',
      })
    ).toThrow('Plugin must have an uninstall method')
  })
})
