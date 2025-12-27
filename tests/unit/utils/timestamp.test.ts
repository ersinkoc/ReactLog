import { describe, it, expect } from 'vitest'
import {
  formatTimestamp,
  formatDuration,
  getRelativeTime,
  getElapsedTime,
  formatElapsedTime,
} from '../../../src/utils/timestamp'

describe('formatTimestamp', () => {
  it('should format timestamp to HH:MM:SS.mmm', () => {
    // Create a specific timestamp
    const date = new Date('2024-01-15T14:30:45.123')
    const result = formatTimestamp(date.getTime())

    // Should contain hours, minutes, seconds, and milliseconds
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3}$/)
    expect(result).toContain(':30:45.123')
  })

  it('should pad single digit values', () => {
    const date = new Date('2024-01-15T09:05:03.007')
    const result = formatTimestamp(date.getTime())

    expect(result).toContain(':05:03.007')
  })
})

describe('formatDuration', () => {
  it('should format microseconds', () => {
    expect(formatDuration(0.5)).toBe('500μs')
    expect(formatDuration(0.001)).toBe('1μs')
  })

  it('should format milliseconds', () => {
    expect(formatDuration(1)).toBe('1.0ms')
    expect(formatDuration(100)).toBe('100.0ms')
    expect(formatDuration(500.5)).toBe('500.5ms')
  })

  it('should format seconds', () => {
    expect(formatDuration(1000)).toBe('1.00s')
    expect(formatDuration(1500)).toBe('1.50s')
    expect(formatDuration(59990)).toBe('59.99s')
  })

  it('should format minutes and seconds', () => {
    expect(formatDuration(60000)).toBe('1m 0.0s')
    expect(formatDuration(90000)).toBe('1m 30.0s')
    expect(formatDuration(125500)).toBe('2m 5.5s')
  })
})

describe('getRelativeTime', () => {
  it('should return "just now" for very recent', () => {
    const now = Date.now()
    expect(getRelativeTime(now, now)).toBe('just now')
    expect(getRelativeTime(now - 500, now)).toBe('just now')
  })

  it('should return seconds ago', () => {
    const now = Date.now()
    expect(getRelativeTime(now - 1000, now)).toBe('1s ago')
    expect(getRelativeTime(now - 30000, now)).toBe('30s ago')
    expect(getRelativeTime(now - 59000, now)).toBe('59s ago')
  })

  it('should return minutes ago', () => {
    const now = Date.now()
    expect(getRelativeTime(now - 60000, now)).toBe('1m ago')
    expect(getRelativeTime(now - 120000, now)).toBe('2m ago')
    expect(getRelativeTime(now - 3599000, now)).toBe('59m ago')
  })

  it('should return hours ago', () => {
    const now = Date.now()
    expect(getRelativeTime(now - 3600000, now)).toBe('1h ago')
    expect(getRelativeTime(now - 7200000, now)).toBe('2h ago')
    expect(getRelativeTime(now - 86399000, now)).toBe('23h ago')
  })

  it('should return days ago', () => {
    const now = Date.now()
    expect(getRelativeTime(now - 86400000, now)).toBe('1d ago')
    expect(getRelativeTime(now - 172800000, now)).toBe('2d ago')
  })

  it('should use current time as default', () => {
    const recentTimestamp = Date.now() - 500
    expect(getRelativeTime(recentTimestamp)).toBe('just now')
  })
})

describe('getElapsedTime', () => {
  it('should calculate elapsed time', () => {
    const now = Date.now()
    const startTime = now - 5000

    expect(getElapsedTime(startTime, now)).toBe(5000)
  })

  it('should use current time as default', () => {
    const startTime = Date.now() - 100
    const elapsed = getElapsedTime(startTime)

    expect(elapsed).toBeGreaterThanOrEqual(100)
    expect(elapsed).toBeLessThan(200)
  })
})

describe('formatElapsedTime', () => {
  it('should format elapsed time as duration', () => {
    const now = Date.now()
    const startTime = now - 5000

    expect(formatElapsedTime(startTime, now)).toBe('5.00s')
  })

  it('should format milliseconds', () => {
    const now = Date.now()
    const startTime = now - 500

    expect(formatElapsedTime(startTime, now)).toBe('500.0ms')
  })

  it('should format minutes', () => {
    const now = Date.now()
    const startTime = now - 90000

    expect(formatElapsedTime(startTime, now)).toBe('1m 30.0s')
  })

  it('should use current time as default', () => {
    const startTime = Date.now() - 100
    const result = formatElapsedTime(startTime)

    expect(result).toMatch(/\d+\.\dms/)
  })
})
