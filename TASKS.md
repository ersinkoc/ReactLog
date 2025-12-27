# ReactLog - Implementation Tasks

This document contains the ordered task list for implementing ReactLog. Tasks must be completed in order, respecting dependencies.

---

## Phase 1: Project Setup

### 1.1 Initialize Project Structure
- [x] Create SPECIFICATION.md
- [x] Create IMPLEMENTATION.md
- [x] Create TASKS.md
- [ ] Create package.json
- [ ] Create tsconfig.json
- [ ] Create tsup.config.ts
- [ ] Create vitest.config.ts
- [ ] Create .gitignore
- [ ] Create LICENSE (MIT)
- [ ] Create README.md (basic)

### 1.2 Create Directory Structure
- [ ] Create src/ directory
- [ ] Create src/kernel/ directory
- [ ] Create src/plugins/core/ directory
- [ ] Create src/plugins/optional/ directory
- [ ] Create src/react/ directory
- [ ] Create src/utils/ directory
- [ ] Create tests/ directory structure

---

## Phase 2: Type Definitions

### 2.1 Core Types (src/types.ts)
**Dependencies**: Phase 1 complete

- [ ] Define EventType union
- [ ] Define BaseEvent interface
- [ ] Define MountEvent interface
- [ ] Define UnmountEvent interface
- [ ] Define UpdateEvent interface
- [ ] Define PropsChangeEvent interface
- [ ] Define PropChange interface
- [ ] Define StateChangeEvent interface
- [ ] Define EffectRunEvent interface
- [ ] Define EffectCleanupEvent interface
- [ ] Define ContextChangeEvent interface
- [ ] Define ErrorEvent interface
- [ ] Define KernelEvent union type
- [ ] Define LogEntry interface
- [ ] Define LogStore interface
- [ ] Define LogFilter interface
- [ ] Define EventHandler type
- [ ] Define Unsubscribe type
- [ ] Define KernelOptions interface
- [ ] Define Kernel interface
- [ ] Define PluginHooks interface
- [ ] Define Plugin interface
- [ ] Define PluginInfo interface
- [ ] Define React component prop interfaces
- [ ] Define hook option interfaces

---

## Phase 3: Utility Functions

### 3.1 Core Utilities
**Dependencies**: Phase 2 complete

- [ ] Implement src/utils/uid.ts
  - [ ] generateUID function
  - [ ] Tests for uid.ts

- [ ] Implement src/utils/timestamp.ts
  - [ ] formatTimestamp function
  - [ ] getRelativeTime function
  - [ ] Tests for timestamp.ts

- [ ] Implement src/utils/deep-equal.ts
  - [ ] deepEqual function
  - [ ] Handle primitives, objects, arrays, Date, RegExp
  - [ ] Handle circular references
  - [ ] Tests for deep-equal.ts

- [ ] Implement src/utils/shallow-equal.ts
  - [ ] shallowEqual function
  - [ ] Tests for shallow-equal.ts

- [ ] Implement src/utils/diff.ts
  - [ ] diffObjects function
  - [ ] diffArrays function
  - [ ] Tests for diff.ts

- [ ] Implement src/utils/format.ts
  - [ ] formatValue function (for console output)
  - [ ] truncateString function
  - [ ] Tests for format.ts

- [ ] Create src/utils/index.ts (barrel export)

---

## Phase 4: Kernel Implementation

### 4.1 Event Bus (src/kernel/event-bus.ts)
**Dependencies**: Phase 3 complete

- [ ] Create EventBus class
  - [ ] on(eventType, handler) method
  - [ ] off(eventType, handler) method
  - [ ] emit(event) method
  - [ ] removeAllListeners() method
- [ ] Handle multiple handlers per event
- [ ] Return unsubscribe function from on()
- [ ] Tests for event-bus.ts

### 4.2 Log Store (src/kernel/log-store.ts)
**Dependencies**: Phase 3 complete

- [ ] Create LogStore class
  - [ ] entries array
  - [ ] byComponent Map
  - [ ] byType Map
  - [ ] addLog(entry) method
  - [ ] getLogs() method
  - [ ] clearLogs() method
  - [ ] filterLogs(filter) method
- [ ] Implement max logs limit
- [ ] Implement indexing
- [ ] Tests for log-store.ts

### 4.3 Plugin Registry (src/kernel/plugin-registry.ts)
**Dependencies**: Phase 3 complete

- [ ] Create PluginRegistry class
  - [ ] register(plugin) method
  - [ ] unregister(pluginName) method
  - [ ] getPlugin(name) method
  - [ ] listPlugins() method
  - [ ] getPluginsByHook(hookName) method
- [ ] Handle duplicate plugin names
- [ ] Tests for plugin-registry.ts

### 4.4 Kernel Core (src/kernel/kernel.ts)
**Dependencies**: 4.1, 4.2, 4.3 complete

- [ ] Create Kernel class
  - [ ] Constructor with options
  - [ ] Integrate EventBus
  - [ ] Integrate LogStore
  - [ ] Integrate PluginRegistry
  - [ ] emit(event) - calls plugin hooks
  - [ ] on/off proxy to EventBus
  - [ ] addLog/getLogs/clearLogs/filterLogs proxy to LogStore
  - [ ] register/unregister/getPlugin/listPlugins proxy to PluginRegistry
  - [ ] configure(options) method
  - [ ] enable/disable/isEnabled methods
- [ ] Error isolation for plugins
- [ ] Tests for kernel.ts

### 4.5 Kernel Factory (src/kernel/index.ts)
**Dependencies**: 4.4 complete

- [ ] Export createKernel factory function
- [ ] Export Kernel class
- [ ] Tests for factory

---

## Phase 5: Core Plugins

### 5.1 Lifecycle Logger (src/plugins/core/lifecycle-logger.ts)
**Dependencies**: Phase 4 complete

- [ ] Create lifecycleLogger plugin factory
- [ ] Implement hooks:
  - [ ] onMount
  - [ ] onUnmount
  - [ ] onUpdate
- [ ] Implement API:
  - [ ] getMountTime(componentId)
  - [ ] getUnmountTime(componentId)
  - [ ] getLifetime(componentId)
  - [ ] getUpdateCount(componentId)
  - [ ] isCurrentlyMounted(componentId)
  - [ ] getLifecycleHistory(componentId)
- [ ] Store mount times, unmount times, update counts
- [ ] Tests for lifecycle-logger.ts

### 5.2 Props Tracker (src/plugins/core/props-tracker.ts)
**Dependencies**: Phase 4 complete

- [ ] Create propsTracker plugin factory
- [ ] Implement hooks:
  - [ ] onMount (capture initial props)
  - [ ] onPropsChange
- [ ] Implement API:
  - [ ] getCurrentProps(componentId)
  - [ ] getPropsHistory(componentId)
  - [ ] getChangeCount(componentId)
  - [ ] getMostChangedProps(componentId, limit)
- [ ] Store props snapshots
- [ ] Track change counts per prop
- [ ] Tests for props-tracker.ts

### 5.3 State Tracker (src/plugins/core/state-tracker.ts)
**Dependencies**: Phase 4 complete

- [ ] Create stateTracker plugin factory
- [ ] Implement hooks:
  - [ ] onMount (capture initial state)
  - [ ] onStateChange
- [ ] Implement API:
  - [ ] getCurrentState(componentId)
  - [ ] getStateHistory(componentId)
  - [ ] getHookState(componentId, hookIndex)
  - [ ] getStateChangeCount(componentId)
- [ ] Store state snapshots
- [ ] Track by hook index
- [ ] Tests for state-tracker.ts

### 5.4 Effect Tracker (src/plugins/core/effect-tracker.ts)
**Dependencies**: Phase 4 complete

- [ ] Create effectTracker plugin factory
- [ ] Implement hooks:
  - [ ] onEffectRun
  - [ ] onEffectCleanup
- [ ] Implement API:
  - [ ] getEffectHistory(componentId)
  - [ ] getEffectRunCount(componentId, effectIndex)
  - [ ] getActiveEffects(componentId)
  - [ ] getEffectDependencies(componentId, effectIndex)
- [ ] Track effect run/cleanup by index
- [ ] Store dependencies
- [ ] Tests for effect-tracker.ts

### 5.5 Console Output (src/plugins/core/console-output/)
**Dependencies**: Phase 4 complete

- [ ] Create src/plugins/core/console-output/formatters.ts
  - [ ] formatMountEvent
  - [ ] formatUnmountEvent
  - [ ] formatUpdateEvent
  - [ ] formatPropsChange
  - [ ] formatStateChange
  - [ ] formatEffectRun
  - [ ] formatEffectCleanup
  - [ ] formatError
  - [ ] Tests for formatters

- [ ] Create src/plugins/core/console-output/console-output.ts
  - [ ] Create consoleOutput plugin factory
  - [ ] Options: enabled, collapsed, colors, timestamp, etc.
  - [ ] Implement hooks:
    - [ ] onLog
  - [ ] Implement API:
    - [ ] configure(options)
    - [ ] pause()
    - [ ] resume()
    - [ ] isPaused()
  - [ ] Console styling with colors
  - [ ] groupCollapsed support
  - [ ] Tests for console-output.ts

### 5.6 Core Plugins Bundle (src/plugins/core/index.ts)
**Dependencies**: 5.1-5.5 complete

- [ ] Export all core plugins
- [ ] Create installCorePlugins(kernel) function

---

## Phase 6: React Integration

### 6.1 React Context (src/react/context.ts)
**Dependencies**: Phase 5 complete

- [ ] Create ReactLogContext
- [ ] Create useLogContext hook
- [ ] Tests for context

### 6.2 Provider (src/react/provider.tsx)
**Dependencies**: 6.1 complete

- [ ] Create ReactLogProvider component
  - [ ] Props: children, enabled, plugins, options, onReady
  - [ ] Initialize kernel with useMemo
  - [ ] Install core plugins
  - [ ] Install optional plugins
  - [ ] Handle enable/disable
  - [ ] Call onReady callback
  - [ ] Cleanup on unmount
- [ ] Tests for provider

### 6.3 useLog Hook (src/react/hooks/use-log.ts)
**Dependencies**: 6.2 complete

- [ ] Create useLog hook
  - [ ] Parameters: name, options
  - [ ] Generate stable componentId
  - [ ] Track mount/unmount lifecycle
  - [ ] Track render count
  - [ ] Return tracking functions
- [ ] Handle StrictMode double-invoke
- [ ] Tests for use-log

### 6.4 useLogMetrics Hook (src/react/hooks/use-log-metrics.ts)
**Dependencies**: 6.2 complete

- [ ] Create useLogMetrics hook
  - [ ] Parameters: componentName
  - [ ] Return metrics for component
  - [ ] Subscribe to log updates
- [ ] Tests for use-log-metrics

### 6.5 Hooks Bundle (src/react/hooks/index.ts)
**Dependencies**: 6.3, 6.4 complete

- [ ] Export useLog
- [ ] Export useLogContext
- [ ] Export useLogMetrics

### 6.6 Log Component (src/react/components/log.tsx)
**Dependencies**: 6.3 complete

- [ ] Create Log wrapper component
  - [ ] Props: name, children, trackProps, trackState, trackEffects
  - [ ] Use useLog internally
  - [ ] Pass tracking context to children
- [ ] Tests for Log component

### 6.7 DebugPanel Component (src/react/components/debug-panel.tsx)
**Dependencies**: 6.2 complete

- [ ] Create DebugPanel component
  - [ ] Props: position, shortcut, draggable, resizable
  - [ ] Placeholder implementation (full UI in optional plugin)
- [ ] Tests for DebugPanel component

### 6.8 Components Bundle (src/react/components/index.ts)
**Dependencies**: 6.6, 6.7 complete

- [ ] Export Log
- [ ] Export DebugPanel

### 6.9 withLog HOC (src/react/hoc/with-log.tsx)
**Dependencies**: 6.3 complete

- [ ] Create withLog HOC
  - [ ] Wrap component with useLog
  - [ ] Forward refs
  - [ ] Copy static properties
- [ ] Tests for withLog

### 6.10 React Bundle (src/react/index.ts)
**Dependencies**: 6.5, 6.8, 6.9 complete

- [ ] Export provider
- [ ] Export hooks
- [ ] Export components
- [ ] Export HOC

---

## Phase 7: Optional Plugins

### 7.1 Context Tracker (src/plugins/optional/context-tracker.ts)
**Dependencies**: Phase 4 complete

- [ ] Create contextTracker plugin factory
- [ ] Options: contexts, trackAll
- [ ] Implement hooks:
  - [ ] onContextChange
- [ ] Implement API
- [ ] Tests for context-tracker.ts

### 7.2 Error Tracker (src/plugins/optional/error-tracker.ts)
**Dependencies**: Phase 4 complete

- [ ] Create errorTracker plugin factory
- [ ] Options: captureStack, maxErrors
- [ ] Implement hooks:
  - [ ] onError
- [ ] Implement API
- [ ] Tests for error-tracker.ts

### 7.3 Render Timer (src/plugins/optional/render-timer.ts)
**Dependencies**: Phase 4 complete

- [ ] Create renderTimer plugin factory
- [ ] Options: warnThreshold, errorThreshold
- [ ] Track render times via update events
- [ ] Implement API:
  - [ ] getRenderTime(componentId)
  - [ ] getSlowestRenders(limit)
  - [ ] getAverageRenderTime(componentId)
  - [ ] getTotalRenderTime(componentId)
- [ ] Tests for render-timer.ts

### 7.4 Render Chain (src/plugins/optional/render-chain.ts)
**Dependencies**: Phase 4 complete

- [ ] Create renderChain plugin factory
- [ ] Options: maxDepth
- [ ] Track parent-child relationships
- [ ] Implement API:
  - [ ] getChain(componentId)
  - [ ] getRootCause(componentId)
  - [ ] getChildren(componentId)
  - [ ] getParent(componentId)
  - [ ] visualizeChain()
- [ ] Tests for render-chain.ts

### 7.5 Panel UI (src/plugins/optional/panel-ui/)
**Dependencies**: Phase 6 complete

- [ ] Create panel-ui/utils/shadow-dom.ts
- [ ] Create panel-ui/utils/draggable.ts
- [ ] Create panel-ui/utils/resizable.ts
- [ ] Create panel-ui/styles/panel.css
- [ ] Create panel-ui/components/log-entry.tsx
- [ ] Create panel-ui/components/log-list.tsx
- [ ] Create panel-ui/components/filter-bar.tsx
- [ ] Create panel-ui/components/toolbar.tsx
- [ ] Create panel-ui/panel.tsx (main panel)
- [ ] Create panel-ui/index.ts (plugin factory)
- [ ] Implement keyboard shortcut
- [ ] Implement Shadow DOM isolation
- [ ] Implement drag/resize
- [ ] Tests for panel-ui

### 7.6 File Exporter (src/plugins/optional/file-exporter.ts)
**Dependencies**: Phase 4 complete

- [ ] Create fileExporter plugin factory
- [ ] Options: format, includeMetadata, prettyPrint
- [ ] Implement API:
  - [ ] exportJSON(filename)
  - [ ] exportCSV(filename)
  - [ ] getExportData()
  - [ ] downloadFile(data, filename, mimeType)
- [ ] Generate file download
- [ ] Tests for file-exporter.ts

### 7.7 Remote Logger (src/plugins/optional/remote-logger.ts)
**Dependencies**: Phase 4 complete

- [ ] Create remoteLogger plugin factory
- [ ] Options: endpoint, method, headers, batchSize, etc.
- [ ] Implement batching logic
- [ ] Implement retry logic
- [ ] Implement API:
  - [ ] flush()
  - [ ] pause()
  - [ ] resume()
  - [ ] isPaused()
  - [ ] getPendingCount()
  - [ ] getFailedCount()
  - [ ] retryFailed()
- [ ] Tests for remote-logger.ts

### 7.8 Optional Plugins Bundle (src/plugins/optional/index.ts)
**Dependencies**: 7.1-7.7 complete

- [ ] Export contextTracker
- [ ] Export errorTracker
- [ ] Export renderTimer
- [ ] Export renderChain
- [ ] Export panelUI
- [ ] Export fileExporter
- [ ] Export remoteLogger

### 7.9 Plugins Entry (src/plugins/index.ts)
**Dependencies**: 7.8 complete

- [ ] Re-export all optional plugins

---

## Phase 8: Main Entry Point

### 8.1 Programmatic API (src/api.ts)
**Dependencies**: Phase 6 complete

- [ ] Implement getKernel()
- [ ] Implement getLogs()
- [ ] Implement clearLogs()
- [ ] Implement exportLogs()
- [ ] Implement filterLogs()
- [ ] Tests for api.ts

### 8.2 Plugin Factory (src/plugin-factory.ts)
**Dependencies**: Phase 4 complete

- [ ] Implement createPlugin() helper
- [ ] Validate plugin structure
- [ ] Tests for plugin-factory.ts

### 8.3 Main Entry (src/index.ts)
**Dependencies**: All previous phases

- [ ] Export ReactLogProvider
- [ ] Export DebugPanel, Log
- [ ] Export useLog, useLogContext, useLogMetrics
- [ ] Export withLog
- [ ] Export getKernel, getLogs, clearLogs, exportLogs, filterLogs
- [ ] Export createPlugin
- [ ] Export all types

---

## Phase 9: Integration Tests

### 9.1 Full Lifecycle Tests
- [ ] Test complete mount → update → unmount cycle
- [ ] Test multiple components
- [ ] Test nested components

### 9.2 Plugin Interaction Tests
- [ ] Test core plugins working together
- [ ] Test optional plugins with core
- [ ] Test plugin enable/disable

### 9.3 Panel Integration Tests
- [ ] Test panel rendering
- [ ] Test log display
- [ ] Test filtering
- [ ] Test export from panel

### 9.4 Export/Import Tests
- [ ] Test JSON export
- [ ] Test CSV export
- [ ] Test export data structure

---

## Phase 10: Documentation Website

### 10.1 Website Structure
- [ ] Create website/ directory
- [ ] Create website/index.html (landing)
- [ ] Create website/assets/css/styles.css
- [ ] Create website/assets/js/main.js

### 10.2 Documentation Pages
- [ ] Create docs/index.html
- [ ] Create docs/getting-started.html
- [ ] Create docs/api/index.html
- [ ] Create docs/api/provider.html
- [ ] Create docs/api/hooks.html
- [ ] Create docs/api/components.html
- [ ] Create docs/api/plugins.html
- [ ] Create docs/plugins/index.html
- [ ] Create docs/plugins/core-plugins.html
- [ ] Create docs/plugins/optional-plugins.html
- [ ] Create docs/plugins/custom-plugins.html
- [ ] Create docs/examples/index.html
- [ ] Create docs/examples/basic.html
- [ ] Create docs/examples/panel.html
- [ ] Create docs/examples/remote.html
- [ ] Create docs/playground/index.html

### 10.3 Website Assets
- [ ] Create og-image.png
- [ ] Create favicon.svg

---

## Phase 11: Final Steps

### 11.1 Documentation
- [ ] Complete README.md with full documentation
- [ ] Create CHANGELOG.md
- [ ] Add JSDoc comments to all public APIs

### 11.2 Examples
- [ ] Create examples/basic/
- [ ] Create examples/with-panel/
- [ ] Create examples/remote-logging/
- [ ] Create examples/custom-plugin/

### 11.3 Verification
- [ ] Run full test suite
- [ ] Verify 100% coverage
- [ ] Build package
- [ ] Test tree-shaking
- [ ] Test CJS import
- [ ] Test ESM import
- [ ] Test TypeScript types

### 11.4 Package Preparation
- [ ] Final package.json review
- [ ] Verify exports configuration
- [ ] Dry run npm publish
- [ ] Tag version

---

## Progress Tracking

| Phase | Tasks | Completed | Progress |
|-------|-------|-----------|----------|
| 1. Project Setup | 10 | 3 | 30% |
| 2. Type Definitions | 24 | 0 | 0% |
| 3. Utility Functions | 14 | 0 | 0% |
| 4. Kernel | 20 | 0 | 0% |
| 5. Core Plugins | 35 | 0 | 0% |
| 6. React Integration | 25 | 0 | 0% |
| 7. Optional Plugins | 40 | 0 | 0% |
| 8. Main Entry | 8 | 0 | 0% |
| 9. Integration Tests | 12 | 0 | 0% |
| 10. Website | 20 | 0 | 0% |
| 11. Final Steps | 15 | 0 | 0% |
| **TOTAL** | **223** | **3** | **1%** |

---

## Implementation Order Summary

1. **Project Setup** → Configuration files, directories
2. **Types** → All TypeScript interfaces and types
3. **Utilities** → Helper functions (no dependencies)
4. **Kernel** → Core system (depends on utilities)
5. **Core Plugins** → 5 plugins (depends on kernel)
6. **React Integration** → Provider, hooks, components (depends on plugins)
7. **Optional Plugins** → 7 plugins (depends on kernel + react)
8. **Main Entry** → API exports (depends on all above)
9. **Integration Tests** → Full system tests
10. **Website** → Documentation site
11. **Final Steps** → Polish and publish
