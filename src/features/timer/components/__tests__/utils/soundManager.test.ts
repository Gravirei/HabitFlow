/**

// Type declarations for test environment
declare const global: typeof globalThis
declare const process: NodeJS.Process

 * Tests for soundManager utility
 * Comprehensive test suite for Web Audio API sound generation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { soundManager } from '../../utils/soundManager'

// Helper to create fresh mock oscillator
const createMockOscillator = () => ({
  type: 'sine' as OscillatorType,
  frequency: { value: 0 },
  // connect returns the destination node (parameter), not 'this'
  connect: vi.fn().mockImplementation(function(destination) {
    return destination
  }),
  start: vi.fn(),
  stop: vi.fn()
})

// Helper to create fresh mock gain node
const createMockGainNode = () => ({
  gain: { 
    value: 0,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn()
  },
  // connect returns the destination node (parameter), not 'this'
  connect: vi.fn().mockImplementation(function(destination) {
    return destination
  })
})

// Store created mocks for assertions
let createdOscillators: ReturnType<typeof createMockOscillator>[] = []
let createdGainNodes: ReturnType<typeof createMockGainNode>[] = []

// Create a consistent destination object
const mockDestination = {}

const mockAudioContext = {
  state: 'running',
  currentTime: 0,
  destination: mockDestination,
  createOscillator: vi.fn(() => {
    const osc = createMockOscillator()
    createdOscillators.push(osc)
    return osc
  }),
  createGain: vi.fn(() => {
    const gain = createMockGainNode()
    createdGainNodes.push(gain)
    return gain
  }),
  close: vi.fn()
}

describe('soundManager', () => {
  beforeEach(() => {
    // Reset mocks and tracking arrays
    vi.clearAllMocks()
    createdOscillators = []
    createdGainNodes = []
    
    // Reset mock functions to create fresh instances
    mockAudioContext.createOscillator = vi.fn(() => {
      const osc = createMockOscillator()
      createdOscillators.push(osc)
      return osc
    })
    mockAudioContext.createGain = vi.fn(() => {
      const gain = createMockGainNode()
      createdGainNodes.push(gain)
      return gain
    })
    mockAudioContext.state = 'running'
    mockAudioContext.currentTime = 0
    
    // Mock AudioContext as a proper constructor
    global.AudioContext = vi.fn().mockImplementation(function(this: any) {
      return mockAudioContext
    }) as any
    ;(global as any).webkitAudioContext = global.AudioContext
  })

  afterEach(() => {
    // Cleanup soundManager
    soundManager.cleanup()
    // Reset the mock AudioContext state
    mockAudioContext.state = 'running'
    mockAudioContext.currentTime = 0
  })

  describe('playSound', () => {
    describe('Beep Sound', () => {
      it('should play beep sound with correct frequency', () => {
        soundManager.playSound('beep', 70)

        expect(mockAudioContext.createOscillator).toHaveBeenCalled()
        expect(mockAudioContext.createGain).toHaveBeenCalled()
        expect(createdOscillators[0].type).toBe('sine')
        expect(createdOscillators[0].frequency.value).toBe(800)
      })

      it('should set correct volume for beep', () => {
        soundManager.playSound('beep', 70)

        expect(createdGainNodes[0].gain.value).toBe(0.7) // 70/100
      })

      it('should start and stop oscillator', () => {
        soundManager.playSound('beep', 70)

        expect(createdOscillators[0].start).toHaveBeenCalled()
        expect(createdOscillators[0].stop).toHaveBeenCalled()
      })

      it('should connect oscillator to gain node and destination', () => {
        soundManager.playSound('beep', 70)

        expect(createdOscillators[0].connect).toHaveBeenCalledWith(createdGainNodes[0])
        expect(createdGainNodes[0].connect).toHaveBeenCalledWith(mockDestination)
      })
    })

    describe('Bell Sound', () => {
      it('should play bell sound with multiple frequencies', () => {
        soundManager.playSound('bell', 70)

        // Bell uses 3 frequencies (C-E-G chord)
        expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3)
        expect(createdOscillators).toHaveLength(3)
      })

      it('should create envelope for bell decay', () => {
        soundManager.playSound('bell', 70)

        // Each bell note creates its own envelope (gain node)
        // Bell creates 3 oscillators, each with its own envelope + 1 main gain node
        expect(createdGainNodes.length).toBeGreaterThanOrEqual(3)
        // Check that gain envelope is set on envelope nodes
        const envelopeNode = createdGainNodes[1] // First envelope after main gain
        expect(envelopeNode.gain.setValueAtTime).toHaveBeenCalled()
        expect(envelopeNode.gain.exponentialRampToValueAtTime).toHaveBeenCalled()
      })

      it('should use sine wave for bell', () => {
        soundManager.playSound('bell', 70)

        // All bell oscillators should be sine waves
        createdOscillators.forEach(osc => {
          expect(osc.type).toBe('sine')
        })
      })
    })

    describe('Chime Sound', () => {
      it('should play chime sound with ascending notes', () => {
        soundManager.playSound('chime', 70)

        // Chime uses 4 ascending notes
        expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(4)
        expect(createdOscillators).toHaveLength(4)
      })

      it('should use triangle wave for chime', () => {
        soundManager.playSound('chime', 70)

        // All chime oscillators should be triangle waves
        createdOscillators.forEach(osc => {
          expect(osc.type).toBe('triangle')
        })
      })

      it('should create envelope for each note', () => {
        soundManager.playSound('chime', 70)

        // Each chime note creates its own envelope
        expect(createdGainNodes.length).toBeGreaterThanOrEqual(4)
        // Check that gain envelopes are set
        const envelopeNode = createdGainNodes[1] // First envelope after main gain
        expect(envelopeNode.gain.setValueAtTime).toHaveBeenCalled()
        expect(envelopeNode.gain.exponentialRampToValueAtTime).toHaveBeenCalled()
      })
    })

    describe('Digital Sound', () => {
      it('should play digital sound with quick beeps', () => {
        soundManager.playSound('digital', 70)

        // Digital uses 3 quick beeps
        expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3)
        expect(createdOscillators).toHaveLength(3)
      })

      it('should use square wave for digital sound', () => {
        soundManager.playSound('digital', 70)

        // All digital oscillators should be square waves
        createdOscillators.forEach(osc => {
          expect(osc.type).toBe('square')
        })
      })
    })

    describe('Volume Control', () => {
      it('should handle 0% volume', () => {
        soundManager.playSound('beep', 0)

        expect(createdGainNodes[0].gain.value).toBe(0)
      })

      it('should handle 50% volume', () => {
        soundManager.playSound('beep', 50)

        expect(createdGainNodes[0].gain.value).toBe(0.5)
      })

      it('should handle 100% volume', () => {
        soundManager.playSound('beep', 100)

        expect(createdGainNodes[0].gain.value).toBe(1.0)
      })

      it('should normalize volume above 100', () => {
        soundManager.playSound('beep', 150)

        expect(createdGainNodes[0].gain.value).toBe(1.0) // Capped at 100%
      })

      it('should normalize negative volume to 0', () => {
        soundManager.playSound('beep', -50)

        expect(createdGainNodes[0].gain.value).toBe(0)
      })
    })

    describe('AudioContext Management', () => {
      it('should create AudioContext on first use', () => {
        soundManager.playSound('beep', 70)

        expect(global.AudioContext).toHaveBeenCalled()
      })

      it('should reuse AudioContext for multiple sounds', () => {
        soundManager.playSound('beep', 70)
        soundManager.playSound('bell', 70)

        // AudioContext should only be created once
        expect(global.AudioContext).toHaveBeenCalledTimes(1)
      })

      it('should use webkitAudioContext if AudioContext not available', () => {
        delete (global as any).AudioContext
        ;(global as any).webkitAudioContext = vi.fn(() => mockAudioContext as any)

        soundManager.playSound('beep', 70)

        expect((global as any).webkitAudioContext).toHaveBeenCalled()
      })
    })

    describe('Error Handling', () => {
      it('should handle errors gracefully', () => {
        mockAudioContext.createOscillator = vi.fn(() => {
          throw new Error('AudioContext error')
        })

        // Should not throw
        expect(() => soundManager.playSound('beep', 70)).not.toThrow()
      })

      it('should log errors to console', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        
        mockAudioContext.createOscillator = vi.fn(() => {
          throw new Error('AudioContext error')
        })

        soundManager.playSound('beep', 70)

        expect(consoleErrorSpy).toHaveBeenCalled()
        
        consoleErrorSpy.mockRestore()
      })

      it('should handle missing AudioContext', () => {
        delete (global as any).AudioContext
        delete (global as any).webkitAudioContext

        expect(() => soundManager.playSound('beep', 70)).not.toThrow()
      })
    })
  })

  describe('cleanup', () => {
    it('should close AudioContext', () => {
      soundManager.playSound('beep', 70)
      soundManager.cleanup()

      expect(mockAudioContext.close).toHaveBeenCalled()
    })

    it('should handle cleanup when AudioContext not created', () => {
      expect(() => soundManager.cleanup()).not.toThrow()
    })

    it('should handle cleanup when AudioContext already closed', () => {
      mockAudioContext.state = 'closed'
      
      soundManager.playSound('beep', 70)
      soundManager.cleanup()

      expect(mockAudioContext.close).not.toHaveBeenCalled()
    })

    it('should allow creating new AudioContext after cleanup', () => {
      soundManager.playSound('beep', 70)
      soundManager.cleanup()

      const firstCallCount = (global.AudioContext as any).mock.calls.length

      soundManager.playSound('beep', 70)

      expect((global.AudioContext as any).mock.calls.length).toBeGreaterThan(firstCallCount)
    })
  })

  describe('Sound Types', () => {
    it('should support all 4 sound types', () => {
      const types: Array<'beep' | 'bell' | 'chime' | 'digital'> = ['beep', 'bell', 'chime', 'digital']

      types.forEach(type => {
        vi.clearAllMocks()
        soundManager.playSound(type, 70)
        expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      })
    })

    it('should handle unknown sound type gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      soundManager.playSound('unknown' as any, 70)

      expect(consoleWarnSpy).toHaveBeenCalled()
      
      consoleWarnSpy.mockRestore()
    })
  })

  describe('Integration', () => {
    it('should play multiple sounds in sequence', () => {
      soundManager.playSound('beep', 70)
      soundManager.playSound('bell', 50)
      soundManager.playSound('chime', 80)

      // Should create oscillators for all sounds
      // beep: 1, bell: 3, chime: 4 = 8 total
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(8)
    })

    it('should handle rapid successive calls', () => {
      for (let i = 0; i < 10; i++) {
        soundManager.playSound('beep', 70)
      }

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(10)
    })
  })

  describe('Singleton Pattern', () => {
    it('should be a singleton instance', async () => {
      // Import the module twice to verify it's the same instance
      const module1 = await import('../../utils/soundManager')
      const module2 = await import('../../utils/soundManager')

      expect(module1.soundManager).toBe(module2.soundManager)
    })

    it('should maintain state across multiple imports', async () => {
      // Play a sound to initialize AudioContext
      soundManager.playSound('beep', 70)
      const firstCallCount = (global.AudioContext as any).mock.calls.length

      // Import module again
      const { soundManager: reimported } = await import('../../utils/soundManager')
      
      // Should be the same instance
      expect(reimported).toBe(soundManager)
      
      // AudioContext should still be the same (no new creation)
      reimported.playSound('bell', 50)
      expect((global.AudioContext as any).mock.calls.length).toBe(firstCallCount)
    })
  })
})
