import type {
  Kernel as IKernel,
  KernelOptions,
  KernelEvent,
  EventType,
  EventHandler,
  LogHandler,
  LogEntry,
  LogStore,
  LogFilter,
  Plugin,
  PluginInfo,
  PluginHooks,
  LogLevel,
} from '../types'
import { EventBus, createEventBus } from './event-bus'
import { LogStore as LogStoreImpl, createLogStore } from './log-store'
import { PluginRegistry, createPluginRegistry } from './plugin-registry'
import { generateUID, formatValue } from '../utils'

/**
 * Default kernel options
 */
const DEFAULT_OPTIONS: Required<KernelOptions> = {
  enabled: true,
  maxLogs: 1000,
  logLevel: 'debug',
}

/**
 * Log level priorities for filtering
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

/**
 * Map event types to log levels
 */
function getLogLevelForEvent(event: KernelEvent): LogLevel {
  switch (event.type) {
    case 'error':
      return 'error'
    case 'unmount':
    case 'effect-cleanup':
      return 'info'
    case 'mount':
    case 'update':
    case 'props-change':
    case 'state-change':
    case 'effect-run':
    case 'context-change':
      return 'debug'
  }
}

/**
 * Format event for log entry
 */
function formatEventForLog(event: KernelEvent): string {
  switch (event.type) {
    case 'mount':
      return `MOUNT ${event.componentName}`
    case 'unmount':
      return `UNMOUNT ${event.componentName} (lifetime: ${event.lifetime}ms)`
    case 'update':
      return `UPDATE ${event.componentName} (${event.reason}, render #${event.renderCount})`
    case 'props-change':
      return `PROPS ${event.componentName} (${event.changes.length} changes)`
    case 'state-change':
      return `STATE ${event.componentName} [${event.hookIndex}] ${formatValue(event.prevState)} → ${formatValue(event.nextState)}`
    case 'effect-run':
      return `EFFECT RUN ${event.componentName} [${event.effectIndex}]`
    case 'effect-cleanup':
      return `EFFECT CLEANUP ${event.componentName} [${event.effectIndex}] (${event.reason})`
    case 'context-change':
      return `CONTEXT ${event.componentName} ${event.contextName}`
    case 'error':
      return `ERROR ${event.componentName}: ${event.error.message}`
  }
}

/**
 * Main Kernel class implementing the micro-kernel architecture
 */
export class Kernel implements IKernel {
  private eventBus: EventBus
  private logStore: LogStoreImpl
  private pluginRegistry: PluginRegistry
  private options: Required<KernelOptions>
  private _enabled: boolean

  constructor(options: KernelOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this._enabled = this.options.enabled

    this.eventBus = createEventBus()
    this.logStore = createLogStore(this.options.maxLogs)
    this.pluginRegistry = createPluginRegistry()

    // Set kernel reference in plugin registry
    this.pluginRegistry.setKernel(this)
  }

  // ============================================
  // PLUGIN MANAGEMENT
  // ============================================

  /**
   * Register a plugin
   */
  register(plugin: Plugin): void {
    this.pluginRegistry.register(plugin)
  }

  /**
   * Unregister a plugin
   */
  unregister(pluginName: string): void {
    this.pluginRegistry.unregister(pluginName)
  }

  /**
   * Get a plugin by name
   */
  getPlugin<T extends Plugin>(name: string): T | undefined {
    return this.pluginRegistry.getPlugin<T>(name)
  }

  /**
   * List all plugins
   */
  listPlugins(): PluginInfo[] {
    return this.pluginRegistry.listPlugins()
  }

  // ============================================
  // EVENT SYSTEM
  // ============================================

  /**
   * Emit an event
   */
  emit(event: KernelEvent): void {
    if (!this._enabled) return

    // Emit to event bus first
    this.eventBus.emit(event)

    // Call plugin hooks
    this.callPluginHooks(event)

    // Create and add log entry
    const level = getLogLevelForEvent(event)

    // Check if event meets log level threshold
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.options.logLevel]) {
      return
    }

    const logEntry: LogEntry = {
      id: generateUID(),
      timestamp: event.timestamp,
      componentId: event.componentId,
      componentName: event.componentName,
      event,
      level,
      formatted: formatEventForLog(event),
    }

    this.addLog(logEntry)
  }

  /**
   * Call appropriate plugin hooks for an event
   */
  private callPluginHooks(event: KernelEvent): void {
    const hookName = this.getHookNameForEvent(event.type)
    if (!hookName) return

    const plugins = this.pluginRegistry.getPluginsByHook(hookName)
    for (const plugin of plugins) {
      try {
        const hook = plugin.hooks?.[hookName]
        if (typeof hook === 'function') {
          // Type assertion needed due to union type
          ;(hook as (e: KernelEvent) => void)(event)
        }
      } catch (error) {
        console.error(`[ReactLog] Plugin "${plugin.name}" hook error:`, error)
      }
    }
  }

  /**
   * Map event type to hook name
   */
  private getHookNameForEvent(eventType: EventType): keyof PluginHooks | null {
    const hookMap: Record<EventType, keyof PluginHooks | null> = {
      'mount': 'onMount',
      'unmount': 'onUnmount',
      'update': 'onUpdate',
      'props-change': 'onPropsChange',
      'state-change': 'onStateChange',
      'effect-run': 'onEffectRun',
      'effect-cleanup': 'onEffectCleanup',
      'context-change': 'onContextChange',
      'error': 'onError',
      'log': null,
    }
    return hookMap[eventType]
  }

  /**
   * Subscribe to an event type
   */
  on(eventType: EventType, handler: EventHandler): () => void {
    return this.eventBus.on(eventType, handler)
  }

  /**
   * Subscribe to log entries
   */
  onLog(handler: LogHandler): () => void {
    return this.eventBus.onLog(handler)
  }

  /**
   * Unsubscribe from an event type
   */
  off(eventType: EventType, handler: EventHandler): void {
    this.eventBus.off(eventType, handler)
  }

  // ============================================
  // LOG STORE
  // ============================================

  /**
   * Get all logs
   */
  getLogs(): LogStore {
    return this.logStore.getLogs()
  }

  /**
   * Add a log entry
   */
  addLog(entry: LogEntry): void {
    this.logStore.addLog(entry)

    // Emit log event
    this.eventBus.emitLog(entry)

    // Call onLog hooks
    const plugins = this.pluginRegistry.getPluginsByHook('onLog')
    for (const plugin of plugins) {
      try {
        plugin.hooks?.onLog?.(entry)
      } catch (error) {
        console.error(`[ReactLog] Plugin "${plugin.name}" onLog error:`, error)
      }
    }
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logStore.clearLogs()
  }

  /**
   * Filter logs
   */
  filterLogs(filter: LogFilter): LogEntry[] {
    return this.logStore.filterLogs(filter)
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  /**
   * Configure kernel options
   */
  configure(options: KernelOptions): void {
    if (options.enabled !== undefined) {
      this._enabled = options.enabled
    }
    if (options.maxLogs !== undefined) {
      this.options.maxLogs = options.maxLogs
      this.logStore.setMaxLogs(options.maxLogs)
    }
    if (options.logLevel !== undefined) {
      this.options.logLevel = options.logLevel
    }
  }

  /**
   * Check if kernel is enabled
   */
  isEnabled(): boolean {
    return this._enabled
  }

  /**
   * Enable the kernel
   */
  enable(): void {
    this._enabled = true
  }

  /**
   * Disable the kernel
   */
  disable(): void {
    this._enabled = false
  }

  /**
   * Get current options
   */
  getOptions(): KernelOptions {
    return { ...this.options }
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * Destroy the kernel and clean up resources
   */
  destroy(): void {
    this.disable()
    this.pluginRegistry.clear()
    this.eventBus.removeAllListeners()
    this.logStore.clearLogs()
  }
}

/**
 * Creates a new Kernel instance
 *
 * @param options - Kernel options
 * @returns A new Kernel instance
 */
export function createKernel(options?: KernelOptions): Kernel {
  return new Kernel(options)
}
