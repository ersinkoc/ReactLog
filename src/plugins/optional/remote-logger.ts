import type {
  Plugin,
  Kernel,
  LogEntry,
  RemoteLoggerOptions,
  RemoteLoggerAPI,
} from '../../types'

/**
 * Default options for remote logger
 */
const DEFAULT_OPTIONS: Omit<RemoteLoggerOptions, 'endpoint'> = {
  method: 'POST',
  headers: undefined,
  batchSize: 10,
  batchInterval: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
  filter: undefined,
  transform: undefined,
  onError: undefined,
  onSuccess: undefined,
}

/**
 * Creates the remote-logger plugin
 * Sends logs to remote HTTP endpoint
 */
export function remoteLogger(
  userOptions: Partial<RemoteLoggerOptions> & { endpoint: string }
): Plugin & { api: RemoteLoggerAPI } {
  const options: RemoteLoggerOptions = { ...DEFAULT_OPTIONS, ...userOptions }

  let kernel: Kernel | null = null
  let pendingLogs: LogEntry[] = []
  let failedLogs: LogEntry[] = []
  let paused = false
  let batchTimer: ReturnType<typeof setTimeout> | null = null

  function shouldLog(entry: LogEntry): boolean {
    if (!options.filter) return true

    const filter = options.filter

    if (filter.componentName !== undefined) {
      if (filter.componentName instanceof RegExp) {
        if (!filter.componentName.test(entry.componentName)) return false
      } else if (entry.componentName !== filter.componentName) {
        return false
      }
    }

    if (filter.eventType !== undefined) {
      const types = Array.isArray(filter.eventType) ? filter.eventType : [filter.eventType]
      if (!types.includes(entry.event.type)) return false
    }

    if (filter.level !== undefined) {
      const levels = Array.isArray(filter.level) ? filter.level : [filter.level]
      if (!levels.includes(entry.level)) return false
    }

    return true
  }

  async function sendLogs(logs: LogEntry[], attempt: number = 1): Promise<boolean> {
    const transformedLogs = options.transform
      ? logs.map(options.transform)
      : logs

    try {
      const response = await fetch(options.endpoint, {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(transformedLogs),
      })

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      options.onSuccess?.(response)
      return true
    } catch (error) {
      if (attempt < options.retryAttempts) {
        await new Promise((resolve) => setTimeout(resolve, options.retryDelay * attempt))
        return sendLogs(logs, attempt + 1)
      }

      options.onError?.(error as Error)
      failedLogs.push(...logs)
      return false
    }
  }

  async function flushInternal(): Promise<void> {
    if (pendingLogs.length === 0) return

    const logsToSend = [...pendingLogs]
    pendingLogs = []

    await sendLogs(logsToSend)
  }

  function scheduleBatch(): void {
    if (batchTimer) return

    batchTimer = setTimeout(async () => {
      batchTimer = null
      if (pendingLogs.length >= options.batchSize) {
        await flushInternal()
      }
      if (pendingLogs.length > 0) {
        scheduleBatch()
      }
    }, options.batchInterval)
  }

  function addLog(entry: LogEntry): void {
    if (paused) return
    if (!shouldLog(entry)) return

    pendingLogs.push(entry)

    if (pendingLogs.length >= options.batchSize) {
      void flushInternal()
    } else {
      scheduleBatch()
    }
  }

  const api: RemoteLoggerAPI = {
    async flush(): Promise<void> {
      await flushInternal()
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

    getPendingCount(): number {
      return pendingLogs.length
    },

    getFailedCount(): number {
      return failedLogs.length
    },

    async retryFailed(): Promise<void> {
      if (failedLogs.length === 0) return

      const logsToRetry = [...failedLogs]
      failedLogs = []

      const success = await sendLogs(logsToRetry)
      if (!success) {
        // Already added back to failedLogs by sendLogs
      }
    },
  }

  const plugin: Plugin = {
    name: 'remote-logger',
    version: '1.0.0',
    type: 'optional',

    install(k: Kernel): void {
      kernel = k
    },

    uninstall(): void {
      if (batchTimer) {
        clearTimeout(batchTimer)
        batchTimer = null
      }
      // Try to flush remaining logs
      if (pendingLogs.length > 0) {
        void flushInternal()
      }
      kernel = null
      pendingLogs = []
      failedLogs = []
    },

    hooks: {
      onLog(entry: LogEntry): void {
        addLog(entry)
      },
    },

    api: api as unknown as Record<string, unknown>,
  }

  return plugin as Plugin & { api: RemoteLoggerAPI }
}
