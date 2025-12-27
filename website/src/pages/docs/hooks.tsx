import { CodeBlock } from "@/components/code-block"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function HooksPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Hooks</h1>
        <p className="text-lg text-muted-foreground">
          ReactLog provides several hooks for different debugging scenarios.
        </p>
      </div>

      {/* useReactLog */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="usereactlog">useReactLog</h2>
        <p className="text-muted-foreground">
          The primary hook for lifecycle logging. Tracks mount, unmount, and render events.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Usage</CardTitle>
            <CardDescription>Add to any component to start logging</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`import { useReactLog } from 'reactlog';

function MyComponent() {
  useReactLog('MyComponent');

  return <div>Hello World</div>;
}`}
              language="tsx"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">With Props Tracking</CardTitle>
            <CardDescription>Track prop changes between renders</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`function UserCard({ user, onEdit }) {
  useReactLog('UserCard', {
    trackProps: true,
    props: { user, onEdit }
  });

  return (
    <div>
      <h2>{user.name}</h2>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
}`}
              language="tsx"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">With State Tracking</CardTitle>
            <CardDescription>Track state changes</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`function Counter() {
  const [count, setCount] = useState(0);

  useReactLog('Counter', {
    trackState: true,
    state: { count }
  });

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`}
              language="tsx"
            />
          </CardContent>
        </Card>
      </section>

      {/* useRenderCount */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="userendercount">useRenderCount</h2>
        <p className="text-muted-foreground">
          Track how many times a component has rendered.
        </p>

        <CodeBlock
          code={`import { useRenderCount } from 'reactlog';

function ExpensiveComponent() {
  const renderCount = useRenderCount('ExpensiveComponent');

  console.log(\`Render #\${renderCount}\`);

  return <div>Rendered {renderCount} times</div>;
}`}
          language="tsx"
        />

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Console Output</h3>
          <div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-sm">
            <div><span className="text-blue-400">[ReactLog]</span> ExpensiveComponent: Render #1</div>
            <div><span className="text-blue-400">[ReactLog]</span> ExpensiveComponent: Render #2</div>
            <div><span className="text-blue-400">[ReactLog]</span> ExpensiveComponent: Render #3</div>
          </div>
        </div>
      </section>

      {/* useWhyDidYouRender */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="usewhydidyourender">useWhyDidYouRender</h2>
        <p className="text-muted-foreground">
          Identify why a component re-rendered by tracking prop and state changes.
        </p>

        <CodeBlock
          code={`import { useWhyDidYouRender } from 'reactlog';

function DataTable({ data, columns, onSort }) {
  useWhyDidYouRender('DataTable', { data, columns, onSort });

  return (
    <table>
      {/* table content */}
    </table>
  );
}`}
          language="tsx"
        />

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Console Output</h3>
          <div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-sm">
            <div><span className="text-yellow-400">[WhyRender]</span> DataTable re-rendered because:</div>
            <div className="pl-4">• <span className="text-cyan-400">data</span> changed (reference)</div>
            <div className="pl-4">• <span className="text-cyan-400">onSort</span> changed (reference)</div>
            <div className="pl-4 text-gray-400">• columns: no change</div>
          </div>
        </div>

        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Optimization Tip</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            If you see "(reference)" changes, consider:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Using <code className="bg-muted px-1 rounded">useMemo</code> for objects/arrays</li>
              <li>Using <code className="bg-muted px-1 rounded">useCallback</code> for functions</li>
              <li>Moving constant values outside the component</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* useLifecycle */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="uselifecycle">useLifecycle</h2>
        <p className="text-muted-foreground">
          Attach custom callbacks to lifecycle events.
        </p>

        <CodeBlock
          code={`import { useLifecycle } from 'reactlog';

function TrackedComponent() {
  useLifecycle('TrackedComponent', {
    onMount: () => {
      console.log('Component mounted!');
      analytics.track('component_view');
    },
    onUnmount: () => {
      console.log('Component unmounted!');
    },
    onRender: (renderCount) => {
      if (renderCount > 10) {
        console.warn('Too many renders!');
      }
    }
  });

  return <div>Tracked</div>;
}`}
          language="tsx"
        />
      </section>

      {/* useRenderTime */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="userendertime">useRenderTime</h2>
        <p className="text-muted-foreground">
          Measure how long a component takes to render.
        </p>

        <CodeBlock
          code={`import { useRenderTime } from 'reactlog';

function HeavyComponent({ data }) {
  const { duration, average } = useRenderTime('HeavyComponent');

  // Log if render is slow
  useEffect(() => {
    if (duration > 16) {
      console.warn(\`Slow render: \${duration.toFixed(2)}ms\`);
    }
  }, [duration]);

  return (
    <div>
      <p>Last render: {duration.toFixed(2)}ms</p>
      <p>Average: {average.toFixed(2)}ms</p>
      {/* expensive rendering */}
    </div>
  );
}`}
          language="tsx"
        />
      </section>

      {/* useEffectLog */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="useeffectlog">useEffectLog</h2>
        <p className="text-muted-foreground">
          Track when effects run and what triggered them.
        </p>

        <CodeBlock
          code={`import { useEffectLog } from 'reactlog';

function DataFetcher({ userId }) {
  const [data, setData] = useState(null);

  useEffectLog(
    'DataFetcher:fetchUser',
    () => {
      fetchUser(userId).then(setData);
    },
    [userId]
  );

  return <div>{data?.name}</div>;
}`}
          language="tsx"
        />

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Console Output</h3>
          <div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-sm">
            <div><span className="text-green-400">[Effect]</span> DataFetcher:fetchUser triggered</div>
            <div className="pl-4">Dependencies changed: <span className="text-cyan-400">userId</span></div>
            <div className="pl-4 text-gray-400">Previous: 123 → Current: 456</div>
          </div>
        </div>
      </section>

      {/* useDebugValue */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="usedebugvalue">useReactLogDebugValue</h2>
        <p className="text-muted-foreground">
          Enhanced version of React's useDebugValue that also logs to console.
        </p>

        <CodeBlock
          code={`import { useReactLogDebugValue } from 'reactlog';

function useCustomHook(initialValue) {
  const [value, setValue] = useState(initialValue);

  // Shows in React DevTools AND console
  useReactLogDebugValue('useCustomHook', {
    value,
    isDefault: value === initialValue
  });

  return [value, setValue];
}`}
          language="tsx"
        />
      </section>

      {/* Hook Combinations */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" id="combinations">Combining Hooks</h2>
        <p className="text-muted-foreground">
          You can combine multiple hooks for comprehensive debugging.
        </p>

        <CodeBlock
          code={`import {
  useReactLog,
  useWhyDidYouRender,
  useRenderTime
} from 'reactlog';

function ComplexComponent({ data, config }) {
  const [state, setState] = useState(initialState);

  // Basic lifecycle logging
  useReactLog('ComplexComponent');

  // Track why re-renders happen
  useWhyDidYouRender('ComplexComponent', { data, config, state });

  // Measure render performance
  const { duration } = useRenderTime('ComplexComponent');

  return (
    <div>
      {/* component content */}
    </div>
  );
}`}
          language="tsx"
        />

        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-lg">Production Tip</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Wrap hooks in a development check to exclude them from production:
            <CodeBlock
              code={`if (process.env.NODE_ENV === 'development') {
  useReactLog('MyComponent');
}`}
              language="tsx"
            />
          </CardContent>
        </Card>
      </section>

      <div className="border-t pt-8 mt-12">
        <p className="text-sm text-muted-foreground">
          See the{" "}
          <a href="#/docs/api" className="text-primary hover:underline">
            API Reference
          </a>{" "}
          for complete hook signatures and options.
        </p>
      </div>
    </div>
  )
}
