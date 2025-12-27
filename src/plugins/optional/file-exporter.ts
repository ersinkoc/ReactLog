import type {
  Plugin,
  Kernel,
  LogEntry,
  EventType,
  FileExporterOptions,
  FileExporterAPI,
  ExportData,
} from '../../types'

/**
 * Default options for file exporter
 */
const DEFAULT_OPTIONS: FileExporterOptions = {
  format: 'json',
  includeMetadata: true,
  prettyPrint: true,
}

/**
 * Creates the file-exporter plugin
 * Exports logs to JSON/CSV files
 */
export function fileExporter(
  userOptions: Partial<FileExporterOptions> = {}
): Plugin & { api: FileExporterAPI } {
  const options: FileExporterOptions = { ...DEFAULT_OPTIONS, ...userOptions }
  let kernel: Kernel | null = null

  function getExportDataInternal(): ExportData {
    if (!kernel) {
      return {
        metadata: {
          exportedAt: new Date().toISOString(),
          sessionStart: new Date().toISOString(),
          sessionDuration: 0,
          totalLogs: 0,
          componentCount: 0,
        },
        logs: [],
        summary: {
          byComponent: {},
          byEventType: {} as Record<EventType, number>,
          byLevel: {},
        },
      }
    }

    const logStore = kernel.getLogs()
    const entries = logStore.entries

    // Calculate summaries
    const byComponent: Record<string, number> = {}
    const byEventType: Record<EventType, number> = {
      'mount': 0,
      'unmount': 0,
      'update': 0,
      'props-change': 0,
      'state-change': 0,
      'effect-run': 0,
      'effect-cleanup': 0,
      'context-change': 0,
      'error': 0,
      'log': 0,
    }
    const byLevel: Record<string, number> = {}

    for (const entry of entries) {
      // By component
      byComponent[entry.componentName] = (byComponent[entry.componentName] ?? 0) + 1

      // By event type
      byEventType[entry.event.type] = (byEventType[entry.event.type] ?? 0) + 1

      // By level
      byLevel[entry.level] = (byLevel[entry.level] ?? 0) + 1
    }

    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        sessionStart: new Date(logStore.startTime).toISOString(),
        sessionDuration: Date.now() - logStore.startTime,
        totalLogs: entries.length,
        componentCount: logStore.byComponent.size,
      },
      logs: entries,
      summary: {
        byComponent,
        byEventType,
        byLevel,
      },
    }
  }

  function downloadFileInternal(data: string, filename: string, mimeType: string): void {
    const blob = new Blob([data], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function logsToCSV(entries: LogEntry[]): string {
    const headers = ['id', 'timestamp', 'componentId', 'componentName', 'eventType', 'level', 'formatted']
    const rows = entries.map((entry) => [
      entry.id,
      new Date(entry.timestamp).toISOString(),
      entry.componentId,
      entry.componentName,
      entry.event.type,
      entry.level,
      `"${entry.formatted.replace(/"/g, '""')}"`,
    ])

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  }

  const api: FileExporterAPI = {
    exportJSON(filename?: string): void {
      const data = getExportDataInternal()
      const jsonStr = options.prettyPrint
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data)
      const fname = filename ?? `reactlog-export-${Date.now()}.json`
      downloadFileInternal(jsonStr, fname, 'application/json')
    },

    exportCSV(filename?: string): void {
      const data = getExportDataInternal()
      const csvStr = logsToCSV(data.logs)
      const fname = filename ?? `reactlog-export-${Date.now()}.csv`
      downloadFileInternal(csvStr, fname, 'text/csv')
    },

    getExportData(): ExportData {
      return getExportDataInternal()
    },

    downloadFile(data: string, filename: string, mimeType: string): void {
      downloadFileInternal(data, filename, mimeType)
    },
  }

  const plugin: Plugin = {
    name: 'file-exporter',
    version: '1.0.0',
    type: 'optional',

    install(k: Kernel): void {
      kernel = k
    },

    uninstall(): void {
      kernel = null
    },

    api: api as unknown as Record<string, unknown>,
  }

  return plugin as Plugin & { api: FileExporterAPI }
}
