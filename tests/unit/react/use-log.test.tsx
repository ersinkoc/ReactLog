import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { useState } from 'react'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { ReactLogProvider } from '../../../src/react/provider'
import { useLog } from '../../../src/react/hooks/use-log'
import type { Kernel } from '../../../src/types'

describe('useLog', () => {
  let capturedKernel: Kernel | null = null

  beforeEach(() => {
    capturedKernel = null
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function TestComponent({ name = 'TestComponent', trackProps = true, trackState = true }: {
    name?: string
    trackProps?: boolean
    trackState?: boolean
  }) {
    const { componentId, renderCount, trackProps: doTrackProps, trackState: doTrackState } = useLog(name, {
      trackProps,
      trackState,
    })

    return (
      <div>
        <span data-testid="component-id">{componentId}</span>
        <span data-testid="render-count">{renderCount}</span>
        <button data-testid="track-props" onClick={() => doTrackProps({ foo: 'bar' })}>Track Props</button>
        <button data-testid="track-state" onClick={() => doTrackState(0, 'newState')}>Track State</button>
      </div>
    )
  }

  function CounterComponent() {
    const [count, setCount] = useState(0)
    const { trackState } = useLog('Counter', { trackState: true })

    const increment = () => {
      const newCount = count + 1
      setCount(newCount)
      trackState(0, newCount)
    }

    return (
      <div>
        <span data-testid="count">{count}</span>
        <button data-testid="increment" onClick={increment}>+</button>
      </div>
    )
  }

  it('should return componentId and renderCount', () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <TestComponent />
      </ReactLogProvider>
    )

    expect(screen.getByTestId('component-id').textContent).toBeTruthy()
    expect(screen.getByTestId('render-count').textContent).toBe('1')
  })

  it('should increment renderCount on re-render', () => {
    const { rerender } = render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <TestComponent name="Test1" />
      </ReactLogProvider>
    )

    expect(screen.getByTestId('render-count').textContent).toBe('1')

    rerender(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <TestComponent name="Test1" />
      </ReactLogProvider>
    )

    expect(screen.getByTestId('render-count').textContent).toBe('2')
  })

  it('should emit mount event on component mount', async () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <TestComponent name="MountTest" />
      </ReactLogProvider>
    )

    // Wait for effect to run
    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const mountEvent = logs?.entries.find(e => e.event.type === 'mount' && e.componentName === 'MountTest')
    expect(mountEvent).toBeDefined()
  })

  it('should emit unmount event on component unmount', async () => {
    let kernelRef: Kernel | null = null

    function UnmountableComponent({ show }: { show: boolean }) {
      return show ? <TestComponent name="UnmountTest" /> : null
    }

    const { rerender } = render(
      <ReactLogProvider onReady={(k) => { kernelRef = k; capturedKernel = k }}>
        <UnmountableComponent show={true} />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // Verify mount happened
    const logsBeforeUnmount = kernelRef?.getLogs()
    const mountEvent = logsBeforeUnmount?.entries.find(e => e.event.type === 'mount' && e.componentName === 'UnmountTest')
    expect(mountEvent).toBeDefined()

    // Hide the component (unmount it without unmounting provider)
    rerender(
      <ReactLogProvider onReady={(k) => { kernelRef = k; capturedKernel = k }}>
        <UnmountableComponent show={false} />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = kernelRef?.getLogs()
    const unmountEvent = logs?.entries.find(e => e.event.type === 'unmount' && e.componentName === 'UnmountTest')
    expect(unmountEvent).toBeDefined()
  })

  it('should track props changes when trackProps is called', async () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <TestComponent name="PropsTest" trackProps={true} />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    fireEvent.click(screen.getByTestId('track-props'))

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const propsEvent = logs?.entries.find(e => e.event.type === 'props-change')
    expect(propsEvent).toBeDefined()
  })

  it('should track state changes when trackState is called', async () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <TestComponent name="StateTest" trackState={true} />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    fireEvent.click(screen.getByTestId('track-state'))

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const stateEvent = logs?.entries.find(e => e.event.type === 'state-change')
    expect(stateEvent).toBeDefined()
  })

  it('should not track props when trackProps option is false', async () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <TestComponent name="NoPropsTest" trackProps={false} />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    fireEvent.click(screen.getByTestId('track-props'))

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const propsEvent = logs?.entries.find(e => e.event.type === 'props-change')
    expect(propsEvent).toBeUndefined()
  })

  it('should not track state when trackState option is false', async () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <TestComponent name="NoStateTest" trackState={false} />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    fireEvent.click(screen.getByTestId('track-state'))

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const stateEvent = logs?.entries.find(e => e.event.type === 'state-change')
    expect(stateEvent).toBeUndefined()
  })

  it('should work without provider (returns noop functions)', () => {
    function NoProviderComponent() {
      const { componentId, renderCount, trackProps, trackState } = useLog('NoProvider')

      return (
        <div>
          <span data-testid="component-id">{componentId}</span>
          <span data-testid="render-count">{renderCount}</span>
          <button data-testid="track-props" onClick={() => trackProps({ test: 1 })}>Track</button>
          <button data-testid="track-state" onClick={() => trackState(0, 'test')}>Track State</button>
        </div>
      )
    }

    // Should not throw without provider
    expect(() => {
      render(<NoProviderComponent />)
    }).not.toThrow()

    // Functions should work without throwing
    fireEvent.click(screen.getByTestId('track-props'))
    fireEvent.click(screen.getByTestId('track-state'))
  })

  it('should emit update event on re-render after mount', async () => {
    const { rerender } = render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <TestComponent name="UpdateTest" />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    rerender(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <TestComponent name="UpdateTest" />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const updateEvent = logs?.entries.find(e => e.event.type === 'update')
    expect(updateEvent).toBeDefined()
  })

  it('should track state with Counter component', async () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <CounterComponent />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(screen.getByTestId('count').textContent).toBe('0')

    fireEvent.click(screen.getByTestId('increment'))

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(screen.getByTestId('count').textContent).toBe('1')

    const logs = capturedKernel?.getLogs()
    const stateEvents = logs?.entries.filter(e => e.event.type === 'state-change')
    expect(stateEvents?.length).toBeGreaterThanOrEqual(1)
  })

  it('should generate unique componentId for each component instance', () => {
    function MultiComponent() {
      return (
        <div>
          <TestComponent name="A" />
          <TestComponent name="B" />
        </div>
      )
    }

    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <MultiComponent />
      </ReactLogProvider>
    )

    const componentIds = screen.getAllByTestId('component-id')
    expect(componentIds[0].textContent).not.toBe(componentIds[1].textContent)
  })

  it('should not emit events when kernel is disabled', async () => {
    // When disabled, onReady won't be called, so we need another approach
    // We can test that even if events are emitted, they don't get logged when disabled
    let kernelRef: Kernel | null = null

    const { rerender } = render(
      <ReactLogProvider enabled={true} onReady={(k) => { kernelRef = k; capturedKernel = k }}>
        <div>Initial</div>
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // Clear logs and disable
    if (kernelRef) {
      const logs = kernelRef.getLogs()
      logs.entries.splice(0, logs.entries.length)
      kernelRef.disable()
    }

    // Rerender with a component while kernel is disabled
    rerender(
      <ReactLogProvider enabled={false} onReady={(k) => { kernelRef = k; capturedKernel = k }}>
        <TestComponent name="DisabledTest" />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // With kernel disabled, events shouldn't be logged
    const logs = kernelRef?.getLogs()
    const disabledEvents = logs?.entries.filter(e => e.componentName === 'DisabledTest')
    expect(disabledEvents?.length ?? 0).toBe(0)
  })
})
