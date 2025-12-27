import { CodeBlock } from "@/components/code-block"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PluginsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Built-in Plugins</h1>
        <p className="text-lg text-muted-foreground">
          ReactLog comes with several built-in plugins to enhance your debugging experience.
        </p>
      </div>

      {/* Performance Plugin */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold" id="performance">Performance Plugin</h2>
          <Badge>Built-in</Badge>
        </div>
        <p className="text-muted-foreground">
          Track render times, identify slow components, and monitor performance metrics.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Measures render duration for each component</li>
              <li>Tracks cumulative render time</li>
              <li>Identifies unnecessary re-renders</li>
              <li>Warns when renders exceed threshold</li>
              <li>Provides render count statistics</li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Usage</h3>
          <CodeBlock
            code={`import { configureReactLog, performancePlugin } from 'reactlog';

configureReactLog({
  plugins: [
    performancePlugin({
      // Warn if render takes longer than 16ms
      warnThreshold: 16,
      // Track cumulative time
      trackCumulative: true,
      // Enable detailed timing
      detailed: true
    })
  ]
});`}
            language="tsx"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Console Output</h3>
          <div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-sm">
            <div><span className="text-blue-400">[Performance]</span> MyComponent rendered in <span className="text-green-400">2.3ms</span></div>
            <div><span className="text-blue-400">[Performance]</span> DataTable rendered in <span className="text-yellow-400">18.5ms</span> <span className="text-yellow-400">⚠️ slow</span></div>
            <div><span className="text-blue-400">[Performance]</span> Button rendered in <span className="text-green-400">0.8ms</span> (render #5)</div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Options</h3>
          <CodeBlock
            code={`interface PerformancePluginOptions {
  // Threshold in ms to trigger warning (default: 16)
  warnThreshold?: number;

  // Track cumulative render time (default: false)
  trackCumulative?: boolean;

  // Show detailed timing breakdown (default: false)
  detailed?: boolean;

  // Only log renders slower than this (default: 0)
  minDuration?: number;
}`}
            language="typescript"
          />
        </div>
      </section>

      {/* Network Plugin */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold" id="network">Network Plugin</h2>
          <Badge>Built-in</Badge>
        </div>
        <p className="text-muted-foreground">
          Track network requests made during component lifecycle.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Intercepts fetch and XMLHttpRequest</li>
              <li>Associates requests with components</li>
              <li>Tracks request timing and status</li>
              <li>Detects duplicate requests</li>
              <li>Monitors request waterfalls</li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Usage</h3>
          <CodeBlock
            code={`import { configureReactLog, networkPlugin } from 'reactlog';

configureReactLog({
  plugins: [
    networkPlugin({
      // Track fetch requests
      trackFetch: true,
      // Track XHR requests
      trackXHR: true,
      // Include request body in logs
      includeBody: false,
      // Include response in logs
      includeResponse: false
    })
  ]
});`}
            language="tsx"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Console Output</h3>
          <div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-sm">
            <div><span className="text-purple-400">[Network]</span> UserProfile: <span className="text-cyan-400">GET</span> /api/user/123 <span className="text-green-400">200 OK</span> (45ms)</div>
            <div><span className="text-purple-400">[Network]</span> UserProfile: <span className="text-cyan-400">GET</span> /api/user/123 <span className="text-yellow-400">⚠️ duplicate request</span></div>
            <div><span className="text-purple-400">[Network]</span> CommentList: <span className="text-cyan-400">POST</span> /api/comments <span className="text-green-400">201 Created</span> (120ms)</div>
          </div>
        </div>
      </section>

      {/* State Plugin */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold" id="state">State Plugin</h2>
          <Badge>Built-in</Badge>
        </div>
        <p className="text-muted-foreground">
          Deep tracking of state changes with diff visualization.
        </p>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Usage</h3>
          <CodeBlock
            code={`import { configureReactLog, statePlugin } from 'reactlog';

configureReactLog({
  plugins: [
    statePlugin({
      // Show diff between old and new state
      showDiff: true,
      // Deep compare objects
      deepCompare: true,
      // Ignore certain keys
      ignoreKeys: ['timestamp', 'lastUpdated']
    })
  ]
});`}
            language="tsx"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Console Output</h3>
          <div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-sm">
            <div><span className="text-orange-400">[State]</span> Counter: count changed</div>
            <div className="pl-4 text-red-400">- count: 5</div>
            <div className="pl-4 text-green-400">+ count: 6</div>
            <div className="mt-2"><span className="text-orange-400">[State]</span> UserForm: user.name changed</div>
            <div className="pl-4 text-red-400">- user.name: "John"</div>
            <div className="pl-4 text-green-400">+ user.name: "Jane"</div>
          </div>
        </div>
      </section>

      {/* Props Plugin */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold" id="props">Props Plugin</h2>
          <Badge>Built-in</Badge>
        </div>
        <p className="text-muted-foreground">
          Track prop changes and identify unnecessary re-renders caused by prop changes.
        </p>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Usage</h3>
          <CodeBlock
            code={`import { configureReactLog, propsPlugin } from 'reactlog';

configureReactLog({
  plugins: [
    propsPlugin({
      // Show which props changed
      showChangedProps: true,
      // Warn on reference changes that could be memoized
      warnOnReferenceChange: true,
      // Deep compare props
      deepCompare: false
    })
  ]
});`}
            language="tsx"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Console Output</h3>
          <div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-sm">
            <div><span className="text-pink-400">[Props]</span> Button: onClick changed (reference)</div>
            <div className="pl-4 text-yellow-400">⚠️ Consider using useCallback</div>
            <div className="mt-2"><span className="text-pink-400">[Props]</span> UserCard: user prop changed</div>
            <div className="pl-4">Changed keys: name, email</div>
          </div>
        </div>
      </section>

      {/* Render Plugin */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold" id="render">Render Plugin</h2>
          <Badge>Built-in</Badge>
        </div>
        <p className="text-muted-foreground">
          Visualize component render tree and track render causes.
        </p>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Usage</h3>
          <CodeBlock
            code={`import { configureReactLog, renderPlugin } from 'reactlog';

configureReactLog({
  plugins: [
    renderPlugin({
      // Show render tree
      showTree: true,
      // Track render causes
      trackCauses: true,
      // Group consecutive renders
      groupRenders: true
    })
  ]
});`}
            language="tsx"
          />
        </div>
      </section>

      {/* History Plugin */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold" id="history">History Plugin</h2>
          <Badge>Built-in</Badge>
        </div>
        <p className="text-muted-foreground">
          Maintain a queryable history of all lifecycle events.
        </p>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Usage</h3>
          <CodeBlock
            code={`import { configureReactLog, historyPlugin, getHistory } from 'reactlog';

configureReactLog({
  plugins: [
    historyPlugin({
      // Maximum entries to keep
      maxEntries: 1000,
      // Persist to localStorage
      persist: false
    })
  ]
});

// Query history
const mountEvents = getHistory({
  type: 'mount',
  component: 'UserProfile'
});`}
            language="tsx"
          />
        </div>
      </section>

      {/* Using Multiple Plugins */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="combining">Combining Plugins</h2>
        <p className="text-muted-foreground">
          You can use multiple plugins together for comprehensive debugging.
        </p>

        <CodeBlock
          code={`import {
  configureReactLog,
  performancePlugin,
  networkPlugin,
  statePlugin,
  propsPlugin
} from 'reactlog';

configureReactLog({
  enabled: process.env.NODE_ENV === 'development',
  plugins: [
    performancePlugin({ warnThreshold: 16 }),
    networkPlugin({ trackFetch: true }),
    statePlugin({ showDiff: true }),
    propsPlugin({ warnOnReferenceChange: true })
  ]
});`}
          language="tsx"
        />
      </section>

      <div className="border-t pt-8 mt-12">
        <p className="text-sm text-muted-foreground">
          Want to create your own plugin? Check out the{" "}
          <a href="#/docs/custom-plugins" className="text-primary hover:underline">
            Custom Plugins guide
          </a>.
        </p>
      </div>
    </div>
  )
}
