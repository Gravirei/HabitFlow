/**
 * Theme System Types
 * TypeScript interfaces for the theme system
 */

export type ThemeMode = 'light' | 'dark' | 'system'

export type TimerStyle = 'default' | 'minimal' | 'bold' | 'neon' | 'retro' | 'gradient'

export type ButtonStyle = 'rounded' | 'pill' | 'sharp' | 'soft'

export type FontFamily = 'system' | 'inter' | 'roboto' | 'poppins' | 'mono'

export interface ThemeColors {
  primary: string
  primaryHover: string
  secondary: string
  background: string
  backgroundSecondary: string
  card: string
  cardHover: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
  info: string
}

export interface ThemeSettings {
  // Appearance
  mode: ThemeMode
  preset: string
  accentColor: string
  
  // Background
  gradientBackground: string | null
  customBackgroundUrl: string | null
  
  // Effects
  timerStyle: TimerStyle
  glowEnabled: boolean
  blurEnabled: boolean
  particlesEnabled: boolean
  borderRadius: number
  buttonStyle: ButtonStyle
  
  // Display
  fontFamily: FontFamily
  timerSize: number
  reducedMotion: boolean
  highContrast: boolean
}

export interface ThemePreset {
  id: string
  name: string
  mode: 'light' | 'dark'
  accent: string
  preview: {
    bg: string
    card: string
    accent: string
  }
  description: string
  special?: boolean
}

export interface AccentColor {
  id: string
  label: string
  primary: string
  secondary: string
}

export interface GradientBackground {
  id: string
  gradient: string
  name: string
}
