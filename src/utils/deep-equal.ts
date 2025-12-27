/**
 * Checks if a value is an object (not null, not array)
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Checks if a value is a Date object
 */
function isDate(value: unknown): value is Date {
  return value instanceof Date
}

/**
 * Checks if a value is a RegExp object
 */
function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp
}

/**
 * Checks if a value is a Map
 */
function isMap(value: unknown): value is Map<unknown, unknown> {
  return value instanceof Map
}

/**
 * Checks if a value is a Set
 */
function isSet(value: unknown): value is Set<unknown> {
  return value instanceof Set
}

/**
 * Deeply compares two values for equality
 * Handles primitives, objects, arrays, Date, RegExp, Map, Set
 * Also handles circular references
 *
 * @param a - First value
 * @param b - Second value
 * @param seen - WeakMap for tracking circular references
 * @returns true if values are deeply equal
 */
export function deepEqual(
  a: unknown,
  b: unknown,
  seen: WeakMap<object, unknown> = new WeakMap()
): boolean {
  // Identical values
  if (a === b) {
    return true
  }

  // NaN check
  if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) {
    return true
  }

  // Null or undefined
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

  // At this point, both are objects

  // Check for circular reference
  if (seen.has(a as object)) {
    return seen.get(a as object) === b
  }

  // Date comparison
  if (isDate(a) && isDate(b)) {
    return a.getTime() === b.getTime()
  }
  if (isDate(a) || isDate(b)) {
    return false
  }

  // RegExp comparison
  if (isRegExp(a) && isRegExp(b)) {
    return a.source === b.source && a.flags === b.flags
  }
  if (isRegExp(a) || isRegExp(b)) {
    return false
  }

  // Map comparison
  if (isMap(a) && isMap(b)) {
    if (a.size !== b.size) {
      return false
    }
    seen.set(a, b)
    for (const [key, value] of a) {
      if (!b.has(key) || !deepEqual(value, b.get(key), seen)) {
        return false
      }
    }
    return true
  }
  if (isMap(a) || isMap(b)) {
    return false
  }

  // Set comparison
  if (isSet(a) && isSet(b)) {
    if (a.size !== b.size) {
      return false
    }
    seen.set(a, b)
    for (const value of a) {
      let found = false
      for (const bValue of b) {
        if (deepEqual(value, bValue, seen)) {
          found = true
          break
        }
      }
      if (!found) {
        return false
      }
    }
    return true
  }
  if (isSet(a) || isSet(b)) {
    return false
  }

  // Array comparison
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false
    }
    seen.set(a, b)
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], seen)) {
        return false
      }
    }
    return true
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    return false
  }

  // Object comparison
  if (isObject(a) && isObject(b)) {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) {
      return false
    }

    seen.set(a, b)

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false
      }
      if (!deepEqual(a[key], b[key], seen)) {
        return false
      }
    }

    return true
  }
  /* c8 ignore start - defensive fallback: unreachable code */
  return false
}
/* c8 ignore stop */
