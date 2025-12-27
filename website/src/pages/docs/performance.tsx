import { CodeBlock } from "@/components/code-block"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PerformancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Performance Guide</h1>
        <p className="text-lg text-muted-foreground">
          Best practices for using ReactLog in performance-sensitive applications.
        </p>
      </div>

      {/* Zero Overhead in Production */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold" id="zero-overhead">Zero Overhead in Production</h2>
          <Badge className="bg-green-500">Recommended</Badge>
        </div>
        <p className="text-muted-foreground">
          ReactLog is designed to have zero runtime overhead when disabled. Here's how to ensure no impact in production.
        </p>

        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Environment Check</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`// Entry point (index.tsx or main.tsx)
import { configureReactLog } from 'reactlog';

configureReactLog({
  enabled: process.env.NODE_ENV === 'development'
});`}
              language="tsx"
            />
            <p className="mt-4 text-sm text-muted-foreground">
              When disabled, all hooks become no-ops with minimal function call overhead.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tree Shaking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              For complete removal in production, use conditional imports:
            </p>
            <CodeBlock
              code={`// hooks/useDebugLog.ts
let useReactLog: typeof import('reactlog').useReactLog;

if (process.env.NODE_ENV === 'development') {
  useReactLog = require('reactlog').useReactLog;
} else {
  // No-op in production
  useReactLog = () => {};
}

export { useReactLog };`}
              language="tsx"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Build-time Removal (Recommended)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Use babel-plugin-transform-remove-console or similar for complete removal:
            </p>
            <CodeBlock
              code={`// babel.config.js
module.exports = {
  presets: ['@babel/preset-react'],
  env: {
    production: {
      plugins: [
        ['transform-remove-imports', {
          test: 'reactlog'
        }]
      ]
    }
  }
};`}
              language="javascript"
            />
          </CardContent>
        </Card>
      </section>

      {/* Hook Performance */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="hooks">Hook Performance</h2>
        <p className="text-muted-foreground">
          Understanding the performance characteristics of ReactLog hooks.
        </p>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Hook</th>
                <th className="text-left p-3 font-medium">Overhead</th>
                <th className="text-left p-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3"><code className="bg-muted px-1 rounded">useReactLog</code></td>
                <td className="p-3"><span className="text-green-500">~0.01ms</span></td>
                <td className="p-3">Basic lifecycle tracking</td>
              </tr>
              <tr className="border-t">
                <td className="p-3"><code className="bg-muted px-1 rounded">useRenderCount</code></td>
                <td className="p-3"><span className="text-green-500">~0.001ms</span></td>
                <td className="p-3">Simple counter increment</td>
              </tr>
              <tr className="border-t">
                <td className="p-3"><code className="bg-muted px-1 rounded">useWhyDidYouRender</code></td>
                <td className="p-3"><span className="text-yellow-500">~0.1-0.5ms</span></td>
                <td className="p-3">Deep comparison of props/state</td>
              </tr>
              <tr className="border-t">
                <td className="p-3"><code className="bg-muted px-1 rounded">useRenderTime</code></td>
                <td className="p-3"><span className="text-green-500">~0.02ms</span></td>
                <td className="p-3">Uses performance.now()</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Heavy Components</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            For components that render very frequently (e.g., in a virtualized list), consider:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Using <code className="bg-muted px-1 rounded">useRenderCount</code> instead of full <code className="bg-muted px-1 rounded">useReactLog</code></li>
              <li>Conditional logging based on render count</li>
              <li>Sampling (log every Nth render)</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Plugin Performance */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="plugins">Plugin Performance</h2>
        <p className="text-muted-foreground">
          Plugins run synchronously. Here's how to keep them fast.
        </p>

        <CodeBlock
          code={`// ❌ Slow: Synchronous heavy operation
function slowPlugin(): ReactLogPlugin {
  return {
    name: 'slow',
    onRender(componentName, data) {
      // This blocks the render!
      const analysis = deepAnalyze(data); // 50ms
      sendToServer(analysis); // 100ms network
    }
  };
}

// ✅ Fast: Deferred processing
function fastPlugin(): ReactLogPlugin {
  return {
    name: 'fast',
    onRender(componentName, data) {
      // Queue for later processing
      requestIdleCallback(() => {
        const analysis = deepAnalyze(data);
        sendToServer(analysis);
      });
    }
  };
}

// ✅ Fast: Batched network requests
function batchedPlugin(): ReactLogPlugin {
  const queue: LogEntry[] = [];

  const flush = debounce(() => {
    if (queue.length > 0) {
      sendToServer([...queue]);
      queue.length = 0;
    }
  }, 1000);

  return {
    name: 'batched',
    onRender(componentName, data) {
      queue.push({ componentName, data, timestamp: Date.now() });
      flush();
    }
  };
}`}
          language="tsx"
        />
      </section>

      {/* Filtering */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="filtering">Smart Filtering</h2>
        <p className="text-muted-foreground">
          Reduce noise and improve performance by filtering logs.
        </p>

        <CodeBlock
          code={`configureReactLog({
  // Filter out high-frequency components
  filter: (componentName) => {
    const highFrequency = ['VirtualRow', 'AnimatedDiv', 'Cursor'];
    return !highFrequency.includes(componentName);
  }
});

// Or filter by pattern
configureReactLog({
  filter: (componentName) => {
    // Skip provider components
    if (componentName.endsWith('Provider')) return false;

    // Skip internal components
    if (componentName.startsWith('_')) return false;

    // Skip styled-components
    if (componentName.startsWith('styled.')) return false;

    return true;
  }
});`}
          language="tsx"
        />
      </section>

      {/* Sampling */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="sampling">Sampling Strategies</h2>
        <p className="text-muted-foreground">
          For high-traffic applications, use sampling to reduce overhead.
        </p>

        <CodeBlock
          code={`// Random sampling
configureReactLog({
  onLog: (entry) => {
    // Only log 10% of events
    if (Math.random() > 0.1) return;
    console.log(entry);
  }
});

// Time-based sampling
let lastLogTime = 0;
configureReactLog({
  onLog: (entry) => {
    const now = Date.now();
    // Max one log per 100ms per component
    if (now - lastLogTime < 100) return;
    lastLogTime = now;
    console.log(entry);
  }
});

// Count-based sampling
const renderCounts = new Map<string, number>();
configureReactLog({
  onLog: (entry) => {
    if (entry.type !== 'render') return;

    const count = (renderCounts.get(entry.componentName) || 0) + 1;
    renderCounts.set(entry.componentName, count);

    // Log every 10th render
    if (count % 10 !== 0) return;
    console.log(\`\${entry.componentName}: render #\${count}\`);
  }
});`}
          language="tsx"
        />
      </section>

      {/* Memory Management */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="memory">Memory Management</h2>
        <p className="text-muted-foreground">
          ReactLog stores log history by default. Here's how to manage memory.
        </p>

        <CodeBlock
          code={`// Limit history size
configureReactLog({
  maxEntries: 100 // Default is 500
});

// Disable history entirely
configureReactLog({
  maxEntries: 0
});

// Periodic cleanup
setInterval(() => {
  clearLogHistory();
}, 60000); // Clear every minute

// Clear on route change
useEffect(() => {
  return () => {
    clearLogHistory(location.pathname);
  };
}, [location.pathname]);`}
          language="tsx"
        />
      </section>

      {/* Measuring ReactLog Impact */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="measuring">Measuring ReactLog Impact</h2>
        <p className="text-muted-foreground">
          Profile ReactLog's own performance impact.
        </p>

        <CodeBlock
          code={`import { configureReactLog, getPerformanceStats } from 'reactlog';

// Enable self-profiling
configureReactLog({
  selfProfile: true
});

// Get performance stats
const stats = getPerformanceStats();
console.log('ReactLog overhead:', stats);
// {
//   totalTime: 45.23,      // ms spent in ReactLog
//   avgHookTime: 0.012,    // ms per hook call
//   avgPluginTime: 0.031,  // ms per plugin callback
//   logCount: 1523,        // total logs
//   memoryUsage: 2.4       // MB of stored history
// }

// Compare with and without ReactLog
performance.mark('with-reactlog-start');
// ... your code
performance.mark('with-reactlog-end');

configureReactLog({ enabled: false });

performance.mark('without-reactlog-start');
// ... same code
performance.mark('without-reactlog-end');

// Measure difference
performance.measure('with-reactlog', 'with-reactlog-start', 'with-reactlog-end');
performance.measure('without-reactlog', 'without-reactlog-start', 'without-reactlog-end');`}
          language="tsx"
        />
      </section>

      {/* Performance Checklist */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="checklist">Performance Checklist</h2>

        <div className="space-y-3">
          <Card>
            <CardContent className="flex items-start gap-3 pt-6">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-medium">Disable in production</p>
                <p className="text-sm text-muted-foreground">Set enabled: false or check NODE_ENV</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 pt-6">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-medium">Filter noisy components</p>
                <p className="text-sm text-muted-foreground">Exclude high-frequency and internal components</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 pt-6">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-medium">Limit history size</p>
                <p className="text-sm text-muted-foreground">Set maxEntries based on available memory</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 pt-6">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-medium">Use appropriate hooks</p>
                <p className="text-sm text-muted-foreground">Choose lighter hooks when full logging isn't needed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 pt-6">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-medium">Keep plugins fast</p>
                <p className="text-sm text-muted-foreground">Defer heavy work with requestIdleCallback or batching</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 pt-6">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-medium">Consider sampling</p>
                <p className="text-sm text-muted-foreground">For very high-traffic apps, log a sample of events</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="border-t pt-8 mt-12">
        <p className="text-sm text-muted-foreground">
          Have performance concerns? Check the{" "}
          <a href="#/docs/configuration" className="text-primary hover:underline">
            Configuration guide
          </a>{" "}
          for all available options.
        </p>
      </div>
    </div>
  )
}
