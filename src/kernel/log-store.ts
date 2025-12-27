import type { EventType, LogEntry, LogFilter, LogStore as ILogStore } from '../types'

/**
 * Default maximum number of logs to store
 */
const DEFAULT_MAX_LOGS = 1000

/**
 * LogStore manages the storage and retrieval of log entries
 * Provides indexing by component and event type for efficient filtering
 */
export class LogStore implements ILogStore {
  entries: LogEntry[] = []
  byComponent: Map<string, LogEntry[]> = new Map()
  byType: Map<EventType, LogEntry[]> = new Map()
  startTime: number
  lastEntry: LogEntry | null = null

  private maxLogs: number

  constructor(maxLogs: number = DEFAULT_MAX_LOGS) {
    this.maxLogs = maxLogs
    this.startTime = Date.now()
  }

  /**
   * Add a log entry to the store
   *
   * @param entry - The log entry to add
   */
  addLog(entry: LogEntry): void {
    this.entries.push(entry)
    this.lastEntry = entry

    // Index by component
    let componentLogs = this.byComponent.get(entry.componentId)
    if (!componentLogs) {
      componentLogs = []
      this.byComponent.set(entry.componentId, componentLogs)
    }
    componentLogs.push(entry)

    // Index by event type
    let typeLogs = this.byType.get(entry.event.type)
    if (!typeLogs) {
      typeLogs = []
      this.byType.set(entry.event.type, typeLogs)
    }
    typeLogs.push(entry)

    // Trim if over max
    if (this.entries.length > this.maxLogs) {
      this.trimLogs()
    }
  }

  /**
   * Trim old logs to stay within maxLogs limit
   */
  private trimLogs(): void {
    const removeCount = this.entries.length - this.maxLogs
    if (removeCount <= 0) return

    const removed = this.entries.splice(0, removeCount)

    // Clean up indexes for removed entries
    for (const entry of removed) {
      // Clean component index
      const componentLogs = this.byComponent.get(entry.componentId)
      if (componentLogs) {
        const index = componentLogs.indexOf(entry)
        if (index !== -1) {
          componentLogs.splice(index, 1)
        }
        if (componentLogs.length === 0) {
          this.byComponent.delete(entry.componentId)
        }
      }

      // Clean type index
      const typeLogs = this.byType.get(entry.event.type)
      if (typeLogs) {
        const index = typeLogs.indexOf(entry)
        if (index !== -1) {
          typeLogs.splice(index, 1)
        }
        if (typeLogs.length === 0) {
          this.byType.delete(entry.event.type)
        }
      }
    }
  }

  /**
   * Get all logs
   *
   * @returns The log store interface
   */
  getLogs(): ILogStore {
    return {
      entries: this.entries,
      byComponent: this.byComponent,
      byType: this.byType,
      startTime: this.startTime,
      lastEntry: this.lastEntry,
    }
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.entries = []
    this.byComponent.clear()
    this.byType.clear()
    this.lastEntry = null
    // Don't reset startTime - it tracks session start
  }

  /**
   * Filter logs based on criteria
   *
   * @param filter - Filter criteria
   * @returns Filtered log entries
   */
  filterLogs(filter: LogFilter): LogEntry[] {
    let result = this.entries

    // Filter by component name
    if (filter.componentName !== undefined) {
      if (filter.componentName instanceof RegExp) {
        const regex = filter.componentName
        result = result.filter((entry) => regex.test(entry.componentName))
      } else {
        const name = filter.componentName
        result = result.filter((entry) => entry.componentName === name)
      }
    }

    // Filter by event type
    if (filter.eventType !== undefined) {
      const types = Array.isArray(filter.eventType) ? filter.eventType : [filter.eventType]
      result = result.filter((entry) => types.includes(entry.event.type))
    }

    // Filter by log level
    if (filter.level !== undefined) {
      const levels = Array.isArray(filter.level) ? filter.level : [filter.level]
      result = result.filter((entry) => levels.includes(entry.level))
    }

    // Filter by time range
    if (filter.timeRange !== undefined) {
      const { start, end } = filter.timeRange
      result = result.filter((entry) => entry.timestamp >= start && entry.timestamp <= end)
    }

    // Apply limit
    if (filter.limit !== undefined && filter.limit > 0) {
      result = result.slice(-filter.limit)
    }

    return result
  }

  /**
   * Get logs for a specific component
   *
   * @param componentId - The component ID
   * @returns Logs for the component
   */
  getLogsByComponent(componentId: string): LogEntry[] {
    return this.byComponent.get(componentId) ?? []
  }

  /**
   * Get logs for a specific event type
   *
   * @param eventType - The event type
   * @returns Logs for the event type
   */
  getLogsByType(eventType: EventType): LogEntry[] {
    return this.byType.get(eventType) ?? []
  }

  /**
   * Get the total number of logs
   *
   * @returns Total log count
   */
  getLogCount(): number {
    return this.entries.length
  }

  /**
   * Get unique component count
   *
   * @returns Number of unique components
   */
  getComponentCount(): number {
    return this.byComponent.size
  }

  /**
   * Set the maximum number of logs
   *
   * @param max - Maximum number of logs
   */
  setMaxLogs(max: number): void {
    this.maxLogs = max
    if (this.entries.length > max) {
      this.trimLogs()
    }
  }

  /**
   * Get the maximum number of logs
   *
   * @returns Maximum log count
   */
  getMaxLogs(): number {
    return this.maxLogs
  }
}

/**
 * Creates a new LogStore instance
 *
 * @param maxLogs - Maximum number of logs to store
 * @returns A new LogStore instance
 */
export function createLogStore(maxLogs?: number): LogStore {
  return new LogStore(maxLogs)
}
