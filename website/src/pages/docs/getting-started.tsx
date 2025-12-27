import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Lightbulb } from "lucide-react"

const installCode = `# npm
npm install @oxog/reactlog

# yarn
yarn add @oxog/reactlog

# pnpm
pnpm add @oxog/reactlog`

const setupCode = `// App.tsx or main.tsx
import { ReactLogProvider } from '@oxog/reactlog'

function App() {
  return (
    <ReactLogProvider
      options={{
        enabled: process.env.NODE_ENV === 'development',
        logLevel: 'debug',
      }}
    >
      <YourApp />
    </ReactLogProvider>
  )
}

export default App`

const useLogCode = `import { useState } from 'react'
import { useLog } from '@oxog/reactlog'

function Counter({ initialValue = 0 }) {
  const [count, setCount] = useState(initialValue)

  // Add debugging for this component
  useLog('Counter', {
    props: { initialValue },
    state: { count },
    trackEffects: true,
  })

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  )
}`

const pluginsCode = `import { ReactLogProvider } from '@oxog/reactlog'
import {
  renderTimer,
  contextTracker,
  errorTracker,
} from '@oxog/reactlog/plugins'

function App() {
  return (
    <ReactLogProvider
      plugins={[
        renderTimer({ threshold: 16 }),
        contextTracker(),
        errorTracker(),
      ]}
    >
      <YourApp />
    </ReactLogProvider>
  )
}`

export function GettingStartedPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-4xl font-bold mb-4">Getting Started</h1>

      <p className="text-lg text-muted-foreground mb-8">
        This guide will help you install ReactLog and get it running in your
        React project in just a few minutes.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Prerequisites</h2>

      <p className="text-muted-foreground mb-4">ReactLog requires:</p>

      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-8">
        <li>React 17.0.0 or higher</li>
        <li>Node.js 18 or higher (for development)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Installation</h2>

      <p className="text-muted-foreground mb-4">
        Install ReactLog using your preferred package manager:
      </p>

      <CodeBlock code={installCode} language="bash" className="mb-4" />

      <Card className="bg-green-500/10 border-green-500/20 mb-8">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground">Tip:</strong>
              <span className="text-muted-foreground ml-1">
                ReactLog has zero runtime dependencies, so it won't add any
                additional packages to your project.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Basic Setup</h2>

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 1: Wrap Your App</h3>

      <p className="text-muted-foreground mb-4">
        Wrap your application with <code className="bg-muted px-1.5 py-0.5 rounded">ReactLogProvider</code>.
        This provides the logging context to all components.
      </p>

      <CodeBlock code={setupCode} language="tsx" className="mb-6" />

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 2: Use the Hook</h3>

      <p className="text-muted-foreground mb-4">
        Add the <code className="bg-muted px-1.5 py-0.5 rounded">useLog</code> hook
        to any component you want to debug:
      </p>

      <CodeBlock code={useLogCode} language="tsx" className="mb-6" />

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 3: Check Your Console</h3>

      <p className="text-muted-foreground mb-4">
        Open your browser's developer console. You'll see beautifully formatted logs:
      </p>

      <div className="code-block p-4 font-mono text-sm leading-relaxed mb-8">
        <div><span className="console-mount">▶ MOUNT</span> Counter <span className="console-time">12:34:56.789</span></div>
        <div className="ml-4"><span className="console-props">├─ Props:</span> {"{"} initialValue: 0 {"}"}</div>
        <div className="mt-1"><span className="console-state">▶ STATE</span> Counter [0] <span className="text-gray-500">0</span> → <span className="text-white">1</span></div>
        <div><span className="console-update">▶ UPDATE</span> Counter <span className="text-gray-500">(state-change, render #2)</span></div>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Configuration Options</h2>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold">Option</th>
              <th className="text-left py-3 px-4 font-semibold">Type</th>
              <th className="text-left py-3 px-4 font-semibold">Default</th>
              <th className="text-left py-3 px-4 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-3 px-4"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">enabled</code></td>
              <td className="py-3 px-4 text-muted-foreground">boolean</td>
              <td className="py-3 px-4 text-muted-foreground">true</td>
              <td className="py-3 px-4 text-muted-foreground">Enable/disable logging</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-3 px-4"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">logLevel</code></td>
              <td className="py-3 px-4 text-muted-foreground">string</td>
              <td className="py-3 px-4 text-muted-foreground">'debug'</td>
              <td className="py-3 px-4 text-muted-foreground">'debug' | 'info' | 'warn' | 'error'</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-3 px-4"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">maxLogs</code></td>
              <td className="py-3 px-4 text-muted-foreground">number</td>
              <td className="py-3 px-4 text-muted-foreground">1000</td>
              <td className="py-3 px-4 text-muted-foreground">Maximum logs to keep in memory</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Using Optional Plugins</h2>

      <p className="text-muted-foreground mb-4">
        ReactLog comes with optional plugins for additional functionality. Import them separately:
      </p>

      <CodeBlock code={pluginsCode} language="tsx" className="mb-8" />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Next Steps</h2>

      <div className="grid sm:grid-cols-2 gap-4 not-prose">
        <Link to="/docs/api">
          <Card className="h-full hover:border-primary transition-colors">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">API Reference</h3>
              <p className="text-sm text-muted-foreground">Explore all available APIs</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/docs/plugins">
          <Card className="h-full hover:border-primary transition-colors">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">Plugins</h3>
              <p className="text-sm text-muted-foreground">Learn about available plugins</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
