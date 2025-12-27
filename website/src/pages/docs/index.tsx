import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Feather, Puzzle, FileCode, TreeDeciduous, Rocket, Code, BookOpen } from "lucide-react"

const quickStartCode = `import { ReactLogProvider, useLog } from '@oxog/reactlog'

// Wrap your app
function App() {
  return (
    <ReactLogProvider>
      <Counter />
    </ReactLogProvider>
  )
}

// Use in any component
function Counter() {
  const [count, setCount] = useState(0)

  useLog('Counter', {
    props: {},
    state: { count },
  })

  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  )
}`

export function DocsIndexPage() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-4xl font-bold mb-4">ReactLog Documentation</h1>

      <p className="text-lg text-muted-foreground mb-8">
        Welcome to ReactLog! A powerful, zero-dependency React lifecycle
        debugger with a micro-kernel plugin architecture. ReactLog helps you
        understand exactly what's happening inside your React components.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">What is ReactLog?</h2>

      <p className="text-muted-foreground mb-4">
        ReactLog is a development tool that provides deep insights into your
        React application's behavior. It tracks:
      </p>

      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-8">
        <li>
          <strong className="text-foreground">Component Lifecycle</strong> -
          Mount, update, and unmount events
        </li>
        <li>
          <strong className="text-foreground">Props Changes</strong> - Deep diff
          detection with before/after values
        </li>
        <li>
          <strong className="text-foreground">State Transitions</strong> - Track
          useState changes with hook identification
        </li>
        <li>
          <strong className="text-foreground">Effect Lifecycle</strong> - Monitor
          useEffect runs and cleanups
        </li>
        <li>
          <strong className="text-foreground">Context Changes</strong> - Track
          context value updates
        </li>
        <li>
          <strong className="text-foreground">Render Performance</strong> -
          Measure render times and detect slow components
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Key Features</h2>

      <div className="grid gap-4 not-prose mb-8">
        {[
          {
            icon: Feather,
            title: "Zero Dependencies",
            description:
              "No external runtime dependencies. Just React as a peer dependency.",
            color: "text-violet-500",
            bgColor: "bg-violet-500/10",
          },
          {
            icon: Puzzle,
            title: "Plugin Architecture",
            description:
              "Micro-kernel design with 5 core and 7 optional plugins. Extend as needed.",
            color: "text-cyan-500",
            bgColor: "bg-cyan-500/10",
          },
          {
            icon: FileCode,
            title: "TypeScript First",
            description: "Written in TypeScript with complete type definitions.",
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
          },
          {
            icon: TreeDeciduous,
            title: "Tree Shakeable",
            description:
              "Only include what you use. Supports both ESM and CommonJS.",
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
          },
        ].map((feature) => (
          <Card key={feature.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center`}
                >
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Quick Example</h2>

      <CodeBlock code={quickStartCode} language="tsx" className="mb-8" />

      <h2 className="text-2xl font-semibold mt-8 mb-4">Next Steps</h2>

      <div className="grid sm:grid-cols-2 gap-4 not-prose">
        <Link to="/docs/getting-started">
          <Card className="h-full hover:border-primary transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-violet-500" />
                <h3 className="font-semibold">Quick Start</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Install and set up ReactLog in your project
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/docs/api">
          <Card className="h-full hover:border-primary transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-5 h-5 text-cyan-500" />
                <h3 className="font-semibold">API Reference</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Explore the complete API documentation
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/docs/plugins">
          <Card className="h-full hover:border-primary transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Puzzle className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold">Plugins</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Learn about core and optional plugins
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/examples">
          <Card className="h-full hover:border-primary transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold">Examples</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                See ReactLog in action with examples
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
