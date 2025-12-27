# ReactLog - Zero-Dependency React Lifecycle Debugger

## Package Identity

- **NPM Package**: `@oxog/reactlog`
- **GitHub Repository**: `https://github.com/ersinkoc/reactlog`
- **Documentation Site**: `https://reactlog.oxog.dev`
- **License**: MIT
- **Author**: ersinkoc

**NO social media, Discord, email, or external links.**

## Package Description

Zero-dependency React lifecycle debugger with micro-kernel plugin architecture.

ReactLog is a comprehensive debugging toolkit for React applications that tracks and visualizes component lifecycles, props changes, state mutations, and effect executions. Built on a micro-kernel architecture with a powerful plugin system, it provides beautiful console output, an optional debug panel, remote logging capabilities, and export functionality—all without any runtime dependencies.

---

## NON-NEGOTIABLE RULES

These rules are ABSOLUTE and must be followed without exception:

### 1. ZERO DEPENDENCIES
```json
{
  "dependencies": {}  // MUST BE EMPTY - NO EXCEPTIONS
}
```
Implement EVERYTHING from scratch. No runtime dependencies allowed.

### 2. 100% TEST COVERAGE
- Every line of code must be tested
- Every branch must be tested
- All tests must pass (100% success rate)
- Use Vitest for testing

### 3. DEVELOPMENT WORKFLOW
Create these documents FIRST, before any code:
1. **SPECIFICATION.md** - Complete package specification
2. **IMPLEMENTATION.md** - Architecture and design decisions
3. **TASKS.md** - Ordered task list with dependencies

Only after these documents are complete, implement the code following TASKS.md sequentially.

### 4. TYPESCRIPT STRICT MODE
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

### 5. NO EXTERNAL LINKS
- ❌ No social media (Twitter, LinkedIn, etc.)
- ❌ No Discord/Slack links
- ❌ No email addresses
- ❌ No donation/sponsor links
- ✅ Only GitHub repo and documentation site allowed

---

## ARCHITECTURE: MICRO-KERNEL + PLUGIN SYSTEM

### Kernel Responsibilities

```typescript
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
```

### Plugin Interface

```typescript
interface Plugin {
  // Identity
  name: string
  version: string
  type: 'core' | 'optional'
  
  // Lifecycle
  install(kernel: Kernel): void
  uninstall(): void
  
  // Event hooks (all optional)
  hooks?: {
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
  
  // Plugin can expose its own API
  api?: Record<string, unknown>
}

interface PluginInfo {
  name: string
  version: string
  type: 'core' | 'optional'
  enabled: boolean
}
```

### Event Types

```typescript
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
  action?: unknown // for useReducer
}

interface EffectRunEvent extends BaseEvent {
  type: 'effect-run'
  effectIndex: number
  dependencies: unknown[]
  dependenciesChanged: number[] // indices of changed deps
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
```

### Log Entry Structure

```typescript
interface LogEntry {
  id: string
  timestamp: number
  componentId: string
  componentName: string
  event: KernelEvent
  level: 'debug' | 'info' | 'warn' | 'error'
  formatted: string // Pre-formatted for console
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
```

---

## CORE PLUGINS (5 Total - Always Loaded)

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
  getActiveEffects(componentId: string): number[] // indices
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
  collapsed: boolean // Use console.groupCollapsed
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

**Console Output Styling:**

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

**Console Output Format:**

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

## OPTIONAL PLUGINS (7 Total - Import Separately)

### 6. context-tracker

Tracks useContext value changes.

```typescript
// Import from plugins subpath
import { contextTracker } from '@oxog/reactlog/plugins'

// Usage
<ReactLogProvider plugins={[contextTracker()]}>

interface ContextTrackerOptions {
  contexts?: string[] // Filter specific contexts
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

Tracks Error Boundary catches and component errors.

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

Measures render duration.

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

Tracks parent→child render propagation.

```typescript
import { renderChain } from '@oxog/reactlog/plugins'

interface RenderChainOptions {
  maxDepth: number // default 10
}

interface RenderChainAPI {
  getChain(componentId: string): RenderChainNode | null
  getRootCause(componentId: string): string | null // componentId that triggered
  getChildren(componentId: string): string[]
  getParent(componentId: string): string | null
  visualizeChain(): string // ASCII tree
}

interface RenderChainNode {
  componentId: string
  componentName: string
  triggeredBy: string | null
  triggered: string[]
  depth: number
  timestamp: number
}

// Console output for render chain:
// 🔗 Render Chain:
//    App (root cause)
//    └─ Header
//       └─ Navigation
//          ├─ NavItem
//          └─ NavItem
```

### 10. panel-ui

Debug panel overlay with Shadow DOM isolation.

```typescript
import { panelUI } from '@oxog/reactlog/plugins'
import { DebugPanel } from '@oxog/reactlog'

// Plugin setup
<ReactLogProvider plugins={[panelUI(options)]}>
  <App />
  <DebugPanel />
</ReactLogProvider>

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

**Panel UI Features:**

- Shadow DOM isolation (no style conflicts)
- Draggable title bar
- Resizable corners/edges
- Keyboard shortcut toggle: `Ctrl+Shift+L`
- Real-time log stream
- Filter by component name
- Filter by event type
- Search logs
- Clear logs button
- Export button
- Pause/resume stream
- Log level indicator (colors)
- Collapsible log groups
- Copy log entry
- Time since start

**Panel UI Sections:**

```
┌─ ReactLog ──────────────────────── [_] [□] [×]
├─────────────────────────────────────────────────
│ 🔍 Filter: [____________] [Components ▼] [Events ▼]
├─────────────────────────────────────────────────
│ ┌─ MyComponent ─────────── 12:34:56 ──────────
│ │  ⬆️ MOUNT
│ │  📦 Props: { userId: 123 }
│ │  📊 State: { loading: true }
│ └──────────────────────────────────────────────
│ ┌─ Header ──────────────── 12:34:57 ──────────
│ │  🔃 UPDATE (props changed)
│ └──────────────────────────────────────────────
├─────────────────────────────────────────────────
│ [Clear] [Export] [⏸️ Pause] │ 127 logs │ 4.2s
└─────────────────────────────────────────────────
```

### 11. file-exporter

Exports logs to JSON/CSV files.

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

Sends logs to remote HTTP endpoint.

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
  flush(): Promise<void> // Send pending logs immediately
  pause(): void
  resume(): void
  isPaused(): boolean
  getPendingCount(): number
  getFailedCount(): number
  retryFailed(): Promise<void>
}
```

---

## PUBLIC API

### React Components

```tsx
// Main Provider
import { ReactLogProvider } from '@oxog/reactlog'

<ReactLogProvider
  enabled={true}
  plugins={[/* optional plugins */]}
  options={{
    maxLogs: 1000,
    logLevel: 'debug',
  }}
  onReady={(kernel) => console.log('ReactLog ready')}
>
  <App />
</ReactLogProvider>

// Debug Panel (requires panelUI plugin)
import { DebugPanel } from '@oxog/reactlog'

<DebugPanel
  position="bottom-right"
  shortcut="ctrl+shift+l"
  draggable
  resizable
/>

// Log Wrapper Component
import { Log } from '@oxog/reactlog'

<Log name="MyComponent" trackProps trackState trackEffects>
  <MyComponent />
</Log>
```

### React Hooks

```tsx
import { useLog, useLogContext, useLogMetrics } from '@oxog/reactlog'

// Main debug hook
function MyComponent({ userId }) {
  useLog('MyComponent', {
    trackProps: true,
    trackState: true,
    trackEffects: true,
  })
  
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    fetchUser(userId)
  }, [userId])
  
  return <div>{count}</div>
}

// Access kernel directly
function AdvancedUsage() {
  const kernel = useLogContext()
  const logs = kernel.getLogs()
}

// Get metrics for a component
function MetricsDisplay() {
  const metrics = useLogMetrics('TargetComponent')
  // metrics.mountTime, metrics.updateCount, etc.
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

export default DebuggedComponent
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
    onMount: (event) => {
      analytics.track('component_mount', { name: event.componentName })
    },
    onError: (event) => {
      errorReporter.capture(event.error)
    },
  },
})
```

---

## TYPE DEFINITIONS

```typescript
// Re-export all types
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
  LogOptions,
  ConsoleOutputOptions,
  PanelUIOptions,
  FileExporterOptions,
  RemoteLoggerOptions,
}

// Provider props
export interface ReactLogProviderProps {
  children: React.ReactNode
  enabled?: boolean
  plugins?: Plugin[]
  options?: ReactLogOptions
  onReady?: (kernel: Kernel) => void
}

export interface ReactLogOptions {
  maxLogs?: number
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}

// Hook options
export interface UseLogOptions {
  name?: string
  trackProps?: boolean
  trackState?: boolean
  trackEffects?: boolean
  trackContext?: boolean
}

// Component props
export interface LogProps {
  children: React.ReactNode
  name: string
  trackProps?: boolean
  trackState?: boolean
  trackEffects?: boolean
  trackContext?: boolean
}

export interface DebugPanelProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  shortcut?: string
  draggable?: boolean
  resizable?: boolean
  defaultCollapsed?: boolean
}
```

---

## TECHNICAL REQUIREMENTS

- **Runtime**: Browser only
- **React Version**: 17+ (hooks required)
- **Module Format**: ESM + CJS (dual package)
- **Node.js Version**: >= 18 (for build/test)
- **TypeScript Version**: >= 5.0, strict mode

### Package Exports

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./plugins": {
      "import": "./dist/plugins/index.js",
      "require": "./dist/plugins/index.cjs"
    }
  }
}
```

### Tree-Shaking

- Core plugins bundled with main entry
- Optional plugins in separate `/plugins` subpath
- No side effects in module scope
- `"sideEffects": false` in package.json

---

## PROJECT STRUCTURE

```
reactlog/
├── src/
│   ├── index.ts                    # Main entry, exports
│   ├── types.ts                    # All type definitions
│   │
│   ├── kernel/                     # Micro-kernel core
│   │   ├── index.ts
│   │   ├── kernel.ts               # Kernel implementation
│   │   ├── event-bus.ts            # Event pub/sub system
│   │   ├── log-store.ts            # Log storage
│   │   └── plugin-registry.ts      # Plugin management
│   │
│   ├── plugins/                    # All plugins
│   │   ├── index.ts                # Optional plugins export
│   │   ├── core/                   # Core plugins (bundled)
│   │   │   ├── index.ts
│   │   │   ├── lifecycle-logger.ts
│   │   │   ├── props-tracker.ts
│   │   │   ├── state-tracker.ts
│   │   │   ├── effect-tracker.ts
│   │   │   └── console-output/
│   │   │       ├── index.ts
│   │   │       ├── console-output.ts
│   │   │       └── formatters.ts
│   │   │
│   │   └── optional/               # Optional plugins
│   │       ├── index.ts
│   │       ├── context-tracker.ts
│   │       ├── error-tracker.ts
│   │       ├── render-timer.ts
│   │       ├── render-chain.ts
│   │       ├── panel-ui/
│   │       │   ├── index.ts
│   │       │   ├── panel.tsx
│   │       │   ├── components/
│   │       │   │   ├── log-list.tsx
│   │       │   │   ├── log-entry.tsx
│   │       │   │   ├── filter-bar.tsx
│   │       │   │   └── toolbar.tsx
│   │       │   ├── styles/
│   │       │   │   └── panel.css
│   │       │   └── utils/
│   │       │       ├── shadow-dom.ts
│   │       │       ├── draggable.ts
│   │       │       └── resizable.ts
│   │       ├── file-exporter.ts
│   │       └── remote-logger.ts
│   │
│   ├── react/                      # React integration
│   │   ├── index.ts
│   │   ├── provider.tsx            # ReactLogProvider
│   │   ├── context.ts              # React context
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── use-log.ts
│   │   │   ├── use-log-context.ts
│   │   │   └── use-log-metrics.ts
│   │   ├── components/
│   │   │   ├── index.ts
│   │   │   ├── log.tsx             # Log wrapper
│   │   │   └── debug-panel.tsx     # Panel component
│   │   └── hoc/
│   │       ├── index.ts
│   │       └── with-log.tsx
│   │
│   └── utils/                      # Internal utilities
│       ├── index.ts
│       ├── deep-equal.ts
│       ├── shallow-equal.ts
│       ├── uid.ts
│       ├── timestamp.ts
│       ├── format.ts
│       └── diff.ts
│
├── tests/
│   ├── unit/
│   │   ├── kernel/
│   │   ├── plugins/
│   │   │   ├── core/
│   │   │   └── optional/
│   │   ├── react/
│   │   └── utils/
│   ├── integration/
│   │   ├── provider.test.tsx
│   │   ├── hooks.test.tsx
│   │   ├── plugins.test.ts
│   │   └── panel.test.tsx
│   └── fixtures/
│       ├── test-components.tsx
│       └── mock-data.ts
│
├── examples/
│   ├── basic/
│   │   ├── index.html
│   │   └── src/
│   ├── with-panel/
│   │   ├── index.html
│   │   └── src/
│   ├── remote-logging/
│   │   ├── index.html
│   │   └── src/
│   └── custom-plugin/
│       ├── index.html
│       └── src/
│
├── website/                        # Documentation site
│   ├── index.html
│   ├── docs/
│   │   ├── index.html
│   │   ├── getting-started.html
│   │   ├── api/
│   │   │   ├── index.html
│   │   │   ├── provider.html
│   │   │   ├── hooks.html
│   │   │   ├── components.html
│   │   │   └── plugins.html
│   │   ├── plugins/
│   │   │   ├── index.html
│   │   │   ├── core-plugins.html
│   │   │   ├── optional-plugins.html
│   │   │   └── custom-plugins.html
│   │   ├── examples/
│   │   │   ├── index.html
│   │   │   ├── basic.html
│   │   │   ├── panel.html
│   │   │   └── remote.html
│   │   └── playground/
│   │       └── index.html
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css
│   │   ├── js/
│   │   │   └── main.js
│   │   └── images/
│   │       ├── og-image.png
│   │       └── favicon.svg
│   └── 404.html
│
├── SPECIFICATION.md
├── IMPLEMENTATION.md
├── TASKS.md
├── README.md
├── CHANGELOG.md
├── LICENSE
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

---

## DOCUMENTATION WEBSITE

Build documentation site for `https://reactlog.oxog.dev`

### Technology Stack
- **Tailwind CSS** (via CDN)
- **Alpine.js** (via CDN)
- **Prism.js** for syntax highlighting
- **Static HTML** (no build step)

### Design Theme (Dark)
```css
--bg-primary: #0a0a0a;
--bg-secondary: #141414;
--bg-tertiary: #1f1f1f;
--text-primary: #fafafa;
--text-secondary: #a1a1aa;
--accent: #22c55e;        /* Green - logging theme */
--accent-hover: #16a34a;
--success: #22c55e;
--warning: #eab308;
--error: #ef4444;
--info: #3b82f6;
```

### Required Pages

1. **Landing Page** - Hero, features, quick install, console output preview
2. **Getting Started** - Installation, basic setup, first log
3. **API Reference** - Full documentation for all exports
4. **Core Plugins** - Documentation for 5 core plugins
5. **Optional Plugins** - Documentation for 7 optional plugins
6. **Custom Plugins** - Guide to creating plugins
7. **Examples** - Basic, panel, remote, custom plugin
8. **Playground** - Interactive code editor with console preview

### Special Features

- Live console output preview (simulated)
- Copy-to-clipboard on all code blocks
- npm/yarn/pnpm tabs
- Mobile responsive
- Plugin comparison table

---

## IMPLEMENTATION CHECKLIST

Before starting implementation:
- [ ] Create SPECIFICATION.md with complete package spec
- [ ] Create IMPLEMENTATION.md with architecture design
- [ ] Create TASKS.md with ordered task list

During implementation:
- [ ] Implement kernel first (foundation)
- [ ] Implement core plugins (5)
- [ ] Implement React integration
- [ ] Implement optional plugins (7)
- [ ] Build Panel UI last
- [ ] Maintain 100% test coverage throughout
- [ ] Write JSDoc for all public APIs

Before completion:
- [ ] All tests passing (100% success)
- [ ] Coverage report shows 100%
- [ ] README.md complete
- [ ] CHANGELOG.md initialized
- [ ] Website functional
- [ ] Package builds without errors
- [ ] Tree-shaking works correctly

---

## CRITICAL IMPLEMENTATION NOTES

### Performance
- Logging should have minimal performance impact
- Use `requestIdleCallback` for non-critical operations
- Batch log entries
- Throttle console output
- Lazy initialize optional plugins

### Console Output Quality
This is the core feature - make it beautiful:
- Proper indentation
- Consistent spacing
- Color coding by event type
- Collapsible groups
- Readable timestamps
- Diff highlighting for changes

### React Integration
- Must work with React 17, 18, 19
- Handle StrictMode double-renders (filter duplicates)
- Support Concurrent Mode
- Handle Suspense boundaries
- Work with React.memo, forwardRef, lazy

### Plugin Isolation
- Plugins should not interfere with each other
- One plugin's error should not crash others
- Plugins can be enabled/disabled at runtime

---

## BEGIN IMPLEMENTATION

Start by creating SPECIFICATION.md with the complete package specification. Then proceed with IMPLEMENTATION.md and TASKS.md before writing any actual code.

Remember: This package will be published to NPM. It must be production-ready, zero-dependency, fully tested, and professionally documented.

The console output quality is the star feature - invest extra effort in making it beautiful and useful.