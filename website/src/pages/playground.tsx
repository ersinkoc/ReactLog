import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "@/components/code-block"
import { RefreshCw, Copy, Settings, Terminal, Filter, Play, Pause } from "lucide-react"

interface LogEntry {
  id: number
  type: string
  text: string
  time: string
}

export function PlaygroundPage() {
  const [mounted, setMounted] = useState(true)
  const [count, setCount] = useState(0)
  const [renderCount, setRenderCount] = useState(1)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logId, setLogId] = useState(0)

  const [config, setConfig] = useState({
    enabled: true,
    logLevel: "debug",
    maxLogs: 100,
  })

  const [consoleOptions, setConsoleOptions] = useState({
    colors: true,
    timestamp: true,
    showProps: true,
    showState: true,
    showEffects: true,
  })

  const addLog = useCallback((type: string, text: string) => {
    if (!config.enabled) return
    const time = new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + String(Date.now() % 1000).padStart(3, "0")
    setLogId((prev) => {
      const newId = prev + 1
      setLogs((prevLogs) => {
        const newLogs = [...prevLogs, { id: newId, type, text, time }]
        return newLogs.slice(-config.maxLogs)
      })
      return newId
    })
  }, [config.enabled, config.maxLogs])

  const handleMount = () => {
    setMounted(true)
    setCount(0)
    setRenderCount(1)
    addLog("mount", "▶ MOUNT Counter")
    if (consoleOptions.showProps) {
      addLog("props", "  ├─ Props: { initialValue: 0 }")
    }
    if (consoleOptions.showEffects) {
      addLog("effect", "▶ EFFECT Counter [0] ran")
    }
  }

  const handleUnmount = () => {
    if (consoleOptions.showEffects) {
      addLog("effect", "▶ EFFECT CLEANUP Counter [0] (unmount)")
    }
    addLog("unmount", `▶ UNMOUNT Counter (lifetime: ${renderCount * 500}ms)`)
    setMounted(false)
  }

  const increment = () => {
    if (!mounted) return
    const prev = count
    setCount(count + 1)
    setRenderCount(renderCount + 1)
    if (consoleOptions.showState) {
      addLog("state", `▶ STATE Counter [0] ${prev} → ${prev + 1}`)
    }
    addLog("update", `▶ UPDATE Counter (state-change, render #${renderCount + 1})`)
  }

  const decrement = () => {
    if (!mounted) return
    const prev = count
    setCount(count - 1)
    setRenderCount(renderCount + 1)
    if (consoleOptions.showState) {
      addLog("state", `▶ STATE Counter [0] ${prev} → ${prev - 1}`)
    }
    addLog("update", `▶ UPDATE Counter (state-change, render #${renderCount + 1})`)
  }

  const resetDemo = () => {
    setLogs([])
    setCount(0)
    setRenderCount(1)
    handleMount()
  }

  const getConsoleClass = (type: string) => {
    if (!consoleOptions.colors) return ""
    const classes: Record<string, string> = {
      mount: "console-mount",
      unmount: "console-unmount",
      update: "console-update",
      props: "console-props",
      state: "console-state",
      effect: "console-effect",
    }
    return classes[type] || ""
  }

  const generatedCode = `import { ReactLogProvider } from '@oxog/reactlog'

<ReactLogProvider
  options={{
    enabled: ${config.enabled},
    logLevel: '${config.logLevel}',
    maxLogs: ${config.maxLogs},
  }}
>
  <App />
</ReactLogProvider>

// Configure console output
kernel.getPlugin('console-output')?.api?.configure({
  colors: ${consoleOptions.colors},
  timestamp: ${consoleOptions.timestamp},
  showProps: ${consoleOptions.showProps},
  showState: ${consoleOptions.showState},
  showEffects: ${consoleOptions.showEffects},
})`

  const copyConfig = () => {
    navigator.clipboard.writeText(generatedCode)
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Playground</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experiment with ReactLog settings and see the simulated console output in real-time.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="w-4 h-4" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Enabled</label>
                  <Button
                    size="sm"
                    variant={config.enabled ? "default" : "outline"}
                    onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                  >
                    {config.enabled ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  </Button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Log Level</label>
                  <select
                    value={config.logLevel}
                    onChange={(e) => setConfig({ ...config, logLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="debug">debug</option>
                    <option value="info">info</option>
                    <option value="warn">warn</option>
                    <option value="error">error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Logs: {config.maxLogs}</label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={config.maxLogs}
                    onChange={(e) => setConfig({ ...config, maxLogs: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Terminal className="w-4 h-4" />
                  Console Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries({
                  colors: "Show Colors",
                  timestamp: "Show Timestamps",
                  showProps: "Show Props",
                  showState: "Show State",
                  showEffects: "Show Effects",
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm">{label}</label>
                    <input
                      type="checkbox"
                      checked={consoleOptions[key as keyof typeof consoleOptions]}
                      onChange={(e) => setConsoleOptions({ ...consoleOptions, [key]: e.target.checked })}
                      className="rounded"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Demo & Console */}
          <div className="lg:col-span-2 space-y-6">
            {/* Demo Component */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Demo: Counter Component</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={resetDemo}>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      variant={mounted ? "destructive" : "default"}
                      onClick={mounted ? handleUnmount : handleMount}
                    >
                      {mounted ? "Unmount" : "Mount"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {mounted ? (
                  <div className="text-center py-4">
                    <div className="text-6xl font-bold tabular-nums mb-4">{count}</div>
                    <div className="flex items-center justify-center gap-3">
                      <Button size="lg" variant="outline" onClick={decrement}>-</Button>
                      <Button size="lg" onClick={increment}>+</Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Render count: {renderCount}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Component unmounted</p>
                    <p className="text-sm">Click "Mount" to see lifecycle events</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Console Panel */}
            <Card className="bg-[#1a1a2e] border-gray-800">
              <CardHeader className="border-b border-gray-700 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-gray-400 text-sm">Console</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" onClick={() => setLogs([])}>
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 overflow-y-auto p-4 font-mono text-sm">
                  {logs.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                      No logs yet. Interact with the component above.
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className={getConsoleClass(log.type)}>
                        {log.text}
                        {consoleOptions.timestamp && log.time && (
                          <span className="console-time ml-2">{log.time}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Generated Code */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Generated Configuration</CardTitle>
                  <Button size="sm" variant="outline" onClick={copyConfig}>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <CodeBlock code={generatedCode} language="tsx" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
