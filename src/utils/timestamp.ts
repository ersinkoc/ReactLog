/**
 * Formats a timestamp to HH:MM:SS.mmm format
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted time string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const ms = date.getMilliseconds().toString().padStart(3, '0')
  return `${hours}:${minutes}:${seconds}.${ms}`
}

/**
 * Formats a duration in milliseconds to a human-readable string
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(0)}μs`
  }
  if (ms < 1000) {
    return `${ms.toFixed(1)}ms`
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`
  }
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(1)
  return `${minutes}m ${seconds}s`
}

/**
 * Gets relative time string (e.g., "2s ago", "5m ago")
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @param now - Current timestamp (defaults to Date.now())
 * @returns Relative time string
 */
export function getRelativeTime(timestamp: number, now: number = Date.now()): string {
  const diff = now - timestamp

  if (diff < 1000) {
    return 'just now'
  }
  if (diff < 60000) {
    const seconds = Math.floor(diff / 1000)
    return `${seconds}s ago`
  }
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}m ago`
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  }
  const days = Math.floor(diff / 86400000)
  return `${days}d ago`
}

/**
 * Gets time elapsed since a start time
 *
 * @param startTime - Start timestamp in milliseconds
 * @param now - Current timestamp (defaults to Date.now())
 * @returns Elapsed time in milliseconds
 */
export function getElapsedTime(startTime: number, now: number = Date.now()): number {
  return now - startTime
}

/**
 * Formats elapsed time to a display string
 *
 * @param startTime - Start timestamp in milliseconds
 * @param now - Current timestamp (defaults to Date.now())
 * @returns Formatted elapsed time string
 */
export function formatElapsedTime(startTime: number, now: number = Date.now()): string {
  return formatDuration(getElapsedTime(startTime, now))
}
