import { describe, it, expect, beforeEach } from 'vitest'
import { LogStore, createLogStore } from '../../../src/kernel/log-store'
import type { LogEntry, MountEvent } from '../../../src/types'

describe('LogStore', () => {
  let logStore: LogStore

  beforeEach(() => {
    logStore = createLogStore(100)
  })

  const createMockLogEntry = (overrides: Partial<LogEntry> = {}): LogEntry => {
    const event: MountEvent = {
      type: 'mount',
      componentId: 'test-id',
      componentName: 'TestComponent',
      timestamp: Date.now(),
      props: {},
      initialState: {},
    }

    return {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      componentId: 'test-id',
      componentName: 'TestComponent',
      event,
      level: 'debug',
      formatted: 'Test log',
      ...overrides,
    }
  }

  describe('addLog', () => {
    it('should add a log entry', () => {
      const entry = createMockLogEntry()
      logStore.addLog(entry)

      expect(logStore.getLogCount()).toBe(1)
      expect(logStore.entries[0]).toBe(entry)
    })

    it('should update lastEntry', () => {
      const entry = createMockLogEntry()
      logStore.addLog(entry)

      expect(logStore.lastEntry).toBe(entry)
    })

    it('should index by component', () => {
      const entry = createMockLogEntry({ componentId: 'comp-1' })
      logStore.addLog(entry)

      expect(logStore.getLogsByComponent('comp-1')).toContain(entry)
    })

    it('should index by event type', () => {
      const entry = createMockLogEntry()
      logStore.addLog(entry)

      expect(logStore.getLogsByType('mount')).toContain(entry)
    })

    it('should trim logs when exceeding max', () => {
      const store = createLogStore(5)

      for (let i = 0; i < 10; i++) {
        store.addLog(createMockLogEntry({ id: `log-${i}` }))
      }

      expect(store.getLogCount()).toBe(5)
      expect(store.entries[0]?.id).toBe('log-5')
    })
  })

  describe('getLogs', () => {
    it('should return the log store', () => {
      const entry = createMockLogEntry()
      logStore.addLog(entry)

      const logs = logStore.getLogs()

      expect(logs.entries).toContain(entry)
      expect(logs.startTime).toBeGreaterThan(0)
    })
  })

  describe('clearLogs', () => {
    it('should clear all logs', () => {
      logStore.addLog(createMockLogEntry())
      logStore.addLog(createMockLogEntry())

      logStore.clearLogs()

      expect(logStore.getLogCount()).toBe(0)
      expect(logStore.lastEntry).toBeNull()
    })

    it('should clear indexes', () => {
      logStore.addLog(createMockLogEntry())
      logStore.clearLogs()

      expect(logStore.byComponent.size).toBe(0)
      expect(logStore.byType.size).toBe(0)
    })
  })

  describe('filterLogs', () => {
    beforeEach(() => {
      // Add various log entries
      logStore.addLog(createMockLogEntry({
        componentName: 'ComponentA',
        level: 'debug',
      }))
      logStore.addLog(createMockLogEntry({
        componentName: 'ComponentB',
        level: 'info',
      }))
      logStore.addLog(createMockLogEntry({
        componentName: 'ComponentA',
        level: 'error',
      }))
    })

    it('should filter by component name string', () => {
      const filtered = logStore.filterLogs({ componentName: 'ComponentA' })
      expect(filtered.length).toBe(2)
    })

    it('should filter by component name regex', () => {
      const filtered = logStore.filterLogs({ componentName: /Component[AB]/ })
      expect(filtered.length).toBe(3)
    })

    it('should filter by level', () => {
      const filtered = logStore.filterLogs({ level: 'debug' })
      expect(filtered.length).toBe(1)
    })

    it('should filter by multiple levels', () => {
      const filtered = logStore.filterLogs({ level: ['debug', 'info'] })
      expect(filtered.length).toBe(2)
    })

    it('should filter by event type', () => {
      const filtered = logStore.filterLogs({ eventType: 'mount' })
      expect(filtered.length).toBe(3)
    })

    it('should apply limit', () => {
      const filtered = logStore.filterLogs({ limit: 2 })
      expect(filtered.length).toBe(2)
    })

    it('should filter by time range', () => {
      const now = Date.now()
      const filtered = logStore.filterLogs({
        timeRange: { start: now - 10000, end: now + 10000 },
      })
      expect(filtered.length).toBe(3)
    })
  })

  describe('setMaxLogs', () => {
    it('should update max logs', () => {
      logStore.setMaxLogs(50)
      expect(logStore.getMaxLogs()).toBe(50)
    })

    it('should trim logs if new max is lower', () => {
      for (let i = 0; i < 100; i++) {
        logStore.addLog(createMockLogEntry())
      }

      logStore.setMaxLogs(10)

      expect(logStore.getLogCount()).toBe(10)
    })
  })

  describe('getComponentCount', () => {
    it('should return unique component count', () => {
      logStore.addLog(createMockLogEntry({ componentId: 'comp-1' }))
      logStore.addLog(createMockLogEntry({ componentId: 'comp-2' }))
      logStore.addLog(createMockLogEntry({ componentId: 'comp-1' }))

      expect(logStore.getComponentCount()).toBe(2)
    })
  })
})
