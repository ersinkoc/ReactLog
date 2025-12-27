import { CodeBlock } from "@/components/code-block"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function CustomPluginsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Creating Custom Plugins</h1>
        <p className="text-lg text-muted-foreground">
          Extend ReactLog with your own plugins for custom debugging capabilities.
        </p>
      </div>

      {/* Plugin Interface */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="interface">Plugin Interface</h2>
        <p className="text-muted-foreground">
          A plugin is an object implementing the ReactLogPlugin interface.
        </p>

        <CodeBlock
          code={`interface ReactLogPlugin {
  // Required: unique plugin name
  name: string;

  // Called when ReactLog initializes
  onInit?: () => void;

  // Called when a component mounts
  onMount?: (componentName: string, data: MountData) => void;

  // Called when a component unmounts
  onUnmount?: (componentName: string) => void;

  // Called when a component updates
  onUpdate?: (componentName: string, data: UpdateData) => void;

  // Called on every render
  onRender?: (componentName: string, data: RenderData) => void;

  // Called when an effect runs
  onEffect?: (componentName: string, data: EffectData) => void;

  // Called when ReactLog is destroyed
  onDestroy?: () => void;
}`}
          language="typescript"
        />
      </section>

      {/* Basic Plugin */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="basic">Basic Plugin Example</h2>
        <p className="text-muted-foreground">
          Here's a simple plugin that logs mount and unmount events.
        </p>

        <CodeBlock
          code={`import { ReactLogPlugin } from 'reactlog';

export function simpleLogPlugin(): ReactLogPlugin {
  return {
    name: 'simple-log',

    onMount(componentName) {
      console.log(\`✅ \${componentName} mounted\`);
    },

    onUnmount(componentName) {
      console.log(\`❌ \${componentName} unmounted\`);
    }
  };
}

// Usage
configureReactLog({
  plugins: [simpleLogPlugin()]
});`}
          language="tsx"
        />
      </section>

      {/* Plugin with Options */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="options">Plugin with Options</h2>
        <p className="text-muted-foreground">
          Create configurable plugins by accepting options.
        </p>

        <CodeBlock
          code={`interface AnalyticsPluginOptions {
  trackingId: string;
  sampleRate?: number;
  excludeComponents?: string[];
}

export function analyticsPlugin(options: AnalyticsPluginOptions): ReactLogPlugin {
  const { trackingId, sampleRate = 1, excludeComponents = [] } = options;

  return {
    name: 'analytics',

    onInit() {
      console.log(\`Analytics initialized with ID: \${trackingId}\`);
    },

    onMount(componentName, data) {
      if (excludeComponents.includes(componentName)) return;
      if (Math.random() > sampleRate) return;

      sendEvent('component_mount', {
        component: componentName,
        timestamp: Date.now()
      });
    },

    onRender(componentName, data) {
      if (data.renderCount % 10 === 0) {
        sendEvent('render_milestone', {
          component: componentName,
          count: data.renderCount
        });
      }
    }
  };
}

// Usage
configureReactLog({
  plugins: [
    analyticsPlugin({
      trackingId: 'UA-123456',
      sampleRate: 0.1,
      excludeComponents: ['InternalProvider']
    })
  ]
});`}
          language="tsx"
        />
      </section>

      {/* Plugin with State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="state">Plugin with Internal State</h2>
        <p className="text-muted-foreground">
          Plugins can maintain internal state for tracking across components.
        </p>

        <CodeBlock
          code={`export function renderCounterPlugin(): ReactLogPlugin {
  // Internal state
  const renderCounts = new Map<string, number>();
  const mountTimes = new Map<string, number>();

  return {
    name: 'render-counter',

    onMount(componentName) {
      renderCounts.set(componentName, 0);
      mountTimes.set(componentName, Date.now());
    },

    onRender(componentName) {
      const count = (renderCounts.get(componentName) || 0) + 1;
      renderCounts.set(componentName, count);

      if (count === 100) {
        console.warn(\`⚠️ \${componentName} has rendered 100 times!\`);
      }
    },

    onUnmount(componentName) {
      const lifetime = Date.now() - (mountTimes.get(componentName) || 0);
      const renders = renderCounts.get(componentName) || 0;

      console.log(
        \`📊 \${componentName}: \${renders} renders in \${lifetime}ms\`
      );

      renderCounts.delete(componentName);
      mountTimes.delete(componentName);
    },

    onDestroy() {
      renderCounts.clear();
      mountTimes.clear();
    }
  };
}`}
          language="tsx"
        />
      </section>

      {/* Advanced: Error Tracking */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold" id="error-tracking">Error Tracking Plugin</h2>
          <Badge variant="outline">Advanced</Badge>
        </div>
        <p className="text-muted-foreground">
          Track errors and associate them with component state.
        </p>

        <CodeBlock
          code={`interface ErrorTrackingOptions {
  onError?: (error: ComponentError) => void;
  captureState?: boolean;
}

interface ComponentError {
  componentName: string;
  error: Error;
  state?: Record<string, unknown>;
  props?: Record<string, unknown>;
  renderCount: number;
}

export function errorTrackingPlugin(options: ErrorTrackingOptions = {}): ReactLogPlugin {
  const componentStates = new Map<string, {
    props: Record<string, unknown>;
    state: Record<string, unknown>;
    renderCount: number;
  }>();

  return {
    name: 'error-tracking',

    onMount(componentName, data) {
      componentStates.set(componentName, {
        props: data.props || {},
        state: {},
        renderCount: 0
      });
    },

    onUpdate(componentName, data) {
      const current = componentStates.get(componentName);
      if (current) {
        current.props = data.props || current.props;
        current.state = data.state || current.state;
        current.renderCount++;
      }
    },

    onRender(componentName, data) {
      if (data.error) {
        const current = componentStates.get(componentName);
        const errorInfo: ComponentError = {
          componentName,
          error: data.error,
          renderCount: current?.renderCount || 0
        };

        if (options.captureState) {
          errorInfo.state = current?.state;
          errorInfo.props = current?.props;
        }

        console.error('Component Error:', errorInfo);
        options.onError?.(errorInfo);
      }
    },

    onUnmount(componentName) {
      componentStates.delete(componentName);
    }
  };
}`}
          language="tsx"
        />
      </section>

      {/* Advanced: Remote Logging */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold" id="remote">Remote Logging Plugin</h2>
          <Badge variant="outline">Advanced</Badge>
        </div>
        <p className="text-muted-foreground">
          Send logs to a remote server for monitoring.
        </p>

        <CodeBlock
          code={`interface RemoteLogOptions {
  endpoint: string;
  batchSize?: number;
  flushInterval?: number;
  headers?: Record<string, string>;
}

export function remoteLogPlugin(options: RemoteLogOptions): ReactLogPlugin {
  const { endpoint, batchSize = 10, flushInterval = 5000 } = options;

  let buffer: LogEntry[] = [];
  let flushTimer: ReturnType<typeof setInterval>;

  const flush = async () => {
    if (buffer.length === 0) return;

    const entries = [...buffer];
    buffer = [];

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify({ entries })
      });
    } catch (error) {
      // Re-add failed entries
      buffer.unshift(...entries);
      console.error('Failed to send logs:', error);
    }
  };

  const addEntry = (entry: LogEntry) => {
    buffer.push(entry);
    if (buffer.length >= batchSize) {
      flush();
    }
  };

  return {
    name: 'remote-log',

    onInit() {
      flushTimer = setInterval(flush, flushInterval);
    },

    onMount(componentName, data) {
      addEntry({
        type: 'mount',
        componentName,
        timestamp: Date.now(),
        data
      });
    },

    onUnmount(componentName) {
      addEntry({
        type: 'unmount',
        componentName,
        timestamp: Date.now()
      });
    },

    onRender(componentName, data) {
      addEntry({
        type: 'render',
        componentName,
        timestamp: Date.now(),
        data
      });
    },

    onDestroy() {
      clearInterval(flushTimer);
      flush(); // Final flush
    }
  };
}`}
          language="tsx"
        />
      </section>

      {/* Testing Plugins */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="testing">Testing Your Plugin</h2>
        <p className="text-muted-foreground">
          Write tests for your plugins using mock functions.
        </p>

        <CodeBlock
          code={`import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { configureReactLog, useReactLog, resetReactLog } from 'reactlog';
import { myCustomPlugin } from './my-custom-plugin';

describe('myCustomPlugin', () => {
  beforeEach(() => {
    resetReactLog();
  });

  it('should call onMount when component mounts', () => {
    const onMount = vi.fn();
    const plugin = myCustomPlugin();
    plugin.onMount = onMount;

    configureReactLog({ plugins: [plugin] });

    renderHook(() => useReactLog('TestComponent'));

    expect(onMount).toHaveBeenCalledWith('TestComponent', expect.any(Object));
  });

  it('should track render counts', () => {
    const plugin = myCustomPlugin();
    configureReactLog({ plugins: [plugin] });

    const { rerender } = renderHook(() => useReactLog('TestComponent'));

    rerender();
    rerender();

    expect(plugin.getRenderCount('TestComponent')).toBe(3);
  });
});`}
          language="tsx"
        />
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="best-practices">Best Practices</h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Use Unique Names</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Always provide a unique name for your plugin to avoid conflicts and allow removal by name.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clean Up in onDestroy</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Release resources, clear intervals, and flush pending data in the onDestroy callback.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Keep Handlers Fast</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Plugin handlers run synchronously. Avoid heavy computation or use requestIdleCallback for non-critical work.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Handle Errors Gracefully</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Wrap async operations in try-catch. A failing plugin shouldn't break the application.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Make Plugins Configurable</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Accept options to allow users to customize behavior without modifying plugin code.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Publishing */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="publishing">Publishing Your Plugin</h2>
        <p className="text-muted-foreground">
          Share your plugin with the community by publishing to npm.
        </p>

        <CodeBlock
          code={`// package.json
{
  "name": "reactlog-plugin-myfeature",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "reactlog": "^1.0.0"
  },
  "keywords": ["reactlog", "reactlog-plugin", "react", "debugging"]
}`}
          language="json"
        />

        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Naming Convention</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Use the <code className="bg-muted px-1 rounded">reactlog-plugin-*</code> naming convention for discoverability on npm.
          </CardContent>
        </Card>
      </section>

      <div className="border-t pt-8 mt-12">
        <p className="text-sm text-muted-foreground">
          Check out the{" "}
          <a href="#/docs/plugins" className="text-primary hover:underline">
            built-in plugins
          </a>{" "}
          for more implementation examples.
        </p>
      </div>
    </div>
  )
}
