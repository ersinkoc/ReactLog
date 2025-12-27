import React, { useState, useEffect } from 'react'
import { useLog } from '../../src/react/hooks/use-log'

/**
 * Simple test component with state
 */
export function TestComponent({ value }: { value: number }) {
  const [count, setCount] = useState(0)

  useLog('TestComponent', {
    trackProps: true,
    trackState: true,
  })

  return (
    <div>
      <span data-testid="value">{value}</span>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  )
}

/**
 * Component with effect
 */
export function EffectComponent({ userId }: { userId: string }) {
  const [data, setData] = useState<string | null>(null)

  useLog('EffectComponent', {
    trackProps: true,
    trackEffects: true,
  })

  useEffect(() => {
    setData(`Data for ${userId}`)
    return () => {
      setData(null)
    }
  }, [userId])

  return <div data-testid="data">{data}</div>
}

/**
 * Component that throws an error
 */
export function ErrorComponent({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

/**
 * Wrapper component for testing
 */
export function Wrapper({ children }: { children: React.ReactNode }) {
  return <div data-testid="wrapper">{children}</div>
}

/**
 * Component with multiple state hooks
 */
export function MultiStateComponent() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')
  const [flag, setFlag] = useState(false)

  useLog('MultiStateComponent', {
    trackState: true,
  })

  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="text">{text}</span>
      <span data-testid="flag">{String(flag)}</span>
      <button data-testid="inc-count" onClick={() => setCount(c => c + 1)}>Inc</button>
      <button data-testid="set-text" onClick={() => setText('hello')}>Set Text</button>
      <button data-testid="toggle-flag" onClick={() => setFlag(f => !f)}>Toggle</button>
    </div>
  )
}
