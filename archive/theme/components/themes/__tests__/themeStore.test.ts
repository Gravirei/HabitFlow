/**
 * Theme Store Tests
 * Comprehensive tests for the theme Zustand store
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ThemeSettings } from '../types'

// Import store after setup is complete
let useThemeStore: typeof import('../themeStore').useThemeStore

// Default theme values for comparison
const DEFAULT_THEME: ThemeSettings = {
  mode: 'dark',
  preset: 'ultra-dark',
  accentColor: 'violet',
  gradientBackground: null,
  customBackgroundUrl: null,
  timerStyle: 'default',
  glowEnabled: true,
  blurEnabled: true,
  particlesEnabled: false,
  borderRadius: 16,
  buttonStyle: 'rounded',
  fontFamily: 'system',
  timerSize: 100,
  reducedMotion: false,
  highContrast: false,
}

describe('useThemeStore', () => {
  beforeEach(async () => {
    // Reset modules to ensure fresh store
    vi.resetModules()
    
    // Clear localStorage before each test
    localStorage.clear()

    // Dynamically import store to ensure setup runs first
    const module = await import('../themeStore')
    useThemeStore = module.useThemeStore
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should start with default theme values', () => {
      const state = useThemeStore.getState()
      
      expect(state.mode).toBe(DEFAULT_THEME.mode)
      expect(state.preset).toBe(DEFAULT_THEME.preset)
      expect(state.accentColor).toBe(DEFAULT_THEME.accentColor)
      expect(state.gradientBackground).toBe(DEFAULT_THEME.gradientBackground)
      expect(state.customBackgroundUrl).toBe(DEFAULT_THEME.customBackgroundUrl)
      expect(state.timerStyle).toBe(DEFAULT_THEME.timerStyle)
      expect(state.glowEnabled).toBe(DEFAULT_THEME.glowEnabled)
      expect(state.blurEnabled).toBe(DEFAULT_THEME.blurEnabled)
      expect(state.particlesEnabled).toBe(DEFAULT_THEME.particlesEnabled)
      expect(state.borderRadius).toBe(DEFAULT_THEME.borderRadius)
      expect(state.buttonStyle).toBe(DEFAULT_THEME.buttonStyle)
      expect(state.fontFamily).toBe(DEFAULT_THEME.fontFamily)
      expect(state.timerSize).toBe(DEFAULT_THEME.timerSize)
      expect(state.reducedMotion).toBe(DEFAULT_THEME.reducedMotion)
      expect(state.highContrast).toBe(DEFAULT_THEME.highContrast)
    })

    it('should have all required setter methods', () => {
      const state = useThemeStore.getState()
      
      expect(typeof state.setMode).toBe('function')
      expect(typeof state.setPreset).toBe('function')
      expect(typeof state.setAccentColor).toBe('function')
      expect(typeof state.setGradientBackground).toBe('function')
      expect(typeof state.setCustomBackgroundUrl).toBe('function')
      expect(typeof state.setTimerStyle).toBe('function')
      expect(typeof state.setGlowEnabled).toBe('function')
      expect(typeof state.setBlurEnabled).toBe('function')
      expect(typeof state.setParticlesEnabled).toBe('function')
      expect(typeof state.setBorderRadius).toBe('function')
      expect(typeof state.setButtonStyle).toBe('function')
      expect(typeof state.setFontFamily).toBe('function')
      expect(typeof state.setTimerSize).toBe('function')
      expect(typeof state.setReducedMotion).toBe('function')
      expect(typeof state.setHighContrast).toBe('function')
      expect(typeof state.updateTheme).toBe('function')
      expect(typeof state.resetToDefaults).toBe('function')
    })
  })

  describe('setMode', () => {
    it('should set mode to light', () => {
      act(() => {
        useThemeStore.getState().setMode('light')
      })

      expect(useThemeStore.getState().mode).toBe('light')
    })

    it('should set mode to dark', () => {
      act(() => {
        useThemeStore.getState().setMode('light')
        useThemeStore.getState().setMode('dark')
      })

      expect(useThemeStore.getState().mode).toBe('dark')
    })

    it('should set mode to system', () => {
      act(() => {
        useThemeStore.getState().setMode('system')
      })

      expect(useThemeStore.getState().mode).toBe('system')
    })

    it('should not affect other properties', () => {
      const originalPreset = useThemeStore.getState().preset

      act(() => {
        useThemeStore.getState().setMode('light')
      })

      expect(useThemeStore.getState().preset).toBe(originalPreset)
    })
  })

  describe('setPreset', () => {
    it('should update preset value', () => {
      act(() => {
        useThemeStore.getState().setPreset('ocean-blue')
      })

      expect(useThemeStore.getState().preset).toBe('ocean-blue')
    })

    it('should accept any string value', () => {
      act(() => {
        useThemeStore.getState().setPreset('custom-preset-123')
      })

      expect(useThemeStore.getState().preset).toBe('custom-preset-123')
    })
  })

  describe('setAccentColor', () => {
    it('should update accent color', () => {
      act(() => {
        useThemeStore.getState().setAccentColor('blue')
      })

      expect(useThemeStore.getState().accentColor).toBe('blue')
    })

    it('should accept hex color values', () => {
      act(() => {
        useThemeStore.getState().setAccentColor('#ff5500')
      })

      expect(useThemeStore.getState().accentColor).toBe('#ff5500')
    })

    it('should accept named colors', () => {
      const colors = ['red', 'green', 'blue', 'violet', 'orange']
      
      colors.forEach(color => {
        act(() => {
          useThemeStore.getState().setAccentColor(color)
        })
        expect(useThemeStore.getState().accentColor).toBe(color)
      })
    })
  })

  describe('setGradientBackground', () => {
    it('should set gradient background', () => {
      const gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      
      act(() => {
        useThemeStore.getState().setGradientBackground(gradient)
      })

      expect(useThemeStore.getState().gradientBackground).toBe(gradient)
    })

    it('should allow null to clear gradient', () => {
      act(() => {
        useThemeStore.getState().setGradientBackground('some-gradient')
        useThemeStore.getState().setGradientBackground(null)
      })

      expect(useThemeStore.getState().gradientBackground).toBeNull()
    })
  })

  describe('setCustomBackgroundUrl', () => {
    it('should set custom background URL', () => {
      const url = 'https://example.com/background.jpg'
      
      act(() => {
        useThemeStore.getState().setCustomBackgroundUrl(url)
      })

      expect(useThemeStore.getState().customBackgroundUrl).toBe(url)
    })

    it('should allow null to clear custom background', () => {
      act(() => {
        useThemeStore.getState().setCustomBackgroundUrl('https://example.com/bg.jpg')
        useThemeStore.getState().setCustomBackgroundUrl(null)
      })

      expect(useThemeStore.getState().customBackgroundUrl).toBeNull()
    })

    it('should accept data URLs', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      
      act(() => {
        useThemeStore.getState().setCustomBackgroundUrl(dataUrl)
      })

      expect(useThemeStore.getState().customBackgroundUrl).toBe(dataUrl)
    })
  })

  describe('setTimerStyle', () => {
    it('should set timer style to default', () => {
      act(() => {
        useThemeStore.getState().setTimerStyle('default')
      })

      expect(useThemeStore.getState().timerStyle).toBe('default')
    })

    it('should set timer style to minimal', () => {
      act(() => {
        useThemeStore.getState().setTimerStyle('minimal')
      })

      expect(useThemeStore.getState().timerStyle).toBe('minimal')
    })

    it('should set timer style to bold', () => {
      act(() => {
        useThemeStore.getState().setTimerStyle('bold')
      })

      expect(useThemeStore.getState().timerStyle).toBe('bold')
    })

    it('should set timer style to neon', () => {
      act(() => {
        useThemeStore.getState().setTimerStyle('neon')
      })

      expect(useThemeStore.getState().timerStyle).toBe('neon')
    })

    it('should set timer style to retro', () => {
      act(() => {
        useThemeStore.getState().setTimerStyle('retro')
      })

      expect(useThemeStore.getState().timerStyle).toBe('retro')
    })

    it('should set timer style to gradient', () => {
      act(() => {
        useThemeStore.getState().setTimerStyle('gradient')
      })

      expect(useThemeStore.getState().timerStyle).toBe('gradient')
    })
  })

  describe('setGlowEnabled', () => {
    it('should enable glow', () => {
      act(() => {
        useThemeStore.getState().setGlowEnabled(false)
        useThemeStore.getState().setGlowEnabled(true)
      })

      expect(useThemeStore.getState().glowEnabled).toBe(true)
    })

    it('should disable glow', () => {
      act(() => {
        useThemeStore.getState().setGlowEnabled(false)
      })

      expect(useThemeStore.getState().glowEnabled).toBe(false)
    })
  })

  describe('setBlurEnabled', () => {
    it('should enable blur', () => {
      act(() => {
        useThemeStore.getState().setBlurEnabled(false)
        useThemeStore.getState().setBlurEnabled(true)
      })

      expect(useThemeStore.getState().blurEnabled).toBe(true)
    })

    it('should disable blur', () => {
      act(() => {
        useThemeStore.getState().setBlurEnabled(false)
      })

      expect(useThemeStore.getState().blurEnabled).toBe(false)
    })
  })

  describe('setParticlesEnabled', () => {
    it('should enable particles', () => {
      act(() => {
        useThemeStore.getState().setParticlesEnabled(true)
      })

      expect(useThemeStore.getState().particlesEnabled).toBe(true)
    })

    it('should disable particles', () => {
      act(() => {
        useThemeStore.getState().setParticlesEnabled(true)
        useThemeStore.getState().setParticlesEnabled(false)
      })

      expect(useThemeStore.getState().particlesEnabled).toBe(false)
    })
  })

  describe('setBorderRadius', () => {
    it('should set border radius', () => {
      act(() => {
        useThemeStore.getState().setBorderRadius(8)
      })

      expect(useThemeStore.getState().borderRadius).toBe(8)
    })

    it('should accept zero', () => {
      act(() => {
        useThemeStore.getState().setBorderRadius(0)
      })

      expect(useThemeStore.getState().borderRadius).toBe(0)
    })

    it('should accept large values', () => {
      act(() => {
        useThemeStore.getState().setBorderRadius(100)
      })

      expect(useThemeStore.getState().borderRadius).toBe(100)
    })
  })

  describe('setButtonStyle', () => {
    it('should set button style to rounded', () => {
      act(() => {
        useThemeStore.getState().setButtonStyle('rounded')
      })

      expect(useThemeStore.getState().buttonStyle).toBe('rounded')
    })

    it('should set button style to pill', () => {
      act(() => {
        useThemeStore.getState().setButtonStyle('pill')
      })

      expect(useThemeStore.getState().buttonStyle).toBe('pill')
    })

    it('should set button style to sharp', () => {
      act(() => {
        useThemeStore.getState().setButtonStyle('sharp')
      })

      expect(useThemeStore.getState().buttonStyle).toBe('sharp')
    })

    it('should set button style to soft', () => {
      act(() => {
        useThemeStore.getState().setButtonStyle('soft')
      })

      expect(useThemeStore.getState().buttonStyle).toBe('soft')
    })
  })

  describe('setFontFamily', () => {
    it('should set font family to system', () => {
      act(() => {
        useThemeStore.getState().setFontFamily('system')
      })

      expect(useThemeStore.getState().fontFamily).toBe('system')
    })

    it('should set font family to inter', () => {
      act(() => {
        useThemeStore.getState().setFontFamily('inter')
      })

      expect(useThemeStore.getState().fontFamily).toBe('inter')
    })

    it('should set font family to roboto', () => {
      act(() => {
        useThemeStore.getState().setFontFamily('roboto')
      })

      expect(useThemeStore.getState().fontFamily).toBe('roboto')
    })

    it('should set font family to poppins', () => {
      act(() => {
        useThemeStore.getState().setFontFamily('poppins')
      })

      expect(useThemeStore.getState().fontFamily).toBe('poppins')
    })

    it('should set font family to mono', () => {
      act(() => {
        useThemeStore.getState().setFontFamily('mono')
      })

      expect(useThemeStore.getState().fontFamily).toBe('mono')
    })
  })

  describe('setTimerSize', () => {
    it('should set timer size', () => {
      act(() => {
        useThemeStore.getState().setTimerSize(120)
      })

      expect(useThemeStore.getState().timerSize).toBe(120)
    })

    it('should accept small values', () => {
      act(() => {
        useThemeStore.getState().setTimerSize(50)
      })

      expect(useThemeStore.getState().timerSize).toBe(50)
    })

    it('should accept large values', () => {
      act(() => {
        useThemeStore.getState().setTimerSize(200)
      })

      expect(useThemeStore.getState().timerSize).toBe(200)
    })
  })

  describe('setReducedMotion', () => {
    it('should enable reduced motion', () => {
      act(() => {
        useThemeStore.getState().setReducedMotion(true)
      })

      expect(useThemeStore.getState().reducedMotion).toBe(true)
    })

    it('should disable reduced motion', () => {
      act(() => {
        useThemeStore.getState().setReducedMotion(true)
        useThemeStore.getState().setReducedMotion(false)
      })

      expect(useThemeStore.getState().reducedMotion).toBe(false)
    })
  })

  describe('setHighContrast', () => {
    it('should enable high contrast', () => {
      act(() => {
        useThemeStore.getState().setHighContrast(true)
      })

      expect(useThemeStore.getState().highContrast).toBe(true)
    })

    it('should disable high contrast', () => {
      act(() => {
        useThemeStore.getState().setHighContrast(true)
        useThemeStore.getState().setHighContrast(false)
      })

      expect(useThemeStore.getState().highContrast).toBe(false)
    })
  })

  describe('updateTheme', () => {
    it('should update multiple properties at once', () => {
      act(() => {
        useThemeStore.getState().updateTheme({
          mode: 'light',
          accentColor: 'blue',
          timerSize: 150,
        })
      })

      const state = useThemeStore.getState()
      expect(state.mode).toBe('light')
      expect(state.accentColor).toBe('blue')
      expect(state.timerSize).toBe(150)
    })

    it('should not affect unspecified properties', () => {
      const originalPreset = useThemeStore.getState().preset

      act(() => {
        useThemeStore.getState().updateTheme({
          mode: 'light',
        })
      })

      expect(useThemeStore.getState().preset).toBe(originalPreset)
    })

    it('should handle empty update', () => {
      const stateBefore = { ...useThemeStore.getState() }

      act(() => {
        useThemeStore.getState().updateTheme({})
      })

      const stateAfter = useThemeStore.getState()
      expect(stateAfter.mode).toBe(stateBefore.mode)
      expect(stateAfter.preset).toBe(stateBefore.preset)
    })

    it('should update all properties when provided', () => {
      const newTheme: Partial<ThemeSettings> = {
        mode: 'light',
        preset: 'ocean',
        accentColor: 'blue',
        gradientBackground: 'linear-gradient(red, blue)',
        customBackgroundUrl: 'https://example.com/bg.jpg',
        timerStyle: 'neon',
        glowEnabled: false,
        blurEnabled: false,
        particlesEnabled: true,
        borderRadius: 24,
        buttonStyle: 'pill',
        fontFamily: 'mono',
        timerSize: 150,
        reducedMotion: true,
        highContrast: true,
      }

      act(() => {
        useThemeStore.getState().updateTheme(newTheme)
      })

      const state = useThemeStore.getState()
      Object.entries(newTheme).forEach(([key, value]) => {
        expect(state[key as keyof ThemeSettings]).toBe(value)
      })
    })
  })

  describe('resetToDefaults', () => {
    it('should reset all properties to default values', () => {
      // First, change all properties
      act(() => {
        useThemeStore.getState().updateTheme({
          mode: 'light',
          preset: 'custom',
          accentColor: 'red',
          gradientBackground: 'some-gradient',
          customBackgroundUrl: 'https://example.com',
          timerStyle: 'neon',
          glowEnabled: false,
          blurEnabled: false,
          particlesEnabled: true,
          borderRadius: 0,
          buttonStyle: 'sharp',
          fontFamily: 'mono',
          timerSize: 50,
          reducedMotion: true,
          highContrast: true,
        })
      })

      // Then reset
      act(() => {
        useThemeStore.getState().resetToDefaults()
      })

      const state = useThemeStore.getState()
      expect(state.mode).toBe(DEFAULT_THEME.mode)
      expect(state.preset).toBe(DEFAULT_THEME.preset)
      expect(state.accentColor).toBe(DEFAULT_THEME.accentColor)
      expect(state.gradientBackground).toBe(DEFAULT_THEME.gradientBackground)
      expect(state.customBackgroundUrl).toBe(DEFAULT_THEME.customBackgroundUrl)
      expect(state.timerStyle).toBe(DEFAULT_THEME.timerStyle)
      expect(state.glowEnabled).toBe(DEFAULT_THEME.glowEnabled)
      expect(state.blurEnabled).toBe(DEFAULT_THEME.blurEnabled)
      expect(state.particlesEnabled).toBe(DEFAULT_THEME.particlesEnabled)
      expect(state.borderRadius).toBe(DEFAULT_THEME.borderRadius)
      expect(state.buttonStyle).toBe(DEFAULT_THEME.buttonStyle)
      expect(state.fontFamily).toBe(DEFAULT_THEME.fontFamily)
      expect(state.timerSize).toBe(DEFAULT_THEME.timerSize)
      expect(state.reducedMotion).toBe(DEFAULT_THEME.reducedMotion)
      expect(state.highContrast).toBe(DEFAULT_THEME.highContrast)
    })

    it('should be idempotent', () => {
      act(() => {
        useThemeStore.getState().resetToDefaults()
        useThemeStore.getState().resetToDefaults()
        useThemeStore.getState().resetToDefaults()
      })

      const state = useThemeStore.getState()
      expect(state.mode).toBe(DEFAULT_THEME.mode)
    })
  })

  describe('Persistence', () => {
    it('should persist theme to localStorage', () => {
      act(() => {
        useThemeStore.getState().setMode('light')
        useThemeStore.getState().setAccentColor('blue')
      })

      const stored = localStorage.getItem('timer-theme-settings')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.state.mode).toBe('light')
      expect(parsed.state.accentColor).toBe('blue')
    })

    it('should use correct storage key', () => {
      act(() => {
        useThemeStore.getState().setMode('light')
      })

      const stored = localStorage.getItem('timer-theme-settings')
      expect(stored).toBeTruthy()
    })

    it('should persist all theme properties', () => {
      act(() => {
        useThemeStore.getState().updateTheme({
          mode: 'light',
          preset: 'ocean',
          accentColor: 'blue',
          timerStyle: 'neon',
          glowEnabled: false,
          borderRadius: 24,
        })
      })

      const stored = localStorage.getItem('timer-theme-settings')
      const parsed = JSON.parse(stored!)
      
      expect(parsed.state.mode).toBe('light')
      expect(parsed.state.preset).toBe('ocean')
      expect(parsed.state.accentColor).toBe('blue')
      expect(parsed.state.timerStyle).toBe('neon')
      expect(parsed.state.glowEnabled).toBe(false)
      expect(parsed.state.borderRadius).toBe(24)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid successive updates', () => {
      expect(() => {
        act(() => {
          for (let i = 0; i < 100; i++) {
            useThemeStore.getState().setTimerSize(50 + i)
          }
        })
      }).not.toThrow()

      expect(useThemeStore.getState().timerSize).toBe(149)
    })

    it('should handle setting same value multiple times', () => {
      act(() => {
        useThemeStore.getState().setMode('light')
        useThemeStore.getState().setMode('light')
        useThemeStore.getState().setMode('light')
      })

      expect(useThemeStore.getState().mode).toBe('light')
    })

    it('should handle very long string values', () => {
      const longString = 'a'.repeat(10000)
      
      act(() => {
        useThemeStore.getState().setPreset(longString)
      })

      expect(useThemeStore.getState().preset).toBe(longString)
    })

    it('should handle special characters in string values', () => {
      const specialChars = '<script>alert("xss")</script> & "quotes" \'single\' `backticks`'
      
      act(() => {
        useThemeStore.getState().setPreset(specialChars)
      })

      expect(useThemeStore.getState().preset).toBe(specialChars)
    })

    it('should handle negative border radius', () => {
      act(() => {
        useThemeStore.getState().setBorderRadius(-10)
      })

      // Store accepts the value - validation should be done at UI level
      expect(useThemeStore.getState().borderRadius).toBe(-10)
    })

    it('should handle negative timer size', () => {
      act(() => {
        useThemeStore.getState().setTimerSize(-50)
      })

      // Store accepts the value - validation should be done at UI level
      expect(useThemeStore.getState().timerSize).toBe(-50)
    })

    it('should handle URL-like strings in gradient background', () => {
      const urlLikeGradient = 'url(https://example.com/image.png), linear-gradient(red, blue)'
      
      act(() => {
        useThemeStore.getState().setGradientBackground(urlLikeGradient)
      })

      expect(useThemeStore.getState().gradientBackground).toBe(urlLikeGradient)
    })
  })

  describe('State Independence', () => {
    it('should not affect other state when updating one property', () => {
      // Store original state
      const originalState = { ...useThemeStore.getState() }

      act(() => {
        useThemeStore.getState().setMode('light')
      })

      const newState = useThemeStore.getState()
      
      // Only mode should change
      expect(newState.mode).toBe('light')
      expect(newState.preset).toBe(originalState.preset)
      expect(newState.accentColor).toBe(originalState.accentColor)
      expect(newState.timerStyle).toBe(originalState.timerStyle)
      expect(newState.glowEnabled).toBe(originalState.glowEnabled)
      expect(newState.blurEnabled).toBe(originalState.blurEnabled)
    })
  })
})
