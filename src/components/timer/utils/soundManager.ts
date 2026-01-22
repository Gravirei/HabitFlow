/**
 * Sound Manager
 * Generates timer completion sounds using Web Audio API
 * No external dependencies - uses native browser APIs
 */

import { logError, ErrorCategory, ErrorSeverity } from './errorMessages'
import { logger } from './logger'

export type SoundType = 'beep' | 'bell' | 'chime' | 'digital' | 'tick'

class SoundManager {
  private audioContext: AudioContext | null = null

  /**
   * Get or create audio context (lazy initialization)
   * Supports both standard and webkit prefixed AudioContext
   */
  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) {
        throw new Error('Web Audio API not supported in this browser')
      }
      this.audioContext = new AudioContextClass()
    }
    return this.audioContext
  }

  /**
   * Play a completion sound
   * @param type - Sound type (beep, bell, chime, digital)
   * @param volume - Volume level (0-100)
   */
  public playSound(type: SoundType, volume: number): void {
    try {
      const ctx = this.getAudioContext()
      
      // Normalize volume to 0-1 range
      const normalizedVolume = Math.max(0, Math.min(100, volume)) / 100

      // Create gain node for volume control
      const gainNode = ctx.createGain()
      gainNode.gain.value = normalizedVolume

      // Play the selected sound type
      switch (type) {
        case 'beep':
          this.playBeep(ctx, gainNode)
          break
        case 'bell':
          this.playBell(ctx, gainNode)
          break
        case 'chime':
          this.playChime(ctx, gainNode)
          break
        case 'digital':
          this.playDigital(ctx, gainNode)
          break
        case 'tick':
          this.playTick(ctx, gainNode)
          break
        default:
          logger.warn(`Unknown sound type: ${type}`, { context: 'soundManager.playSound' })
      }
    } catch (error) {
      logError(
        error,
        'Failed to play sound',
        { soundType: type, volume },
        ErrorCategory.SOUND,
        ErrorSeverity.LOW
      )
    }
  }

  /**
   * Beep: Simple single-tone beep (800Hz sine wave)
   */
  private playBeep(ctx: AudioContext, gainNode: GainNode): void {
    const oscillator = ctx.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.value = 800
    
    oscillator.connect(gainNode).connect(ctx.destination)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  }

  /**
   * Bell: Musical chord with decay envelope (C-E-G major triad)
   * Creates a pleasant bell-like sound
   */
  private playBell(ctx: AudioContext, gainNode: GainNode): void {
    // Major chord frequencies: C5, E5, G5
    const frequencies = [523.25, 659.25, 783.99]
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      
      // Create envelope for decay effect
      const envelope = ctx.createGain()
      envelope.gain.setValueAtTime(0.3, ctx.currentTime)
      envelope.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1)
      
      osc.connect(envelope).connect(gainNode).connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.1) // Slight delay between notes
      osc.stop(ctx.currentTime + 1)
    })
  }

  /**
   * Chime: Ascending musical notes (A4 to A5)
   * Creates a pleasant ascending melody
   */
  private playChime(ctx: AudioContext, gainNode: GainNode): void {
    // Ascending notes: A4, C#5, E5, A5
    const notes = [440.00, 554.37, 659.25, 880.00]
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'triangle' // Softer than sine
      osc.frequency.value = freq
      
      // Create envelope for smooth note
      const envelope = ctx.createGain()
      envelope.gain.setValueAtTime(0.4, ctx.currentTime + i * 0.15)
      envelope.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3)
      
      osc.connect(envelope).connect(gainNode).connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.15)
      osc.stop(ctx.currentTime + i * 0.15 + 0.3)
    })
  }

  /**
   * Digital: Quick electronic beeps (retro computer sound)
   * Three short beeps with varying pitch
   */
  private playDigital(ctx: AudioContext, gainNode: GainNode): void {
    const frequencies = [1000, 1200, 1000] // Up-down pattern
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'square' // More electronic/digital sound
      osc.frequency.value = freq
      
      osc.connect(gainNode).connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.1)
      osc.stop(ctx.currentTime + i * 0.1 + 0.08) // Very short beeps
    })
  }

  /**
   * Tick: Ultra-sharp "snap" sound with dual-tone for modern UI feedback
   * Combines high and low frequencies for a rich, crisp click
   */
  private playTick(ctx: AudioContext, gainNode: GainNode): void {
    // High frequency component - provides the "snap"
    const highOsc = ctx.createOscillator()
    highOsc.type = 'sine'
    highOsc.frequency.setValueAtTime(2000, ctx.currentTime)
    highOsc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.015)

    // Low frequency component - provides body/punch
    const lowOsc = ctx.createOscillator()
    lowOsc.type = 'triangle'
    lowOsc.frequency.setValueAtTime(150, ctx.currentTime)

    // Very fast attack and decay for sharpness
    const highEnvelope = ctx.createGain()
    highEnvelope.gain.setValueAtTime(0.4, ctx.currentTime)
    highEnvelope.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.015)

    const lowEnvelope = ctx.createGain()
    lowEnvelope.gain.setValueAtTime(0.3, ctx.currentTime)
    lowEnvelope.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.015)

    // Connect both oscillators
    highOsc.connect(highEnvelope).connect(gainNode).connect(ctx.destination)
    lowOsc.connect(lowEnvelope).connect(gainNode).connect(ctx.destination)

    highOsc.start(ctx.currentTime)
    lowOsc.start(ctx.currentTime)
    highOsc.stop(ctx.currentTime + 0.015)
    lowOsc.stop(ctx.currentTime + 0.015)
  }

  /**
   * Cleanup audio context and free resources
   * Should be called when component unmounts
   */
  public cleanup(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

// Singleton instance
export const soundManager = new SoundManager()
