import { CodeBlock } from "@/components/code-block"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ConfigurationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Configuration</h1>
        <p className="text-lg text-muted-foreground">
          Configure ReactLog to match your debugging needs.
        </p>
      </div>

      {/* Global Configuration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="global">Global Configuration</h2>
        <p className="text-muted-foreground">
          Set up ReactLog once in your app's entry point.
        </p>

        <CodeBlock
          code={`// src/index.tsx or src/main.tsx
import { configureReactLog } from 'reactlog';

configureReactLog({
  // Enable/disable all logging
  enabled: process.env.NODE_ENV === 'development',

  // Plugins to use
  plugins: [],

  // Filter which components to log
  filter: (componentName) => true,

  // Callback for each log entry
  onLog: (entry) => console.log(entry),

  // Maximum log entries to keep in history
  maxEntries: 500,

  // Enable performance tracking
  trackPerformance: true,

  // Show timestamps in logs
  showTimestamp: true,

  // Custom prefix for all logs
  prefix: '[ReactLog]'
});`}
          language="tsx"
        />
      </section>

      {/* Configuration Options */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="options">Configuration Options</h2>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-mono">enabled</CardTitle>
              <CardDescription>Type: boolean | Default: true</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">
                Globally enable or disable ReactLog. When disabled, all hooks become no-ops.
              </p>
              <CodeBlock
                code={`configureReactLog({
  enabled: process.env.NODE_ENV === 'development'
});`}
                language="tsx"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-mono">filter</CardTitle>
              <CardDescription>Type: (componentName: string) =&gt; boolean</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">
                Filter which components should be logged. Return true to log, false to skip.
              </p>
              <CodeBlock
                code={`configureReactLog({
  // Only log components starting with "App"
  filter: (name) => name.startsWith('App'),

  // Exclude internal components
  filter: (name) => !name.startsWith('_'),

  // Log specific components only
  filter: (name) => ['UserProfile', 'DataTable'].includes(name)
});`}
                language="tsx"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-mono">onLog</CardTitle>
              <CardDescription>Type: (entry: LogEntry) =&gt; void</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">
                Callback function called for each log entry. Use for custom logging or analytics.
              </p>
              <CodeBlock
                code={`configureReactLog({
  onLog: (entry) => {
    // Send to analytics
    analytics.track('component_lifecycle', entry);

    // Custom logging
    if (entry.type === 'mount') {
      console.log(\`Mounted: \${entry.componentName}\`);
    }

    // Performance monitoring
    if (entry.duration && entry.duration > 16) {
      reportSlowRender(entry);
    }
  }
});`}
                language="tsx"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-mono">maxEntries</CardTitle>
              <CardDescription>Type: number | Default: 500</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">
                Maximum number of log entries to keep in history. Older entries are removed when limit is reached.
              </p>
              <CodeBlock
                code={`configureReactLog({
  maxEntries: 1000
});`}
                language="tsx"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-mono">trackPerformance</CardTitle>
              <CardDescription>Type: boolean | Default: false</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">
                Enable render duration tracking for all components.
              </p>
              <CodeBlock
                code={`configureReactLog({
  trackPerformance: true
});`}
                language="tsx"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-mono">showTimestamp</CardTitle>
              <CardDescription>Type: boolean | Default: true</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">
                Include timestamps in console output.
              </p>
              <CodeBlock
                code={`configureReactLog({
  showTimestamp: true
});

// Output: [12:34:56.789] [ReactLog] MyComponent mounted`}
                language="tsx"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-mono">prefix</CardTitle>
              <CardDescription>Type: string | Default: "[ReactLog]"</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">
                Custom prefix for all log messages.
              </p>
              <CodeBlock
                code={`configureReactLog({
  prefix: '[DEBUG]'
});

// Output: [DEBUG] MyComponent mounted`}
                language="tsx"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-mono">formatter</CardTitle>
              <CardDescription>Type: (entry: LogEntry) =&gt; string</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">
                Custom formatter function for log output.
              </p>
              <CodeBlock
                code={`configureReactLog({
  formatter: (entry) => {
    const time = new Date(entry.timestamp).toISOString();
    return \`[\${time}] \${entry.componentName}: \${entry.type}\`;
  }
});`}
                language="tsx"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Environment-based Configuration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="environment">Environment-based Configuration</h2>
        <p className="text-muted-foreground">
          Configure differently based on environment.
        </p>

        <CodeBlock
          code={`// config/reactlog.ts
import {
  configureReactLog,
  performancePlugin,
  networkPlugin,
  statePlugin
} from 'reactlog';

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const isStaging = process.env.REACT_APP_ENV === 'staging';

configureReactLog({
  // Disable in production
  enabled: isDev || isStaging,

  // More plugins in staging for debugging
  plugins: isStaging
    ? [performancePlugin(), networkPlugin(), statePlugin()]
    : isDev
      ? [performancePlugin()]
      : [],

  // Verbose logging only in dev
  showTimestamp: isDev,

  // Send logs to server in staging
  onLog: isStaging
    ? (entry) => sendToLogServer(entry)
    : undefined,

  // Keep more history in dev
  maxEntries: isDev ? 1000 : 100
});`}
          language="tsx"
        />
      </section>

      {/* Per-Component Configuration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="per-component">Per-Component Configuration</h2>
        <p className="text-muted-foreground">
          Override global settings for specific components.
        </p>

        <CodeBlock
          code={`import { useReactLog } from 'reactlog';

function CriticalComponent({ data }) {
  // Override global settings for this component
  useReactLog('CriticalComponent', {
    // Always log this component even if globally filtered
    force: true,

    // Track props for this component
    trackProps: true,
    props: { data },

    // Custom logging for this component
    onLog: (entry) => {
      alertIfSlow(entry);
    }
  });

  return <div>{/* content */}</div>;
}`}
          language="tsx"
        />
      </section>

      {/* Runtime Configuration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="runtime">Runtime Configuration</h2>
        <p className="text-muted-foreground">
          Change configuration at runtime for dynamic debugging.
        </p>

        <CodeBlock
          code={`import {
  configureReactLog,
  setEnabled,
  setFilter,
  addPlugin,
  removePlugin
} from 'reactlog';

// Toggle logging on/off
window.toggleReactLog = () => {
  setEnabled(current => !current);
};

// Focus on specific component
window.debugComponent = (name) => {
  setFilter(componentName => componentName === name);
};

// Add plugin at runtime
window.enablePerformanceTracking = () => {
  addPlugin(performancePlugin({ warnThreshold: 16 }));
};

// Remove plugin
window.disablePerformanceTracking = () => {
  removePlugin('performance');
};`}
          language="tsx"
        />

        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-lg">DevTools Integration</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>You can expose these functions to window for console debugging:</p>
            <CodeBlock
              code={`// In your entry file
if (process.env.NODE_ENV === 'development') {
  window.__REACTLOG__ = {
    enable: () => setEnabled(true),
    disable: () => setEnabled(false),
    filter: setFilter,
    getHistory: getLogHistory,
    clear: clearLogHistory
  };
}`}
              language="tsx"
            />
          </CardContent>
        </Card>
      </section>

      {/* Recommended Configurations */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="presets">Recommended Configurations</h2>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Minimal (Low Noise)</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`configureReactLog({
  enabled: true,
  showTimestamp: false,
  plugins: [],
  filter: (name) => !name.includes('Provider')
});`}
                language="tsx"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Focused</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`configureReactLog({
  enabled: true,
  trackPerformance: true,
  plugins: [
    performancePlugin({
      warnThreshold: 16,
      trackCumulative: true
    })
  ]
});`}
                language="tsx"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Full Debugging</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`configureReactLog({
  enabled: true,
  showTimestamp: true,
  trackPerformance: true,
  maxEntries: 2000,
  plugins: [
    performancePlugin(),
    networkPlugin(),
    statePlugin({ showDiff: true }),
    propsPlugin({ warnOnReferenceChange: true })
  ]
});`}
                language="tsx"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="border-t pt-8 mt-12">
        <p className="text-sm text-muted-foreground">
          See the{" "}
          <a href="#/docs/plugins" className="text-primary hover:underline">
            Plugins documentation
          </a>{" "}
          for plugin-specific configuration options.
        </p>
      </div>
    </div>
  )
}
