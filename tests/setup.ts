import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock requestIdleCallback for JSDOM
if (typeof window !== 'undefined' && !window.requestIdleCallback) {
  window.requestIdleCallback = ((callback: IdleRequestCallback) => {
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => 50,
      })
    }, 1)
  }) as typeof window.requestIdleCallback
}

if (typeof window !== 'undefined' && !window.cancelIdleCallback) {
  window.cancelIdleCallback = ((id: number) => {
    clearTimeout(id)
  }) as typeof window.cancelIdleCallback
}

// Suppress console output during tests unless explicitly needed
const originalConsole = { ...console }

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'group').mockImplementation(() => {})
  vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {})
  vi.spyOn(console, 'groupEnd').mockImplementation(() => {})
  vi.spyOn(console, 'debug').mockImplementation(() => {})
  vi.spyOn(console, 'info').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

// Expose original console for tests that need it
export { originalConsole }
