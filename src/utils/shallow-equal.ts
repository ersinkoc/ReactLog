/**
 * Performs a shallow equality comparison between two values
 * For objects, checks if all top-level properties are equal using ===
 * For arrays, checks if all elements are equal using ===
 *
 * @param a - First value
 * @param b - Second value
 * @returns true if values are shallowly equal
 */
export function shallowEqual(a: unknown, b: unknown): boolean {
  // Identical values
  if (a === b) {
    return true
  }

  // NaN check
  if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) {
    return true
  }

  // Null or undefined check
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b
  }

  // Different types
  if (typeof a !== typeof b) {
    return false
  }

  // Primitives
  if (typeof a !== 'object') {
    return a === b
  }

  // Array comparison
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false
      }
    }
    return true
  }

  // One is array, other is not
  if (Array.isArray(a) || Array.isArray(b)) {
    return false
  }

  // Object comparison
  const objA = a as Record<string, unknown>
  const objB = b as Record<string, unknown>
  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || objA[key] !== objB[key]) {
      return false
    }
  }

  return true
}

/**
 * Performs a shallow equality comparison for React props
 * Same as shallowEqual but with slightly different semantics for React
 *
 * @param prevProps - Previous props object
 * @param nextProps - Next props object
 * @returns true if props are shallowly equal
 */
export function shallowEqualProps(
  prevProps: Record<string, unknown>,
  nextProps: Record<string, unknown>
): boolean {
  return shallowEqual(prevProps, nextProps)
}
