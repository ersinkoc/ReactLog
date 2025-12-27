import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { remoteLogger } from '../../../src/plugins/optional/remote-logger'
import type { Kernel, LogEntry } from '../../../src/types'

describe('remoteLogger plugin', () => {
  let mockKernel: Kernel
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockKernel = {
      register: vi.fn(),
      unregister: vi.fn(),
      emit: vi.fn(),
      getLogs: vi.fn().mockReturnValue({ entries: [], byComponent: new Map(), startTime: Date.now() }),
      getPlugin: vi.fn(),
      getPlugins: vi.fn(),
    } as unknown as Kernel

    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    })
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function createLogEntry(overrides: Partial<LogEntry> = {}): LogEntry {
    return {
      id: 'log-1',
      timestamp: Date.now(),
      componentId: 'comp-1',
      componentName: 'TestComponent',
      event: { type: 'mount' },
      level: 'info',
      formatted: 'MOUNT TestComponent',
      ...overrides,
    }
  }

  it('should create plugin with correct name and version', () => {
    const plugin = remoteLogger({ endpoint: 'https://api.example.com/logs' })
    expect(plugin.name).toBe('remote-logger')
    expect(plugin.version).toBe('1.0.0')
    expect(plugin.type).toBe('optional')
  })

  it('should install and uninstall correctly', () => {
    const plugin = remoteLogger({ endpoint: 'https://api.example.com/logs' })
    expect(() => plugin.install(mockKernel)).not.toThrow()
    expect(() => plugin.uninstall()).not.toThrow()
  })

  it('should add logs to pending queue', () => {
    const plugin = remoteLogger({ endpoint: 'https://api.example.com/logs', batchSize: 10 })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry())

    expect(plugin.api.getPendingCount()).toBe(1)
  })

  it('should flush when batch size is reached', async () => {
    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      batchSize: 2,
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry({ id: 'log-1' }))
    plugin.hooks?.onLog?.(createLogEntry({ id: 'log-2' }))

    // Wait for async flush
    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  it('should manually flush logs', async () => {
    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      batchSize: 100,
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry())

    await plugin.api.flush()

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/logs',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    )
  })

  it('should pause and resume logging', () => {
    const plugin = remoteLogger({ endpoint: 'https://api.example.com/logs' })
    plugin.install(mockKernel)

    expect(plugin.api.isPaused()).toBe(false)

    plugin.api.pause()
    expect(plugin.api.isPaused()).toBe(true)

    // Should not add logs when paused
    plugin.hooks?.onLog?.(createLogEntry())
    expect(plugin.api.getPendingCount()).toBe(0)

    plugin.api.resume()
    expect(plugin.api.isPaused()).toBe(false)

    // Should add logs when resumed
    plugin.hooks?.onLog?.(createLogEntry())
    expect(plugin.api.getPendingCount()).toBe(1)
  })

  it('should filter logs by component name string', () => {
    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      filter: { componentName: 'AllowedComponent' },
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry({ componentName: 'AllowedComponent' }))
    plugin.hooks?.onLog?.(createLogEntry({ componentName: 'DisallowedComponent' }))

    expect(plugin.api.getPendingCount()).toBe(1)
  })

  it('should filter logs by component name regex', () => {
    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      filter: { componentName: /^Test/ },
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry({ componentName: 'TestComponent' }))
    plugin.hooks?.onLog?.(createLogEntry({ componentName: 'OtherComponent' }))

    expect(plugin.api.getPendingCount()).toBe(1)
  })

  it('should filter logs by event type', () => {
    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      filter: { eventType: ['mount', 'unmount'] },
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry({ event: { type: 'mount' } }))
    plugin.hooks?.onLog?.(createLogEntry({ event: { type: 'update' } }))

    expect(plugin.api.getPendingCount()).toBe(1)
  })

  it('should filter logs by single event type', () => {
    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      filter: { eventType: 'mount' },
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry({ event: { type: 'mount' } }))
    plugin.hooks?.onLog?.(createLogEntry({ event: { type: 'update' } }))

    expect(plugin.api.getPendingCount()).toBe(1)
  })

  it('should filter logs by level', () => {
    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      filter: { level: ['error', 'warn'] },
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry({ level: 'error' }))
    plugin.hooks?.onLog?.(createLogEntry({ level: 'info' }))

    expect(plugin.api.getPendingCount()).toBe(1)
  })

  it('should filter logs by single level', () => {
    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      filter: { level: 'error' },
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry({ level: 'error' }))
    plugin.hooks?.onLog?.(createLogEntry({ level: 'info' }))

    expect(plugin.api.getPendingCount()).toBe(1)
  })

  it('should transform logs before sending', async () => {
    const transform = vi.fn((entry: LogEntry) => ({
      ...entry,
      customField: 'added',
    }))

    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      transform,
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry())
    await plugin.api.flush()

    expect(transform).toHaveBeenCalled()
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/logs',
      expect.objectContaining({
        body: expect.stringContaining('customField'),
      })
    )
  })

  it('should call onSuccess callback on successful send', async () => {
    const onSuccess = vi.fn()

    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      onSuccess,
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry())
    await plugin.api.flush()

    expect(onSuccess).toHaveBeenCalled()
  })

  it('should call onError callback on failed send', async () => {
    const onError = vi.fn()
    mockFetch.mockRejectedValue(new Error('Network error'))

    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      retryAttempts: 1,
      onError,
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry())
    await plugin.api.flush()

    expect(onError).toHaveBeenCalled()
  })

  it('should add to failed logs on error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      retryAttempts: 1,
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry())
    await plugin.api.flush()

    expect(plugin.api.getFailedCount()).toBe(1)
  })

  it('should retry failed logs', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue({ ok: true, status: 200 })

    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      retryAttempts: 1,
      retryDelay: 10,
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry())
    await plugin.api.flush()

    expect(plugin.api.getFailedCount()).toBe(1)

    // Retry failed logs
    await plugin.api.retryFailed()

    expect(plugin.api.getFailedCount()).toBe(0)
  })

  it('should not retry when no failed logs', async () => {
    const plugin = remoteLogger({ endpoint: 'https://api.example.com/logs' })
    plugin.install(mockKernel)

    await plugin.api.retryFailed()

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should handle HTTP error responses', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    })

    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      retryAttempts: 1,
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry())
    await plugin.api.flush()

    expect(plugin.api.getFailedCount()).toBe(1)
  })

  it('should use custom headers', async () => {
    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      headers: {
        Authorization: 'Bearer token',
        'X-Custom-Header': 'value',
      },
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry())
    await plugin.api.flush()

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/logs',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
          'X-Custom-Header': 'value',
        }),
      })
    )
  })

  it('should clear pending logs on uninstall', async () => {
    const plugin = remoteLogger({ endpoint: 'https://api.example.com/logs', batchSize: 100 })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry())
    expect(plugin.api.getPendingCount()).toBe(1)

    plugin.uninstall()

    // After uninstall, pending count should be 0
    expect(plugin.api.getPendingCount()).toBe(0)
  })

  it('should handle empty flush', async () => {
    const plugin = remoteLogger({ endpoint: 'https://api.example.com/logs' })
    plugin.install(mockKernel)

    await plugin.api.flush()

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should retry with exponential backoff', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const plugin = remoteLogger({
      endpoint: 'https://api.example.com/logs',
      retryAttempts: 3,
      retryDelay: 10,
    })
    plugin.install(mockKernel)

    plugin.hooks?.onLog?.(createLogEntry())
    await plugin.api.flush()

    // Should have attempted 3 times
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })
})
