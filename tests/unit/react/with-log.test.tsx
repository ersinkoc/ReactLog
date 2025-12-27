import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { ReactLogProvider } from '../../../src/react/provider'
import { withLog, createWithLog } from '../../../src/react/hoc/with-log'
import type { Kernel } from '../../../src/types'

describe('withLog HOC', () => {
  let capturedKernel: Kernel | null = null

  beforeEach(() => {
    capturedKernel = null
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function SimpleComponent({ message }: { message: string }) {
    return <div data-testid="message">{message}</div>
  }

  function NamedComponent({ value }: { value: number }) {
    return <span data-testid="value">{value}</span>
  }
  NamedComponent.displayName = 'NamedComponent'

  it('should wrap component and render it', () => {
    const WrappedComponent = withLog(SimpleComponent)

    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <WrappedComponent message="Hello" />
      </ReactLogProvider>
    )

    expect(screen.getByTestId('message').textContent).toBe('Hello')
  })

  it('should pass props to wrapped component', () => {
    const WrappedComponent = withLog(NamedComponent)

    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <WrappedComponent value={42} />
      </ReactLogProvider>
    )

    expect(screen.getByTestId('value').textContent).toBe('42')
  })

  it('should use custom name option', async () => {
    const WrappedComponent = withLog(SimpleComponent, { name: 'CustomName' })

    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <WrappedComponent message="Test" />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const hasCustomName = logs?.entries.some(e => e.componentName === 'CustomName')
    expect(hasCustomName).toBe(true)
  })

  it('should use component displayName as default name', async () => {
    const WrappedComponent = withLog(NamedComponent)

    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <WrappedComponent value={1} />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const hasDisplayName = logs?.entries.some(e => e.componentName === 'NamedComponent')
    expect(hasDisplayName).toBe(true)
  })

  it('should set displayName on wrapped component', () => {
    const WrappedComponent = withLog(SimpleComponent, { name: 'TestName' })
    expect(WrappedComponent.displayName).toBe('withLog(TestName)')
  })

  it('should track props when trackProps is true', async () => {
    const WrappedComponent = withLog(SimpleComponent, {
      name: 'PropsTracked',
      trackProps: true,
    })

    const { rerender } = render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <WrappedComponent message="First" />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    rerender(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <WrappedComponent message="Second" />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const propsEvent = logs?.entries.find(e => e.event.type === 'props-change')
    expect(propsEvent).toBeDefined()
  })

  it('should not track props when trackProps is false', async () => {
    const WrappedComponent = withLog(SimpleComponent, {
      name: 'NoPropsTracked',
      trackProps: false,
    })

    const { rerender } = render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <WrappedComponent message="First" />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    rerender(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <WrappedComponent message="Second" />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const propsEvent = logs?.entries.find(
      e => e.event.type === 'props-change' && e.componentName === 'NoPropsTracked'
    )
    expect(propsEvent).toBeUndefined()
  })

  it('should emit mount event', async () => {
    const WrappedComponent = withLog(SimpleComponent, { name: 'MountHOC' })

    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <WrappedComponent message="Test" />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const mountEvent = logs?.entries.find(
      e => e.event.type === 'mount' && e.componentName === 'MountHOC'
    )
    expect(mountEvent).toBeDefined()
  })
})

describe('createWithLog', () => {
  let capturedKernel: Kernel | null = null

  beforeEach(() => {
    capturedKernel = null
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function TestComponent({ text }: { text: string }) {
    return <div data-testid="text">{text}</div>
  }

  it('should create HOC factory with default options', () => {
    const withDebugLog = createWithLog({ trackProps: true, trackState: false })
    const WrappedComponent = withDebugLog(TestComponent)

    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <WrappedComponent text="Hello" />
      </ReactLogProvider>
    )

    expect(screen.getByTestId('text').textContent).toBe('Hello')
  })

  it('should allow overriding default options', async () => {
    const withDebugLog = createWithLog({ trackProps: false })
    const WrappedComponent = withDebugLog(TestComponent, {
      name: 'OverrideTest',
      trackProps: true,
    })

    const { rerender } = render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <WrappedComponent text="First" />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    rerender(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <WrappedComponent text="Second" />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const propsEvent = logs?.entries.find(
      e => e.event.type === 'props-change' && e.componentName === 'OverrideTest'
    )
    expect(propsEvent).toBeDefined()
  })

  it('should set displayName correctly', () => {
    const withDebugLog = createWithLog()
    const WrappedComponent = withDebugLog(TestComponent, { name: 'CustomFactory' })

    expect(WrappedComponent.displayName).toBe('withLog(CustomFactory)')
  })
})
