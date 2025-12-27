import type { EventType, EventHandler, KernelEvent, LogEntry, LogHandler, Unsubscribe } from '../types'

/**
 * EventBus implements a pub/sub pattern for kernel events
 * Supports multiple handlers per event type
 */
export class EventBus {
  private handlers: Map<EventType, Set<EventHandler>> = new Map()
  private logHandlers: Set<LogHandler> = new Set()

  /**
   * Subscribe to an event type
   *
   * @param eventType - The event type to subscribe to
   * @param handler - The handler function to call when event occurs
   * @returns Unsubscribe function
   */
  on(eventType: EventType, handler: EventHandler): Unsubscribe {
    let typeHandlers = this.handlers.get(eventType)
    if (!typeHandlers) {
      typeHandlers = new Set()
      this.handlers.set(eventType, typeHandlers)
    }
    typeHandlers.add(handler)

    return () => {
      this.off(eventType, handler)
    }
  }

  /**
   * Subscribe to log entries
   *
   * @param handler - The handler function to call when a log is added
   * @returns Unsubscribe function
   */
  onLog(handler: LogHandler): Unsubscribe {
    this.logHandlers.add(handler)

    return () => {
      this.logHandlers.delete(handler)
    }
  }

  /**
   * Unsubscribe from an event type
   *
   * @param eventType - The event type to unsubscribe from
   * @param handler - The handler function to remove
   */
  off(eventType: EventType, handler: EventHandler): void {
    const typeHandlers = this.handlers.get(eventType)
    if (typeHandlers) {
      typeHandlers.delete(handler)
      if (typeHandlers.size === 0) {
        this.handlers.delete(eventType)
      }
    }
  }

  /**
   * Emit an event to all subscribed handlers
   *
   * @param event - The event to emit
   */
  emit(event: KernelEvent): void {
    const typeHandlers = this.handlers.get(event.type)
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        try {
          handler(event)
        } catch (error) {
          console.error('[ReactLog] Event handler error:', error)
        }
      }
    }
  }

  /**
   * Emit a log entry to all log handlers
   *
   * @param entry - The log entry to emit
   */
  emitLog(entry: LogEntry): void {
    for (const handler of this.logHandlers) {
      try {
        handler(entry)
      } catch (error) {
        console.error('[ReactLog] Log handler error:', error)
      }
    }
  }

  /**
   * Get the number of handlers for an event type
   *
   * @param eventType - The event type to check
   * @returns Number of handlers
   */
  getHandlerCount(eventType: EventType): number {
    return this.handlers.get(eventType)?.size ?? 0
  }

  /**
   * Get the number of log handlers
   *
   * @returns Number of log handlers
   */
  getLogHandlerCount(): number {
    return this.logHandlers.size
  }

  /**
   * Remove all handlers for all event types
   */
  removeAllListeners(): void {
    this.handlers.clear()
    this.logHandlers.clear()
  }

  /**
   * Check if there are any handlers for an event type
   *
   * @param eventType - The event type to check
   * @returns true if there are handlers
   */
  hasHandlers(eventType: EventType): boolean {
    return (this.handlers.get(eventType)?.size ?? 0) > 0
  }

  /**
   * Get all registered event types
   *
   * @returns Array of event types with handlers
   */
  getRegisteredEventTypes(): EventType[] {
    return Array.from(this.handlers.keys())
  }
}

/**
 * Creates a new EventBus instance
 *
 * @returns A new EventBus instance
 */
export function createEventBus(): EventBus {
  return new EventBus()
}
