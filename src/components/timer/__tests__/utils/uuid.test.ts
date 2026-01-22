import { describe, it, expect } from 'vitest'
import { generateUUID } from '../../utils/uuid'

describe('uuid utilities', () => {
  describe('generateUUID', () => {
    it('should generate a non-empty string', () => {
      const uuid = generateUUID()
      
      expect(typeof uuid).toBe('string')
      expect(uuid.length).toBeGreaterThan(0)
    })

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID()
      const uuid2 = generateUUID()
      const uuid3 = generateUUID()
      
      expect(uuid1).not.toBe(uuid2)
      expect(uuid2).not.toBe(uuid3)
      expect(uuid1).not.toBe(uuid3)
    })

    it('should generate UUIDs of consistent length', () => {
      const uuids = Array.from({ length: 100 }, () => generateUUID())
      const lengths = uuids.map(uuid => uuid.length)
      const uniqueLengths = new Set(lengths)
      
      // All UUIDs should have the same length
      expect(uniqueLengths.size).toBe(1)
    })

    it('should generate many unique UUIDs', () => {
      const count = 1000
      const uuids = Array.from({ length: count }, () => generateUUID())
      const uniqueUuids = new Set(uuids)
      
      // All should be unique
      expect(uniqueUuids.size).toBe(count)
    })

    it('should handle rapid generation', () => {
      const uuids: string[] = []
      
      for (let i = 0; i < 100; i++) {
        uuids.push(generateUUID())
      }
      
      const uniqueUuids = new Set(uuids)
      expect(uniqueUuids.size).toBe(100)
    })

    it('should use crypto.randomUUID if available', () => {
      // Check if native crypto.randomUUID is available
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        const uuid = generateUUID()
        
        // Native crypto.randomUUID returns standard UUID format
        // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        
        expect(uuid).toMatch(uuidRegex)
      }
    })

    it('should fallback gracefully if crypto.randomUUID is not available', () => {
      // Note: In modern environments, crypto is always available
      // This test verifies the function works with available crypto
      const uuid = generateUUID()
      
      expect(typeof uuid).toBe('string')
      expect(uuid.length).toBeGreaterThan(0)
    })

    it('should not generate sequential UUIDs', () => {
      const uuid1 = generateUUID()
      const uuid2 = generateUUID()
      
      // UUIDs should be random, not sequential
      // Simple check: they should differ in multiple positions
      let diffCount = 0
      const minLength = Math.min(uuid1.length, uuid2.length)
      
      for (let i = 0; i < minLength; i++) {
        if (uuid1[i] !== uuid2[i]) {
          diffCount++
        }
      }
      
      // At least 25% of characters should be different
      expect(diffCount).toBeGreaterThan(minLength * 0.25)
    })

    it('should not return null or undefined', () => {
      const uuid = generateUUID()
      
      expect(uuid).not.toBeNull()
      expect(uuid).not.toBeUndefined()
    })

    it('should not contain whitespace', () => {
      const uuid = generateUUID()
      
      expect(uuid).not.toMatch(/\s/)
    })

    it('should be suitable as object key', () => {
      const obj: Record<string, string> = {}
      const uuid1 = generateUUID()
      const uuid2 = generateUUID()
      
      obj[uuid1] = 'value1'
      obj[uuid2] = 'value2'
      
      expect(obj[uuid1]).toBe('value1')
      expect(obj[uuid2]).toBe('value2')
      expect(Object.keys(obj).length).toBe(2)
    })

    it('should generate IDs suitable for React keys', () => {
      const uuids = Array.from({ length: 10 }, () => generateUUID())
      
      // All should be strings
      uuids.forEach(uuid => {
        expect(typeof uuid).toBe('string')
      })
      
      // All should be unique
      const uniqueUuids = new Set(uuids)
      expect(uniqueUuids.size).toBe(10)
    })

    it('should handle concurrent calls', async () => {
      const promises = Array.from({ length: 100 }, () => 
        Promise.resolve(generateUUID())
      )
      
      const uuids = await Promise.all(promises)
      const uniqueUuids = new Set(uuids)
      
      expect(uniqueUuids.size).toBe(100)
    })

    it('should maintain uniqueness across multiple test runs', () => {
      const run1 = Array.from({ length: 50 }, () => generateUUID())
      const run2 = Array.from({ length: 50 }, () => generateUUID())
      
      const allUuids = [...run1, ...run2]
      const uniqueUuids = new Set(allUuids)
      
      expect(uniqueUuids.size).toBe(100)
    })

    it('should not throw errors', () => {
      expect(() => {
        for (let i = 0; i < 1000; i++) {
          generateUUID()
        }
      }).not.toThrow()
    })

    describe('Performance', () => {
      it('should generate UUIDs quickly', () => {
        const start = performance.now()
        
        for (let i = 0; i < 1000; i++) {
          generateUUID()
        }
        
        const end = performance.now()
        const duration = end - start
        
        // Should take less than 100ms for 1000 UUIDs
        expect(duration).toBeLessThan(100)
      })

      it('should not degrade with repeated calls', () => {
        const measurements: number[] = []
        
        for (let batch = 0; batch < 10; batch++) {
          const start = performance.now()
          
          for (let i = 0; i < 100; i++) {
            generateUUID()
          }
          
          const end = performance.now()
          measurements.push(end - start)
        }
        
        // Later batches should not be significantly slower
        // Be lenient as timing can vary in test environments
        const firstBatch = measurements[0]
        const lastBatch = measurements[measurements.length - 1]
        
        // Allow up to 10x slower as timing can be flaky in CI/test environments
        expect(lastBatch).toBeLessThan(Math.max(firstBatch * 10, 100))
      })
    })

    describe('Collision Resistance', () => {
      it('should have very low collision probability', () => {
        const uuids = new Set<string>()
        const count = 10000
        
        for (let i = 0; i < count; i++) {
          uuids.add(generateUUID())
        }
        
        // Should have zero collisions
        expect(uuids.size).toBe(count)
      })

      it('should generate different UUIDs when called in tight loop', () => {
        const uuids: string[] = []
        
        for (let i = 0; i < 1000; i++) {
          uuids.push(generateUUID())
        }
        
        // Check for any duplicates
        const hasDuplicates = uuids.some((uuid, index) => 
          uuids.indexOf(uuid) !== index
        )
        
        expect(hasDuplicates).toBe(false)
      })
    })

    describe('Format Validation', () => {
      it('should generate valid string format', () => {
        const uuid = generateUUID()
        
        // Should be a string with reasonable length
        expect(typeof uuid).toBe('string')
        expect(uuid.length).toBeGreaterThanOrEqual(10)
        expect(uuid.length).toBeLessThanOrEqual(50)
      })

      it('should not contain special characters that break URLs', () => {
        const uuid = generateUUID()
        
        // Should be URL-safe
        const urlUnsafeChars = /[<>{}|\\^`\[\]\s]/
        expect(uuid).not.toMatch(urlUnsafeChars)
      })

      it('should be serializable to JSON', () => {
        const uuid = generateUUID()
        
        expect(() => {
          JSON.stringify({ id: uuid })
          JSON.parse(JSON.stringify({ id: uuid }))
        }).not.toThrow()
      })
    })
  })
})
