import type { Plugin, PluginHooks, PluginType, Kernel } from './types'

/**
 * Plugin configuration for createPlugin
 */
export interface PluginConfig {
  name: string
  version: string
  type?: PluginType
  hooks?: PluginHooks
  api?: Record<string, unknown>
  onInstall?: (kernel: Kernel) => void
  onUninstall?: () => void
}

/**
 * Creates a plugin from a configuration object
 *
 * @param config - Plugin configuration
 * @returns A plugin instance
 */
export function createPlugin(config: PluginConfig): Plugin {
  if (!config.name || typeof config.name !== 'string') {
    throw new Error('Plugin name is required and must be a string')
  }

  if (!config.version || typeof config.version !== 'string') {
    throw new Error('Plugin version is required and must be a string')
  }

  return {
    name: config.name,
    version: config.version,
    type: config.type ?? 'optional',
    hooks: config.hooks,
    api: config.api,

    install(k: Kernel): void {
      config.onInstall?.(k)
    },

    uninstall(): void {
      config.onUninstall?.()
    },
  }
}

/**
 * Validates a plugin object
 *
 * @param plugin - Plugin to validate
 * @returns true if valid
 * @throws Error if invalid
 */
export function validatePlugin(plugin: unknown): plugin is Plugin {
  if (!plugin || typeof plugin !== 'object') {
    throw new Error('Plugin must be an object')
  }

  const p = plugin as Record<string, unknown>

  if (!p['name'] || typeof p['name'] !== 'string') {
    throw new Error('Plugin must have a name property of type string')
  }

  if (!p['version'] || typeof p['version'] !== 'string') {
    throw new Error('Plugin must have a version property of type string')
  }

  if (!p['type'] || (p['type'] !== 'core' && p['type'] !== 'optional')) {
    throw new Error('Plugin must have a type property of "core" or "optional"')
  }

  if (typeof p['install'] !== 'function') {
    throw new Error('Plugin must have an install method')
  }

  if (typeof p['uninstall'] !== 'function') {
    throw new Error('Plugin must have an uninstall method')
  }

  return true
}
