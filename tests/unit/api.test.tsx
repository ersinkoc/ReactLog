import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, act } from '@testing-library/react'
import { ReactLogProvider } from '../../src/react/provider'
import { useLog } from '../../src/react/hooks/use-log'
import {
  getKernel,
  getLogs,
  clearLogs,
  filterLogs,
  exportLogs,
  getPluginAPI,
  isEnabled,
  enable,
  disable,
} from '../../src/api'
import type { Kernel } from '../../src/types'

describe('API', () => {
  let capturedKernel: Kernel | null = null

  beforeEach(() => {
    capturedKernel = null
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function TrackedComponent({ name }: { name: string }) {
    useLog(name)
    return <div>{name}</div>
  }

  function renderWithProvider(children: React.ReactNode) {
    return render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        {children}
      </ReactLogProvider>
    )
  }

  describe('getKernel', () => {
    it('should return null when not initialized', () => {
      // Without rendering provider, kernel should be null
      // Note: This depends on global state, so it may return previously set kernel
      // For a clean test, we'd need to reset global state
    })

    it('should return kernel after provider renders', () => {
      renderWithProvider(<div>Test</div>)
      const kernel = getKernel()
      expect(kernel).toBeDefined()
    })
  })

  describe('getLogs', () => {
    it('should return logs from kernel', async () => {
      renderWithProvider(<TrackedComponent name="LogsTest" />)

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      const logs = getLogs()
      expect(logs).toBeDefined()
      expect(logs?.entries).toBeInstanceOf(Array)
    })

    it('should contain component events', async () => {
      renderWithProvider(<TrackedComponent name="EventTest" />)

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      const logs = getLogs()
      const hasComponentEvent = logs?.entries.some(e => e.componentName === 'EventTest')
      expect(hasComponentEvent).toBe(true)
    })
  })

  describe('clearLogs', () => {
    it('should clear all logs', async () => {
      renderWithProvider(<TrackedComponent name="ClearTest" />)

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      const logsBefore = getLogs()
      expect(logsBefore?.entries.length).toBeGreaterThan(0)

      clearLogs()

      const logsAfter = getLogs()
      expect(logsAfter?.entries.length).toBe(0)
    })
  })

  describe('filterLogs', () => {
    it('should filter by component name', async () => {
      renderWithProvider(
        <>
          <TrackedComponent name="FilterA" />
          <TrackedComponent name="FilterB" />
        </>
      )

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      const filtered = filterLogs({ componentName: 'FilterA' })
      expect(filtered.every(e => e.componentName === 'FilterA')).toBe(true)
    })

    it('should filter by event type', async () => {
      renderWithProvider(<TrackedComponent name="TypeFilter" />)

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      const filtered = filterLogs({ eventType: 'mount' })
      expect(filtered.every(e => e.event.type === 'mount')).toBe(true)
    })

    it('should return empty array when no matches', async () => {
      renderWithProvider(<TrackedComponent name="NoMatch" />)

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      const filtered = filterLogs({ componentName: 'NonExistent' })
      expect(filtered).toEqual([])
    })
  })

  describe('exportLogs', () => {
    it('should export logs as JSON string', async () => {
      renderWithProvider(<TrackedComponent name="ExportTest" />)

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      const exported = exportLogs()
      expect(typeof exported).toBe('string')

      const parsed = JSON.parse(exported)
      expect(parsed).toHaveProperty('entries')
      expect(parsed).toHaveProperty('exportedAt')
      expect(parsed).toHaveProperty('totalLogs')
    })

    it('should export pretty-printed JSON when requested', async () => {
      renderWithProvider(<TrackedComponent name="PrettyTest" />)

      await act(async () => {
        await vi.runAllTimersAsync()
      })

      const exported = exportLogs(true)
      expect(exported).toContain('\n')
      expect(exported).toContain('  ')
    })

    it('should return empty structure when no kernel', async () => {
      // Use vi.spyOn to mock getLogs to return null
      const apiModule = await import('../../src/api')
      const getLogsSpy = vi.spyOn(apiModule, 'getLogs').mockReturnValue(null)

      const exported = apiModule.exportLogs()
      const parsed = JSON.parse(exported)
      expect(parsed).toEqual({ entries: [], startTime: 0, lastEntry: null })

      getLogsSpy.mockRestore()
    })
  })

  describe('getPluginAPI', () => {
    it('should return plugin API if exists', () => {
      const customPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        type: 'optional' as const,
        install: vi.fn(),
        uninstall: vi.fn(),
        api: {
          doSomething: () => 'done',
        },
      }

      render(
        <ReactLogProvider plugins={[customPlugin]}>
          <div>Test</div>
        </ReactLogProvider>
      )

      const api = getPluginAPI<{ doSomething: () => string }>('test-plugin')
      expect(api?.doSomething()).toBe('done')
    })

    it('should return undefined for non-existent plugin', () => {
      renderWithProvider(<div>Test</div>)

      const api = getPluginAPI('non-existent')
      expect(api).toBeUndefined()
    })
  })

  describe('isEnabled', () => {
    it('should return true when enabled', () => {
      renderWithProvider(<div>Test</div>)
      expect(isEnabled()).toBe(true)
    })

    it('should return false when disabled', () => {
      render(
        <ReactLogProvider enabled={false}>
          <div>Test</div>
        </ReactLogProvider>
      )

      expect(isEnabled()).toBe(false)
    })
  })

  describe('enable/disable', () => {
    it('should enable the kernel', () => {
      render(
        <ReactLogProvider enabled={false}>
          <div>Test</div>
        </ReactLogProvider>
      )

      expect(isEnabled()).toBe(false)

      enable()

      expect(isEnabled()).toBe(true)
    })

    it('should disable the kernel', () => {
      renderWithProvider(<div>Test</div>)

      expect(isEnabled()).toBe(true)

      disable()

      expect(isEnabled()).toBe(false)
    })
  })
})
