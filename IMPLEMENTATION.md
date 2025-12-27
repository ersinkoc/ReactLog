# ReactLog - Implementation Guide

## Architecture Overview

ReactLog uses a **Micro-Kernel Architecture** with a **Plugin System**. The kernel provides minimal core functionality while plugins extend capabilities.

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Application                         │
├─────────────────────────────────────────────────────────────────┤
│                     ReactLogProvider                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    React Integration                         ││
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   ││
│  │   │ useLog   │  │ Log      │  │ withLog  │  │DebugPanel│   ││
│  │   └──────────┘  └──────────┘  └──────────┘  └──────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                         KERNEL                               ││
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐ ││
│  │  │  Event Bus    │ │   Log Store   │ │ Plugin Registry   │ ││
│  │  │  (pub/sub)    │ │  (in-memory)  │ │ (management)      │ ││
│  │  └───────────────┘ └───────────────┘ └───────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                       PLUGINS                                ││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │  CORE (always loaded)                                   │││
│  │  │  lifecycle-logger │ props-tracker │ state-tracker       │││
│  │  │  effect-tracker   │ console-output                      │││
│  │  └─────────────────────────────────────────────────────────┘││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │  OPTIONAL (import separately)                           │││
│  │  │  context-tracker │ error-tracker │ render-timer         │││
│  │  │  render-chain    │ panel-ui      │ file-exporter        │││
│  │  │  remote-logger                                          │││
│  │  └─────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

### 1. Zero Dependencies Strategy

**Decision**: Implement everything from scratch.

**Rationale**:
- No supply chain vulnerabilities
- Complete control over behavior
- Smaller bundle size
- No version conflicts

**Implementations Required**:
- Deep equality comparison (no lodash)
- Shallow equality comparison
- UID generation
- Object diffing
- Timestamp formatting
- Event emitter pattern

### 2. Micro-Kernel Pattern

**Decision**: Keep kernel minimal, delegate to plugins.

**Kernel Responsibilities**:
- Event bus (pub/sub)
- Log store management
- Plugin lifecycle management
- Configuration

**Plugin Responsibilities**:
- All tracking logic
- Console output formatting
- UI rendering
- Export functionality

**Benefits**:
- Easy to extend
- Plugins can be enabled/disabled
- Failures isolated to plugins
- Tree-shakeable

### 3. Event-Driven Architecture

**Decision**: Use event-driven pattern for component communication.

```typescript
// Event flow
Component → useLog hook → Kernel.emit() → Event Bus → Plugins

// Example flow for props change:
1. MyComponent re-renders with new props
2. useLog hook detects change via useEffect
3. Hook calls kernel.emit(propsChangeEvent)
4. Event bus notifies all subscribed plugins
5. props-tracker plugin records the change
6. console-output plugin formats and logs
```

### 4. Plugin Isolation

**Decision**: Each plugin operates independently.

**Implementation**:
```typescript
class Kernel {
  emit(event: KernelEvent) {
    for (const plugin of this.plugins) {
      try {
        const hookName = `on${capitalize(event.type)}`
        plugin.hooks?.[hookName]?.(event)
      } catch (error) {
        // Log error but don't crash other plugins
        console.error(`Plugin ${plugin.name} error:`, error)
      }
    }
  }
}
```

### 5. React Integration Strategy

**Decision**: Use React Context for kernel distribution.

```typescript
// Context provides kernel instance
const ReactLogContext = createContext<Kernel | null>(null)

// Provider initializes kernel and plugins
function ReactLogProvider({ children, plugins, options }) {
  const kernel = useMemo(() => createKernel(options), [])

  useEffect(() => {
    // Install core plugins
    installCorePlugins(kernel)
    // Install optional plugins
    plugins?.forEach(p => kernel.register(p))
    return () => kernel.disable()
  }, [])

  return (
    <ReactLogContext.Provider value={kernel}>
      {children}
    </ReactLogContext.Provider>
  )
}
```

### 6. Component Tracking Mechanism

**Decision**: Use hooks for tracking, generate stable component IDs.

```typescript
function useLog(name: string, options: UseLogOptions) {
  const kernel = useLogContext()
  const componentId = useRef(generateUID()).current
  const renderCount = useRef(0)
  const mountTime = useRef(Date.now())

  // Track mount
  useEffect(() => {
    kernel.emit({
      type: 'mount',
      componentId,
      componentName: name,
      timestamp: mountTime.current,
      props: {}, // Will be captured
      initialState: {},
    })

    return () => {
      kernel.emit({
        type: 'unmount',
        componentId,
        componentName: name,
        timestamp: Date.now(),
        lifetime: Date.now() - mountTime.current,
      })
    }
  }, [])

  // Track updates
  renderCount.current++
  // ... tracking logic
}
```

### 7. State/Props Tracking

**Decision**: Use refs to store previous values, compare on render.

```typescript
function useLog(name: string, options: UseLogOptions) {
  const prevPropsRef = useRef<Record<string, unknown>>({})
  const prevStateRef = useRef<unknown[]>([])

  // Called during render to capture current props
  const trackProps = (props: Record<string, unknown>) => {
    if (options.trackProps) {
      const changes = diffProps(prevPropsRef.current, props)
      if (changes.length > 0) {
        kernel.emit({
          type: 'props-change',
          componentId,
          componentName: name,
          timestamp: Date.now(),
          changes,
        })
      }
      prevPropsRef.current = { ...props }
    }
  }

  // ... similar for state
}
```

### 8. Effect Tracking

**Decision**: Wrap useEffect calls or use custom hooks.

**Challenge**: React doesn't expose effect execution directly.

**Solution**: Provide wrapper hooks:

```typescript
// Option 1: Wrapper hook
function useTrackedEffect(
  effect: EffectCallback,
  deps: DependencyList,
  index: number
) {
  const kernel = useLogContext()
  const componentInfo = useComponentInfo()
  const prevDepsRef = useRef<DependencyList>([])

  useEffect(() => {
    // Log effect run
    const changedIndices = findChangedDeps(prevDepsRef.current, deps)
    kernel.emit({
      type: 'effect-run',
      ...componentInfo,
      effectIndex: index,
      dependencies: deps,
      dependenciesChanged: changedIndices,
    })

    const cleanup = effect()

    prevDepsRef.current = deps

    return () => {
      if (cleanup) {
        kernel.emit({
          type: 'effect-cleanup',
          ...componentInfo,
          effectIndex: index,
          reason: 'deps-change',
        })
        cleanup()
      }
    }
  }, deps)
}
```

### 9. Console Output Strategy

**Decision**: Use console.groupCollapsed with styled output.

```typescript
class ConsoleOutputPlugin implements Plugin {
  hooks = {
    onLog: (entry: LogEntry) => {
      if (this.isPaused) return

      const style = this.getStyle(entry.event.type)
      const icon = ICONS[entry.event.type]

      console.groupCollapsed(
        `%c${icon} ${entry.componentName}%c ${entry.event.type}`,
        style.component,
        style.event
      )

      this.logEventDetails(entry.event)
      console.groupEnd()
    }
  }
}
```

### 10. Panel UI Isolation

**Decision**: Use Shadow DOM for complete style isolation.

```typescript
function DebugPanel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<ShadowRoot | null>(null)

  useEffect(() => {
    if (containerRef.current && !shadowRef.current) {
      shadowRef.current = containerRef.current.attachShadow({ mode: 'open' })

      // Inject styles
      const style = document.createElement('style')
      style.textContent = PANEL_STYLES
      shadowRef.current.appendChild(style)

      // Render panel content
      const root = document.createElement('div')
      shadowRef.current.appendChild(root)
      // ... render React into root
    }
  }, [])

  return <div ref={containerRef} />
}
```

### 11. Performance Optimizations

**Batch Processing**:
```typescript
class LogStore {
  private pendingLogs: LogEntry[] = []
  private flushScheduled = false

  addLog(entry: LogEntry) {
    this.pendingLogs.push(entry)

    if (!this.flushScheduled) {
      this.flushScheduled = true
      requestIdleCallback(() => this.flush())
    }
  }

  private flush() {
    const batch = this.pendingLogs
    this.pendingLogs = []
    this.flushScheduled = false

    batch.forEach(entry => {
      this.entries.push(entry)
      this.indexEntry(entry)
    })

    this.emit('batch', batch)
  }
}
```

**Throttled Console Output**:
```typescript
class ConsoleOutputPlugin {
  private throttle = 16 // ms
  private lastOutput = 0
  private queue: LogEntry[] = []

  onLog(entry: LogEntry) {
    this.queue.push(entry)
    this.scheduleOutput()
  }

  private scheduleOutput() {
    const now = Date.now()
    const elapsed = now - this.lastOutput

    if (elapsed >= this.throttle) {
      this.outputQueue()
    } else {
      setTimeout(() => this.outputQueue(), this.throttle - elapsed)
    }
  }
}
```

### 12. StrictMode Handling

**Decision**: Deduplicate mount/unmount in development mode.

```typescript
function useLog(name: string) {
  const kernel = useLogContext()
  const mountCount = useRef(0)
  const isMounted = useRef(false)

  useEffect(() => {
    mountCount.current++

    // In StrictMode, first mount is immediately followed by unmount
    // Only log on second mount (the "real" one)
    if (process.env.NODE_ENV === 'development') {
      // Use timeout to detect StrictMode double-invoke
      const timer = setTimeout(() => {
        if (!isMounted.current) {
          isMounted.current = true
          kernel.emit({ type: 'mount', ... })
        }
      }, 0)

      return () => {
        clearTimeout(timer)
        if (isMounted.current) {
          isMounted.current = false
          kernel.emit({ type: 'unmount', ... })
        }
      }
    } else {
      // Production: log immediately
      kernel.emit({ type: 'mount', ... })
      return () => kernel.emit({ type: 'unmount', ... })
    }
  }, [])
}
```

---

## Module Organization

### Entry Points

**Main Entry (`./dist/index.js`)**:
```typescript
// Core exports
export { ReactLogProvider } from './react/provider'
export { DebugPanel, Log } from './react/components'
export { useLog, useLogContext, useLogMetrics } from './react/hooks'
export { withLog } from './react/hoc'

// Programmatic API
export { getKernel, getLogs, clearLogs, exportLogs, filterLogs } from './api'
export { createPlugin } from './plugin-factory'

// Types
export type * from './types'

// Core plugins are auto-installed by provider
```

**Plugins Entry (`./dist/plugins/index.js`)**:
```typescript
// Optional plugins
export { contextTracker } from './optional/context-tracker'
export { errorTracker } from './optional/error-tracker'
export { renderTimer } from './optional/render-timer'
export { renderChain } from './optional/render-chain'
export { panelUI } from './optional/panel-ui'
export { fileExporter } from './optional/file-exporter'
export { remoteLogger } from './optional/remote-logger'
```

### Internal Structure

```
src/
├── index.ts                    # Main entry point
├── types.ts                    # All type definitions
│
├── kernel/
│   ├── index.ts               # Kernel factory
│   ├── kernel.ts              # Kernel class
│   ├── event-bus.ts           # Event pub/sub
│   ├── log-store.ts           # Log storage
│   └── plugin-registry.ts     # Plugin management
│
├── plugins/
│   ├── index.ts               # Optional plugins export
│   ├── core/
│   │   ├── index.ts           # Core plugins bundle
│   │   ├── lifecycle-logger.ts
│   │   ├── props-tracker.ts
│   │   ├── state-tracker.ts
│   │   ├── effect-tracker.ts
│   │   └── console-output/
│   │       ├── index.ts
│   │       ├── console-output.ts
│   │       └── formatters.ts
│   │
│   └── optional/
│       ├── index.ts
│       ├── context-tracker.ts
│       ├── error-tracker.ts
│       ├── render-timer.ts
│       ├── render-chain.ts
│       ├── panel-ui/
│       │   ├── index.ts
│       │   ├── panel.tsx
│       │   ├── components/
│       │   └── utils/
│       ├── file-exporter.ts
│       └── remote-logger.ts
│
├── react/
│   ├── index.ts
│   ├── context.ts
│   ├── provider.tsx
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── use-log.ts
│   │   ├── use-log-context.ts
│   │   └── use-log-metrics.ts
│   ├── components/
│   │   ├── index.ts
│   │   ├── log.tsx
│   │   └── debug-panel.tsx
│   └── hoc/
│       ├── index.ts
│       └── with-log.tsx
│
└── utils/
    ├── index.ts
    ├── deep-equal.ts
    ├── shallow-equal.ts
    ├── uid.ts
    ├── timestamp.ts
    ├── format.ts
    └── diff.ts
```

---

## Build Configuration

### TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Bundle Configuration (`tsup.config.ts`)

```typescript
import { defineConfig } from 'tsup'

export default defineConfig([
  // Main entry
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
    treeshake: true,
  },
  // Plugins entry
  {
    entry: ['src/plugins/index.ts'],
    outDir: 'dist/plugins',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    external: ['react', 'react-dom'],
    treeshake: true,
  },
])
```

### Test Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts'],
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
  },
})
```

### Package Configuration (`package.json`)

```json
{
  "name": "@oxog/reactlog",
  "version": "1.0.0",
  "description": "Zero-dependency React lifecycle debugger with micro-kernel plugin architecture",
  "author": "ersinkoc",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/ersinkoc/reactlog"
  },
  "homepage": "https://reactlog.oxog.dev",
  "keywords": [
    "react",
    "debug",
    "debugger",
    "lifecycle",
    "devtools",
    "logging",
    "developer-tools",
    "react-hooks",
    "performance"
  ],
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./plugins": {
      "import": {
        "types": "./dist/plugins/index.d.ts",
        "default": "./dist/plugins/index.js"
      },
      "require": {
        "types": "./dist/plugins/index.d.cts",
        "default": "./dist/plugins/index.cjs"
      }
    }
  },
  "files": [
    "dist"
  ],
  "sideEffects": false,
  "engines": {
    "node": ">=18"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "jsdom": "^23.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "prepublishOnly": "npm run build && npm run test"
  }
}
```

---

## Testing Strategy

### Unit Tests

Each module has corresponding unit tests:

```
tests/
├── unit/
│   ├── kernel/
│   │   ├── kernel.test.ts
│   │   ├── event-bus.test.ts
│   │   ├── log-store.test.ts
│   │   └── plugin-registry.test.ts
│   │
│   ├── plugins/
│   │   ├── core/
│   │   │   ├── lifecycle-logger.test.ts
│   │   │   ├── props-tracker.test.ts
│   │   │   ├── state-tracker.test.ts
│   │   │   ├── effect-tracker.test.ts
│   │   │   └── console-output.test.ts
│   │   └── optional/
│   │       ├── context-tracker.test.ts
│   │       ├── error-tracker.test.ts
│   │       ├── render-timer.test.ts
│   │       ├── render-chain.test.ts
│   │       ├── panel-ui.test.tsx
│   │       ├── file-exporter.test.ts
│   │       └── remote-logger.test.ts
│   │
│   ├── react/
│   │   ├── provider.test.tsx
│   │   ├── hooks/
│   │   │   ├── use-log.test.tsx
│   │   │   ├── use-log-context.test.tsx
│   │   │   └── use-log-metrics.test.tsx
│   │   ├── components/
│   │   │   ├── log.test.tsx
│   │   │   └── debug-panel.test.tsx
│   │   └── hoc/
│   │       └── with-log.test.tsx
│   │
│   └── utils/
│       ├── deep-equal.test.ts
│       ├── shallow-equal.test.ts
│       ├── uid.test.ts
│       ├── timestamp.test.ts
│       ├── format.test.ts
│       └── diff.test.ts
│
├── integration/
│   ├── full-lifecycle.test.tsx
│   ├── plugin-interaction.test.ts
│   ├── panel-integration.test.tsx
│   └── export-import.test.ts
│
└── fixtures/
    ├── test-components.tsx
    └── mock-data.ts
```

### Test Coverage Requirements

- 100% line coverage
- 100% branch coverage
- 100% function coverage
- 100% statement coverage

### Testing Patterns

**Kernel Tests**:
```typescript
describe('Kernel', () => {
  it('should emit events to subscribed handlers', () => {
    const kernel = createKernel()
    const handler = vi.fn()

    kernel.on('mount', handler)
    kernel.emit(createMountEvent())

    expect(handler).toHaveBeenCalledOnce()
  })
})
```

**React Hook Tests**:
```typescript
describe('useLog', () => {
  it('should emit mount event on component mount', () => {
    const kernel = createTestKernel()
    const emitSpy = vi.spyOn(kernel, 'emit')

    render(
      <TestProvider kernel={kernel}>
        <TestComponent />
      </TestProvider>
    )

    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'mount' })
    )
  })
})
```

**Plugin Tests**:
```typescript
describe('ConsoleOutputPlugin', () => {
  it('should format mount events correctly', () => {
    const consoleSpy = vi.spyOn(console, 'groupCollapsed')
    const plugin = createConsoleOutputPlugin()

    plugin.hooks.onLog(createLogEntry({ type: 'mount' }))

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('MOUNT')
    )
  })
})
```

---

## Error Handling

### Plugin Errors

```typescript
class Kernel {
  private safeCallHook(plugin: Plugin, hookName: string, event: KernelEvent) {
    try {
      const hook = plugin.hooks?.[hookName as keyof PluginHooks]
      if (typeof hook === 'function') {
        hook(event as never)
      }
    } catch (error) {
      // Log but don't propagate
      console.error(
        `[ReactLog] Plugin "${plugin.name}" error in ${hookName}:`,
        error
      )

      // Emit error event for error-tracker plugin
      if (hookName !== 'onError') {
        this.emit({
          type: 'error',
          componentId: 'kernel',
          componentName: 'Kernel',
          timestamp: Date.now(),
          error: error as Error,
          errorInfo: { componentStack: '' },
          recovered: true,
        })
      }
    }
  }
}
```

### React Error Boundaries

```typescript
class ReactLogErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const kernel = getKernel()
    kernel?.emit({
      type: 'error',
      componentId: this.props.componentId,
      componentName: this.props.componentName,
      timestamp: Date.now(),
      error,
      errorInfo,
      recovered: false,
    })
  }
}
```

---

## Performance Considerations

### Memory Management

```typescript
class LogStore {
  private maxLogs: number

  addLog(entry: LogEntry) {
    this.entries.push(entry)

    // Trim old logs if exceeding limit
    if (this.entries.length > this.maxLogs) {
      const removed = this.entries.splice(0, this.entries.length - this.maxLogs)
      this.cleanupIndexes(removed)
    }
  }
}
```

### Lazy Loading

```typescript
// Optional plugins are only loaded when imported
// Tree-shaking removes unused plugins

// User code:
import { panelUI } from '@oxog/reactlog/plugins'
// Only panelUI code is bundled, not all optional plugins
```

### Disable in Production

```typescript
function ReactLogProvider({ enabled = process.env.NODE_ENV !== 'production' }) {
  // Auto-disable in production unless explicitly enabled
}
```

---

## Browser Compatibility

- Modern browsers (ES2020)
- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

No IE11 support (uses modern APIs).
