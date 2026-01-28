import { describe, it, expect, vi, beforeEach } from 'vitest'
import { enrollTotp, verifyFactor, unenrollFactor, challengeFactor, listFactors } from '../mfa'
import { supabase } from '@/lib/supabase'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      mfa: {
        enroll: vi.fn(),
        challenge: vi.fn(),
        verify: vi.fn(),
        unenroll: vi.fn(),
        listFactors: vi.fn(),
      },
    },
  },
}))

describe('MFA Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('enrollTotp', () => {
    it('should enroll TOTP successfully', async () => {
      const mockFactor = {
        id: 'test-factor-id',
        type: 'totp' as const,
        totp: {
          qr_code: '<svg>QR Code</svg>',
          secret: 'TEST_SECRET',
          uri: 'otpauth://...',
        },
      }

      // Mock the mfa object on supabase.auth
      vi.mocked(supabase.auth as any).mfa = {
        enroll: vi.fn().mockResolvedValue({
          data: mockFactor,
          error: null,
        }),
      }

      const result = await enrollTotp('TestApp')

      expect((supabase.auth as any).mfa.enroll).toHaveBeenCalledWith({
        factorType: 'totp',
        friendlyName: 'TestApp',
      })
      expect(result).toEqual(mockFactor)
    })

    it('should throw error if enrollment fails', async () => {
      vi.mocked(supabase.auth as any).mfa = {
        enroll: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Enrollment failed' },
        }),
      }

      await expect(enrollTotp('TestApp')).rejects.toThrow('Enrollment failed')
    })

    it('should throw error if MFA not available', async () => {
      // Remove mfa from auth
      vi.mocked(supabase.auth as any).mfa = undefined

      await expect(enrollTotp('TestApp')).rejects.toThrow('MFA is not available')
    })
  })

  describe('challengeFactor', () => {
    it('should create challenge successfully', async () => {
      const mockChallenge = { id: 'challenge-id', expires_at: '2026-01-28T12:00:00Z' }

      vi.mocked(supabase.auth as any).mfa = {
        challenge: vi.fn().mockResolvedValue({
          data: mockChallenge,
          error: null,
        }),
      }

      const result = await challengeFactor('factor-id')

      expect((supabase.auth as any).mfa.challenge).toHaveBeenCalledWith({ factorId: 'factor-id' })
      expect(result).toEqual(mockChallenge)
    })

    it('should throw error if challenge fails', async () => {
      vi.mocked(supabase.auth as any).mfa = {
        challenge: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Challenge failed' },
        }),
      }

      await expect(challengeFactor('factor-id')).rejects.toThrow('Challenge failed')
    })
  })

  describe('verifyFactor', () => {
    it('should verify factor successfully', async () => {
      vi.mocked(supabase.auth as any).mfa = {
        verify: vi.fn().mockResolvedValue({
          data: {},
          error: null,
        }),
      }

      await verifyFactor({
        factorId: 'factor-id',
        challengeId: 'challenge-id',
        code: '123456',
      })

      expect((supabase.auth as any).mfa.verify).toHaveBeenCalledWith({
        factorId: 'factor-id',
        challengeId: 'challenge-id',
        code: '123456',
      })
    })

    it('should throw error if verification fails', async () => {
      vi.mocked(supabase.auth as any).mfa = {
        verify: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Invalid code' },
        }),
      }

      await expect(
        verifyFactor({
          factorId: 'factor-id',
          challengeId: 'challenge-id',
          code: '000000',
        })
      ).rejects.toThrow('Invalid code')
    })
  })

  describe('unenrollFactor', () => {
    it('should unenroll factor successfully', async () => {
      vi.mocked(supabase.auth as any).mfa = {
        unenroll: vi.fn().mockResolvedValue({
          data: {},
          error: null,
        }),
      }

      await unenrollFactor('factor-id')

      expect((supabase.auth as any).mfa.unenroll).toHaveBeenCalledWith({ factorId: 'factor-id' })
    })

    it('should throw error if unenrollment fails', async () => {
      vi.mocked(supabase.auth as any).mfa = {
        unenroll: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Unenroll failed' },
        }),
      }

      await expect(unenrollFactor('factor-id')).rejects.toThrow('Unenroll failed')
    })
  })

  describe('listFactors', () => {
    it('should list factors successfully', async () => {
      const mockFactors = [
        { id: 'factor-1', type: 'totp' },
        { id: 'factor-2', type: 'totp' },
      ]

      vi.mocked(supabase.auth as any).mfa = {
        listFactors: vi.fn().mockResolvedValue({
          data: { totp: mockFactors },
          error: null,
        }),
      }

      const result = await listFactors()

      expect((supabase.auth as any).mfa.listFactors).toHaveBeenCalled()
      expect(result).toEqual(mockFactors)
    })

    it('should return empty array if no factors', async () => {
      vi.mocked(supabase.auth as any).mfa = {
        listFactors: vi.fn().mockResolvedValue({
          data: { totp: [] },
          error: null,
        }),
      }

      const result = await listFactors()

      expect(result).toEqual([])
    })

    it('should throw error if listing fails', async () => {
      vi.mocked(supabase.auth as any).mfa = {
        listFactors: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Failed to list factors' },
        }),
      }

      await expect(listFactors()).rejects.toThrow('Failed to list factors')
    })
  })
})
