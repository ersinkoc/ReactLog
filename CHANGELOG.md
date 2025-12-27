# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added

- Initial release of ReactLog
- **Micro-kernel architecture** with plugin system
- **Zero runtime dependencies** - everything implemented from scratch

#### Core Features
- `ReactLogProvider` - Main provider component
- `useLog` - Hook for tracking component lifecycle
- `useLogContext` - Hook to access kernel directly
- `useLogMetrics` - Hook for component metrics
- `Log` - Wrapper component for logging
- `DebugPanel` - Debug panel component
- `withLog` - Higher-order component

#### Core Plugins (Always Loaded)
- `lifecycle-logger` - Tracks mount, unmount, and update events
- `props-tracker` - Tracks props changes with diff analysis
- `state-tracker` - Tracks useState and useReducer changes
- `effect-tracker` - Tracks useEffect execution and cleanup
- `console-output` - Beautiful console output with colors and icons

#### Optional Plugins
- `contextTracker` - Tracks useContext value changes
- `errorTracker` - Tracks Error Boundary catches
- `renderTimer` - Measures render duration
- `renderChain` - Tracks parent→child render propagation
- `panelUI` - Debug panel overlay with Shadow DOM isolation
- `fileExporter` - Exports logs to JSON/CSV files
- `remoteLogger` - Sends logs to remote HTTP endpoint

#### Programmatic API
- `getKernel()` - Access kernel instance
- `getLogs()` - Get all logs
- `clearLogs()` - Clear all logs
- `filterLogs()` - Filter logs by criteria
- `exportLogs()` - Export logs as JSON
- `createPlugin()` - Create custom plugins

#### Developer Experience
- Full TypeScript support with strict mode
- Tree-shakeable exports
- ESM and CJS dual package
- React 17, 18, 19 compatibility
- StrictMode handling
