import React, { useEffect } from 'react'
import type { LogProps } from '../../types'
import { useLog } from '../hooks/use-log'

/**
 * Log component wrapper for tracking child component lifecycle
 *
 * Usage:
 * ```tsx
 * <Log name="MyComponent" trackProps trackState>
 *   <MyComponent {...props} />
 * </Log>
 * ```
 */
export function Log({
  children,
  name,
  trackProps = true,
  trackState = true,
  trackEffects = true,
  trackContext = false,
}: LogProps): React.ReactElement {
  const { trackProps: doTrackProps } = useLog(name, {
    trackProps,
    trackState,
    trackEffects,
    trackContext,
  })

  // Track props from children if it's a single element with props
  useEffect(() => {
    if (trackProps && React.isValidElement(children)) {
      const childProps = children.props as Record<string, unknown>
      doTrackProps(childProps)
    }
  })

  return <>{children}</>
}

/**
 * Creates a Log wrapper with pre-configured options
 *
 * Usage:
 * ```tsx
 * const TrackedComponent = createLogWrapper('MyComponent', { trackProps: true })
 *
 * // Later:
 * <TrackedComponent>
 *   <MyComponent />
 * </TrackedComponent>
 * ```
 */
export function createLogWrapper(
  name: string,
  options: Omit<LogProps, 'children' | 'name'> = {}
): React.FC<{ children: React.ReactNode }> {
  return function LogWrapper({ children }: { children: React.ReactNode }) {
    return (
      <Log name={name} {...options}>
        {children}
      </Log>
    )
  }
}
