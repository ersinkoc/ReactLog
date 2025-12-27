import type { ReactNode, ErrorInfo } from 'react'

// ============================================
// EVENT TYPES
// ============================================

/**
 * All possible event types in ReactLog
 */
export type EventType =
  | 'mount'
  | 'unmount'
  | 'update'
  | 'props-change'
  | 'state-change'
  | 'effect-run'
  | 'effect-cleanup'
  | 'context-change'
  | 'error'
  | 'log'

/**
 * Base event interface with common properties
 */
export interface BaseEvent {
  type: EventType
  componentId: string
  componentName: string
  timestamp: number
}

/**
 * Event emitted when a component mounts
 */
export interface MountEvent extends BaseEvent {
  type: 'mount'
  props: Record<string, unknown>
  initialState: Record<string, unknown>
}

/**
 * Event emitted when a component unmounts
 */
export interface UnmountEvent extends BaseEvent {
  type: 'unmount'
  lifetime: number
}

/**
 * Update reason types
 */
export type UpdateReason = 'props' | 'state' | 'context' | 'parent' | 'force'

/**
 * Event emitted when a component updates
 */
export interface UpdateEvent extends BaseEvent {
  type: 'update'
  reason: UpdateReason
  renderCount: number
}

/**
 * Represents a single prop change
 */
export interface PropChange {
  key: string
  prevValue: unknown
  nextValue: unknown
  isDeepEqual: boolean
}

/**
 * Event emitted when props change
 */
export interface PropsChangeEvent extends BaseEvent {
  type: 'props-change'
  changes: PropChange[]
}

/**
 * Hook types for state tracking
 */
export type HookType = 'useState' | 'useReducer'

/**
 * Event emitted when state changes
 */
export interface StateChangeEvent extends BaseEvent {
  type: 'state-change'
  hookIndex: number
  hookType: HookType
  prevState: unknown
  nextState: unknown
  action?: unknown
}

/**
 * Event emitted when an effect runs
 */
export interface EffectRunEvent extends BaseEvent {
  type: 'effect-run'
  effectIndex: number
  dependencies: unknown[]
  dependenciesChanged: number[]
}

/**
 * Reason for effect cleanup
 */
export type EffectCleanupReason = 'unmount' | 'deps-change'

/**
 * Event emitted when an effect cleanup runs
 */
export interface EffectCleanupEvent extends BaseEvent {
  type: 'effect-cleanup'
  effectIndex: number
  reason: EffectCleanupReason
}

/**
 * Event emitted when context value changes
 */
export interface ContextChangeEvent extends BaseEvent {
  type: 'context-change'
  contextName: string
  prevValue: unknown
  nextValue: unknown
}

/**
 * Event emitted when an error occurs
 */
export interface ErrorEvent extends BaseEvent {
  type: 'error'
  error: Error
  errorInfo: ErrorInfo
  recovered: boolean
}

/**
 * Union type of all kernel events
 */
export type KernelEvent =
  | MountEvent
  | UnmountEvent
  | UpdateEvent
  | PropsChangeEvent
  | StateChangeEvent
  | EffectRunEvent
  | EffectCleanupEvent
  | ContextChangeEvent
  | ErrorEvent

// ============================================
// LOG TYPES
// ============================================

/**
 * Log level types
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * A single log entry
 */
export interface LogEntry {
  id: string
  timestamp: number
  componentId: string
  componentName: string
  event: KernelEvent
  level: LogLevel
  formatted: string
}

/**
 * Log store containing all logs with indexes
 */
export interface LogStore {
  entries: LogEntry[]
  byComponent: Map<string, LogEntry[]>
  byType: Map<EventType, LogEntry[]>
  startTime: number
  lastEntry: LogEntry | null
}

/**
 * Filter options for querying logs
 */
export interface LogFilter {
  componentName?: string | RegExp
  eventType?: EventType | EventType[]
  level?: LogLevel | LogLevel[]
  timeRange?: { start: number; end: number }
  limit?: number
}

// ============================================
// KERNEL TYPES
// ============================================

/**
 * Event handler function type
 */
export type EventHandler<T extends KernelEvent = KernelEvent> = (event: T) => void

/**
 * Log handler function type
 */
export type LogHandler = (entry: LogEntry) => void

/**
 * Unsubscribe function returned by event subscriptions
 */
export type Unsubscribe = () => void

/**
 * Kernel configuration options
 */
export interface KernelOptions {
  enabled?: boolean
  maxLogs?: number
  logLevel?: LogLevel
}

/**
 * The main kernel interface
 */
export interface Kernel {
  // Plugin management
  register(plugin: Plugin): void
  unregister(pluginName: string): void
  getPlugin<T extends Plugin>(name: string): T | undefined
  listPlugins(): PluginInfo[]

  // Event system
  emit(event: KernelEvent): void
  on(eventType: EventType, handler: EventHandler): Unsubscribe
  onLog(handler: LogHandler): Unsubscribe
  off(eventType: EventType, handler: EventHandler): void

  // Log store
  getLogs(): LogStore
  addLog(entry: LogEntry): void
  clearLogs(): void
  filterLogs(filter: LogFilter): LogEntry[]

  // Configuration
  configure(options: KernelOptions): void
  isEnabled(): boolean
  enable(): void
  disable(): void
  getOptions(): KernelOptions
}

// ============================================
// PLUGIN TYPES
// ============================================

/**
 * Plugin hooks for responding to events
 */
export interface PluginHooks {
  onMount?: (event: MountEvent) => void
  onUnmount?: (event: UnmountEvent) => void
  onUpdate?: (event: UpdateEvent) => void
  onPropsChange?: (event: PropsChangeEvent) => void
  onStateChange?: (event: StateChangeEvent) => void
  onEffectRun?: (event: EffectRunEvent) => void
  onEffectCleanup?: (event: EffectCleanupEvent) => void
  onContextChange?: (event: ContextChangeEvent) => void
  onError?: (event: ErrorEvent) => void
  onLog?: (entry: LogEntry) => void
}

/**
 * Plugin type - core or optional
 */
export type PluginType = 'core' | 'optional'

/**
 * Plugin interface
 */
export interface Plugin {
  name: string
  version: string
  type: PluginType
  install(kernel: Kernel): void
  uninstall(): void
  hooks?: PluginHooks
  api?: Record<string, unknown>
}

/**
 * Plugin information for listing
 */
export interface PluginInfo {
  name: string
  version: string
  type: PluginType
  enabled: boolean
}

// ============================================
// REACT TYPES
// ============================================

/**
 * ReactLogProvider component props
 */
export interface ReactLogProviderProps {
  children: ReactNode
  enabled?: boolean
  plugins?: Plugin[]
  options?: ReactLogOptions
  onReady?: (kernel: Kernel) => void
}

/**
 * ReactLog options
 */
export interface ReactLogOptions {
  maxLogs?: number
  logLevel?: LogLevel
}

/**
 * useLog hook options
 */
export interface UseLogOptions {
  name?: string
  trackProps?: boolean
  trackState?: boolean
  trackEffects?: boolean
  trackContext?: boolean
}

/**
 * Log component props
 */
export interface LogProps {
  children: ReactNode
  name: string
  trackProps?: boolean
  trackState?: boolean
  trackEffects?: boolean
  trackContext?: boolean
}

/**
 * DebugPanel component props
 */
export interface DebugPanelProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  shortcut?: string
  draggable?: boolean
  resizable?: boolean
  defaultCollapsed?: boolean
}

/**
 * withLog HOC options
 */
export interface WithLogOptions {
  name?: string
  trackProps?: boolean
  trackState?: boolean
  trackEffects?: boolean
}

// ============================================
// PLUGIN API TYPES
// ============================================

/**
 * Lifecycle record for lifecycle-logger plugin
 */
export interface LifecycleRecord {
  type: 'mount' | 'unmount' | 'update'
  timestamp: number
  details: string
}

/**
 * Lifecycle logger plugin API
 */
export interface LifecycleLoggerAPI {
  getMountTime(componentId: string): number | null
  getUnmountTime(componentId: string): number | null
  getLifetime(componentId: string): number | null
  getUpdateCount(componentId: string): number
  isCurrentlyMounted(componentId: string): boolean
  getLifecycleHistory(componentId: string): LifecycleRecord[]
}

/**
 * Props snapshot for props-tracker plugin
 */
export interface PropsSnapshot {
  timestamp: number
  props: Record<string, unknown>
  changes: PropChange[]
}

/**
 * Props change statistics
 */
export interface PropChangeStats {
  key: string
  changeCount: number
  lastChanged: number
}

/**
 * Props tracker plugin API
 */
export interface PropsTrackerAPI {
  getCurrentProps(componentId: string): Record<string, unknown> | null
  getPropsHistory(componentId: string): PropsSnapshot[]
  getChangeCount(componentId: string): number
  getMostChangedProps(componentId: string, limit?: number): PropChangeStats[]
}

/**
 * Hook state for state-tracker plugin
 */
export interface HookState {
  index: number
  type: HookType
  value: unknown
  prevValue: unknown | null
}

/**
 * State snapshot for state-tracker plugin
 */
export interface StateSnapshot {
  timestamp: number
  hooks: HookState[]
}

/**
 * State tracker plugin API
 */
export interface StateTrackerAPI {
  getCurrentState(componentId: string): StateSnapshot | null
  getStateHistory(componentId: string): StateSnapshot[]
  getHookState(componentId: string, hookIndex: number): unknown
  getStateChangeCount(componentId: string): number
}

/**
 * Effect record for effect-tracker plugin
 */
export interface EffectRecord {
  timestamp: number
  effectIndex: number
  action: 'run' | 'cleanup'
  dependencies: unknown[]
  dependenciesChanged: number[]
  reason: 'mount' | 'deps-change' | 'unmount'
}

/**
 * Effect tracker plugin API
 */
export interface EffectTrackerAPI {
  getEffectHistory(componentId: string): EffectRecord[]
  getEffectRunCount(componentId: string, effectIndex: number): number
  getActiveEffects(componentId: string): number[]
  getEffectDependencies(componentId: string, effectIndex: number): unknown[]
}

/**
 * Console output plugin options
 */
export interface ConsoleOutputOptions {
  enabled: boolean
  collapsed: boolean
  colors: boolean
  timestamp: boolean
  showProps: boolean
  showState: boolean
  showEffects: boolean
  filter?: LogFilter
}

/**
 * Console output plugin API
 */
export interface ConsoleOutputAPI {
  configure(options: Partial<ConsoleOutputOptions>): void
  pause(): void
  resume(): void
  isPaused(): boolean
}

/**
 * Context tracker plugin options
 */
export interface ContextTrackerOptions {
  contexts?: string[]
  trackAll?: boolean
}

/**
 * Context record for context-tracker plugin
 */
export interface ContextRecord {
  timestamp: number
  contextName: string
  prevValue: unknown
  nextValue: unknown
}

/**
 * Context tracker plugin API
 */
export interface ContextTrackerAPI {
  getContextValue(componentId: string, contextName: string): unknown
  getContextHistory(componentId: string, contextName: string): ContextRecord[]
  getTrackedContexts(): string[]
}

/**
 * Error tracker plugin options
 */
export interface ErrorTrackerOptions {
  captureStack: boolean
  maxErrors: number
}

/**
 * Error record for error-tracker plugin
 */
export interface ErrorRecord {
  id: string
  timestamp: number
  componentId: string
  componentName: string
  error: Error
  errorInfo: ErrorInfo
  recovered: boolean
  stack: string | null
}

/**
 * Error tracker plugin API
 */
export interface ErrorTrackerAPI {
  getErrors(componentId?: string): ErrorRecord[]
  getErrorCount(): number
  clearErrors(): void
  getLastError(): ErrorRecord | null
}

/**
 * Render timer plugin options
 */
export interface RenderTimerOptions {
  warnThreshold: number
  errorThreshold: number
}

/**
 * Render time statistics
 */
export interface RenderTimeStats {
  count: number
  total: number
  average: number
  min: number
  max: number
  last: number
}

/**
 * Render time record
 */
export interface RenderTimeRecord {
  componentId: string
  componentName: string
  duration: number
  timestamp: number
}

/**
 * Render timer plugin API
 */
export interface RenderTimerAPI {
  getRenderTime(componentId: string): RenderTimeStats
  getSlowestRenders(limit?: number): RenderTimeRecord[]
  getAverageRenderTime(componentId: string): number
  getTotalRenderTime(componentId: string): number
}

/**
 * Render chain plugin options
 */
export interface RenderChainOptions {
  maxDepth: number
}

/**
 * Render chain node
 */
export interface RenderChainNode {
  componentId: string
  componentName: string
  triggeredBy: string | null
  triggered: string[]
  depth: number
  timestamp: number
}

/**
 * Render chain plugin API
 */
export interface RenderChainAPI {
  getChain(componentId: string): RenderChainNode | null
  getRootCause(componentId: string): string | null
  getChildren(componentId: string): string[]
  getParent(componentId: string): string | null
  visualizeChain(): string
}

/**
 * Panel UI plugin options
 */
export interface PanelUIOptions {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  shortcut: string
  draggable: boolean
  resizable: boolean
  defaultWidth: number
  defaultHeight: number
  defaultCollapsed: boolean
  theme: 'dark' | 'light' | 'auto'
  maxLogs: number
}

/**
 * Panel UI plugin API
 */
export interface PanelUIAPI {
  open(): void
  close(): void
  toggle(): void
  isOpen(): boolean
  setPosition(position: PanelUIOptions['position']): void
  setTheme(theme: PanelUIOptions['theme']): void
}

/**
 * File exporter plugin options
 */
export interface FileExporterOptions {
  format: 'json' | 'csv'
  includeMetadata: boolean
  prettyPrint: boolean
}

/**
 * Export data structure
 */
export interface ExportData {
  metadata: {
    exportedAt: string
    sessionStart: string
    sessionDuration: number
    totalLogs: number
    componentCount: number
  }
  logs: LogEntry[]
  summary: {
    byComponent: Record<string, number>
    byEventType: Record<EventType, number>
    byLevel: Record<string, number>
  }
}

/**
 * File exporter plugin API
 */
export interface FileExporterAPI {
  exportJSON(filename?: string): void
  exportCSV(filename?: string): void
  getExportData(): ExportData
  downloadFile(data: string, filename: string, mimeType: string): void
}

/**
 * Remote logger plugin options
 */
export interface RemoteLoggerOptions {
  endpoint: string
  method: 'POST' | 'PUT'
  headers?: Record<string, string>
  batchSize: number
  batchInterval: number
  retryAttempts: number
  retryDelay: number
  filter?: LogFilter
  transform?: (entry: LogEntry) => unknown
  onError?: (error: Error) => void
  onSuccess?: (response: Response) => void
}

/**
 * Remote logger plugin API
 */
export interface RemoteLoggerAPI {
  flush(): Promise<void>
  pause(): void
  resume(): void
  isPaused(): boolean
  getPendingCount(): number
  getFailedCount(): number
  retryFailed(): Promise<void>
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Component metrics
 */
export interface ComponentMetrics {
  componentId: string
  componentName: string
  mountTime: number | null
  unmountTime: number | null
  lifetime: number | null
  updateCount: number
  renderCount: number
  lastUpdate: number | null
  isCurrentlyMounted: boolean
}
