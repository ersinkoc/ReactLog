import { describe, it, expect } from 'vitest'
import { diffObjects, diffArrays, diffProps, findChangedDependencies } from '../../../src/utils/diff'

describe('diffObjects', () => {
  it('should detect added properties', () => {
    const prev = { a: 1 }
    const next = { a: 1, b: 2 }

    const changes = diffObjects(prev, next)

    expect(changes).toHaveLength(1)
    expect(changes[0]).toEqual({
      key: 'b',
      prevValue: undefined,
      nextValue: 2,
      type: 'added',
    })
  })

  it('should detect removed properties', () => {
    const prev = { a: 1, b: 2 }
    const next = { a: 1 }

    const changes = diffObjects(prev, next)

    expect(changes).toHaveLength(1)
    expect(changes[0]).toEqual({
      key: 'b',
      prevValue: 2,
      nextValue: undefined,
      type: 'removed',
    })
  })

  it('should detect changed properties', () => {
    const prev = { a: 1 }
    const next = { a: 2 }

    const changes = diffObjects(prev, next)

    expect(changes).toHaveLength(1)
    expect(changes[0]).toEqual({
      key: 'a',
      prevValue: 1,
      nextValue: 2,
      type: 'changed',
    })
  })

  it('should not report unchanged properties', () => {
    const prev = { a: 1, b: 2 }
    const next = { a: 1, b: 2 }

    const changes = diffObjects(prev, next)

    expect(changes).toHaveLength(0)
  })

  it('should handle empty objects', () => {
    expect(diffObjects({}, {})).toHaveLength(0)
    expect(diffObjects({ a: 1 }, {})).toHaveLength(1)
    expect(diffObjects({}, { a: 1 })).toHaveLength(1)
  })

  it('should detect deep changes', () => {
    const prev = { nested: { a: 1 } }
    const next = { nested: { a: 2 } }

    const changes = diffObjects(prev, next)

    expect(changes).toHaveLength(1)
    expect(changes[0].type).toBe('changed')
  })
})

describe('diffArrays', () => {
  it('should detect added elements', () => {
    const prev = [1, 2]
    const next = [1, 2, 3]

    const result = diffArrays(prev, next)

    expect(result.added).toHaveLength(1)
    expect(result.added[0]).toEqual({ index: 2, value: 3 })
  })

  it('should detect removed elements', () => {
    const prev = [1, 2, 3]
    const next = [1, 2]

    const result = diffArrays(prev, next)

    expect(result.removed).toHaveLength(1)
    expect(result.removed[0]).toEqual({ index: 2, value: 3 })
  })

  it('should detect changed elements', () => {
    const prev = [1, 2, 3]
    const next = [1, 5, 3]

    const result = diffArrays(prev, next)

    expect(result.changed).toHaveLength(1)
    expect(result.changed[0]).toEqual({ index: 1, prevValue: 2, nextValue: 5 })
  })

  it('should track unchanged elements', () => {
    const prev = [1, 2, 3]
    const next = [1, 2, 3]

    const result = diffArrays(prev, next)

    expect(result.unchanged).toHaveLength(3)
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
    expect(result.changed).toHaveLength(0)
  })

  it('should handle empty arrays', () => {
    expect(diffArrays([], []).unchanged).toHaveLength(0)
    expect(diffArrays([1], []).removed).toHaveLength(1)
    expect(diffArrays([], [1]).added).toHaveLength(1)
  })
})

describe('diffProps', () => {
  it('should detect prop changes', () => {
    const prev = { name: 'John' }
    const next = { name: 'Jane' }

    const changes = diffProps(prev, next)

    expect(changes).toHaveLength(1)
    expect(changes[0].key).toBe('name')
    expect(changes[0].prevValue).toBe('John')
    expect(changes[0].nextValue).toBe('Jane')
  })

  it('should detect added props', () => {
    const prev = {}
    const next = { name: 'John' }

    const changes = diffProps(prev, next)

    expect(changes).toHaveLength(1)
    expect(changes[0].key).toBe('name')
    expect(changes[0].prevValue).toBeUndefined()
    expect(changes[0].nextValue).toBe('John')
  })

  it('should detect removed props', () => {
    const prev = { name: 'John' }
    const next = {}

    const changes = diffProps(prev, next)

    expect(changes).toHaveLength(1)
    expect(changes[0].key).toBe('name')
    expect(changes[0].prevValue).toBe('John')
    expect(changes[0].nextValue).toBeUndefined()
  })

  it('should include isDeepEqual flag', () => {
    // When values are reference-different but deep equal, no change is reported
    // (this is intentional for React optimization)
    const prev = { data: { nested: 'value' } }
    const next = { data: { nested: 'value' } }

    const noChanges = diffProps(prev, next)
    expect(noChanges).toHaveLength(0)

    // When values are actually different, change is reported with isDeepEqual = false
    const prev2 = { data: { nested: 'value' } }
    const next2 = { data: { nested: 'different' } }

    const changes = diffProps(prev2, next2)
    expect(changes).toHaveLength(1)
    expect(changes[0].isDeepEqual).toBe(false)
  })

  it('should not report unchanged props', () => {
    const prev = { a: 1, b: 2 }
    const next = { a: 1, b: 2 }

    const changes = diffProps(prev, next)

    expect(changes).toHaveLength(0)
  })
})

describe('findChangedDependencies', () => {
  it('should find changed dependency indices', () => {
    const prev = [1, 'hello', true]
    const next = [1, 'world', true]

    const changed = findChangedDependencies(prev, next)

    expect(changed).toEqual([1])
  })

  it('should find multiple changes', () => {
    const prev = [1, 2, 3]
    const next = [10, 2, 30]

    const changed = findChangedDependencies(prev, next)

    expect(changed).toEqual([0, 2])
  })

  it('should detect added dependencies', () => {
    const prev = [1, 2]
    const next = [1, 2, 3]

    const changed = findChangedDependencies(prev, next)

    expect(changed).toContain(2)
  })

  it('should detect removed dependencies', () => {
    const prev = [1, 2, 3]
    const next = [1, 2]

    const changed = findChangedDependencies(prev, next)

    expect(changed).toContain(2)
  })

  it('should return empty array for identical deps', () => {
    const prev = [1, 2, 3]
    const next = [1, 2, 3]

    const changed = findChangedDependencies(prev, next)

    expect(changed).toEqual([])
  })

  it('should use Object.is semantics', () => {
    const prev = [NaN, 0]
    const next = [NaN, -0]

    const changed = findChangedDependencies(prev, next)

    // NaN === NaN with Object.is, but 0 !== -0
    expect(changed).toEqual([1])
  })

  it('should handle empty arrays', () => {
    expect(findChangedDependencies([], [])).toEqual([])
    expect(findChangedDependencies([1], [])).toEqual([0])
    expect(findChangedDependencies([], [1])).toEqual([0])
  })
})
