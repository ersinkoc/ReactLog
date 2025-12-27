import { describe, it, expect, beforeEach } from 'vitest'
import { generateUID, generateShortUID, resetUIDCounter } from '../../../src/utils/uid'

describe('uid', () => {
  beforeEach(() => {
    resetUIDCounter()
  })

  describe('generateUID', () => {
    it('should generate a unique ID', () => {
      const id = generateUID()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('should generate different IDs on each call', () => {
      const id1 = generateUID()
      const id2 = generateUID()
      expect(id1).not.toBe(id2)
    })

    it('should include timestamp and counter parts', () => {
      const id = generateUID()
      const parts = id.split('-')
      expect(parts.length).toBe(3)
    })

    it('should generate many unique IDs', () => {
      const ids = new Set<string>()
      for (let i = 0; i < 1000; i++) {
        ids.add(generateUID())
      }
      expect(ids.size).toBe(1000)
    })
  })

  describe('generateShortUID', () => {
    it('should generate a short ID', () => {
      const id = generateShortUID()
      expect(typeof id).toBe('string')
      expect(id.length).toBeLessThanOrEqual(8)
    })

    it('should generate different short IDs', () => {
      const id1 = generateShortUID()
      const id2 = generateShortUID()
      // Note: There's a small chance these could be equal due to randomness
      // but practically they should be different
      expect(id1).not.toBe(id2)
    })
  })

  describe('resetUIDCounter', () => {
    it('should reset the counter', () => {
      generateUID()
      generateUID()
      resetUIDCounter()
      const id = generateUID()
      const parts = id.split('-')
      // The second part is the counter in base36
      expect(parts[1]).toBe('0')
    })
  })
})
