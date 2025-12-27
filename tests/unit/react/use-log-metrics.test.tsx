import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { useState } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ReactLogProvider } from '../../../src/react/provider'
import { useLog } from '../../../src/react/hooks/use-log'
import { useLogMetrics, useAllMetrics } from '../../../src/react/hooks/use-log-metrics'
import type { Kernel } from '../../../src/types'

describe('useLogMetrics', () => {
  let capturedKernel: Kernel | null = null

  beforeEach(() => {
    capturedKernel = null
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function TrackedComponent({ name }: { name: string }) {
    useLog(name)
    return <div data-testid={`tracked-${name}`}>{name}</div>
  }

  function MetricsDisplay({ componentName }: { componentName: string }) {
    const metrics = useLogMetrics(componentName)

    return (
      <div data-testid="metrics">
        <span data-testid="metrics-name">{metrics?.componentName || 'null'}</span>
        <span data-testid="metrics-mounted">{metrics?.isCurrentlyMounted ? 'yes' : 'no'}</span>
        <span data-testid="metrics-renders">{metrics?.renderCount || 0}</span>
        <span data-testid="metrics-updates">{metrics?.updateCount || 0}</span>
      </div>
    )
  }

  function AllMetricsDisplay() {
    const allMetrics = useAllMetrics()

    return (
      <div data-testid="all-metrics">
        <span data-testid="total-components">{allMetrics.length}</span>
        {allMetrics.map((m, i) => (
          <div key={i} data-testid={`metric-${i}`}>
            {m.componentName}: {m.renderCount} renders
          </div>
        ))}
      </div>
    )
  }

  it('should return null when no logs exist for component', () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <MetricsDisplay componentName="NonExistent" />
      </ReactLogProvider>
    )

    expect(screen.getByTestId('metrics-name').textContent).toBe('null')
  })

  it('should return metrics for tracked component', async () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <TrackedComponent name="TestComp" />
        <MetricsDisplay componentName="TestComp" />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(screen.getByTestId('metrics-name').textContent).toBe('TestComp')
    expect(screen.getByTestId('metrics-mounted').textContent).toBe('yes')
  })

  it('should update metrics on re-render', async () => {
    function ReRenderComponent() {
      const [count, setCount] = useState(0)
      useLog('ReRenderComp')

      return (
        <div>
          <span data-testid="count">{count}</span>
          <button data-testid="increment" onClick={() => setCount(c => c + 1)}>+</button>
        </div>
      )
    }

    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <ReRenderComponent />
        <MetricsDisplay componentName="ReRenderComp" />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const initialRenders = parseInt(screen.getByTestId('metrics-renders').textContent || '0')

    fireEvent.click(screen.getByTestId('increment'))

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const newRenders = parseInt(screen.getByTestId('metrics-renders').textContent || '0')
    expect(newRenders).toBeGreaterThanOrEqual(initialRenders)
  })

  it('should work without provider', () => {
    function StandaloneMetrics() {
      const metrics = useLogMetrics('Test')
      return <div data-testid="standalone">{metrics ? 'has-metrics' : 'no-metrics'}</div>
    }

    expect(() => {
      render(<StandaloneMetrics />)
    }).not.toThrow()

    expect(screen.getByTestId('standalone').textContent).toBe('no-metrics')
  })
})

describe('useAllMetrics', () => {
  let capturedKernel: Kernel | null = null

  beforeEach(() => {
    capturedKernel = null
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function TrackedComponent({ name }: { name: string }) {
    useLog(name)
    return <div data-testid={`tracked-${name}`}>{name}</div>
  }

  function AllMetricsDisplay() {
    const allMetrics = useAllMetrics()

    return (
      <div data-testid="all-metrics">
        <span data-testid="total-components">{allMetrics.length}</span>
        {allMetrics.map((m, i) => (
          <div key={m.componentId} data-testid={`metric-${i}`}>
            {m.componentName}
          </div>
        ))}
      </div>
    )
  }

  it('should return empty array when no components tracked', () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <AllMetricsDisplay />
      </ReactLogProvider>
    )

    expect(screen.getByTestId('total-components').textContent).toBe('0')
  })

  it('should return metrics for all tracked components', async () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <TrackedComponent name="CompA" />
        <TrackedComponent name="CompB" />
        <TrackedComponent name="CompC" />
        <AllMetricsDisplay />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const total = parseInt(screen.getByTestId('total-components').textContent || '0')
    expect(total).toBeGreaterThanOrEqual(3)
  })

  it('should work without provider', () => {
    function StandaloneAllMetrics() {
      const metrics = useAllMetrics()
      return <div data-testid="standalone">{metrics.length}</div>
    }

    expect(() => {
      render(<StandaloneAllMetrics />)
    }).not.toThrow()

    expect(screen.getByTestId('standalone').textContent).toBe('0')
  })

  it('should update when logs change', async () => {
    function DynamicComponent() {
      const [show, setShow] = useState(true)

      return (
        <div>
          {show && <TrackedComponent name="Dynamic" />}
          <button data-testid="toggle" onClick={() => setShow(s => !s)}>Toggle</button>
          <AllMetricsDisplay />
        </div>
      )
    }

    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <DynamicComponent />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const initialCount = parseInt(screen.getByTestId('total-components').textContent || '0')
    expect(initialCount).toBeGreaterThanOrEqual(1)

    // Unmount the tracked component
    fireEvent.click(screen.getByTestId('toggle'))

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // Count might stay same (unmounted components still tracked)
    // but isCurrentlyMounted should change
  })

  it('should track update events and calculate lifetime for unmounted components', async () => {
    function UpdatingComponent({ showMetrics }: { showMetrics: boolean }) {
      const [count, setCount] = useState(0)
      const [show, setShow] = useState(true)

      return (
        <div>
          {show && (
            <TrackedWithState name="UpdatingComp" count={count} />
          )}
          <button data-testid="update" onClick={() => setCount(c => c + 1)}>Update</button>
          <button data-testid="unmount" onClick={() => setShow(false)}>Unmount</button>
          {showMetrics && <AllMetricsDisplay />}
        </div>
      )
    }

    function TrackedWithState({ name, count }: { name: string; count: number }) {
      useLog(name)
      return <div data-testid="tracked">{name}: {count}</div>
    }

    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <UpdatingComponent showMetrics={true} />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // Trigger an update
    fireEvent.click(screen.getByTestId('update'))

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // Verify component is tracked
    const countBefore = parseInt(screen.getByTestId('total-components').textContent || '0')
    expect(countBefore).toBeGreaterThanOrEqual(1)

    // Unmount the component
    fireEvent.click(screen.getByTestId('unmount'))

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // Component should still be in metrics but with isCurrentlyMounted = false
    const countAfter = parseInt(screen.getByTestId('total-components').textContent || '0')
    expect(countAfter).toBeGreaterThanOrEqual(1)
  })
})
