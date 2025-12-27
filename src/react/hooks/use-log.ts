import { useEffect, useRef, useCallback } from 'react'
import type { UseLogOptions, MountEvent, UnmountEvent, UpdateEvent, PropsChangeEvent, StateChangeEvent } from '../../types'
import { useOptionalLogContext } from '../context'
import { generateUID, diffProps } from '../../utils'

/**
 * Internal state for tracking component lifecycle
 */
interface LogState {
  componentId: string
  renderCount: number
  mountTime: number
  prevProps: Record<string, unknown>
  prevState: unknown[]
}

/**
 * useLog hook for tracking component lifecycle
 *
 * @param name - Component name for logging
 * @param options - Tracking options
 * @returns Tracking utilities
 */
export function useLog(
  name: string,
  options: UseLogOptions = {}
): {
  componentId: string
  renderCount: number
  trackProps: (props: Record<string, unknown>) => void
  trackState: (hookIndex: number, state: unknown) => void
} {
  const kernel = useOptionalLogContext()
  const stateRef = useRef<LogState | null>(null)
  const isMountedRef = useRef(false)
  const strictModeFixRef = useRef(false)

  // Initialize state on first render
  if (!stateRef.current) {
    stateRef.current = {
      componentId: generateUID(),
      renderCount: 0,
      mountTime: Date.now(),
      prevProps: {},
      prevState: [],
    }
  }

  const state = stateRef.current
  state.renderCount++

  const {
    trackProps: shouldTrackProps = true,
    trackState: shouldTrackState = true,
  } = options

  // Track mount/unmount
  useEffect(() => {
    if (!kernel || !kernel.isEnabled()) return undefined

    // Handle StrictMode double-invoke
    if (strictModeFixRef.current) {
      strictModeFixRef.current = false
      return undefined
    }

    isMountedRef.current = true

    // Emit mount event
    const mountEvent: MountEvent = {
      type: 'mount',
      componentId: state.componentId,
      componentName: name,
      timestamp: state.mountTime,
      props: { ...state.prevProps },
      initialState: {},
    }
    kernel.emit(mountEvent)

    return () => {
      isMountedRef.current = false
      strictModeFixRef.current = true

      // In StrictMode, cleanup runs immediately after mount
      // Use setTimeout to detect if this is a real unmount
      // The check will run after any potential remount
      setTimeout(() => {
        if (!isMountedRef.current) {
          const unmountEvent: UnmountEvent = {
            type: 'unmount',
            componentId: state.componentId,
            componentName: name,
            timestamp: Date.now(),
            lifetime: Date.now() - state.mountTime,
          }
          kernel.emit(unmountEvent)
        }
      }, 0)
    }
  }, [kernel, name, state])

  // Track updates (after initial render)
  useEffect(() => {
    if (!kernel || !kernel.isEnabled()) return
    if (state.renderCount <= 1) return // Skip first render

    const updateEvent: UpdateEvent = {
      type: 'update',
      componentId: state.componentId,
      componentName: name,
      timestamp: Date.now(),
      reason: 'props', // Will be refined based on what changed
      renderCount: state.renderCount,
    }
    kernel.emit(updateEvent)
  })

  // Track props function
  const trackProps = useCallback(
    (props: Record<string, unknown>) => {
      if (!kernel || !kernel.isEnabled() || !shouldTrackProps) return

      const changes = diffProps(state.prevProps, props)
      if (changes.length > 0) {
        const propsEvent: PropsChangeEvent = {
          type: 'props-change',
          componentId: state.componentId,
          componentName: name,
          timestamp: Date.now(),
          changes,
        }
        kernel.emit(propsEvent)
      }

      state.prevProps = { ...props }
    },
    [kernel, name, state, shouldTrackProps]
  )

  // Track state function
  const trackState = useCallback(
    (hookIndex: number, newState: unknown) => {
      if (!kernel || !kernel.isEnabled() || !shouldTrackState) return

      const prevState = state.prevState[hookIndex]
      if (prevState !== newState) {
        const stateEvent: StateChangeEvent = {
          type: 'state-change',
          componentId: state.componentId,
          componentName: name,
          timestamp: Date.now(),
          hookIndex,
          hookType: 'useState',
          prevState,
          nextState: newState,
        }
        kernel.emit(stateEvent)

        state.prevState[hookIndex] = newState
      }
    },
    [kernel, name, state, shouldTrackState]
  )

  return {
    componentId: state.componentId,
    renderCount: state.renderCount,
    trackProps,
    trackState,
  }
}
