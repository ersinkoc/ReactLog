import type {
  Plugin,
  Kernel,
  ErrorEvent,
  ErrorTrackerOptions,
  ErrorTrackerAPI,
  ErrorRecord,
} from '../../types'
import { generateUID } from '../../utils'

/**
 * Default options for error tracker
 */
const DEFAULT_OPTIONS: ErrorTrackerOptions = {
  captureStack: true,
  maxErrors: 100,
}

/**
 * Creates the error-tracker plugin
 * Tracks Error Boundary catches and component errors
 */
export function errorTracker(
  userOptions: Partial<ErrorTrackerOptions> = {}
): Plugin & { api: ErrorTrackerAPI } {
  const options: ErrorTrackerOptions = { ...DEFAULT_OPTIONS, ...userOptions }
  const errors: ErrorRecord[] = []
  const errorsByComponent = new Map<string, ErrorRecord[]>()

  function addError(record: ErrorRecord): void {
    errors.push(record)

    // Index by component
    let componentErrors = errorsByComponent.get(record.componentId)
    if (!componentErrors) {
      componentErrors = []
      errorsByComponent.set(record.componentId, componentErrors)
    }
    componentErrors.push(record)

    // Trim if over max
    if (errors.length > options.maxErrors) {
      const removed = errors.shift()
      if (removed) {
        const compErrors = errorsByComponent.get(removed.componentId)
        if (compErrors) {
          const index = compErrors.indexOf(removed)
          if (index !== -1) {
            compErrors.splice(index, 1)
          }
          if (compErrors.length === 0) {
            errorsByComponent.delete(removed.componentId)
          }
        }
      }
    }
  }

  const api: ErrorTrackerAPI = {
    getErrors(componentId?: string): ErrorRecord[] {
      if (componentId) {
        return errorsByComponent.get(componentId) ?? []
      }
      return [...errors]
    },

    getErrorCount(): number {
      return errors.length
    },

    clearErrors(): void {
      errors.length = 0
      errorsByComponent.clear()
    },

    getLastError(): ErrorRecord | null {
      return errors[errors.length - 1] ?? null
    },
  }

  const plugin: Plugin = {
    name: 'error-tracker',
    version: '1.0.0',
    type: 'optional',

    install(_k: Kernel): void {
      // Plugin installed
    },

    uninstall(): void {
      errors.length = 0
      errorsByComponent.clear()
    },

    hooks: {
      onError(event: ErrorEvent): void {
        const record: ErrorRecord = {
          id: generateUID(),
          timestamp: event.timestamp,
          componentId: event.componentId,
          componentName: event.componentName,
          error: event.error,
          errorInfo: event.errorInfo,
          recovered: event.recovered,
          stack: options.captureStack ? event.error.stack ?? null : null,
        }

        addError(record)
      },
    },

    api: api as unknown as Record<string, unknown>,
  }

  return plugin as Plugin & { api: ErrorTrackerAPI }
}
