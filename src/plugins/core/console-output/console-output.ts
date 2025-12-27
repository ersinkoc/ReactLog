import type { Plugin, Kernel, LogEntry, ConsoleOutputOptions, ConsoleOutputAPI } from '../../../types'
import {
  formatMountEvent,
  formatUnmountEvent,
  formatUpdateEvent,
  formatPropsChangeEvent,
  formatStateChangeEvent,
  formatEffectRunEvent,
  formatEffectCleanupEvent,
  formatContextChangeEvent,
  formatErrorEvent,
  formatTimestampForConsole,
  CONSOLE_STYLES,
} from './formatters'

/**
 * Default console output options
 */
const DEFAULT_OPTIONS: ConsoleOutputOptions = {
  enabled: true,
  collapsed: true,
  colors: true,
  timestamp: true,
  showProps: true,
  showState: true,
  showEffects: true,
  filter: undefined,
}

/**
 * Creates the console-output plugin
 * Formats and outputs beautiful console logs
 */
export function consoleOutput(
  userOptions: Partial<ConsoleOutputOptions> = {}
): Plugin & { api: ConsoleOutputAPI } {
  let options: ConsoleOutputOptions = { ...DEFAULT_OPTIONS, ...userOptions }
  let kernel: Kernel | null = null
  let paused = false

  const api: ConsoleOutputAPI = {
    configure(newOptions: Partial<ConsoleOutputOptions>): void {
      options = { ...options, ...newOptions }
    },

    pause(): void {
      paused = true
    },

    resume(): void {
      paused = false
    },

    isPaused(): boolean {
      return paused
    },
  }

  function shouldLog(entry: LogEntry): boolean {
    if (!options.enabled || paused) return false

    // Apply filter if configured
    if (options.filter) {
      const filter = options.filter

      // Filter by component name
      if (filter.componentName !== undefined) {
        if (filter.componentName instanceof RegExp) {
          if (!filter.componentName.test(entry.componentName)) return false
        } else if (entry.componentName !== filter.componentName) {
          return false
        }
      }

      // Filter by event type
      if (filter.eventType !== undefined) {
        const types = Array.isArray(filter.eventType) ? filter.eventType : [filter.eventType]
        if (!types.includes(entry.event.type)) return false
      }

      // Filter by log level
      if (filter.level !== undefined) {
        const levels = Array.isArray(filter.level) ? filter.level : [filter.level]
        if (!levels.includes(entry.level)) return false
      }
    }

    return true
  }

  function outputLog(entry: LogEntry): void {
    const event = entry.event
    const timestamp = options.timestamp ? formatTimestampForConsole(entry.timestamp) : ''

    // Choose console method
    const groupMethod = options.collapsed ? console.groupCollapsed : console.group

    // Format based on event type
    let formatted: { message: string; args: unknown[]; details?: { message: string; args: unknown[] }[] }

    switch (event.type) {
      case 'mount':
        if (!options.showProps) return
        formatted = formatMountEvent(event)
        break
      case 'unmount':
        formatted = formatUnmountEvent(event)
        break
      case 'update':
        formatted = formatUpdateEvent(event)
        break
      case 'props-change':
        if (!options.showProps) return
        formatted = formatPropsChangeEvent(event)
        break
      case 'state-change':
        if (!options.showState) return
        formatted = formatStateChangeEvent(event)
        break
      case 'effect-run':
        if (!options.showEffects) return
        formatted = formatEffectRunEvent(event)
        break
      case 'effect-cleanup':
        if (!options.showEffects) return
        formatted = formatEffectCleanupEvent(event)
        break
      case 'context-change':
        formatted = formatContextChangeEvent(event)
        break
      case 'error':
        formatted = formatErrorEvent(event)
        break
      default:
        return
    }

    // Add timestamp to message if enabled
    let message = formatted.message
    let args = formatted.args
    if (timestamp) {
      message = `${message} %c${timestamp}`
      args = [...args, CONSOLE_STYLES.timestamp]
    }

    // Output to console
    if (options.colors) {
      if ('details' in formatted && formatted.details && formatted.details.length > 0) {
        groupMethod(message, ...args)
        for (const detail of formatted.details) {
          console.log(detail.message, ...detail.args)
        }
        console.groupEnd()
      } else {
        console.log(message, ...args)
      }
    } else {
      // Plain text without colors
      const plainMessage = message.replace(/%c/g, '')
      if ('details' in formatted && formatted.details && formatted.details.length > 0) {
        groupMethod(plainMessage)
        for (const detail of formatted.details) {
          console.log(detail.message.replace(/%c/g, ''))
        }
        console.groupEnd()
      } else {
        console.log(plainMessage)
      }
    }
  }

  const plugin: Plugin = {
    name: 'console-output',
    version: '1.0.0',
    type: 'core',

    install(k: Kernel): void {
      kernel = k
    },

    uninstall(): void {
      kernel = null
    },

    api: api as unknown as Record<string, unknown>,

    hooks: {
      onLog(entry: LogEntry): void {
        if (shouldLog(entry)) {
          outputLog(entry)
        }
      },
    },
  }

  return plugin as Plugin & { api: ConsoleOutputAPI }
}
