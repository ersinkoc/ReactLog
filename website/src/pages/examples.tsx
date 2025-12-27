import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"

const examples = {
  counter: {
    title: "Basic Counter",
    description: "A simple counter demonstrating state change tracking and update events.",
    code: `import { useState } from 'react'
import { useLog } from '@oxog/reactlog'

function Counter({ initialValue = 0 }) {
  const [count, setCount] = useState(initialValue)

  useLog('Counter', {
    props: { initialValue },
    state: { count },
  })

  return (
    <div className="counter">
      <span>{count}</span>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={() => setCount(c => c - 1)}>-</button>
    </div>
  )
}`,
    output: [
      { type: "mount", text: "▶ MOUNT Counter", time: "12:00:00.000" },
      { type: "props", text: "  ├─ Props: { initialValue: 0 }", time: "" },
      { type: "state", text: "▶ STATE Counter [0] 0 → 1", time: "12:00:01.234" },
      { type: "update", text: "▶ UPDATE Counter (state-change, render #2)", time: "" },
    ],
  },
  todo: {
    title: "Todo List",
    description: "Shows state tracking for arrays and child component lifecycle.",
    code: `function TodoList() {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')

  useLog('TodoList', { state: { todos, input } })

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: input,
        done: false
      }])
      setInput('')
    }
  }

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add todo..."
      />
      <button onClick={addTodo}>Add</button>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  )
}

function TodoItem({ todo }) {
  useLog('TodoItem', { props: { todo } })
  return <div>{todo.text}</div>
}`,
    output: [
      { type: "mount", text: "▶ MOUNT TodoList", time: "12:00:00.000" },
      { type: "state", text: '▶ STATE TodoList [1] "" → "Buy milk"', time: "" },
      { type: "update", text: "▶ UPDATE TodoList (state-change, render #2)", time: "" },
      { type: "state", text: "▶ STATE TodoList [0] [] → [{...}]", time: "" },
      { type: "mount", text: "▶ MOUNT TodoItem", time: "12:00:01.456" },
    ],
  },
  async: {
    title: "Async Data Fetching",
    description: "Effect tracking with data loading states.",
    code: `function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useLog('UserProfile', {
    props: { userId },
    state: { user, loading, error },
    trackEffects: true,
  })

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        setUser(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [userId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  return <div>{user.name}</div>
}`,
    output: [
      { type: "mount", text: "▶ MOUNT UserProfile", time: "12:00:00.000" },
      { type: "props", text: "  ├─ Props: { userId: 123 }", time: "" },
      { type: "effect", text: "▶ EFFECT UserProfile [0] ran", time: "" },
      { type: "state", text: "▶ STATE UserProfile [0] null → { name: 'John', ... }", time: "" },
      { type: "state", text: "▶ STATE UserProfile [1] true → false", time: "" },
      { type: "update", text: "▶ UPDATE UserProfile (state-change, render #2)", time: "" },
    ],
  },
}

export function ExamplesPage() {
  const [activeTab, setActiveTab] = useState("counter")

  const getConsoleClass = (type: string) => {
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

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Examples</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See ReactLog in action with these interactive examples. Each example
            shows the code and the expected console output.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="counter">Counter</TabsTrigger>
            <TabsTrigger value="todo">Todo List</TabsTrigger>
            <TabsTrigger value="async">Async Data</TabsTrigger>
          </TabsList>

          {Object.entries(examples).map(([key, example]) => (
            <TabsContent key={key} value={key}>
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{example.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {example.description}
                  </p>
                  <CodeBlock code={example.code} language="tsx" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Console Output</h3>
                  <p className="text-muted-foreground mb-4">
                    What you'll see in the console:
                  </p>

                  <div className="code-block p-4 font-mono text-sm leading-relaxed">
                    {example.output.map((line, index) => (
                      <div key={index} className={getConsoleClass(line.type)}>
                        {line.text}
                        {line.time && (
                          <span className="console-time ml-2">{line.time}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-12 text-center">
          <Button asChild>
            <a
              href="https://github.com/ersinkoc/reactlog/tree/main/examples"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-4 h-4 mr-2" />
              View More Examples on GitHub
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
