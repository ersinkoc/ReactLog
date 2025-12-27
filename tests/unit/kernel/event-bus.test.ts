import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventBus, createEventBus } from '../../../src/kernel/event-bus'
import type { MountEvent, KernelEvent, LogEntry } from '../../../src/types'

describe('EventBus', () => {
  let eventBus: EventBus

  beforeEach(() => {
    eventBus = createEventBus()
  })

  const createMockEvent = (type: string = 'mount'): MountEvent => ({
    type: 'mount',
    componentId: 'test-id',
    componentName: 'TestComponent',
    timestamp: Date.now(),
    props: {},
    initialState: {},
  })

  const createMockLogEntry = (): LogEntry => ({
    id: 'log-id',
    timestamp: Date.now(),
    componentId: 'test-id',
    componentName: 'TestComponent',
    event: createMockEvent(),
    level: 'debug',
    formatted: 'Test log',
  })

  describe('on', () => {
    it('should subscribe to an event type', () => {
      const handler = vi.fn()
      eventBus.on('mount', handler)

      expect(eventBus.getHandlerCount('mount')).toBe(1)
    })

    it('should return an unsubscribe function', () => {
      const handler = vi.fn()
      const unsubscribe = eventBus.on('mount', handler)

      expect(typeof unsubscribe).toBe('function')

      unsubscribe()
      expect(eventBus.getHandlerCount('mount')).toBe(0)
    })

    it('should allow multiple handlers for the same event', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventBus.on('mount', handler1)
      eventBus.on('mount', handler2)

      expect(eventBus.getHandlerCount('mount')).toBe(2)
    })
  })

  describe('off', () => {
    it('should unsubscribe a handler', () => {
      const handler = vi.fn()
      eventBus.on('mount', handler)
      eventBus.off('mount', handler)

      expect(eventBus.getHandlerCount('mount')).toBe(0)
    })

    it('should not throw when removing non-existent handler', () => {
      const handler = vi.fn()
      expect(() => eventBus.off('mount', handler)).not.toThrow()
    })
  })

  describe('emit', () => {
    it('should call all subscribed handlers', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventBus.on('mount', handler1)
      eventBus.on('mount', handler2)

      const event = createMockEvent()
      eventBus.emit(event)

      expect(handler1).toHaveBeenCalledWith(event)
      expect(handler2).toHaveBeenCalledWith(event)
    })

    it('should not call handlers for different event types', () => {
      const mountHandler = vi.fn()
      const unmountHandler = vi.fn()

      eventBus.on('mount', mountHandler)
      eventBus.on('unmount', unmountHandler)

      eventBus.emit(createMockEvent())

      expect(mountHandler).toHaveBeenCalled()
      expect(unmountHandler).not.toHaveBeenCalled()
    })

    it('should handle errors in handlers gracefully', () => {
      const errorHandler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error')
      })
      const normalHandler = vi.fn()

      eventBus.on('mount', errorHandler)
      eventBus.on('mount', normalHandler)

      expect(() => eventBus.emit(createMockEvent())).not.toThrow()
      expect(normalHandler).toHaveBeenCalled()
    })
  })

  describe('onLog', () => {
    it('should subscribe to log entries', () => {
      const handler = vi.fn()
      eventBus.onLog(handler)

      expect(eventBus.getLogHandlerCount()).toBe(1)
    })

    it('should return an unsubscribe function', () => {
      const handler = vi.fn()
      const unsubscribe = eventBus.onLog(handler)

      unsubscribe()
      expect(eventBus.getLogHandlerCount()).toBe(0)
    })
  })

  describe('emitLog', () => {
    it('should call log handlers', () => {
      const handler = vi.fn()
      eventBus.onLog(handler)

      const entry = createMockLogEntry()
      eventBus.emitLog(entry)

      expect(handler).toHaveBeenCalledWith(entry)
    })

    it('should handle errors in log handlers gracefully', () => {
      const errorHandler = vi.fn().mockImplementation(() => {
        throw new Error('Log handler error')
      })

      eventBus.onLog(errorHandler)

      expect(() => eventBus.emitLog(createMockLogEntry())).not.toThrow()
    })
  })

  describe('removeAllListeners', () => {
    it('should remove all handlers', () => {
      eventBus.on('mount', vi.fn())
      eventBus.on('unmount', vi.fn())
      eventBus.onLog(vi.fn())

      eventBus.removeAllListeners()

      expect(eventBus.getHandlerCount('mount')).toBe(0)
      expect(eventBus.getHandlerCount('unmount')).toBe(0)
      expect(eventBus.getLogHandlerCount()).toBe(0)
    })
  })

  describe('hasHandlers', () => {
    it('should return true when handlers exist', () => {
      eventBus.on('mount', vi.fn())
      expect(eventBus.hasHandlers('mount')).toBe(true)
    })

    it('should return false when no handlers exist', () => {
      expect(eventBus.hasHandlers('mount')).toBe(false)
    })
  })

  describe('getRegisteredEventTypes', () => {
    it('should return all registered event types', () => {
      eventBus.on('mount', vi.fn())
      eventBus.on('unmount', vi.fn())

      const types = eventBus.getRegisteredEventTypes()

      expect(types).toContain('mount')
      expect(types).toContain('unmount')
      expect(types.length).toBe(2)
    })
  })
})
