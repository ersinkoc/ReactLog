import React, { useEffect, useMemo, useRef } from 'react'
import type { ReactLogProviderProps, Kernel } from '../types'
import { createKernel } from '../kernel'
import { installCorePlugins } from '../plugins/core'
import { ReactLogContext } from './context'

/**
 * Global kernel reference for programmatic API
 */
let globalKernel: Kernel | null = null

/**
 * Get the global kernel instance
 */
export function getGlobalKernel(): Kernel | null {
  return globalKernel
}

/**
 * ReactLogProvider component
 * Wraps the application and provides the kernel context
 */
export function ReactLogProvider({
  children,
  enabled = typeof window !== 'undefined',
  plugins = [],
  options = {},
  onReady,
}: ReactLogProviderProps): React.ReactElement {
  const kernelRef = useRef<Kernel | null>(null)

  // Create kernel only once
  const kernel = useMemo(() => {
    const k = createKernel({
      enabled,
      ...(options.maxLogs !== undefined && { maxLogs: options.maxLogs }),
      ...(options.logLevel !== undefined && { logLevel: options.logLevel }),
    })

    // Install core plugins
    installCorePlugins(k)

    // Install optional plugins
    for (const plugin of plugins) {
      k.register(plugin)
    }

    kernelRef.current = k
    globalKernel = k

    return k
  }, []) // Empty deps - kernel created once

  // Handle enabled prop changes
  useEffect(() => {
    if (enabled) {
      kernel.enable()
    } else {
      kernel.disable()
    }
  }, [enabled, kernel])

  // Handle options changes
  useEffect(() => {
    const config: Record<string, unknown> = {}
    if (options.maxLogs !== undefined) config['maxLogs'] = options.maxLogs
    if (options.logLevel !== undefined) config['logLevel'] = options.logLevel
    if (Object.keys(config).length > 0) {
      kernel.configure(config as Parameters<typeof kernel.configure>[0])
    }
  }, [options.maxLogs, options.logLevel, kernel])

  // Call onReady callback
  useEffect(() => {
    if (onReady && kernel.isEnabled()) {
      onReady(kernel)
    }
  }, [onReady, kernel])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (kernelRef.current) {
        kernelRef.current.disable()
        if (globalKernel === kernelRef.current) {
          globalKernel = null
        }
      }
    }
  }, [])

  return (
    <ReactLogContext.Provider value={kernel}>
      {children}
    </ReactLogContext.Provider>
  )
}
