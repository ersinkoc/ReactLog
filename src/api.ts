import type { Kernel, LogStore, LogEntry, LogFilter, Plugin } from './types'
import { getGlobalKernel } from './react/provider'

/**
 * Get the global kernel instance
 *
 * @returns The kernel instance or null if not initialized
 */
export function getKernel(): Kernel | null {
  return getGlobalKernel()
}

/**
 * Get all logs from the kernel
 *
 * @returns The log store or null if kernel not initialized
 */
export function getLogs(): LogStore | null {
  const kernel = getKernel()
  return kernel?.getLogs() ?? null
}

/**
 * Clear all logs from the kernel
 */
export function clearLogs(): void {
  const kernel = getKernel()
  kernel?.clearLogs()
}

/**
 * Filter logs based on criteria
 *
 * @param filter - Filter criteria
 * @returns Filtered log entries or empty array if kernel not initialized
 */
export function filterLogs(filter: LogFilter): LogEntry[] {
  const kernel = getKernel()
  return kernel?.filterLogs(filter) ?? []
}

/**
 * Export logs as JSON string
 *
 * @param pretty - Whether to pretty-print the JSON
 * @returns JSON string of logs
 */
export function exportLogs(pretty: boolean = false): string {
  const logs = getLogs()
  if (!logs) {
    return JSON.stringify({ entries: [], startTime: 0, lastEntry: null })
  }

  const exportData = {
    entries: logs.entries,
    startTime: logs.startTime,
    lastEntry: logs.lastEntry,
    exportedAt: new Date().toISOString(),
    totalLogs: logs.entries.length,
  }

  return pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData)
}

/**
 * Get plugin API from the kernel
 *
 * @param pluginName - Name of the plugin
 * @returns Plugin API or undefined
 */
export function getPluginAPI<T>(pluginName: string): T | undefined {
  const kernel = getKernel()
  const plugin = kernel?.getPlugin<Plugin & { api: T }>(pluginName)
  return plugin?.api
}

/**
 * Check if the kernel is currently enabled
 *
 * @returns true if enabled, false otherwise
 */
export function isEnabled(): boolean {
  const kernel = getKernel()
  return kernel?.isEnabled() ?? false
}

/**
 * Enable the kernel
 */
export function enable(): void {
  const kernel = getKernel()
  kernel?.enable()
}

/**
 * Disable the kernel
 */
export function disable(): void {
  const kernel = getKernel()
  kernel?.disable()
}
