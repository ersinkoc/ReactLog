import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ReactLogProvider } from '../../../src/react/provider'
import { Log, createLogWrapper } from '../../../src/react/components/log'
import { DebugPanel } from '../../../src/react/components/debug-panel'
import type { Kernel } from '../../../src/types'

describe('Log Component', () => {
  let capturedKernel: Kernel | null = null

  beforeEach(() => {
    capturedKernel = null
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function ChildComponent({ value }: { value: string }) {
    return <span data-testid="child">{value}</span>
  }

  it('should render children', () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <Log name="TestLog">
          <ChildComponent value="Hello" />
        </Log>
      </ReactLogProvider>
    )

    expect(screen.getByTestId('child').textContent).toBe('Hello')
  })

  it('should emit mount event', async () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <Log name="MountLog">
          <div>Content</div>
        </Log>
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const mountEvent = logs?.entries.find(e => e.componentName === 'MountLog' && e.event.type === 'mount')
    expect(mountEvent).toBeDefined()
  })

  it('should track props from child element', async () => {
    const { rerender } = render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <Log name="PropsLog" trackProps={true}>
          <ChildComponent value="First" />
        </Log>
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    rerender(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <Log name="PropsLog" trackProps={true}>
          <ChildComponent value="Second" />
        </Log>
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const propsEvent = logs?.entries.find(e => e.event.type === 'props-change')
    expect(propsEvent).toBeDefined()
  })

  it('should respect trackProps=false', async () => {
    const { rerender } = render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <Log name="NoPropsLog" trackProps={false}>
          <ChildComponent value="First" />
        </Log>
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    rerender(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <Log name="NoPropsLog" trackProps={false}>
          <ChildComponent value="Second" />
        </Log>
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const propsEvent = logs?.entries.find(
      e => e.event.type === 'props-change' && e.componentName === 'NoPropsLog'
    )
    expect(propsEvent).toBeUndefined()
  })

  it('should handle non-element children', () => {
    expect(() => {
      render(
        <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
          <Log name="TextLog">
            Just some text
          </Log>
        </ReactLogProvider>
      )
    }).not.toThrow()
  })
})

describe('createLogWrapper', () => {
  let capturedKernel: Kernel | null = null

  beforeEach(() => {
    capturedKernel = null
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create a wrapper with pre-configured options', async () => {
    const TrackedWrapper = createLogWrapper('PreConfigured', { trackProps: true })

    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <TrackedWrapper>
          <div>Content</div>
        </TrackedWrapper>
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    const logs = capturedKernel?.getLogs()
    const event = logs?.entries.find(e => e.componentName === 'PreConfigured')
    expect(event).toBeDefined()
  })

  it('should render children correctly', () => {
    const Wrapper = createLogWrapper('ChildWrapper')

    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <Wrapper>
          <span data-testid="wrapped">Wrapped Content</span>
        </Wrapper>
      </ReactLogProvider>
    )

    expect(screen.getByTestId('wrapped').textContent).toBe('Wrapped Content')
  })
})

describe('DebugPanel', () => {
  let capturedKernel: Kernel | null = null

  beforeEach(() => {
    capturedKernel = null
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return null without provider', () => {
    const { container } = render(<DebugPanel />)
    expect(container.firstChild).toBeNull()
  })

  it('should render when provider is present', () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <DebugPanel />
      </ReactLogProvider>
    )

    expect(screen.getByText('ReactLog')).toBeDefined()
  })

  it('should start collapsed when defaultCollapsed is true', () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <DebugPanel defaultCollapsed={true} />
      </ReactLogProvider>
    )

    expect(screen.getByText('ReactLog')).toBeDefined()
    // Should show right arrow (collapsed)
    expect(screen.getByText('\u25B6')).toBeDefined()
  })

  it('should start expanded when defaultCollapsed is false', () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <DebugPanel defaultCollapsed={false} />
      </ReactLogProvider>
    )

    // Should show down arrow (expanded)
    expect(screen.getByText('\u25BC')).toBeDefined()
  })

  it('should toggle when clicked', () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <DebugPanel defaultCollapsed={true} />
      </ReactLogProvider>
    )

    // Initially collapsed
    expect(screen.getByText('\u25B6')).toBeDefined()

    // Click to expand
    fireEvent.click(screen.getByText('ReactLog'))

    expect(screen.getByText('\u25BC')).toBeDefined()
  })

  it('should clear logs when Clear button is clicked', async () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <Log name="TestComponent">
          <div>Test</div>
        </Log>
        <DebugPanel defaultCollapsed={false} />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // Should have some logs
    const logsBeforeClear = capturedKernel?.getLogs()
    expect(logsBeforeClear?.entries.length).toBeGreaterThan(0)

    // Click clear button
    fireEvent.click(screen.getByText('Clear'))

    // Logs should be cleared
    const logsAfterClear = capturedKernel?.getLogs()
    expect(logsAfterClear?.entries.length).toBe(0)
  })

  it('should respond to keyboard shortcut', () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <DebugPanel shortcut="ctrl+shift+l" defaultCollapsed={true} />
      </ReactLogProvider>
    )

    // Initially collapsed
    expect(screen.getByText('\u25B6')).toBeDefined()

    // Trigger keyboard shortcut
    fireEvent.keyDown(window, { key: 'l', ctrlKey: true, shiftKey: true })

    // Should be expanded
    expect(screen.getByText('\u25BC')).toBeDefined()
  })

  it('should show "No logs yet" when empty', () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <DebugPanel defaultCollapsed={false} />
      </ReactLogProvider>
    )

    expect(screen.getByText('No logs yet')).toBeDefined()
  })

  it('should display logs', async () => {
    render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <Log name="DisplayTest">
          <div>Content</div>
        </Log>
        <DebugPanel defaultCollapsed={false} />
      </ReactLogProvider>
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // Should show the component name (may appear multiple times in debug panel)
    const displayTestElements = screen.getAllByText('DisplayTest')
    expect(displayTestElements.length).toBeGreaterThan(0)
  })

  it('should support different positions', () => {
    const { rerender } = render(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <DebugPanel position="top-left" />
      </ReactLogProvider>
    )

    expect(screen.getByText('ReactLog')).toBeDefined()

    rerender(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <DebugPanel position="top-right" />
      </ReactLogProvider>
    )

    expect(screen.getByText('ReactLog')).toBeDefined()

    rerender(
      <ReactLogProvider onReady={(k) => { capturedKernel = k }}>
        <DebugPanel position="bottom-left" />
      </ReactLogProvider>
    )

    expect(screen.getByText('ReactLog')).toBeDefined()
  })

  it('should return null and delegate to panelUI plugin when available', () => {
    const openFn = vi.fn()
    const closeFn = vi.fn()

    const panelUIPlugin = {
      name: 'panel-ui',
      version: '1.0.0',
      type: 'optional' as const,
      install: vi.fn(),
      uninstall: vi.fn(),
      api: {
        open: openFn,
        close: closeFn,
        isOpen: () => false,
        toggle: vi.fn(),
      },
    }

    const { container } = render(
      <ReactLogProvider plugins={[panelUIPlugin]} onReady={(k) => { capturedKernel = k }}>
        <DebugPanel defaultCollapsed={false} />
      </ReactLogProvider>
    )

    // When panelUI plugin is present, DebugPanel returns null
    // and delegates to the plugin
    expect(container.querySelector('[style*="position: fixed"]')).toBeNull()

    // The open function should have been called since defaultCollapsed is false
    expect(openFn).toHaveBeenCalled()
  })

  it('should call panelUI close when collapsed', () => {
    const openFn = vi.fn()
    const closeFn = vi.fn()

    const panelUIPlugin = {
      name: 'panel-ui',
      version: '1.0.0',
      type: 'optional' as const,
      install: vi.fn(),
      uninstall: vi.fn(),
      api: {
        open: openFn,
        close: closeFn,
        isOpen: () => false,
        toggle: vi.fn(),
      },
    }

    render(
      <ReactLogProvider plugins={[panelUIPlugin]} onReady={(k) => { capturedKernel = k }}>
        <DebugPanel defaultCollapsed={true} />
      </ReactLogProvider>
    )

    // The close function should have been called since defaultCollapsed is true
    expect(closeFn).toHaveBeenCalled()
  })
})
