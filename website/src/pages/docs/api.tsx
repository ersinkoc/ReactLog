import { CodeBlock } from "@/components/code-block"

export function ApiPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">API Reference</h1>
        <p className="text-lg text-muted-foreground">
          Complete API documentation for ReactLog functions and types.
        </p>
      </div>

      {/* useReactLog */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="usereactlog">useReactLog</h2>
        <p className="text-muted-foreground">
          The main hook for enabling lifecycle logging in your components.
        </p>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Signature</h3>
          <CodeBlock
            code={`function useReactLog(
  componentName?: string,
  options?: UseReactLogOptions
): void`}
            language="typescript"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Parameters</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Parameter</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3"><code className="text-sm bg-muted px-1 rounded">componentName</code></td>
                  <td className="p-3"><code className="text-sm bg-muted px-1 rounded">string</code></td>
                  <td className="p-3">Optional name for the component. Auto-detected if not provided.</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3"><code className="text-sm bg-muted px-1 rounded">options</code></td>
                  <td className="p-3"><code className="text-sm bg-muted px-1 rounded">UseReactLogOptions</code></td>
                  <td className="p-3">Optional configuration options for this hook instance.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Example</h3>
          <CodeBlock
            code={`import { useReactLog } from 'reactlog';

function MyComponent() {
  useReactLog('MyComponent', {
    trackProps: true,
    trackState: true
  });

  return <div>Hello World</div>;
}`}
            language="tsx"
          />
        </div>
      </section>

      {/* UseReactLogOptions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="usereactlogoptions">UseReactLogOptions</h2>
        <p className="text-muted-foreground">
          Configuration options for the useReactLog hook.
        </p>

        <CodeBlock
          code={`interface UseReactLogOptions {
  // Track prop changes
  trackProps?: boolean;

  // Track state changes (requires passing state)
  trackState?: boolean;

  // Custom props to track
  props?: Record<string, unknown>;

  // Custom state to track
  state?: Record<string, unknown>;

  // Show timestamps in logs
  showTimestamp?: boolean;

  // Custom log prefix
  prefix?: string;
}`}
          language="typescript"
        />
      </section>

      {/* configureReactLog */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="configurereactlog">configureReactLog</h2>
        <p className="text-muted-foreground">
          Configure global settings for ReactLog.
        </p>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Signature</h3>
          <CodeBlock
            code={`function configureReactLog(config: ReactLogConfig): void`}
            language="typescript"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Example</h3>
          <CodeBlock
            code={`import { configureReactLog } from 'reactlog';

configureReactLog({
  enabled: process.env.NODE_ENV === 'development',
  plugins: [performancePlugin(), networkPlugin()],
  filter: (componentName) => !componentName.startsWith('Internal'),
  onLog: (entry) => sendToAnalytics(entry)
});`}
            language="tsx"
          />
        </div>
      </section>

      {/* ReactLogConfig */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="reactlogconfig">ReactLogConfig</h2>
        <p className="text-muted-foreground">
          Global configuration interface for ReactLog.
        </p>

        <CodeBlock
          code={`interface ReactLogConfig {
  // Enable or disable logging globally
  enabled?: boolean;

  // Array of plugins to use
  plugins?: ReactLogPlugin[];

  // Filter function to exclude certain components
  filter?: (componentName: string) => boolean;

  // Callback for each log entry
  onLog?: (entry: LogEntry) => void;

  // Maximum number of log entries to keep
  maxEntries?: number;

  // Enable performance tracking
  trackPerformance?: boolean;

  // Custom formatter for log output
  formatter?: (entry: LogEntry) => string;
}`}
          language="typescript"
        />
      </section>

      {/* LogEntry */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="logentry">LogEntry</h2>
        <p className="text-muted-foreground">
          Structure of a log entry object.
        </p>

        <CodeBlock
          code={`interface LogEntry {
  // Unique identifier for the entry
  id: string;

  // Timestamp of the event
  timestamp: number;

  // Component name
  componentName: string;

  // Type of lifecycle event
  type: 'mount' | 'unmount' | 'update' | 'render' | 'effect';

  // Additional data (props, state changes, etc.)
  data?: Record<string, unknown>;

  // Render duration in milliseconds (if performance tracking enabled)
  duration?: number;

  // Previous values (for updates)
  previous?: Record<string, unknown>;

  // Current values
  current?: Record<string, unknown>;
}`}
          language="typescript"
        />
      </section>

      {/* ReactLogPlugin */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="reactlogplugin">ReactLogPlugin</h2>
        <p className="text-muted-foreground">
          Interface for creating custom plugins.
        </p>

        <CodeBlock
          code={`interface ReactLogPlugin {
  // Unique plugin name
  name: string;

  // Called when ReactLog initializes
  onInit?: () => void;

  // Called on component mount
  onMount?: (componentName: string, data: MountData) => void;

  // Called on component unmount
  onUnmount?: (componentName: string) => void;

  // Called on component update
  onUpdate?: (componentName: string, data: UpdateData) => void;

  // Called on every render
  onRender?: (componentName: string, data: RenderData) => void;

  // Called when effect runs
  onEffect?: (componentName: string, data: EffectData) => void;

  // Called when ReactLog is destroyed
  onDestroy?: () => void;
}`}
          language="typescript"
        />
      </section>

      {/* getLogHistory */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="getloghistory">getLogHistory</h2>
        <p className="text-muted-foreground">
          Retrieve the history of logged events.
        </p>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Signature</h3>
          <CodeBlock
            code={`function getLogHistory(filter?: LogHistoryFilter): LogEntry[]`}
            language="typescript"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Example</h3>
          <CodeBlock
            code={`import { getLogHistory } from 'reactlog';

// Get all logs
const allLogs = getLogHistory();

// Get logs for specific component
const componentLogs = getLogHistory({
  componentName: 'MyComponent'
});

// Get only mount/unmount events
const lifecycleLogs = getLogHistory({
  types: ['mount', 'unmount']
});`}
            language="tsx"
          />
        </div>
      </section>

      {/* clearLogHistory */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="clearloghistory">clearLogHistory</h2>
        <p className="text-muted-foreground">
          Clear all stored log entries.
        </p>

        <CodeBlock
          code={`import { clearLogHistory } from 'reactlog';

// Clear all logs
clearLogHistory();

// Clear logs for specific component
clearLogHistory('MyComponent');`}
          language="tsx"
        />
      </section>

      <div className="border-t pt-8 mt-12">
        <p className="text-sm text-muted-foreground">
          Need more details? Check out the{" "}
          <a href="#/docs/plugins" className="text-primary hover:underline">
            Plugins documentation
          </a>{" "}
          or{" "}
          <a href="#/docs/custom-plugins" className="text-primary hover:underline">
            create your own plugin
          </a>.
        </p>
      </div>
    </div>
  )
}
