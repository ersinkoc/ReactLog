import { describe, it, expect } from 'vitest'
import { deepEqual } from '../../../src/utils/deep-equal'

describe('deepEqual', () => {
  describe('primitives', () => {
    it('should return true for identical primitives', () => {
      expect(deepEqual(1, 1)).toBe(true)
      expect(deepEqual('hello', 'hello')).toBe(true)
      expect(deepEqual(true, true)).toBe(true)
      expect(deepEqual(null, null)).toBe(true)
      expect(deepEqual(undefined, undefined)).toBe(true)
    })

    it('should return false for different primitives', () => {
      expect(deepEqual(1, 2)).toBe(false)
      expect(deepEqual('hello', 'world')).toBe(false)
      expect(deepEqual(true, false)).toBe(false)
      expect(deepEqual(null, undefined)).toBe(false)
    })

    it('should handle NaN correctly', () => {
      expect(deepEqual(NaN, NaN)).toBe(true)
      expect(deepEqual(NaN, 1)).toBe(false)
    })
  })

  describe('arrays', () => {
    it('should return true for identical arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true)
      expect(deepEqual([], [])).toBe(true)
    })

    it('should return false for different arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false)
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false)
    })

    it('should handle nested arrays', () => {
      expect(deepEqual([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true)
      expect(deepEqual([[1, 2], [3, 4]], [[1, 2], [3, 5]])).toBe(false)
    })
  })

  describe('objects', () => {
    it('should return true for identical objects', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
      expect(deepEqual({}, {})).toBe(true)
    })

    it('should return false for different objects', () => {
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false)
      expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false)
      expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    })

    it('should handle nested objects', () => {
      expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true)
      expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false)
    })
  })

  describe('special types', () => {
    it('should handle Date objects', () => {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-01-01')
      const date3 = new Date('2024-01-02')
      expect(deepEqual(date1, date2)).toBe(true)
      expect(deepEqual(date1, date3)).toBe(false)
    })

    it('should handle RegExp objects', () => {
      expect(deepEqual(/abc/, /abc/)).toBe(true)
      expect(deepEqual(/abc/g, /abc/g)).toBe(true)
      expect(deepEqual(/abc/, /def/)).toBe(false)
      expect(deepEqual(/abc/g, /abc/i)).toBe(false)
    })

    it('should handle Map objects', () => {
      const map1 = new Map([['a', 1], ['b', 2]])
      const map2 = new Map([['a', 1], ['b', 2]])
      const map3 = new Map([['a', 1], ['b', 3]])
      expect(deepEqual(map1, map2)).toBe(true)
      expect(deepEqual(map1, map3)).toBe(false)
    })

    it('should handle Set objects', () => {
      const set1 = new Set([1, 2, 3])
      const set2 = new Set([1, 2, 3])
      const set3 = new Set([1, 2, 4])
      expect(deepEqual(set1, set2)).toBe(true)
      expect(deepEqual(set1, set3)).toBe(false)
    })
  })

  describe('mixed types', () => {
    it('should return false for different types', () => {
      expect(deepEqual(1, '1')).toBe(false)
      expect(deepEqual([], {})).toBe(false)
      expect(deepEqual(null, {})).toBe(false)
      expect(deepEqual(undefined, null)).toBe(false)
    })
  })

  describe('circular references', () => {
    it('should handle circular references in objects', () => {
      const obj1: Record<string, unknown> = { a: 1 }
      obj1['self'] = obj1

      const obj2: Record<string, unknown> = { a: 1 }
      obj2['self'] = obj2

      expect(deepEqual(obj1, obj2)).toBe(true)
    })

    it('should handle circular references in arrays', () => {
      const arr1: unknown[] = [1, 2]
      arr1.push(arr1)

      const arr2: unknown[] = [1, 2]
      arr2.push(arr2)

      expect(deepEqual(arr1, arr2)).toBe(true)
    })
  })
})
