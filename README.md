# ReactLog

Zero-dependency React lifecycle debugger with micro-kernel plugin architecture.

## Features

- **Zero Dependencies** - No runtime dependencies, everything implemented from scratch
- **Micro-Kernel Architecture** - Minimal core with powerful plugin system
- **Beautiful Console Output** - Styled, collapsible log groups with icons
- **Full Lifecycle Tracking** - Mount, unmount, updates, props, state, effects
- **Debug Panel** - Optional floating UI panel with Shadow DOM isolation
- **Remote Logging** - Send logs to external endpoints
- **Export Functionality** - Export logs as JSON or CSV
- **Tree-Shakeable** - Only bundle what you use
- **TypeScript First** - Full type definitions included

## Installation

```bash
npm install @oxog/reactlog
```

```bash
yarn add @oxog/reactlog
```

```bash
pnpm add @oxog/reactlog
```

## Quick Start

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

  useEffect(() => {
    fetchUser(userId)
  }, [userId])

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  )
}
```

## Console Output

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

## Core Plugins (Always Loaded)

1. **lifecycle-logger** - Tracks mount, unmount, and update events
2. **props-tracker** - Tracks all props changes with diff analysis
3. **state-tracker** - Tracks useState and useReducer changes
4. **effect-tracker** - Tracks useEffect execution and cleanup
5. **console-output** - Formats beautiful console logs

## Optional Plugins

```tsx
import { panelUI, fileExporter, remoteLogger } from '@oxog/reactlog/plugins'

<ReactLogProvider plugins={[
  panelUI({ position: 'bottom-right' }),
  fileExporter({ format: 'json' }),
  remoteLogger({ endpoint: 'https://logs.example.com' }),
]}>
  <App />
</ReactLogProvider>
```

- **context-tracker** - Tracks useContext value changes
- **error-tracker** - Tracks Error Boundary catches
- **render-timer** - Measures render duration
- **render-chain** - Tracks parent→child render propagation
- **panel-ui** - Debug panel overlay with Shadow DOM
- **file-exporter** - Export logs to JSON/CSV
- **remote-logger** - Send logs to remote endpoint

## API Reference

### Components

- `<ReactLogProvider>` - Main provider component
- `<DebugPanel>` - Debug panel (requires panelUI plugin)
- `<Log>` - Wrapper component for logging

### Hooks

- `useLog(name, options)` - Main debug hook
- `useLogContext()` - Access kernel directly
- `useLogMetrics(componentName)` - Get metrics for a component

### HOC

- `withLog(Component, options)` - Higher-order component wrapper

### Programmatic API

- `getKernel()` - Access kernel instance
- `getLogs()` - Get all logs
- `clearLogs()` - Clear all logs
- `filterLogs(filter)` - Filter logs
- `exportLogs()` - Export as JSON string
- `createPlugin(config)` - Create custom plugin

## Creating Custom Plugins

```tsx
import { createPlugin } from '@oxog/reactlog'

const analyticsPlugin = createPlugin({
  name: 'my-analytics',
  version: '1.0.0',
  type: 'optional',
  hooks: {
    onMount: (event) => {
      analytics.track('component_mount', {
        name: event.componentName,
      })
    },
    onError: (event) => {
      errorReporter.capture(event.error)
    },
  },
})
```

## Documentation

Full documentation available at [https://reactlog.oxog.dev](https://reactlog.oxog.dev)

## License

MIT
