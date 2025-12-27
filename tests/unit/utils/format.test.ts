import { describe, it, expect } from 'vitest'
import {
  truncateString,
  getTypeName,
  formatValue,
  formatValueWithStyle,
  formatChange,
  formatComponentName,
  padString,
  formatNumber,
} from '../../../src/utils/format'

describe('truncateString', () => {
  it('should not truncate short strings', () => {
    expect(truncateString('hello', 10)).toBe('hello')
  })

  it('should truncate long strings with ellipsis', () => {
    expect(truncateString('hello world', 8)).toBe('hello...')
  })

  it('should handle exact length', () => {
    expect(truncateString('hello', 5)).toBe('hello')
  })

  it('should use default max length', () => {
    const longString = 'a'.repeat(150)
    const result = truncateString(longString)
    expect(result.length).toBe(100)
    expect(result.endsWith('...')).toBe(true)
  })
})

describe('getTypeName', () => {
  it('should identify null', () => {
    expect(getTypeName(null)).toBe('null')
  })

  it('should identify undefined', () => {
    expect(getTypeName(undefined)).toBe('undefined')
  })

  it('should identify arrays', () => {
    expect(getTypeName([])).toBe('Array')
    expect(getTypeName([1, 2, 3])).toBe('Array')
  })

  it('should identify Date', () => {
    expect(getTypeName(new Date())).toBe('Date')
  })

  it('should identify RegExp', () => {
    expect(getTypeName(/test/)).toBe('RegExp')
  })

  it('should identify Map', () => {
    expect(getTypeName(new Map())).toBe('Map')
  })

  it('should identify Set', () => {
    expect(getTypeName(new Set())).toBe('Set')
  })

  it('should identify Error', () => {
    expect(getTypeName(new Error('test'))).toBe('Error')
  })

  it('should identify functions', () => {
    expect(getTypeName(() => {})).toBe('Function')
    expect(getTypeName(function test() {})).toBe('Function')
  })

  it('should identify plain objects', () => {
    expect(getTypeName({})).toBe('Object')
  })

  it('should identify custom class instances', () => {
    class MyClass {}
    expect(getTypeName(new MyClass())).toBe('MyClass')
  })

  it('should identify primitives', () => {
    expect(getTypeName('string')).toBe('string')
    expect(getTypeName(123)).toBe('number')
    expect(getTypeName(true)).toBe('boolean')
    expect(getTypeName(Symbol('test'))).toBe('symbol')
    expect(getTypeName(BigInt(123))).toBe('bigint')
  })
})

describe('formatValue', () => {
  it('should format null', () => {
    expect(formatValue(null)).toBe('null')
  })

  it('should format undefined', () => {
    expect(formatValue(undefined)).toBe('undefined')
  })

  it('should format strings with quotes', () => {
    expect(formatValue('hello')).toBe('"hello"')
  })

  it('should truncate long strings', () => {
    const longString = 'a'.repeat(200)
    const result = formatValue(longString)
    expect(result.length).toBeLessThan(150)
    expect(result.endsWith('..."')).toBe(true)
  })

  it('should format numbers', () => {
    expect(formatValue(123)).toBe('123')
    expect(formatValue(3.14)).toBe('3.14')
  })

  it('should format booleans', () => {
    expect(formatValue(true)).toBe('true')
    expect(formatValue(false)).toBe('false')
  })

  it('should format bigints', () => {
    expect(formatValue(BigInt(123))).toBe('123n')
  })

  it('should format symbols', () => {
    expect(formatValue(Symbol('test'))).toBe('Symbol(test)')
  })

  it('should format functions', () => {
    expect(formatValue(() => {})).toBe('[Function: anonymous]')
    expect(formatValue(function test() {})).toBe('[Function: test]')
  })

  it('should format Date', () => {
    const date = new Date('2024-01-01T00:00:00.000Z')
    expect(formatValue(date)).toBe('2024-01-01T00:00:00.000Z')
  })

  it('should format RegExp', () => {
    expect(formatValue(/test/gi)).toBe('/test/gi')
  })

  it('should format Error', () => {
    expect(formatValue(new Error('test message'))).toBe('[Error: test message]')
  })

  it('should format Map', () => {
    const map = new Map([['a', 1], ['b', 2]])
    const result = formatValue(map)
    expect(result).toContain('Map(2)')
    expect(result).toContain('"a" => 1')
  })

  it('should format large Map with ellipsis', () => {
    const map = new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 5]])
    const result = formatValue(map)
    expect(result).toContain('... +2')
  })

  it('should format Set', () => {
    const set = new Set([1, 2, 3])
    const result = formatValue(set)
    expect(result).toContain('Set(3)')
  })

  it('should format large Set with ellipsis', () => {
    const set = new Set([1, 2, 3, 4, 5])
    const result = formatValue(set)
    expect(result).toContain('... +2')
  })

  it('should format empty arrays', () => {
    expect(formatValue([])).toBe('[]')
  })

  it('should format arrays', () => {
    expect(formatValue([1, 2, 3])).toBe('[1, 2, 3]')
  })

  it('should format large arrays with ellipsis', () => {
    const result = formatValue([1, 2, 3, 4, 5, 6, 7, 8])
    expect(result).toContain('... +3')
  })

  it('should format empty objects', () => {
    expect(formatValue({})).toBe('{}')
  })

  it('should format objects', () => {
    const result = formatValue({ a: 1, b: 2 })
    expect(result).toContain('a: 1')
    expect(result).toContain('b: 2')
  })

  it('should format large objects with ellipsis', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 }
    const result = formatValue(obj)
    expect(result).toContain('... +2')
  })

  it('should limit depth', () => {
    const deep = { a: { b: { c: { d: { e: 1 } } } } }
    const result = formatValue(deep)
    // At max depth, objects show {...N} format
    expect(result).toContain('{...1}')
  })

  it('should show ellipsis for arrays at max depth', () => {
    const deep = { a: { b: { c: [1, 2, 3] } } }
    const result = formatValue(deep)
    expect(result).toContain('[...3]')
  })

  it('should show ellipsis for objects at max depth', () => {
    const deep = { a: { b: { c: { x: 1, y: 2 } } } }
    const result = formatValue(deep)
    expect(result).toContain('{...2}')
  })

  it('should return [...] when called with depth > MAX_DEPTH directly', () => {
    // Call formatValue with depth=4 directly (MAX_DEPTH is 3)
    const result = formatValue({ test: 'value' }, 4)
    expect(result).toBe('[...]')
  })

  it('should return [...] for values at depth > MAX_DEPTH', () => {
    // When depth > MAX_DEPTH, formatValue returns '[...]' immediately
    // This only happens when called with explicit depth parameter
    const result1 = formatValue('test', 5)
    expect(result1).toBe('[...]')

    const result2 = formatValue([1, 2, 3], 10)
    expect(result2).toBe('[...]')

    const result3 = formatValue(null, 4)
    expect(result3).toBe('[...]')
  })
})

describe('formatValueWithStyle', () => {
  it('should format null with style', () => {
    const result = formatValueWithStyle(null)
    expect(result.text).toBe('null')
    expect(result.style).toContain('color')
  })

  it('should format undefined with style', () => {
    const result = formatValueWithStyle(undefined)
    expect(result.text).toBe('undefined')
    expect(result.style).toContain('color')
  })

  it('should format strings with style', () => {
    const result = formatValueWithStyle('hello')
    expect(result.text).toBe('"hello"')
    expect(result.style).toContain('color')
  })

  it('should format numbers with style', () => {
    const result = formatValueWithStyle(123)
    expect(result.text).toBe('123')
    expect(result.style).toContain('color')
  })

  it('should format booleans with style', () => {
    const result = formatValueWithStyle(true)
    expect(result.text).toBe('true')
    expect(result.style).toContain('color')
  })

  it('should format functions with style', () => {
    const result = formatValueWithStyle(() => {})
    expect(result.style).toContain('color')
  })

  it('should format arrays with style', () => {
    const result = formatValueWithStyle([1, 2, 3])
    expect(result.style).toContain('color')
  })

  it('should format objects with style', () => {
    const result = formatValueWithStyle({ a: 1 })
    expect(result.style).toContain('color')
  })

  it('should format bigints with style', () => {
    const result = formatValueWithStyle(BigInt(123))
    expect(result.text).toBe('123n')
    expect(result.style).toContain('color')
  })
})

describe('formatChange', () => {
  it('should format simple value changes', () => {
    expect(formatChange(1, 2)).toBe('1 → 2')
  })

  it('should format string changes', () => {
    expect(formatChange('old', 'new')).toBe('"old" → "new"')
  })

  it('should format null/undefined changes', () => {
    expect(formatChange(null, 'value')).toBe('null → "value"')
    expect(formatChange('value', undefined)).toBe('"value" → undefined')
  })
})

describe('formatComponentName', () => {
  it('should return name without id', () => {
    expect(formatComponentName('MyComponent')).toBe('MyComponent')
  })

  it('should include short id when provided', () => {
    expect(formatComponentName('MyComponent', 'abc123-xyz789')).toBe('MyComponent#abc123')
  })

  it('should handle id without dash', () => {
    // When there's no dash, split('-')[0] returns the full string
    expect(formatComponentName('MyComponent', 'abcdefghijkl')).toBe('MyComponent#abcdefghijkl')
  })
})

describe('padString', () => {
  it('should pad string to length', () => {
    expect(padString('hi', 5)).toBe('hi   ')
  })

  it('should not pad if already long enough', () => {
    expect(padString('hello', 3)).toBe('hello')
  })

  it('should use custom padding character', () => {
    expect(padString('hi', 5, '-')).toBe('hi---')
  })
})

describe('formatNumber', () => {
  it('should format numbers with locale separators', () => {
    // This depends on locale but should work
    const result = formatNumber(1000000)
    expect(typeof result).toBe('string')
  })
})
