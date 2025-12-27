import React, { useEffect } from 'react'
import type { WithLogOptions } from '../../types'
import { useLog } from '../hooks/use-log'

/**
 * Higher-Order Component for adding logging to a component
 *
 * Usage:
 * ```tsx
 * const DebuggedComponent = withLog(MyComponent, {
 *   name: 'MyComponent',
 *   trackProps: true,
 *   trackState: true,
 * })
 * ```
 */
export function withLog<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithLogOptions = {}
): React.ComponentType<P> {
  const {
    name = WrappedComponent.displayName || WrappedComponent.name || 'Component',
    trackProps = true,
    trackState = true,
    trackEffects = true,
  } = options

  function WithLogComponent(props: P): React.ReactElement {
    const { trackProps: doTrackProps } = useLog(name, {
      trackProps,
      trackState,
      trackEffects,
    })

    // Track props on each render
    useEffect(() => {
      if (trackProps) {
        doTrackProps(props as Record<string, unknown>)
      }
    })

    return React.createElement(WrappedComponent, props)
  }

  // Copy static properties
  const displayName = `withLog(${name})`
  WithLogComponent.displayName = displayName

  return WithLogComponent
}

/**
 * Creates a withLog HOC with pre-configured options
 *
 * Usage:
 * ```tsx
 * const withDebugLog = createWithLog({ trackProps: true, trackState: true })
 * const DebuggedComponent = withDebugLog(MyComponent)
 * ```
 */
export function createWithLog(
  defaultOptions: Omit<WithLogOptions, 'name'> = {}
): <P extends object>(
  Component: React.ComponentType<P>,
  options?: WithLogOptions
) => React.ComponentType<P> {
  return function customWithLog<P extends object>(
    Component: React.ComponentType<P>,
    options: WithLogOptions = {}
  ) {
    return withLog(Component, { ...defaultOptions, ...options })
  }
}
