import { Link } from "react-router-dom"
import {
  ArrowRight,
  Terminal,
  Sparkles,
  GitBranch,
  Settings2,
  Database,
  Zap,
  Puzzle,
  BookOpen,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "@/components/code-block"

const features = [
  {
    icon: GitBranch,
    title: "Lifecycle Tracking",
    description:
      "Track component mount, update, and unmount events with precise timing and context.",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: Settings2,
    title: "Props Monitoring",
    description:
      "Deep diff detection for prop changes with previous and next value comparison.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: Database,
    title: "State Tracking",
    description:
      "Monitor useState changes with hook index identification and value transitions.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Zap,
    title: "Effect Tracking",
    description:
      "Track useEffect runs and cleanups with dependency change detection.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Puzzle,
    title: "Plugin Architecture",
    description:
      "Micro-kernel design with core and optional plugins. Extend functionality as needed.",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    icon: Terminal,
    title: "Beautiful Output",
    description:
      "Colorized, grouped console output with timestamps and formatted values.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
]

const exampleCode = `import { ReactLogProvider, useLog } from '@oxog/reactlog'

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

// In any component
function Counter() {
  const [count, setCount] = useState(0)

  useLog('Counter', {
    props: {},
    state: { count },
    trackEffects: true,
  })

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  )
}`

export function HomePage() {
  const copyInstallCommand = () => {
    navigator.clipboard.writeText("npm install @oxog/reactlog")
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Zero Dependencies • TypeScript • Tree-Shakeable
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Debug React with
            <span className="gradient-text"> Clarity</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            A powerful React lifecycle debugger with micro-kernel plugin
            architecture. Track props, state, effects, and renders with
            beautiful console output.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" asChild>
              <Link to="/docs/getting-started">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={copyInstallCommand}
              className="font-mono text-sm"
            >
              <Terminal className="w-4 h-4 mr-2" />
              npm install @oxog/reactlog
              <Copy className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </div>

          {/* Console Demo */}
          <div className="code-block shadow-2xl max-w-3xl mx-auto text-left animate-float">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-gray-400 text-sm ml-2">Console</span>
            </div>
            <div className="p-4 bg-[#1a1a2e] font-mono text-sm leading-relaxed">
              <div>
                <span className="console-mount">▶ MOUNT</span> Counter{" "}
                <span className="console-time">12:34:56.789</span>
              </div>
              <div className="ml-4">
                <span className="console-props">├─ Props:</span> {"{"}
                initialValue: 0 {"}"}
              </div>
              <div className="mt-1">
                <span className="console-state">▶ STATE</span> Counter [0]{" "}
                <span className="text-gray-500">0</span> →{" "}
                <span className="text-white">1</span>{" "}
                <span className="console-time">12:34:57.123</span>
              </div>
              <div>
                <span className="console-update">▶ UPDATE</span> Counter{" "}
                <span className="text-gray-400">
                  (state-change, render #2)
                </span>{" "}
                <span className="console-time">12:34:57.125</span>
              </div>
              <div className="mt-1">
                <span className="console-effect">▶ EFFECT</span> Counter [0]{" "}
                <span className="text-cyan-400">ran</span>{" "}
                <span className="console-time">12:34:57.130</span>
              </div>
              <div className="mt-1">
                <span className="console-state">▶ STATE</span> Counter [0]{" "}
                <span className="text-gray-500">1</span> →{" "}
                <span className="text-white">2</span>{" "}
                <span className="console-time">12:34:58.456</span>
              </div>
              <div>
                <span className="console-update">▶ UPDATE</span> Counter{" "}
                <span className="text-gray-400">
                  (state-change, render #3)
                </span>{" "}
                <span className="console-time">12:34:58.458</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4" id="features">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive debugging tools designed for modern React
              applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="card-hover">
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Simple Setup,
                <br />
                Powerful Debugging
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Wrap your app with ReactLogProvider and start debugging
                immediately. Configure plugins and filters to match your
                workflow.
              </p>

              <ul className="space-y-4">
                {[
                  "Zero runtime dependencies - no bloat",
                  "Tree-shakeable - only include what you use",
                  "TypeScript-first with full type safety",
                  "Works with React 17, 18, and 19",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="code-block shadow-xl">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700">
                <span className="text-gray-400 text-sm">App.tsx</span>
              </div>
              <CodeBlock code={exampleCode} language="tsx" />
            </div>
          </div>
        </div>
      </section>

      {/* Plugins Section */}
      <section className="py-20 px-4" id="plugins">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Extensible Plugin System
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              5 core plugins included by default, plus 7 optional plugins for
              advanced debugging
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Core Plugins */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center">
                    <Puzzle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Core Plugins</h3>
                    <p className="text-sm text-muted-foreground">
                      Included by default
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "lifecycle-logger", desc: "Mount/unmount tracking" },
                    { name: "props-tracker", desc: "Props change detection" },
                    { name: "state-tracker", desc: "State transitions" },
                    { name: "effect-tracker", desc: "Effect lifecycle" },
                    { name: "console-output", desc: "Beautiful console logs" },
                  ].map((plugin) => (
                    <div
                      key={plugin.name}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Badge variant="secondary">{plugin.name}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {plugin.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Optional Plugins */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                    <Puzzle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Optional Plugins</h3>
                    <p className="text-sm text-muted-foreground">
                      Import as needed
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "renderTimer", desc: "Render performance metrics" },
                    { name: "renderChain", desc: "Render cascade visualization" },
                    { name: "contextTracker", desc: "Context change monitoring" },
                    { name: "errorTracker", desc: "Error boundary integration" },
                    { name: "panelUI", desc: "Visual debug panel" },
                    { name: "fileExporter", desc: "Export logs to JSON/CSV" },
                    { name: "remoteLogger", desc: "Send logs to remote endpoint" },
                  ].map((plugin) => (
                    <div
                      key={plugin.name}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Badge variant="outline">{plugin.name}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {plugin.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-violet-500/10 via-cyan-500/10 to-emerald-500/10 border-border">
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Debug Smarter?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Start using ReactLog today and gain complete visibility into
                your React application's behavior.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild>
                  <Link to="/docs">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Read the Docs
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <a
                    href="https://github.com/ersinkoc/reactlog"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    View on GitHub
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
