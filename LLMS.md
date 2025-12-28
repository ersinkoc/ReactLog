# @oxog/reactlog - LLM Documentation

> Zero-dependency React lifecycle debugger with micro-kernel plugin architecture

**Version:** 1.0.1
**License:** MIT
**Repository:** https://github.com/ersinkoc/reactlog
**Homepage:** https://reactlog.oxog.dev

---

## Quick Reference

### Installation

```bash
npm install @oxog/reactlog
# or
yarn add @oxog/reactlog
# or
pnpm add @oxog/reactlog
```

### Quick Start

```tsx
import { ReactLogProvider, useLog } from '@oxog/reactlog'

// Wrap your app with the provider
function App() {
  return (
    <ReactLogProvider>
      <MyComponent userId={123} />
    </ReactLogProvider>
  )
}

// Add logging to any component
function MyComponent({ userId }) {
  useLog('MyComponent', {
    trackProps: true,
    trackState: true,
    trackEffects: true,
  })

  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  )
}
```

---

## Package Overview

### Purpose

ReactLog is a comprehensive debugging tool for React applications that tracks component lifecycle events, state changes, props updates, and effect execution. It uses a micro-kernel architecture with a powerful plugin system, allowing developers to extend functionality while keeping the core minimal and tree-shakeable.

### Key Features

- **Zero Dependencies**: No runtime dependencies - everything implemented from scratch
- **Micro-Kernel Architecture**: Minimal core with powerful, extensible plugin system
- **Beautiful Console Output**: Styled, collapsible log groups with icons and colors
- **Full Lifecycle Tracking**: Mount, unmount, updates, props, state, effects, context, errors
- **Debug Panel**: Optional floating UI panel with Shadow DOM isolation
- **Remote Logging**: Send logs to external HTTP endpoints
- **Export Functionality**: Export logs as JSON or CSV files
- **Tree-Shakeable**: Only bundle what you use
- **TypeScript First**: Full type definitions included
- **React 17, 18, 19 Compatible**: Works with all modern React versions
- **StrictMode Handling**: Properly handles React 18's double-invoke behavior

### Architecture

ReactLog uses a micro-kernel architecture where:
1. The **Kernel** is the central hub managing plugins, events, and log storage
2. **Core Plugins** (always loaded) handle lifecycle, props, state, effect tracking, and console output
3. **Optional Plugins** (tree-shakeable) provide advanced features like UI panel, file export, remote logging
4. **Event Bus** enables pub/sub communication between components and plugins
5. **Log Store** maintains indexed, filterable log entries

### Dependencies

- **Runtime:** Zero runtime dependencies
- **Peer:** `react >=17.0.0`, `react-dom >=17.0.0`

---

## API Reference

### Exports Summary

| Export | Type | Description |
|--------|------|-------------|
| `ReactLogProvider` | Component | Main provider component wrapping your app |
| `useLog` | Hook | Main debug hook for tracking component lifecycle |
| `useLogContext` | Hook | Access kernel directly from context |
| `useLogMetrics` | Hook | Get metrics for a specific component |
| `useAllMetrics` | Hook | Get metrics for all tracked components |
| `Log` | Component | Wrapper component for declarative logging |
| `DebugPanel` | Component | Debug panel UI component |
| `withLog` | HOC | Higher-order component wrapper |
| `createWithLog` | Factory | Create pre-configured withLog HOC |
| `createLogWrapper` | Factory | Create pre-configured Log wrapper |
| `getKernel` | Function | Get global kernel instance |
| `getLogs` | Function | Get all logs from kernel |
| `clearLogs` | Function | Clear all logs |
| `filterLogs` | Function | Filter logs by criteria |
| `exportLogs` | Function | Export logs as JSON string |
| `getPluginAPI` | Function | Get plugin API by name |
| `isEnabled` | Function | Check if kernel is enabled |
| `enable` | Function | Enable the kernel |
| `disable` | Function | Disable the kernel |
| `createPlugin` | Function | Create a custom plugin |
| `validatePlugin` | Function | Validate a plugin object |
| `createKernel` | Function | Create a new Kernel instance |
| `Kernel` | Class | Main Kernel class |

---

### Components

#### `ReactLogProvider`

Main provider component that initializes the kernel and provides context.

```tsx
import { ReactLogProvider } from '@oxog/reactlog'

<ReactLogProvider
  enabled={true}                    // Enable/disable logging
  plugins={[]}                      // Optional plugins array
  options={{ maxLogs: 1000 }}       // Kernel options
  onReady={(kernel) => {}}          // Callback when kernel is ready
>
  <App />
</ReactLogProvider>
```

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | - | Child components |
| `enabled` | `boolean` | No | `true` (in browser) | Enable/disable logging |
| `plugins` | `Plugin[]` | No | `[]` | Optional plugins to install |
| `options` | `ReactLogOptions` | No | `{}` | Kernel configuration |
| `onReady` | `(kernel: Kernel) => void` | No | - | Callback when kernel ready |

**ReactLogOptions:**

```typescript
interface ReactLogOptions {
  maxLogs?: number      // Maximum log entries (default: 1000)
  logLevel?: LogLevel   // Minimum log level ('debug' | 'info' | 'warn' | 'error')
}
```

---

#### `Log`

Wrapper component for declarative logging.

```tsx
import { Log } from '@oxog/reactlog'

<Log name="MyComponent" trackProps trackState>
  <MyComponent {...props} />
</Log>
```

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | - | Child component to track |
| `name` | `string` | Yes | - | Component name for logging |
| `trackProps` | `boolean` | No | `true` | Track props changes |
| `trackState` | `boolean` | No | `true` | Track state changes |
| `trackEffects` | `boolean` | No | `true` | Track effect execution |
| `trackContext` | `boolean` | No | `false` | Track context changes |

---

#### `DebugPanel`

Debug panel component displaying logs in a floating UI.

```tsx
import { DebugPanel } from '@oxog/reactlog'

<DebugPanel
  position="bottom-right"
  shortcut="ctrl+shift+l"
  draggable
  resizable
  defaultCollapsed={false}
/>
```

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | No | `'bottom-right'` | Panel position |
| `shortcut` | `string` | No | `'ctrl+shift+l'` | Keyboard shortcut to toggle |
| `draggable` | `boolean` | No | `true` | Allow dragging |
| `resizable` | `boolean` | No | `true` | Allow resizing |
| `defaultCollapsed` | `boolean` | No | `false` | Start collapsed |

**Note:** For full functionality, use with the `panelUI` plugin from `@oxog/reactlog/plugins`.

---

### Hooks

#### `useLog(name, options?)`

Main debug hook for tracking component lifecycle.

```tsx
import { useLog } from '@oxog/reactlog'

function MyComponent({ userId }) {
  const { componentId, renderCount, trackProps, trackState } = useLog('MyComponent', {
    trackProps: true,
    trackState: true,
    trackEffects: true,
    trackContext: false,
  })

  // Manually track props changes if needed
  useEffect(() => {
    trackProps({ userId })
  }, [userId, trackProps])

  return <div>Component ID: {componentId}, Renders: {renderCount}</div>
}
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | `string` | Yes | - | Component name for logging |
| `options` | `UseLogOptions` | No | `{}` | Tracking options |

**UseLogOptions:**

```typescript
interface UseLogOptions {
  name?: string            // Override component name
  trackProps?: boolean     // Track props changes (default: true)
  trackState?: boolean     // Track state changes (default: true)
  trackEffects?: boolean   // Track effect execution (default: true)
  trackContext?: boolean   // Track context changes (default: false)
}
```

**Returns:**

```typescript
{
  componentId: string                              // Unique component instance ID
  renderCount: number                              // Current render count
  trackProps: (props: Record<string, unknown>) => void   // Manual props tracking
  trackState: (hookIndex: number, state: unknown) => void // Manual state tracking
}
```

---

#### `useLogContext()`

Access the ReactLog kernel directly from context.

```tsx
import { useLogContext } from '@oxog/reactlog'

function MyComponent() {
  const kernel = useLogContext()  // Throws if not in provider

  const logs = kernel.getLogs()
  const plugins = kernel.listPlugins()

  return <div>{logs.entries.length} logs</div>
}
```

**Returns:** `Kernel`

**Throws:** Error if used outside of `ReactLogProvider`

---

#### `useOptionalLogContext()`

Optionally access the kernel (returns null if not in provider).

```tsx
import { useOptionalLogContext } from '@oxog/reactlog'

function MyComponent() {
  const kernel = useOptionalLogContext()  // Returns null if not in provider

  if (!kernel) {
    return <div>Logging disabled</div>
  }

  return <div>{kernel.getLogs().entries.length} logs</div>
}
```

**Returns:** `Kernel | null`

---

#### `useLogMetrics(componentName)`

Get metrics for a specific component.

```tsx
import { useLogMetrics } from '@oxog/reactlog'

function MetricsDisplay() {
  const metrics = useLogMetrics('MyComponent')

  if (!metrics) return null

  return (
    <div>
      <p>Render count: {metrics.renderCount}</p>
      <p>Update count: {metrics.updateCount}</p>
      <p>Lifetime: {metrics.lifetime}ms</p>
      <p>Currently mounted: {metrics.isCurrentlyMounted ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `componentName` | `string` | Yes | Name of component to get metrics for |

**Returns:** `ComponentMetrics | null`

```typescript
interface ComponentMetrics {
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
```

---

#### `useAllMetrics()`

Get metrics for all tracked components.

```tsx
import { useAllMetrics } from '@oxog/reactlog'

function AllMetricsDisplay() {
  const allMetrics = useAllMetrics()

  return (
    <ul>
      {allMetrics.map(m => (
        <li key={m.componentId}>
          {m.componentName}: {m.renderCount} renders
        </li>
      ))}
    </ul>
  )
}
```

**Returns:** `ComponentMetrics[]`

---

### Higher-Order Component

#### `withLog(Component, options?)`

HOC for adding logging to a component.

```tsx
import { withLog } from '@oxog/reactlog'

function MyComponent({ name }) {
  return <div>Hello, {name}</div>
}

// Wrap with logging
const LoggedComponent = withLog(MyComponent, {
  name: 'MyComponent',
  trackProps: true,
  trackState: true,
  trackEffects: true,
})

// Usage
<LoggedComponent name="World" />
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Component` | `React.ComponentType<P>` | Yes | Component to wrap |
| `options` | `WithLogOptions` | No | Logging options |

**WithLogOptions:**

```typescript
interface WithLogOptions {
  name?: string           // Component name (defaults to Component.displayName or name)
  trackProps?: boolean    // Track props changes (default: true)
  trackState?: boolean    // Track state changes (default: true)
  trackEffects?: boolean  // Track effect execution (default: true)
}
```

**Returns:** `React.ComponentType<P>`

---

#### `createWithLog(defaultOptions)`

Create a pre-configured withLog HOC factory.

```tsx
import { createWithLog } from '@oxog/reactlog'

// Create a custom HOC with default options
const withDebugLog = createWithLog({
  trackProps: true,
  trackState: true,
  trackEffects: false,
})

// Use it
const LoggedComponent = withDebugLog(MyComponent)
const AnotherLogged = withDebugLog(AnotherComponent, { name: 'Custom' })
```

---

### Programmatic API

#### `getKernel()`

Get the global kernel instance.

```tsx
import { getKernel } from '@oxog/reactlog'

const kernel = getKernel()
if (kernel) {
  console.log('Kernel is initialized')
  console.log('Plugins:', kernel.listPlugins())
}
```

**Returns:** `Kernel | null`

---

#### `getLogs()`

Get all logs from the kernel.

```tsx
import { getLogs } from '@oxog/reactlog'

const logs = getLogs()
if (logs) {
  console.log(`Total logs: ${logs.entries.length}`)
  console.log(`Session start: ${new Date(logs.startTime)}`)
  console.log(`Last entry:`, logs.lastEntry)
}
```

**Returns:** `LogStore | null`

```typescript
interface LogStore {
  entries: LogEntry[]
  byComponent: Map<string, LogEntry[]>
  byType: Map<EventType, LogEntry[]>
  startTime: number
  lastEntry: LogEntry | null
}
```

---

#### `clearLogs()`

Clear all logs from the kernel.

```tsx
import { clearLogs } from '@oxog/reactlog'

clearLogs()
```

---

#### `filterLogs(filter)`

Filter logs based on criteria.

```tsx
import { filterLogs } from '@oxog/reactlog'

// Filter by component name (string or RegExp)
const componentLogs = filterLogs({ componentName: 'MyComponent' })
const patternLogs = filterLogs({ componentName: /^User/ })

// Filter by event type (single or array)
const mountLogs = filterLogs({ eventType: 'mount' })
const lifecycleLogs = filterLogs({ eventType: ['mount', 'unmount', 'update'] })

// Filter by log level
const errorLogs = filterLogs({ level: 'error' })
const importantLogs = filterLogs({ level: ['warn', 'error'] })

// Filter by time range
const recentLogs = filterLogs({
  timeRange: { start: Date.now() - 60000, end: Date.now() }
})

// Limit results
const lastTenLogs = filterLogs({ limit: 10 })

// Combine filters
const filtered = filterLogs({
  componentName: 'MyComponent',
  eventType: ['mount', 'update'],
  level: ['debug', 'info'],
  limit: 50
})
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | `LogFilter` | Yes | Filter criteria |

**LogFilter:**

```typescript
interface LogFilter {
  componentName?: string | RegExp
  eventType?: EventType | EventType[]
  level?: LogLevel | LogLevel[]
  timeRange?: { start: number; end: number }
  limit?: number
}
```

**Returns:** `LogEntry[]`

---

#### `exportLogs(pretty?)`

Export logs as JSON string.

```tsx
import { exportLogs } from '@oxog/reactlog'

// Compact JSON
const json = exportLogs()

// Pretty-printed JSON
const prettyJson = exportLogs(true)

// Parse and use
const data = JSON.parse(json)
console.log(`Exported ${data.totalLogs} logs at ${data.exportedAt}`)
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `pretty` | `boolean` | No | `false` | Pretty-print the JSON |

**Returns:** `string` (JSON)

---

#### `getPluginAPI<T>(pluginName)`

Get a plugin's API by name.

```tsx
import { getPluginAPI } from '@oxog/reactlog'
import type { RenderTimerAPI } from '@oxog/reactlog'

const renderTimerAPI = getPluginAPI<RenderTimerAPI>('render-timer')
if (renderTimerAPI) {
  const stats = renderTimerAPI.getRenderTime('my-component-id')
  console.log(`Average render time: ${stats.average}ms`)
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pluginName` | `string` | Yes | Name of the plugin |

**Returns:** `T | undefined`

---

#### `isEnabled()`, `enable()`, `disable()`

Control kernel enabled state.

```tsx
import { isEnabled, enable, disable } from '@oxog/reactlog'

console.log(isEnabled())  // true or false

disable()
console.log(isEnabled())  // false

enable()
console.log(isEnabled())  // true
```

---

### Plugin Factory

#### `createPlugin(config)`

Create a custom plugin.

```tsx
import { createPlugin } from '@oxog/reactlog'
import type { MountEvent, ErrorEvent, Kernel } from '@oxog/reactlog'

const analyticsPlugin = createPlugin({
  name: 'my-analytics',
  version: '1.0.0',
  type: 'optional',  // 'core' | 'optional'

  hooks: {
    onMount: (event: MountEvent) => {
      analytics.track('component_mount', {
        name: event.componentName,
        props: event.props,
      })
    },
    onError: (event: ErrorEvent) => {
      errorReporter.capture(event.error)
    },
    // Available hooks: onMount, onUnmount, onUpdate, onPropsChange,
    // onStateChange, onEffectRun, onEffectCleanup, onContextChange,
    // onError, onLog
  },

  api: {
    getAnalyticsData: () => analyticsData,
    clearAnalytics: () => { analyticsData = [] },
  },

  onInstall: (kernel: Kernel) => {
    console.log('Plugin installed!')
  },

  onUninstall: () => {
    console.log('Plugin uninstalled!')
  },
})

// Use in provider
<ReactLogProvider plugins={[analyticsPlugin]}>
  <App />
</ReactLogProvider>
```

**PluginConfig:**

```typescript
interface PluginConfig {
  name: string                        // Unique plugin name
  version: string                     // Plugin version
  type?: 'core' | 'optional'          // Plugin type (default: 'optional')
  hooks?: PluginHooks                 // Event hooks
  api?: Record<string, unknown>       // Public API
  onInstall?: (kernel: Kernel) => void  // Called when installed
  onUninstall?: () => void            // Called when uninstalled
}

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
```

**Returns:** `Plugin`

---

#### `validatePlugin(plugin)`

Validate a plugin object.

```tsx
import { validatePlugin } from '@oxog/reactlog'

try {
  validatePlugin(myPlugin)  // Returns true if valid
} catch (error) {
  console.error('Invalid plugin:', error.message)
}
```

**Returns:** `boolean` (true if valid)

**Throws:** `Error` with description if invalid

---

### Kernel Class

#### `createKernel(options?)`

Create a new Kernel instance (for advanced usage).

```tsx
import { createKernel, installCorePlugins } from '@oxog/reactlog'

const kernel = createKernel({
  enabled: true,
  maxLogs: 500,
  logLevel: 'debug',
})

// Install core plugins manually
installCorePlugins(kernel)

// Register custom plugins
kernel.register(myPlugin)
```

**KernelOptions:**

```typescript
interface KernelOptions {
  enabled?: boolean     // Enable/disable (default: true)
  maxLogs?: number      // Max log entries (default: 1000)
  logLevel?: LogLevel   // Minimum level (default: 'debug')
}
```

**Kernel Methods:**

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
```

---

## Core Plugins

Core plugins are automatically installed with `ReactLogProvider`.

### lifecycle-logger

Tracks component mount, unmount, and update events.

**API:**

```typescript
interface LifecycleLoggerAPI {
  getMountTime(componentId: string): number | null
  getUnmountTime(componentId: string): number | null
  getLifetime(componentId: string): number | null
  getUpdateCount(componentId: string): number
  isCurrentlyMounted(componentId: string): boolean
  getLifecycleHistory(componentId: string): LifecycleRecord[]
}
```

### props-tracker

Tracks all props changes with diff analysis.

**API:**

```typescript
interface PropsTrackerAPI {
  getCurrentProps(componentId: string): Record<string, unknown> | null
  getPropsHistory(componentId: string): PropsSnapshot[]
  getChangeCount(componentId: string): number
  getMostChangedProps(componentId: string, limit?: number): PropChangeStats[]
}
```

### state-tracker

Tracks useState and useReducer changes.

**API:**

```typescript
interface StateTrackerAPI {
  getCurrentState(componentId: string): StateSnapshot | null
  getStateHistory(componentId: string): StateSnapshot[]
  getHookState(componentId: string, hookIndex: number): unknown
  getStateChangeCount(componentId: string): number
}
```

### effect-tracker

Tracks useEffect execution and cleanup.

**API:**

```typescript
interface EffectTrackerAPI {
  getEffectHistory(componentId: string): EffectRecord[]
  getEffectRunCount(componentId: string, effectIndex: number): number
  getActiveEffects(componentId: string): number[]
  getEffectDependencies(componentId: string, effectIndex: number): unknown[]
}
```

### console-output

Formats beautiful console logs with colors and icons.

**API:**

```typescript
interface ConsoleOutputAPI {
  configure(options: Partial<ConsoleOutputOptions>): void
  pause(): void
  resume(): void
  isPaused(): boolean
}

interface ConsoleOutputOptions {
  enabled: boolean     // Enable console output (default: true)
  collapsed: boolean   // Use collapsed groups (default: true)
  colors: boolean      // Use colors (default: true)
  timestamp: boolean   // Show timestamps (default: true)
  showProps: boolean   // Show props events (default: true)
  showState: boolean   // Show state events (default: true)
  showEffects: boolean // Show effect events (default: true)
  filter?: LogFilter   // Optional filter
}
```

---

## Optional Plugins

Import from `@oxog/reactlog/plugins`:

```tsx
import {
  contextTracker,
  errorTracker,
  renderTimer,
  renderChain,
  panelUI,
  fileExporter,
  remoteLogger
} from '@oxog/reactlog/plugins'
```

### contextTracker

Tracks useContext value changes.

```tsx
import { contextTracker } from '@oxog/reactlog/plugins'

<ReactLogProvider plugins={[
  contextTracker({ trackAll: true })
]}>
  <App />
</ReactLogProvider>
```

**Options:**

```typescript
interface ContextTrackerOptions {
  contexts?: string[]    // Specific context names to track
  trackAll?: boolean     // Track all contexts (default: true)
}
```

**API:**

```typescript
interface ContextTrackerAPI {
  getContextValue(componentId: string, contextName: string): unknown
  getContextHistory(componentId: string, contextName: string): ContextRecord[]
  getTrackedContexts(): string[]
}
```

---

### errorTracker

Tracks Error Boundary catches and component errors.

```tsx
import { errorTracker } from '@oxog/reactlog/plugins'

<ReactLogProvider plugins={[
  errorTracker({ captureStack: true, maxErrors: 100 })
]}>
  <App />
</ReactLogProvider>
```

**Options:**

```typescript
interface ErrorTrackerOptions {
  captureStack: boolean  // Capture stack traces (default: true)
  maxErrors: number      // Max errors to store (default: 100)
}
```

**API:**

```typescript
interface ErrorTrackerAPI {
  getErrors(componentId?: string): ErrorRecord[]
  getErrorCount(): number
  clearErrors(): void
  getLastError(): ErrorRecord | null
}
```

---

### renderTimer

Measures render duration and detects slow renders.

```tsx
import { renderTimer } from '@oxog/reactlog/plugins'

<ReactLogProvider plugins={[
  renderTimer({ warnThreshold: 16, errorThreshold: 50 })
]}>
  <App />
</ReactLogProvider>
```

**Options:**

```typescript
interface RenderTimerOptions {
  warnThreshold: number   // Warn if render > this ms (default: 16)
  errorThreshold: number  // Error if render > this ms (default: 50)
}
```

**API:**

```typescript
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
```

---

### renderChain

Tracks parent-to-child render propagation.

```tsx
import { renderChain } from '@oxog/reactlog/plugins'

<ReactLogProvider plugins={[
  renderChain({ maxDepth: 10 })
]}>
  <App />
</ReactLogProvider>
```

**Options:**

```typescript
interface RenderChainOptions {
  maxDepth: number  // Max chain depth before warning (default: 10)
}
```

**API:**

```typescript
interface RenderChainAPI {
  getChain(componentId: string): RenderChainNode | null
  getRootCause(componentId: string): string | null
  getChildren(componentId: string): string[]
  getParent(componentId: string): string | null
  visualizeChain(): string  // ASCII tree visualization
}
```

---

### panelUI

Debug panel overlay with Shadow DOM isolation.

```tsx
import { panelUI } from '@oxog/reactlog/plugins'

<ReactLogProvider plugins={[
  panelUI({
    position: 'bottom-right',
    shortcut: 'ctrl+shift+l',
    theme: 'dark',
  })
]}>
  <App />
</ReactLogProvider>
```

**Options:**

```typescript
interface PanelUIOptions {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  shortcut: string           // Keyboard shortcut (default: 'ctrl+shift+l')
  draggable: boolean         // Allow dragging (default: true)
  resizable: boolean         // Allow resizing (default: true)
  defaultWidth: number       // Initial width (default: 400)
  defaultHeight: number      // Initial height (default: 300)
  defaultCollapsed: boolean  // Start collapsed (default: false)
  theme: 'dark' | 'light' | 'auto'  // Color theme (default: 'dark')
  maxLogs: number            // Max logs to display (default: 500)
}
```

**API:**

```typescript
interface PanelUIAPI {
  open(): void
  close(): void
  toggle(): void
  isOpen(): boolean
  setPosition(position: PanelUIOptions['position']): void
  setTheme(theme: PanelUIOptions['theme']): void
}
```

---

### fileExporter

Export logs to JSON or CSV files.

```tsx
import { fileExporter } from '@oxog/reactlog/plugins'

<ReactLogProvider plugins={[
  fileExporter({ format: 'json', prettyPrint: true })
]}>
  <App />
</ReactLogProvider>
```

**Options:**

```typescript
interface FileExporterOptions {
  format: 'json' | 'csv'     // Default export format
  includeMetadata: boolean   // Include metadata (default: true)
  prettyPrint: boolean       // Pretty print JSON (default: true)
}
```

**API:**

```typescript
interface FileExporterAPI {
  exportJSON(filename?: string): void  // Download as JSON
  exportCSV(filename?: string): void   // Download as CSV
  getExportData(): ExportData          // Get data without download
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

---

### remoteLogger

Send logs to remote HTTP endpoint.

```tsx
import { remoteLogger } from '@oxog/reactlog/plugins'

<ReactLogProvider plugins={[
  remoteLogger({
    endpoint: 'https://logs.example.com/api/logs',
    batchSize: 10,
    batchInterval: 5000,
  })
]}>
  <App />
</ReactLogProvider>
```

**Options:**

```typescript
interface RemoteLoggerOptions {
  endpoint: string           // Required: HTTP endpoint URL
  method: 'POST' | 'PUT'     // HTTP method (default: 'POST')
  headers?: Record<string, string>  // Additional headers
  batchSize: number          // Logs per batch (default: 10)
  batchInterval: number      // Batch interval ms (default: 5000)
  retryAttempts: number      // Retry count (default: 3)
  retryDelay: number         // Retry delay ms (default: 1000)
  filter?: LogFilter         // Filter which logs to send
  transform?: (entry: LogEntry) => unknown  // Transform before sending
  onError?: (error: Error) => void     // Error callback
  onSuccess?: (response: Response) => void  // Success callback
}
```

**API:**

```typescript
interface RemoteLoggerAPI {
  flush(): Promise<void>     // Send pending logs immediately
  pause(): void              // Pause sending
  resume(): void             // Resume sending
  isPaused(): boolean
  getPendingCount(): number  // Logs waiting to send
  getFailedCount(): number   // Failed logs
  retryFailed(): Promise<void>  // Retry failed logs
}
```

---

## Types & Interfaces

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
  lifetime: number
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
```

### Log Types

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  id: string
  timestamp: number
  componentId: string
  componentName: string
  event: KernelEvent
  level: LogLevel
  formatted: string
}
```

### Type Imports

```typescript
import type {
  // Kernel types
  Kernel,
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
  PropsChangeEvent,
  StateChangeEvent,
  EffectRunEvent,
  EffectCleanupEvent,
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

  // Component metrics
  ComponentMetrics,
} from '@oxog/reactlog'
```

---

## Usage Patterns

### Pattern 1: Basic Component Debugging

**Use Case:** Quick debugging of a single component's lifecycle.

```tsx
import { ReactLogProvider, useLog } from '@oxog/reactlog'

function App() {
  return (
    <ReactLogProvider>
      <UserProfile userId={123} />
    </ReactLogProvider>
  )
}

function UserProfile({ userId }) {
  useLog('UserProfile')

  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])

  return user ? <div>{user.name}</div> : <div>Loading...</div>
}
```

### Pattern 2: Full Application Debugging

**Use Case:** Debug entire application with UI panel and remote logging.

```tsx
import { ReactLogProvider } from '@oxog/reactlog'
import { panelUI, remoteLogger, renderTimer } from '@oxog/reactlog/plugins'

function App() {
  return (
    <ReactLogProvider
      enabled={process.env.NODE_ENV === 'development'}
      plugins={[
        panelUI({ position: 'bottom-right' }),
        renderTimer({ warnThreshold: 16 }),
        remoteLogger({
          endpoint: '/api/logs',
          batchSize: 20,
        }),
      ]}
      options={{ maxLogs: 2000 }}
    >
      <Routes />
    </ReactLogProvider>
  )
}
```

### Pattern 3: Conditional Debugging

**Use Case:** Debug specific components only.

```tsx
import { Log } from '@oxog/reactlog'

function Dashboard() {
  return (
    <div>
      <Header />

      {/* Only debug this slow component */}
      <Log name="DataTable" trackProps trackState>
        <DataTable data={largeDataset} />
      </Log>

      <Footer />
    </div>
  )
}
```

### Pattern 4: Performance Analysis

**Use Case:** Find and fix slow renders.

```tsx
import { ReactLogProvider, getPluginAPI } from '@oxog/reactlog'
import { renderTimer, type RenderTimerAPI } from '@oxog/reactlog/plugins'

function App() {
  return (
    <ReactLogProvider plugins={[renderTimer()]}>
      <Dashboard />
      <PerformanceMonitor />
    </ReactLogProvider>
  )
}

function PerformanceMonitor() {
  const [slowRenders, setSlowRenders] = useState([])

  useEffect(() => {
    const api = getPluginAPI<RenderTimerAPI>('render-timer')
    if (api) {
      const interval = setInterval(() => {
        setSlowRenders(api.getSlowestRenders(10))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [])

  return (
    <div>
      <h3>Slowest Renders</h3>
      {slowRenders.map((r, i) => (
        <div key={i}>{r.componentName}: {r.duration.toFixed(2)}ms</div>
      ))}
    </div>
  )
}
```

### Pattern 5: Custom Analytics Plugin

**Use Case:** Send component events to analytics service.

```tsx
import { createPlugin, ReactLogProvider } from '@oxog/reactlog'

const analyticsPlugin = createPlugin({
  name: 'analytics',
  version: '1.0.0',
  type: 'optional',

  hooks: {
    onMount: (event) => {
      analytics.track('component.mount', {
        component: event.componentName,
        props: Object.keys(event.props),
      })
    },
    onError: (event) => {
      analytics.track('component.error', {
        component: event.componentName,
        error: event.error.message,
      })
      errorReporting.capture(event.error)
    },
  },
})

function App() {
  return (
    <ReactLogProvider plugins={[analyticsPlugin]}>
      <Routes />
    </ReactLogProvider>
  )
}
```

### Pattern 6: Export Logs for Bug Reports

**Use Case:** Export debug logs when user reports a bug.

```tsx
import { exportLogs, getLogs } from '@oxog/reactlog'
import { fileExporter, type FileExporterAPI } from '@oxog/reactlog/plugins'

function BugReportButton() {
  const handleExport = () => {
    const api = getPluginAPI<FileExporterAPI>('file-exporter')
    if (api) {
      api.exportJSON('bug-report-logs.json')
    } else {
      // Fallback without plugin
      const json = exportLogs(true)
      downloadFile(json, 'bug-report-logs.json', 'application/json')
    }
  }

  return <button onClick={handleExport}>Export Debug Logs</button>
}
```

---

## Console Output

ReactLog produces beautiful, styled console output:

```
┌─ MyComponent ─────────────────────────────────
│  ⬆️  MOUNT                        12:34:56.789
│  📦 Props: { userId: 123 }
│  📊 State[0]: 0
│  🔄 Effect[0] RUN (mount)
├─────────────────────────────────────────────────
│  🔃 UPDATE                        12:34:58.123
│  📦 Props changed:
│     userId: 123 → 456
│  🧹 Effect[0] CLEANUP
│  🔄 Effect[0] RUN (deps changed: [0])
├─────────────────────────────────────────────────
│  ⬇️  UNMOUNT                      12:35:01.456
│  🧹 Effect[0] CLEANUP
│  ⏱️  Lifetime: 4.667s
└─────────────────────────────────────────────────
```

---

## Configuration

### Environment-Based Configuration

```tsx
const isDev = process.env.NODE_ENV === 'development'
const isDebug = process.env.REACT_APP_DEBUG === 'true'

<ReactLogProvider
  enabled={isDev || isDebug}
  options={{
    maxLogs: isDev ? 2000 : 500,
    logLevel: isDev ? 'debug' : 'warn',
  }}
  plugins={isDev ? [panelUI(), renderTimer()] : []}
>
  <App />
</ReactLogProvider>
```

### Console Output Configuration

```tsx
import { getPluginAPI } from '@oxog/reactlog'
import type { ConsoleOutputAPI } from '@oxog/reactlog'

// After provider renders
const consoleAPI = getPluginAPI<ConsoleOutputAPI>('console-output')
if (consoleAPI) {
  consoleAPI.configure({
    collapsed: false,     // Expand all groups
    colors: true,         // Use colors
    timestamp: true,      // Show timestamps
    showProps: true,      // Show props events
    showState: true,      // Show state events
    showEffects: false,   // Hide effect events
    filter: {
      componentName: /^(User|Auth)/,  // Only User* and Auth* components
    },
  })
}
```

---

## Error Handling

### Error Boundary Integration

```tsx
import { useLogContext } from '@oxog/reactlog'

class ErrorBoundary extends React.Component {
  static contextType = ReactLogContext

  componentDidCatch(error, errorInfo) {
    const kernel = this.context
    if (kernel) {
      kernel.emit({
        type: 'error',
        componentId: 'error-boundary',
        componentName: 'ErrorBoundary',
        timestamp: Date.now(),
        error,
        errorInfo,
        recovered: true,
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

---

## Performance Considerations

### Bundle Size

- **Full package:** ~15KB (minified)
- **Gzipped:** ~5KB
- **Tree-shakeable:** Yes - only bundle what you import

### Optimization Tips

1. **Disable in production:**
   ```tsx
   <ReactLogProvider enabled={process.env.NODE_ENV === 'development'}>
   ```

2. **Limit log retention:**
   ```tsx
   <ReactLogProvider options={{ maxLogs: 500 }}>
   ```

3. **Filter console output:**
   ```tsx
   consoleAPI.configure({
     filter: { componentName: 'ProblemComponent' }
   })
   ```

4. **Use optional plugins sparingly:**
   Only import plugins you need - they're tree-shakeable.

---

## TypeScript Support

### Type Imports

```typescript
import type {
  Kernel,
  Plugin,
  LogEntry,
  MountEvent,
  ComponentMetrics,
} from '@oxog/reactlog'

import type {
  RenderTimerAPI,
  FileExporterAPI,
  PanelUIAPI,
} from '@oxog/reactlog/plugins'
```

### Generic Plugin API

```typescript
const api = getPluginAPI<RenderTimerAPI>('render-timer')
if (api) {
  const stats: RenderTimeStats = api.getRenderTime('id')
}
```

---

## Changelog (Recent)

### v1.0.1 (2025-12-28)

- Fixed tsup build crash on Windows
- Fixed duplicate React key warning in Playground
- Improved StrictMode double-invoke handling
- Achieved 100% test coverage

### v1.0.0 (2025-12-28)

- Initial release
- Micro-kernel architecture with plugin system
- Zero runtime dependencies
- Core plugins: lifecycle-logger, props-tracker, state-tracker, effect-tracker, console-output
- Optional plugins: contextTracker, errorTracker, renderTimer, renderChain, panelUI, fileExporter, remoteLogger
- React 17, 18, 19 compatibility

---

## Links

- **NPM:** https://www.npmjs.com/package/@oxog/reactlog
- **GitHub:** https://github.com/ersinkoc/reactlog
- **Documentation:** https://reactlog.oxog.dev
- **Issues:** https://github.com/ersinkoc/reactlog/issues

---

## LLM Usage Notes

### Recommended Prompts

1. "Help me debug why my component is re-rendering too often using ReactLog"
2. "Set up ReactLog with performance monitoring for my React app"
3. "Create a custom ReactLog plugin to track user interactions"
4. "Export ReactLog data for a bug report"
5. "Configure ReactLog to only track specific components"

### Common Misconceptions

1. **Misconception:** ReactLog needs to be installed in production.
   **Reality:** ReactLog is a development tool. Use `enabled={process.env.NODE_ENV === 'development'}` to disable in production.

2. **Misconception:** All plugins are loaded by default.
   **Reality:** Only core plugins are auto-loaded. Optional plugins from `@oxog/reactlog/plugins` are tree-shakeable.

3. **Misconception:** ReactLog modifies component behavior.
   **Reality:** ReactLog is observation-only. It doesn't modify props, state, or component rendering.

### Code Generation Guidelines

When generating code for ReactLog:

- Always wrap the app with `<ReactLogProvider>` at the root
- Import types separately with `import type`
- Use the latest API patterns (v1.0.1)
- For debugging specific components, prefer `useLog` hook over `<Log>` wrapper
- Always check if kernel exists when using programmatic API (`getKernel()` can return null)
- Include error handling for async plugin operations

---

## Document Metadata

- **Generated:** 2025-12-28
- **Package Version:** 1.0.1
- **Documentation Version:** 1.0
- **Format:** LLM-Optimized Markdown
