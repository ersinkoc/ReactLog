import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { ReactLogProvider } from '../../../src/react/provider'
import { useLogContext } from '../../../src/react/context'
import type { Kernel } from '../../../src/types'

describe('ReactLogProvider', () => {
  function TestConsumer() {
    const kernel = useLogContext()
    return <div data-testid="kernel-status">{kernel.isEnabled() ? 'enabled' : 'disabled'}</div>
  }

  it('should provide kernel context to children', () => {
    render(
      <ReactLogProvider>
        <TestConsumer />
      </ReactLogProvider>
    )

    expect(screen.getByTestId('kernel-status')).toHaveTextContent('enabled')
  })

  it('should render children', () => {
    render(
      <ReactLogProvider>
        <div data-testid="child">Child content</div>
      </ReactLogProvider>
    )

    expect(screen.getByTestId('child')).toHaveTextContent('Child content')
  })

  it('should respect enabled prop', () => {
    render(
      <ReactLogProvider enabled={false}>
        <TestConsumer />
      </ReactLogProvider>
    )

    expect(screen.getByTestId('kernel-status')).toHaveTextContent('disabled')
  })

  it('should call onReady callback', () => {
    const onReady = vi.fn()

    render(
      <ReactLogProvider onReady={onReady}>
        <div>Test</div>
      </ReactLogProvider>
    )

    expect(onReady).toHaveBeenCalled()
    expect(onReady.mock.calls[0]?.[0]).toBeDefined()
  })

  it('should accept custom options', () => {
    let capturedKernel: Kernel | null = null

    render(
      <ReactLogProvider
        options={{ maxLogs: 500, logLevel: 'warn' }}
        onReady={(k) => { capturedKernel = k }}
      >
        <div>Test</div>
      </ReactLogProvider>
    )

    expect(capturedKernel?.getOptions().maxLogs).toBe(500)
    expect(capturedKernel?.getOptions().logLevel).toBe('warn')
  })

  it('should register custom plugins', () => {
    const customPlugin = {
      name: 'custom-plugin',
      version: '1.0.0',
      type: 'optional' as const,
      install: vi.fn(),
      uninstall: vi.fn(),
    }

    let capturedKernel: Kernel | null = null

    render(
      <ReactLogProvider
        plugins={[customPlugin]}
        onReady={(k) => { capturedKernel = k }}
      >
        <div>Test</div>
      </ReactLogProvider>
    )

    expect(customPlugin.install).toHaveBeenCalled()
    expect(capturedKernel?.getPlugin('custom-plugin')).toBeDefined()
  })
})
