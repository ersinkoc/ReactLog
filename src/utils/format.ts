/**
 * Maximum length for formatted values before truncation
 */
const MAX_VALUE_LENGTH = 100

/**
 * Maximum depth for object stringification
 */
const MAX_DEPTH = 3

/**
 * Truncates a string to a maximum length
 *
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string with ellipsis if needed
 */
export function truncateString(str: string, maxLength: number = MAX_VALUE_LENGTH): string {
  if (str.length <= maxLength) {
    return str
  }
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Gets the type name of a value
 *
 * @param value - Value to get type of
 * @returns Type name string
 */
export function getTypeName(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (Array.isArray(value)) return 'Array'
  if (value instanceof Date) return 'Date'
  if (value instanceof RegExp) return 'RegExp'
  if (value instanceof Map) return 'Map'
  if (value instanceof Set) return 'Set'
  if (value instanceof Error) return 'Error'
  if (typeof value === 'function') return 'Function'
  if (typeof value === 'object') {
    const constructor = (value as object).constructor
    if (constructor && constructor.name && constructor.name !== 'Object') {
      return constructor.name
    }
    return 'Object'
  }
  return typeof value
}

/**
 * Formats a value for display in console or UI
 *
 * @param value - Value to format
 * @param depth - Current depth (for recursion)
 * @returns Formatted string representation
 */
export function formatValue(value: unknown, depth: number = 0): string {
  if (depth > MAX_DEPTH) {
    return '[...]'
  }

  if (value === null) return 'null'
  if (value === undefined) return 'undefined'

  if (typeof value === 'string') {
    return `"${truncateString(value, MAX_VALUE_LENGTH - 2)}"`
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (typeof value === 'bigint') {
    return `${value}n`
  }

  if (typeof value === 'symbol') {
    return value.toString()
  }

  if (typeof value === 'function') {
    const name = value.name || 'anonymous'
    return `[Function: ${name}]`
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (value instanceof RegExp) {
    return value.toString()
  }

  if (value instanceof Error) {
    return `[Error: ${value.message}]`
  }

  if (value instanceof Map) {
    const entries = Array.from(value.entries())
      .slice(0, 3)
      .map(([k, v]) => `${formatValue(k, depth + 1)} => ${formatValue(v, depth + 1)}`)
      .join(', ')
    const more = value.size > 3 ? `, ... +${value.size - 3}` : ''
    return `Map(${value.size}) { ${entries}${more} }`
  }

  if (value instanceof Set) {
    const values = Array.from(value)
      .slice(0, 3)
      .map((v) => formatValue(v, depth + 1))
      .join(', ')
    const more = value.size > 3 ? `, ... +${value.size - 3}` : ''
    return `Set(${value.size}) { ${values}${more} }`
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    if (depth >= MAX_DEPTH) return `[...${value.length}]`

    const items = value
      .slice(0, 5)
      .map((v) => formatValue(v, depth + 1))
      .join(', ')
    const more = value.length > 5 ? `, ... +${value.length - 5}` : ''
    return `[${items}${more}]`
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj)

    if (keys.length === 0) return '{}'
    if (depth >= MAX_DEPTH) return `{...${keys.length}}`

    const pairs = keys
      .slice(0, 5)
      .map((k) => `${k}: ${formatValue(obj[k], depth + 1)}`)
      .join(', ')
    const more = keys.length > 5 ? `, ... +${keys.length - 5}` : ''
    return `{ ${pairs}${more} }`
  }
  /* c8 ignore start - defensive fallback: unreachable code */
  return String(value)
}
/* c8 ignore stop */

/**
 * Formats a value with syntax highlighting info for console
 *
 * @param value - Value to format
 * @returns Object with formatted string and style
 */
export function formatValueWithStyle(value: unknown): { text: string; style: string } {
  const text = formatValue(value)
  let style = ''

  if (value === null || value === undefined) {
    style = 'color: #888'
  } else if (typeof value === 'string') {
    style = 'color: #a5d6a7'
  } else if (typeof value === 'number' || typeof value === 'bigint') {
    style = 'color: #90caf9'
  } else if (typeof value === 'boolean') {
    style = 'color: #ce93d8'
  } else if (typeof value === 'function') {
    style = 'color: #80cbc4'
  } else if (Array.isArray(value)) {
    style = 'color: #ffcc80'
  } else if (typeof value === 'object') {
    style = 'color: #fff59d'
  }

  return { text, style }
}

/**
 * Formats a change arrow for prop/state changes
 *
 * @param prev - Previous value
 * @param next - Next value
 * @returns Formatted change string
 */
export function formatChange(prev: unknown, next: unknown): string {
  return `${formatValue(prev)} → ${formatValue(next)}`
}

/**
 * Formats component name with optional ID
 *
 * @param name - Component name
 * @param id - Optional component ID
 * @returns Formatted component identifier
 */
export function formatComponentName(name: string, id?: string): string {
  if (id) {
    const shortId = id.split('-')[0] || id.slice(0, 8)
    return `${name}#${shortId}`
  }
  return name
}

/**
 * Pads a string to a minimum length
 *
 * @param str - String to pad
 * @param length - Minimum length
 * @param char - Character to use for padding
 * @returns Padded string
 */
export function padString(str: string, length: number, char: string = ' '): string {
  if (str.length >= length) return str
  return str + char.repeat(length - str.length)
}

/**
 * Formats a number with separators for readability
 *
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString()
}
