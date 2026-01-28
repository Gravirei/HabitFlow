/**
 * Theme Store
 * Zustand store for managing theme state with localStorage persistence
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeSettings } from './types'

interface ThemeStore extends ThemeSettings {
  // Actions
  setMode: (mode: ThemeSettings['mode']) => void
  setPreset: (preset: string) => void
  setAccentColor: (color: string) => void
  setGradientBackground: (gradient: string | null) => void
  setCustomBackgroundUrl: (url: string | null) => void
  setTimerStyle: (style: ThemeSettings['timerStyle']) => void
  setGlowEnabled: (enabled: boolean) => void
  setBlurEnabled: (enabled: boolean) => void
  setParticlesEnabled: (enabled: boolean) => void
  setBorderRadius: (radius: number) => void
  setButtonStyle: (style: ThemeSettings['buttonStyle']) => void
  setFontFamily: (font: ThemeSettings['fontFamily']) => void
  setTimerSize: (size: number) => void
  setReducedMotion: (enabled: boolean) => void
  setHighContrast: (enabled: boolean) => void
  
  // Bulk update
  updateTheme: (partial: Partial<ThemeSettings>) => void
  
  // Reset
  resetToDefaults: () => void
}

const DEFAULT_THEME: ThemeSettings = {
  // Appearance
  mode: 'dark',
  preset: 'ultra-dark',
  accentColor: 'violet',
  
  // Background
  gradientBackground: null,
  customBackgroundUrl: null,
  
  // Effects
  timerStyle: 'default',
  glowEnabled: true,
  blurEnabled: true,
  particlesEnabled: false,
  borderRadius: 16,
  buttonStyle: 'rounded',
  
  // Display
  fontFamily: 'system',
  timerSize: 100,
  reducedMotion: false,
  highContrast: false,
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      ...DEFAULT_THEME,
      
      // Individual setters
      setMode: (mode) => set({ mode }),
      setPreset: (preset) => set({ preset }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setGradientBackground: (gradientBackground) => set({ gradientBackground }),
      setCustomBackgroundUrl: (customBackgroundUrl) => set({ customBackgroundUrl }),
      setTimerStyle: (timerStyle) => set({ timerStyle }),
      setGlowEnabled: (glowEnabled) => set({ glowEnabled }),
      setBlurEnabled: (blurEnabled) => set({ blurEnabled }),
      setParticlesEnabled: (particlesEnabled) => set({ particlesEnabled }),
      setBorderRadius: (borderRadius) => set({ borderRadius }),
      setButtonStyle: (buttonStyle) => set({ buttonStyle }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setTimerSize: (timerSize) => set({ timerSize }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setHighContrast: (highContrast) => set({ highContrast }),
      
      // Bulk update
      updateTheme: (partial) => set((state) => ({ ...state, ...partial })),
      
      // Reset
      resetToDefaults: () => set(DEFAULT_THEME),
    }),
    {
      name: 'timer-theme-settings',
    }
  )
)
