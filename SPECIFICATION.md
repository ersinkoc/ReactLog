# ReactLog - Complete Package Specification

## Overview

**Package Name**: `@oxog/reactlog`
**Version**: 1.0.0
**Description**: Zero-dependency React lifecycle debugger with micro-kernel plugin architecture.

ReactLog is a comprehensive debugging toolkit for React applications that tracks and visualizes component lifecycles, props changes, state mutations, and effect executions. Built on a micro-kernel architecture with a powerful plugin system.

---

## Package Identity

| Property | Value |
|----------|-------|
| NPM Package | `@oxog/reactlog` |
| GitHub Repository | `https://github.com/ersinkoc/reactlog` |
| Documentation Site | `https://reactlog.oxog.dev` |
| License | MIT |
| Author | ersinkoc |

---

## Technical Requirements

### Runtime Environment
- **Platform**: Browser only
- **React Version**: 17+ (hooks required)
- **Module Format**: ESM + CJS (dual package)

### Development Environment
- **Node.js**: >= 18
- **TypeScript**: >= 5.0
- **Strict Mode**: Enabled with `noUncheckedIndexedAccess` and `noImplicitOverride`

### Non-Negotiable Constraints
1. **Zero Runtime Dependencies**: `dependencies: {}` must be empty
2. **100% Test Coverage**: All lines and branches tested
3. **Tree-Shakeable**: `sideEffects: false`

---

## Package Exports

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./plugins": {
      "import": "./dist/plugins/index.js",
      "require": "./dist/plugins/index.cjs",
      "types": "./dist/plugins/index.d.ts"
    }
  }
}
```

---

## Type Definitions

### Core Types

```typescript
// ============================================
// EVENT TYPES
// ============================================

type EventType =
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

interface BaseEvent {
  type: EventType
  componentId: string
  componentName: string
  timestamp: number
}

interface MountEvent extends BaseEvent {
  type: 'mount'
  props: Record<string, unknown>
  initialState: Record<string, unknown>
}

interface UnmountEvent extends BaseEvent {
  type: 'unmount'
  lifetime: number // ms since mount
}

interface UpdateEvent extends BaseEvent {
  type: 'update'
  reason: 'props' | 'state' | 'context' | 'parent' | 'force'
  renderCount: number
}

interface PropsChangeEvent extends BaseEvent {
  type: 'props-change'
  changes: PropChange[]
}

interface PropChange {
  key: string
  prevValue: unknown
  nextValue: unknown
  isDeepEqual: boolean
}

interface StateChangeEvent extends BaseEvent {
  type: 'state-change'
  hookIndex: number
  hookType: 'useState' | 'useReducer'
  prevState: unknown
  nextState: unknown
  action?: unknown
}

interface EffectRunEvent extends BaseEvent {
  type: 'effect-run'
  effectIndex: number
  dependencies: unknown[]
  dependenciesChanged: number[]
}

interface EffectCleanupEvent extends BaseEvent {
  type: 'effect-cleanup'
  effectIndex: number
  reason: 'unmount' | 'deps-change'
}

interface ContextChangeEvent extends BaseEvent {
  type: 'context-change'
  contextName: string
  prevValue: unknown
  nextValue: unknown
}

interface ErrorEvent extends BaseEvent {
  type: 'error'
  error: Error
  errorInfo: React.ErrorInfo
  recovered: boolean
}

type KernelEvent =
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

interface LogEntry {
  id: string
  timestamp: number
  componentId: string
  componentName: string
  event: KernelEvent
  level: 'debug' | 'info' | 'warn' | 'error'
  formatted: string
}

interface LogStore {
  entries: LogEntry[]
  byComponent: Map<string, LogEntry[]>
  byType: Map<EventType, LogEntry[]>
  startTime: number
  lastEntry: LogEntry | null
}

interface LogFilter {
  componentName?: string | RegExp
  eventType?: EventType | EventType[]
  level?: LogEntry['level'] | LogEntry['level'][]
  timeRange?: { start: number; end: number }
  limit?: number
}

// ============================================
// KERNEL TYPES
// ============================================

type EventHandler = (event: KernelEvent) => void
type Unsubscribe = () => void

interface KernelOptions {
  enabled?: boolean
  maxLogs?: number
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}

interface Kernel {
  // Plugin management
  register(plugin: Plugin): void
  unregister(pluginName: string): void
  getPlugin<T extends Plugin>(name: string): T | undefined
  listPlugins(): PluginInfo[]

  // Event system
  emit(event: KernelEvent): void
  on(eventType: EventType, handler: EventHandler): Unsubscribe
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
}

// ============================================
// PLUGIN TYPES
// ============================================

interface PluginHooks {
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

interface Plugin {
  name: string
  version: string
  type: 'core' | 'optional'
  install(kernel: Kernel): void
  uninstall(): void
  hooks?: PluginHooks
  api?: Record<string, unknown>
}

interface PluginInfo {
  name: string
  version: string
  type: 'core' | 'optional'
  enabled: boolean
}

// ============================================
// REACT TYPES
// ============================================

interface ReactLogProviderProps {
  children: React.ReactNode
  enabled?: boolean
  plugins?: Plugin[]
  options?: ReactLogOptions
  onReady?: (kernel: Kernel) => void
}

interface ReactLogOptions {
  maxLogs?: number
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}

interface UseLogOptions {
  name?: string
  trackProps?: boolean
  trackState?: boolean
  trackEffects?: boolean
  trackContext?: boolean
}

interface LogProps {
  children: React.ReactNode
  name: string
  trackProps?: boolean
  trackState?: boolean
  trackEffects?: boolean
  trackContext?: boolean
}

interface DebugPanelProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  shortcut?: string
  draggable?: boolean
  resizable?: boolean
  defaultCollapsed?: boolean
}

interface WithLogOptions {
  name?: string
  trackProps?: boolean
  trackState?: boolean
  trackEffects?: boolean
}
```

---

## Core Plugins (5 Total)

Core plugins are bundled with the main entry point and always loaded.

### 1. lifecycle-logger

Tracks mount, unmount, and update events.

```typescript
interface LifecycleLoggerAPI {
  getMountTime(componentId: string): number | null
  getUnmountTime(componentId: string): number | null
  getLifetime(componentId: string): number | null
  getUpdateCount(componentId: string): number
  isCurrentlyMounted(componentId: string): boolean
  getLifecycleHistory(componentId: string): LifecycleRecord[]
}

interface LifecycleRecord {
  type: 'mount' | 'unmount' | 'update'
  timestamp: number
  details: string
}
```

### 2. props-tracker

Tracks all props changes with diff analysis.

```typescript
interface PropsTrackerAPI {
  getCurrentProps(componentId: string): Record<string, unknown> | null
  getPropsHistory(componentId: string): PropsSnapshot[]
  getChangeCount(componentId: string): number
  getMostChangedProps(componentId: string, limit?: number): PropChangeStats[]
}

interface PropsSnapshot {
  timestamp: number
  props: Record<string, unknown>
  changes: PropChange[]
}

interface PropChangeStats {
  key: string
  changeCount: number
  lastChanged: number
}
```

### 3. state-tracker

Tracks useState and useReducer changes.

```typescript
interface StateTrackerAPI {
  getCurrentState(componentId: string): StateSnapshot | null
  getStateHistory(componentId: string): StateSnapshot[]
  getHookState(componentId: string, hookIndex: number): unknown
  getStateChangeCount(componentId: string): number
}

interface StateSnapshot {
  timestamp: number
  hooks: HookState[]
}

interface HookState {
  index: number
  type: 'useState' | 'useReducer'
  value: unknown
  prevValue: unknown | null
}
```

### 4. effect-tracker

Tracks useEffect and useLayoutEffect execution.

```typescript
interface EffectTrackerAPI {
  getEffectHistory(componentId: string): EffectRecord[]
  getEffectRunCount(componentId: string, effectIndex: number): number
  getActiveEffects(componentId: string): number[]
  getEffectDependencies(componentId: string, effectIndex: number): unknown[]
}

interface EffectRecord {
  timestamp: number
  effectIndex: number
  action: 'run' | 'cleanup'
  dependencies: unknown[]
  dependenciesChanged: number[]
  reason: 'mount' | 'deps-change' | 'unmount'
}
```

### 5. console-output

Formats and outputs beautiful console logs.

```typescript
interface ConsoleOutputOptions {
  enabled: boolean
  collapsed: boolean
  colors: boolean
  timestamp: boolean
  showProps: boolean
  showState: boolean
  showEffects: boolean
  filter?: LogFilter
}

interface ConsoleOutputAPI {
  configure(options: Partial<ConsoleOutputOptions>): void
  pause(): void
  resume(): void
  isPaused(): boolean
}
```

**Console Styling Constants:**

```typescript
const CONSOLE_STYLES = {
  // Event icons
  mount: '⬆️',
  unmount: '⬇️',
  update: '🔃',
  props: '📦',
  state: '📊',
  effectRun: '🔄',
  effectCleanup: '🧹',
  context: '🌐',
  error: '❌',

  // Colors (CSS for console)
  componentName: 'color: #61dafb; font-weight: bold',
  timestamp: 'color: #888',
  mount: 'color: #4caf50',
  unmount: 'color: #f44336',
  update: 'color: #2196f3',
  props: 'color: #ff9800',
  state: 'color: #9c27b0',
  effect: 'color: #00bcd4',
  error: 'color: #f44336; font-weight: bold',
  changed: 'color: #ff5722',
  unchanged: 'color: #888',
}
```

---

## Optional Plugins (7 Total)

Optional plugins are imported separately from `@oxog/reactlog/plugins`.

### 6. context-tracker

```typescript
import { contextTracker } from '@oxog/reactlog/plugins'

interface ContextTrackerOptions {
  contexts?: string[]
  trackAll?: boolean
}

interface ContextTrackerAPI {
  getContextValue(componentId: string, contextName: string): unknown
  getContextHistory(componentId: string, contextName: string): ContextRecord[]
  getTrackedContexts(): string[]
}

interface ContextRecord {
  timestamp: number
  contextName: string
  prevValue: unknown
  nextValue: unknown
}
```

### 7. error-tracker

```typescript
import { errorTracker } from '@oxog/reactlog/plugins'

interface ErrorTrackerOptions {
  captureStack: boolean
  maxErrors: number
}

interface ErrorTrackerAPI {
  getErrors(componentId?: string): ErrorRecord[]
  getErrorCount(): number
  clearErrors(): void
  getLastError(): ErrorRecord | null
}

interface ErrorRecord {
  id: string
  timestamp: number
  componentId: string
  componentName: string
  error: Error
  errorInfo: React.ErrorInfo
  recovered: boolean
  stack: string | null
}
```

### 8. render-timer

```typescript
import { renderTimer } from '@oxog/reactlog/plugins'

interface RenderTimerOptions {
  warnThreshold: number // ms, default 16
  errorThreshold: number // ms, default 50
}

interface RenderTimerAPI {
  getRenderTime(componentId: string): RenderTimeStats
  getSlowestRenders(limit?: number): RenderTimeRecord[]
  getAverageRenderTime(componentId: string): number
  getTotalRenderTime(componentId: string): number
}

interface RenderTimeStats {
  count: number
  total: number
  average: number
  min: number
  max: number
  last: number
}

interface RenderTimeRecord {
  componentId: string
  componentName: string
  duration: number
  timestamp: number
}
```

### 9. render-chain

```typescript
import { renderChain } from '@oxog/reactlog/plugins'

interface RenderChainOptions {
  maxDepth: number // default 10
}

interface RenderChainAPI {
  getChain(componentId: string): RenderChainNode | null
  getRootCause(componentId: string): string | null
  getChildren(componentId: string): string[]
  getParent(componentId: string): string | null
  visualizeChain(): string
}

interface RenderChainNode {
  componentId: string
  componentName: string
  triggeredBy: string | null
  triggered: string[]
  depth: number
  timestamp: number
}
```

### 10. panel-ui

```typescript
import { panelUI } from '@oxog/reactlog/plugins'
import { DebugPanel } from '@oxog/reactlog'

interface PanelUIOptions {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  shortcut: string // default 'ctrl+shift+l'
  draggable: boolean
  resizable: boolean
  defaultWidth: number
  defaultHeight: number
  defaultCollapsed: boolean
  theme: 'dark' | 'light' | 'auto'
  maxLogs: number
}

interface PanelUIAPI {
  open(): void
  close(): void
  toggle(): void
  isOpen(): boolean
  setPosition(position: PanelUIOptions['position']): void
  setTheme(theme: PanelUIOptions['theme']): void
}
```

**Panel Features:**
- Shadow DOM isolation
- Draggable title bar
- Resizable corners/edges
- Keyboard shortcut toggle
- Real-time log stream
- Filter by component/event type
- Search logs
- Clear/Export/Pause buttons
- Time since start display

### 11. file-exporter

```typescript
import { fileExporter } from '@oxog/reactlog/plugins'

interface FileExporterOptions {
  format: 'json' | 'csv'
  includeMetadata: boolean
  prettyPrint: boolean
}

interface FileExporterAPI {
  exportJSON(filename?: string): void
  exportCSV(filename?: string): void
  getExportData(): ExportData
  downloadFile(data: string, filename: string, mimeType: string): void
}

interface ExportData {
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
```

### 12. remote-logger

```typescript
import { remoteLogger } from '@oxog/reactlog/plugins'

interface RemoteLoggerOptions {
  endpoint: string
  method: 'POST' | 'PUT'
  headers?: Record<string, string>
  batchSize: number // default 10
  batchInterval: number // ms, default 5000
  retryAttempts: number // default 3
  retryDelay: number // ms, default 1000
  filter?: LogFilter
  transform?: (entry: LogEntry) => unknown
  onError?: (error: Error) => void
  onSuccess?: (response: Response) => void
}

interface RemoteLoggerAPI {
  flush(): Promise<void>
  pause(): void
  resume(): void
  isPaused(): boolean
  getPendingCount(): number
  getFailedCount(): number
  retryFailed(): Promise<void>
}
```

---

## Public API

### React Components

```tsx
// ReactLogProvider
import { ReactLogProvider } from '@oxog/reactlog'

<ReactLogProvider
  enabled={true}
  plugins={[]}
  options={{ maxLogs: 1000, logLevel: 'debug' }}
  onReady={(kernel) => {}}
>
  <App />
</ReactLogProvider>

// DebugPanel (requires panelUI plugin)
import { DebugPanel } from '@oxog/reactlog'

<DebugPanel
  position="bottom-right"
  shortcut="ctrl+shift+l"
  draggable
  resizable
/>

// Log wrapper
import { Log } from '@oxog/reactlog'

<Log name="MyComponent" trackProps trackState trackEffects>
  <MyComponent />
</Log>
```

### React Hooks

```tsx
import { useLog, useLogContext, useLogMetrics } from '@oxog/reactlog'

// Main debug hook
function MyComponent() {
  useLog('MyComponent', {
    trackProps: true,
    trackState: true,
    trackEffects: true,
  })
  // ...
}

// Access kernel directly
function AdvancedUsage() {
  const kernel = useLogContext()
  const logs = kernel.getLogs()
}

// Get metrics for a component
function MetricsDisplay() {
  const metrics = useLogMetrics('TargetComponent')
}
```

### HOC

```tsx
import { withLog } from '@oxog/reactlog'

const DebuggedComponent = withLog(MyComponent, {
  name: 'MyComponent',
  trackProps: true,
  trackState: true,
  trackEffects: true,
})
```

### Programmatic API

```tsx
import {
  getKernel,
  getLogs,
  clearLogs,
  exportLogs,
  filterLogs,
  createPlugin,
} from '@oxog/reactlog'

// Access kernel
const kernel = getKernel()

// Get all logs
const logs = getLogs()

// Filter logs
const componentLogs = filterLogs({
  componentName: 'MyComponent',
  eventType: ['mount', 'unmount'],
})

// Clear all logs
clearLogs()

// Export as JSON string
const json = exportLogs()

// Create custom plugin
const myPlugin = createPlugin({
  name: 'my-analytics',
  version: '1.0.0',
  type: 'optional',
  hooks: {
    onMount: (event) => {},
    onError: (event) => {},
  },
})
```

---

## Type Exports

All types are exported from the main entry point:

```typescript
export type {
  // Kernel
  Kernel,
  KernelOptions,
  KernelEvent,
  EventType,
  EventHandler,
  Unsubscribe,

  // Plugins
  Plugin,
  PluginInfo,
  PluginHooks,

  // Events
  BaseEvent,
  MountEvent,
  UnmountEvent,
  UpdateEvent,
  PropsChangeEvent,
  StateChangeEvent,
  EffectRunEvent,
  EffectCleanupEvent,
  ContextChangeEvent,
  ErrorEvent,

  // Log
  LogEntry,
  LogStore,
  LogFilter,

  // Changes
  PropChange,

  // Options
  ReactLogOptions,
  UseLogOptions,
  LogProps,
  ConsoleOutputOptions,
  PanelUIOptions,
  FileExporterOptions,
  RemoteLoggerOptions,

  // Provider
  ReactLogProviderProps,
  DebugPanelProps,
  WithLogOptions,
}
```

---

## Utility Functions Required

### deep-equal.ts
Deep equality comparison for objects/arrays.

### shallow-equal.ts
Shallow equality comparison for props/state.

### uid.ts
Unique ID generation for components and log entries.

### timestamp.ts
Timestamp formatting utilities.

### format.ts
String formatting for console output.

### diff.ts
Object diff calculation for props/state changes.

---

## Console Output Format

```
┌─ ComponentName ─────────────────────────────────
│  ⬆️  MOUNT                        12:34:56.789
│  📦 Props: { userId: 123, theme: "dark" }
│  📊 State[0]: { loading: true }
│  📊 State[1]: { count: 0 }
│  🔄 Effect[0] RUN (mount)
│  🔄 Effect[1] RUN (mount)
├─────────────────────────────────────────────────
│  🔃 UPDATE                        12:34:58.123
│  📦 Props changed:
│     userId: 123 → 456
│  🧹 Effect[0] CLEANUP
│  🔄 Effect[0] RUN (deps changed: [0])
├─────────────────────────────────────────────────
│  ⬇️  UNMOUNT                      12:35:01.456
│  🧹 Effect[0] CLEANUP
│  🧹 Effect[1] CLEANUP
│  ⏱️  Lifetime: 4.667s
└─────────────────────────────────────────────────
```

---

## Performance Requirements

1. Logging should have minimal performance impact
2. Use `requestIdleCallback` for non-critical operations
3. Batch log entries before console output
4. Throttle console output in high-frequency scenarios
5. Lazy initialize optional plugins
6. Plugin errors must not crash the application

---

## React Compatibility

1. React 17, 18, 19 support
2. Handle StrictMode double-renders
3. Support Concurrent Mode
4. Handle Suspense boundaries
5. Work with React.memo, forwardRef, lazy

---

## Documentation Website

**URL**: https://reactlog.oxog.dev

**Technology Stack**:
- Tailwind CSS (CDN)
- Alpine.js (CDN)
- Prism.js for syntax highlighting
- Static HTML (no build step)

**Theme (Dark)**:
```css
--bg-primary: #0a0a0a;
--bg-secondary: #141414;
--bg-tertiary: #1f1f1f;
--text-primary: #fafafa;
--text-secondary: #a1a1aa;
--accent: #22c55e;
--accent-hover: #16a34a;
--success: #22c55e;
--warning: #eab308;
--error: #ef4444;
--info: #3b82f6;
```

**Required Pages**:
1. Landing Page
2. Getting Started
3. API Reference
4. Core Plugins
5. Optional Plugins
6. Custom Plugins
7. Examples
8. Playground
