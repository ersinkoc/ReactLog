import { describe, it, expect } from 'vitest'
import { shallowEqual, shallowEqualProps } from '../../../src/utils/shallow-equal'

describe('shallowEqual', () => {
  it('should return true for identical values', () => {
    expect(shallowEqual(1, 1)).toBe(true)
    expect(shallowEqual('hello', 'hello')).toBe(true)
    expect(shallowEqual(true, true)).toBe(true)
  })

  it('should return true for same reference', () => {
    const obj = { a: 1 }
    expect(shallowEqual(obj, obj)).toBe(true)

    const arr = [1, 2, 3]
    expect(shallowEqual(arr, arr)).toBe(true)
  })

  it('should return true for NaN values', () => {
    expect(shallowEqual(NaN, NaN)).toBe(true)
  })

  it('should handle null and undefined', () => {
    expect(shallowEqual(null, null)).toBe(true)
    expect(shallowEqual(undefined, undefined)).toBe(true)
    expect(shallowEqual(null, undefined)).toBe(false)
    expect(shallowEqual(undefined, null)).toBe(false)
    expect(shallowEqual(null, 0)).toBe(false)
    expect(shallowEqual(undefined, '')).toBe(false)
  })

  it('should return false for different types', () => {
    expect(shallowEqual(1, '1')).toBe(false)
    expect(shallowEqual(true, 1)).toBe(false)
    expect(shallowEqual({}, [])).toBe(false)
  })

  it('should compare primitives correctly', () => {
    expect(shallowEqual(1, 2)).toBe(false)
    expect(shallowEqual('hello', 'world')).toBe(false)
    expect(shallowEqual(true, false)).toBe(false)
  })

  describe('array comparison', () => {
    it('should compare arrays shallowly', () => {
      expect(shallowEqual([1, 2, 3], [1, 2, 3])).toBe(true)
      expect(shallowEqual(['a', 'b'], ['a', 'b'])).toBe(true)
    })

    it('should return false for different length arrays', () => {
      expect(shallowEqual([1, 2], [1, 2, 3])).toBe(false)
    })

    it('should return false for different elements', () => {
      expect(shallowEqual([1, 2, 3], [1, 5, 3])).toBe(false)
    })

    it('should compare by reference not deep equality', () => {
      const obj = { a: 1 }
      expect(shallowEqual([obj], [obj])).toBe(true)
      expect(shallowEqual([{ a: 1 }], [{ a: 1 }])).toBe(false) // Different references
    })

    it('should return false when one is array and other is not', () => {
      expect(shallowEqual([1], { 0: 1 })).toBe(false)
      expect(shallowEqual({ 0: 1 }, [1])).toBe(false)
    })
  })

  describe('object comparison', () => {
    it('should compare objects shallowly', () => {
      expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
    })

    it('should return false for different number of keys', () => {
      expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    })

    it('should return false for missing keys', () => {
      expect(shallowEqual({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false)
    })

    it('should return false for different values', () => {
      expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false)
    })

    it('should compare by reference not deep equality', () => {
      const nested = { x: 1 }
      expect(shallowEqual({ a: nested }, { a: nested })).toBe(true)
      expect(shallowEqual({ a: { x: 1 } }, { a: { x: 1 } })).toBe(false) // Different references
    })

    it('should handle empty objects', () => {
      expect(shallowEqual({}, {})).toBe(true)
    })
  })
})

describe('shallowEqualProps', () => {
  it('should behave like shallowEqual for objects', () => {
    expect(shallowEqualProps({ a: 1 }, { a: 1 })).toBe(true)
    expect(shallowEqualProps({ a: 1 }, { a: 2 })).toBe(false)
    expect(shallowEqualProps({ a: 1 }, { b: 1 })).toBe(false)
  })

  it('should work with React-like props', () => {
    const onClick = () => {}
    const children = 'text'

    expect(
      shallowEqualProps(
        { onClick, children, disabled: false },
        { onClick, children, disabled: false }
      )
    ).toBe(true)

    expect(
      shallowEqualProps(
        { onClick, children, disabled: false },
        { onClick, children, disabled: true }
      )
    ).toBe(false)
  })
})
