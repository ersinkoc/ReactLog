// Optional plugins - imported separately from '@oxog/reactlog/plugins'
export { contextTracker } from './optional/context-tracker'
export { errorTracker } from './optional/error-tracker'
export { renderTimer } from './optional/render-timer'
export { renderChain } from './optional/render-chain'
export { panelUI } from './optional/panel-ui'
export { fileExporter } from './optional/file-exporter'
export { remoteLogger } from './optional/remote-logger'

// Re-export types for convenience
export type {
  ContextTrackerOptions,
  ContextTrackerAPI,
  ContextRecord,
  ErrorTrackerOptions,
  ErrorTrackerAPI,
  ErrorRecord,
  RenderTimerOptions,
  RenderTimerAPI,
  RenderTimeStats,
  RenderTimeRecord,
  RenderChainOptions,
  RenderChainAPI,
  RenderChainNode,
  PanelUIOptions,
  PanelUIAPI,
  FileExporterOptions,
  FileExporterAPI,
  ExportData,
  RemoteLoggerOptions,
  RemoteLoggerAPI,
} from '../types'
