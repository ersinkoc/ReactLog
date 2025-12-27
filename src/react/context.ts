import { createContext, useContext } from 'react'
import type { Kernel } from '../types'

/**
 * React context for ReactLog kernel
 */
export const ReactLogContext = createContext<Kernel | null>(null)

/**
 * Hook to access the ReactLog kernel from context
 *
 * @returns The kernel instance
 * @throws Error if used outside of ReactLogProvider
 */
export function useLogContext(): Kernel {
  const kernel = useContext(ReactLogContext)
  if (!kernel) {
    throw new Error('useLogContext must be used within a ReactLogProvider')
  }
  return kernel
}

/**
 * Hook to optionally access the ReactLog kernel from context
 * Returns null if not within a provider (doesn't throw)
 *
 * @returns The kernel instance or null
 */
export function useOptionalLogContext(): Kernel | null {
  return useContext(ReactLogContext)
}
