// React components and hooks
export {
  ReactLogProvider,
  getGlobalKernel,
} from './react/provider'

export {
  ReactLogContext,
  useLogContext,
  useOptionalLogContext,
} from './react/context'

export {
  useLog,
} from './react/hooks/use-log'

export {
  useLogMetrics,
  useAllMetrics,
} from './react/hooks/use-log-metrics'

export {
  Log,
  createLogWrapper,
} from './react/components/log'

export {
  DebugPanel,
} from './react/components/debug-panel'

export {
  withLog,
  createWithLog,
} from './react/hoc/with-log'

// Programmatic API
export {
  getKernel,
  getLogs,
  clearLogs,
  filterLogs,
  exportLogs,
  getPluginAPI,
  isEnabled,
  enable,
  disable,
} from './api'

// Plugin factory
export {
  createPlugin,
  validatePlugin,
  type PluginConfig,
} from './plugin-factory'

// Kernel (for advanced usage)
export {
  createKernel,
  Kernel,
} from './kernel'

// Core plugins (for manual installation)
export {
  lifecycleLogger,
  propsTracker,
  stateTracker,
  effectTracker,
  consoleOutput,
  installCorePlugins,
  createCorePlugins,
  CONSOLE_STYLES,
} from './plugins/core'

// Type exports
export type {
  // Kernel types
  Kernel as KernelInterface,
  KernelOptions,
  KernelEvent,
  EventType,
  EventHandler,
  LogHandler,
  Unsubscribe,

  // Plugin types
  Plugin,
  PluginInfo,
  PluginHooks,
  PluginType,

  // Event types
  BaseEvent,
  MountEvent,
  UnmountEvent,
  UpdateEvent,
  UpdateReason,
  PropsChangeEvent,
  PropChange,
  StateChangeEvent,
  HookType,
  EffectRunEvent,
  EffectCleanupEvent,
  EffectCleanupReason,
  ContextChangeEvent,
  ErrorEvent,

  // Log types
  LogEntry,
  LogStore,
  LogFilter,
  LogLevel,

  // React types
  ReactLogProviderProps,
  ReactLogOptions,
  UseLogOptions,
  LogProps,
  DebugPanelProps,
  WithLogOptions,

  // Plugin API types
  LifecycleLoggerAPI,
  LifecycleRecord,
  PropsTrackerAPI,
  PropsSnapshot,
  PropChangeStats,
  StateTrackerAPI,
  StateSnapshot,
  HookState,
  EffectTrackerAPI,
  EffectRecord,
  ConsoleOutputOptions,
  ConsoleOutputAPI,
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

  // Utility types
  ComponentMetrics,
  DeepPartial,
} from './types'
