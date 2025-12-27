import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fileExporter } from '../../../src/plugins/optional/file-exporter'
import type { Kernel, LogEntry } from '../../../src/types'

describe('fileExporter plugin', () => {
  let mockKernel: Kernel
  let mockCreateObjectURL: ReturnType<typeof vi.fn>
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>

  beforeEach(() => {
    const mockEntries: LogEntry[] = [
      {
        id: 'log-1',
        timestamp: 1700000000000,
        componentId: 'comp-1',
        componentName: 'TestComponent',
        event: { type: 'mount' },
        level: 'info',
        formatted: 'MOUNT TestComponent',
      },
      {
        id: 'log-2',
        timestamp: 1700000001000,
        componentId: 'comp-1',
        componentName: 'TestComponent',
        event: { type: 'update' },
        level: 'debug',
        formatted: 'UPDATE TestComponent',
      },
    ]

    mockKernel = {
      register: vi.fn(),
      unregister: vi.fn(),
      emit: vi.fn(),
      getLogs: vi.fn().mockReturnValue({
        entries: mockEntries,
        byComponent: new Map([['TestComponent', mockEntries]]),
        startTime: 1700000000000,
      }),
      getPlugin: vi.fn(),
      getPlugins: vi.fn(),
    } as unknown as Kernel

    // Mock DOM APIs
    mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url')
    mockRevokeObjectURL = vi.fn()
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL

    // Mock document methods
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    }
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as HTMLElement)
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as HTMLElement)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create plugin with correct name and version', () => {
    const plugin = fileExporter()
    expect(plugin.name).toBe('file-exporter')
    expect(plugin.version).toBe('1.0.0')
    expect(plugin.type).toBe('optional')
  })

  it('should install and uninstall correctly', () => {
    const plugin = fileExporter()
    expect(() => plugin.install(mockKernel)).not.toThrow()
    expect(() => plugin.uninstall()).not.toThrow()
  })

  it('should get export data', () => {
    const plugin = fileExporter()
    plugin.install(mockKernel)

    const data = plugin.api.getExportData()

    expect(data.metadata).toBeDefined()
    expect(data.metadata.totalLogs).toBe(2)
    expect(data.logs).toHaveLength(2)
    expect(data.summary.byComponent).toBeDefined()
    expect(data.summary.byEventType).toBeDefined()
  })

  it('should get export data with component count', () => {
    const plugin = fileExporter()
    plugin.install(mockKernel)

    const data = plugin.api.getExportData()
    expect(data.metadata.componentCount).toBe(1)
  })

  it('should return empty data without kernel', () => {
    const plugin = fileExporter()
    // Don't install - no kernel

    const data = plugin.api.getExportData()
    expect(data.metadata.totalLogs).toBe(0)
    expect(data.logs).toEqual([])
  })

  it('should export JSON', () => {
    const plugin = fileExporter()
    plugin.install(mockKernel)

    expect(() => plugin.api.exportJSON()).not.toThrow()
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalled()
  })

  it('should export JSON with custom filename', () => {
    const plugin = fileExporter()
    plugin.install(mockKernel)

    expect(() => plugin.api.exportJSON('custom-export.json')).not.toThrow()
  })

  it('should export CSV', () => {
    const plugin = fileExporter()
    plugin.install(mockKernel)

    expect(() => plugin.api.exportCSV()).not.toThrow()
    expect(mockCreateObjectURL).toHaveBeenCalled()
  })

  it('should export CSV with custom filename', () => {
    const plugin = fileExporter()
    plugin.install(mockKernel)

    expect(() => plugin.api.exportCSV('custom-export.csv')).not.toThrow()
  })

  it('should download file with custom params', () => {
    const plugin = fileExporter()
    plugin.install(mockKernel)

    expect(() => plugin.api.downloadFile('test data', 'test.txt', 'text/plain')).not.toThrow()
    expect(mockCreateObjectURL).toHaveBeenCalled()
  })

  it('should respect prettyPrint option for JSON', () => {
    const pluginPretty = fileExporter({ prettyPrint: true })
    pluginPretty.install(mockKernel)

    const pluginCompact = fileExporter({ prettyPrint: false })
    pluginCompact.install(mockKernel)

    // Both should work without error
    expect(() => pluginPretty.api.exportJSON()).not.toThrow()
    expect(() => pluginCompact.api.exportJSON()).not.toThrow()
  })

  it('should calculate summaries correctly', () => {
    const plugin = fileExporter()
    plugin.install(mockKernel)

    const data = plugin.api.getExportData()

    expect(data.summary.byComponent['TestComponent']).toBe(2)
    expect(data.summary.byEventType['mount']).toBe(1)
    expect(data.summary.byEventType['update']).toBe(1)
    expect(data.summary.byLevel['info']).toBe(1)
    expect(data.summary.byLevel['debug']).toBe(1)
  })

  it('should handle quotes in CSV export', () => {
    const mockEntriesWithQuotes: LogEntry[] = [
      {
        id: 'log-1',
        timestamp: 1700000000000,
        componentId: 'comp-1',
        componentName: 'TestComponent',
        event: { type: 'mount' },
        level: 'info',
        formatted: 'Test "quoted" content',
      },
    ]

    const quotedKernel = {
      ...mockKernel,
      getLogs: vi.fn().mockReturnValue({
        entries: mockEntriesWithQuotes,
        byComponent: new Map([['TestComponent', mockEntriesWithQuotes]]),
        startTime: 1700000000000,
      }),
    } as unknown as Kernel

    const plugin = fileExporter()
    plugin.install(quotedKernel)

    expect(() => plugin.api.exportCSV()).not.toThrow()
  })

  it('should clear kernel reference on uninstall', () => {
    const plugin = fileExporter()
    plugin.install(mockKernel)

    plugin.uninstall()

    // After uninstall, getExportData should return empty data
    const data = plugin.api.getExportData()
    expect(data.metadata.totalLogs).toBe(0)
  })
})
