import { deepEqual } from './deep-equal'
import type { PropChange } from '../types'

/**
 * Represents a change between two values
 */
export interface ValueChange {
  key: string
  prevValue: unknown
  nextValue: unknown
  type: 'added' | 'removed' | 'changed' | 'unchanged'
}

/**
 * Computes the diff between two objects
 * Returns an array of changes
 *
 * @param prev - Previous object
 * @param next - Next object
 * @returns Array of value changes
 */
export function diffObjects(
  prev: Record<string, unknown>,
  next: Record<string, unknown>
): ValueChange[] {
  const changes: ValueChange[] = []
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)])

  for (const key of allKeys) {
    const prevValue = prev[key]
    const nextValue = next[key]
    const hasPrev = Object.prototype.hasOwnProperty.call(prev, key)
    const hasNext = Object.prototype.hasOwnProperty.call(next, key)

    if (!hasPrev && hasNext) {
      changes.push({
        key,
        prevValue: undefined,
        nextValue,
        type: 'added',
      })
    } else if (hasPrev && !hasNext) {
      changes.push({
        key,
        prevValue,
        nextValue: undefined,
        type: 'removed',
      })
    } else if (!deepEqual(prevValue, nextValue)) {
      changes.push({
        key,
        prevValue,
        nextValue,
        type: 'changed',
      })
    }
  }

  return changes
}

/**
 * Computes the diff between two arrays
 * Returns information about what changed
 *
 * @param prev - Previous array
 * @param next - Next array
 * @returns Object describing the changes
 */
export function diffArrays(
  prev: unknown[],
  next: unknown[]
): {
  added: { index: number; value: unknown }[]
  removed: { index: number; value: unknown }[]
  changed: { index: number; prevValue: unknown; nextValue: unknown }[]
  unchanged: { index: number; value: unknown }[]
} {
  const result = {
    added: [] as { index: number; value: unknown }[],
    removed: [] as { index: number; value: unknown }[],
    changed: [] as { index: number; prevValue: unknown; nextValue: unknown }[],
    unchanged: [] as { index: number; value: unknown }[],
  }

  const maxLength = Math.max(prev.length, next.length)

  for (let i = 0; i < maxLength; i++) {
    const hasPrev = i < prev.length
    const hasNext = i < next.length
    const prevValue = prev[i]
    const nextValue = next[i]

    if (!hasPrev && hasNext) {
      result.added.push({ index: i, value: nextValue })
    } else if (hasPrev && !hasNext) {
      result.removed.push({ index: i, value: prevValue })
    } else if (!deepEqual(prevValue, nextValue)) {
      result.changed.push({ index: i, prevValue, nextValue })
    } else {
      result.unchanged.push({ index: i, value: prevValue })
    }
  }

  return result
}

/**
 * Computes prop changes for ReactLog events
 *
 * @param prev - Previous props
 * @param next - Next props
 * @returns Array of PropChange objects
 */
export function diffProps(
  prev: Record<string, unknown>,
  next: Record<string, unknown>
): PropChange[] {
  const changes: PropChange[] = []
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)])

  for (const key of allKeys) {
    const prevValue = prev[key]
    const nextValue = next[key]
    const hasPrev = Object.prototype.hasOwnProperty.call(prev, key)
    const hasNext = Object.prototype.hasOwnProperty.call(next, key)

    // Only report if there's an actual change
    if (hasPrev !== hasNext || prevValue !== nextValue) {
      const isDeepEq = deepEqual(prevValue, nextValue)
      if (!isDeepEq || hasPrev !== hasNext) {
        changes.push({
          key,
          prevValue: hasPrev ? prevValue : undefined,
          nextValue: hasNext ? nextValue : undefined,
          isDeepEqual: isDeepEq,
        })
      }
    }
  }

  return changes
}

/**
 * Finds which dependency indices changed between two dependency arrays
 *
 * @param prevDeps - Previous dependencies array
 * @param nextDeps - Next dependencies array
 * @returns Array of indices that changed
 */
export function findChangedDependencies(
  prevDeps: unknown[],
  nextDeps: unknown[]
): number[] {
  const changed: number[] = []
  const maxLength = Math.max(prevDeps.length, nextDeps.length)

  for (let i = 0; i < maxLength; i++) {
    const prevValue = prevDeps[i]
    const nextValue = nextDeps[i]

    // Use Object.is for comparison (same as React)
    if (!Object.is(prevValue, nextValue)) {
      changed.push(i)
    }
  }

  return changed
}
