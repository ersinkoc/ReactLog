import type { Plugin, PluginInfo, PluginHooks, Kernel } from '../types'

/**
 * PluginRegistry manages plugin lifecycle and storage
 */
export class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map()
  private enabledPlugins: Set<string> = new Set()
  private kernel: Kernel | null = null

  /**
   * Set the kernel reference (called during kernel initialization)
   *
   * @param kernel - The kernel instance
   */
  setKernel(kernel: Kernel): void {
    this.kernel = kernel
  }

  /**
   * Register a plugin
   *
   * @param plugin - The plugin to register
   * @throws Error if plugin with same name already exists
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`)
    }

    this.plugins.set(plugin.name, plugin)
    this.enabledPlugins.add(plugin.name)

    // Install the plugin if kernel is available
    if (this.kernel) {
      try {
        plugin.install(this.kernel)
      } catch (error) {
        console.error(`[ReactLog] Failed to install plugin "${plugin.name}":`, error)
        // Still keep it registered but mark as not enabled
        this.enabledPlugins.delete(plugin.name)
      }
    }
  }

  /**
   * Unregister a plugin
   *
   * @param pluginName - The name of the plugin to unregister
   */
  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (plugin) {
      try {
        plugin.uninstall()
      } catch (error) {
        console.error(`[ReactLog] Failed to uninstall plugin "${pluginName}":`, error)
      }
      this.plugins.delete(pluginName)
      this.enabledPlugins.delete(pluginName)
    }
  }

  /**
   * Get a plugin by name
   *
   * @param name - The plugin name
   * @returns The plugin or undefined
   */
  getPlugin<T extends Plugin>(name: string): T | undefined {
    return this.plugins.get(name) as T | undefined
  }

  /**
   * List all registered plugins
   *
   * @returns Array of plugin info
   */
  listPlugins(): PluginInfo[] {
    return Array.from(this.plugins.values()).map((plugin) => ({
      name: plugin.name,
      version: plugin.version,
      type: plugin.type,
      enabled: this.enabledPlugins.has(plugin.name),
    }))
  }

  /**
   * Enable a plugin
   *
   * @param pluginName - The plugin name
   */
  enablePlugin(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (plugin && !this.enabledPlugins.has(pluginName)) {
      this.enabledPlugins.add(pluginName)
      if (this.kernel) {
        try {
          plugin.install(this.kernel)
        } catch (error) {
          console.error(`[ReactLog] Failed to install plugin "${pluginName}":`, error)
          this.enabledPlugins.delete(pluginName)
        }
      }
    }
  }

  /**
   * Disable a plugin
   *
   * @param pluginName - The plugin name
   */
  disablePlugin(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (plugin && this.enabledPlugins.has(pluginName)) {
      try {
        plugin.uninstall()
      } catch (error) {
        console.error(`[ReactLog] Failed to uninstall plugin "${pluginName}":`, error)
      }
      this.enabledPlugins.delete(pluginName)
    }
  }

  /**
   * Check if a plugin is enabled
   *
   * @param pluginName - The plugin name
   * @returns true if enabled
   */
  isPluginEnabled(pluginName: string): boolean {
    return this.enabledPlugins.has(pluginName)
  }

  /**
   * Get all plugins that have a specific hook
   *
   * @param hookName - The hook name
   * @returns Array of plugins with the hook
   */
  getPluginsByHook(hookName: keyof PluginHooks): Plugin[] {
    return Array.from(this.plugins.values()).filter(
      (plugin) =>
        this.enabledPlugins.has(plugin.name) &&
        plugin.hooks &&
        typeof plugin.hooks[hookName] === 'function'
    )
  }

  /**
   * Get all enabled plugins
   *
   * @returns Array of enabled plugins
   */
  getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).filter((plugin) =>
      this.enabledPlugins.has(plugin.name)
    )
  }

  /**
   * Get plugin count
   *
   * @returns Total number of registered plugins
   */
  getPluginCount(): number {
    return this.plugins.size
  }

  /**
   * Get enabled plugin count
   *
   * @returns Number of enabled plugins
   */
  getEnabledPluginCount(): number {
    return this.enabledPlugins.size
  }

  /**
   * Check if a plugin is registered
   *
   * @param pluginName - The plugin name
   * @returns true if registered
   */
  hasPlugin(pluginName: string): boolean {
    return this.plugins.has(pluginName)
  }

  /**
   * Clear all plugins
   */
  clear(): void {
    // Uninstall all plugins first
    for (const plugin of this.plugins.values()) {
      try {
        plugin.uninstall()
      } catch (error) {
        console.error(`[ReactLog] Failed to uninstall plugin "${plugin.name}":`, error)
      }
    }
    this.plugins.clear()
    this.enabledPlugins.clear()
  }
}

/**
 * Creates a new PluginRegistry instance
 *
 * @returns A new PluginRegistry instance
 */
export function createPluginRegistry(): PluginRegistry {
  return new PluginRegistry()
}
