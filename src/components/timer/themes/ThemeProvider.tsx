/**
 * ThemeProvider Component
 * Applies theme settings to the document and manages theme state
 */

import { useEffect } from 'react'
import { useThemeStore } from './themeStore'

// Accent color mappings
const ACCENT_COLORS: Record<string, { primary: string; secondary: string }> = {
  indigo: { primary: '#6366f1', secondary: '#818cf8' },
  violet: { primary: '#8b5cf6', secondary: '#a78bfa' },
  purple: { primary: '#a855f7', secondary: '#c084fc' },
  pink: { primary: '#ec4899', secondary: '#f472b6' },
  rose: { primary: '#f43f5e', secondary: '#fb7185' },
  red: { primary: '#ef4444', secondary: '#f87171' },
  orange: { primary: '#f97316', secondary: '#fb923c' },
  amber: { primary: '#f59e0b', secondary: '#fbbf24' },
  yellow: { primary: '#eab308', secondary: '#facc15' },
  lime: { primary: '#84cc16', secondary: '#a3e635' },
  green: { primary: '#22c55e', secondary: '#4ade80' },
  emerald: { primary: '#10b981', secondary: '#34d399' },
  teal: { primary: '#14b8a6', secondary: '#2dd4bf' },
  cyan: { primary: '#06b6d4', secondary: '#22d3ee' },
  sky: { primary: '#0ea5e9', secondary: '#38bdf8' },
  blue: { primary: '#3b82f6', secondary: '#60a5fa' },
}

// Font family mappings
const FONT_FAMILIES: Record<string, string> = {
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  inter: 'Inter, system-ui, sans-serif',
  roboto: 'Roboto, system-ui, sans-serif',
  poppins: 'Poppins, system-ui, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
}

// Theme preset color mappings
const THEME_PRESET_COLORS: Record<string, { bg: string; card: string; accent: string }> = {
  // Dark themes
  'ultra-dark': { bg: '#020617', card: '#0f172a', accent: '#8b5cf6' },
  'default': { bg: '#0f172a', card: '#1e293b', accent: '#6366f1' },
  'midnight': { bg: '#0c0a1d', card: '#1a1730', accent: '#8b5cf6' },
  'ocean': { bg: '#0a1929', card: '#0d2137', accent: '#06b6d4' },
  'forest': { bg: '#0a1f1a', card: '#0d2a23', accent: '#10b981' },
  'sunset': { bg: '#1a1410', card: '#2a1f18', accent: '#f97316' },
  'cherry': { bg: '#1a0a10', card: '#2a1520', accent: '#f43f5e' },
  'amoled': { bg: '#000000', card: '#0a0a0a', accent: '#6366f1' },
  'nord': { bg: '#2e3440', card: '#3b4252', accent: '#88c0d0' },
  'dracula': { bg: '#282a36', card: '#44475a', accent: '#bd93f9' },
  'monokai': { bg: '#272822', card: '#3e3d32', accent: '#f8f8f2' },
  // Light themes
  'minimal-light': { bg: '#ffffff', card: '#f8fafc', accent: '#64748b' },
  'warm-light': { bg: '#fffbeb', card: '#fef3c7', accent: '#f59e0b' },
  'cool-light': { bg: '#f0f9ff', card: '#e0f2fe', accent: '#0ea5e9' },
  'lavender': { bg: '#faf5ff', card: '#f3e8ff', accent: '#8b5cf6' },
  'mint': { bg: '#ecfdf5', card: '#d1fae5', accent: '#10b981' },
  'peach': { bg: '#fff7ed', card: '#ffedd5', accent: '#f97316' },
  'rose-light': { bg: '#fdf2f8', card: '#fce7f3', accent: '#ec4899' },
  'paper': { bg: '#fafaf9', card: '#f5f5f4', accent: '#78716c' },
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore()

  useEffect(() => {
    const root = document.documentElement

    // Detect system theme if mode is 'system'
    let effectiveMode = theme.mode
    if (theme.mode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      effectiveMode = isDark ? 'dark' : 'light'
    }

    // Apply dark/light mode class
    if (effectiveMode === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }

    // Apply preset-specific colors
    const presetColors = THEME_PRESET_COLORS[theme.preset]
    if (presetColors) {
      root.style.setProperty('--color-background', presetColors.bg)
      root.style.setProperty('--color-card', presetColors.card)
      root.style.setProperty('--color-preset-accent', presetColors.accent)
      
      // Calculate secondary colors based on preset
      const isDarkPreset = effectiveMode === 'dark'
      if (isDarkPreset) {
        // For dark themes, make secondary colors lighter
        root.style.setProperty('--color-background-secondary', presetColors.bg)
        root.style.setProperty('--color-card-hover', lightenColor(presetColors.card, 10))
        root.style.setProperty('--color-border', presetColors.card)
      } else {
        // For light themes, make secondary colors darker
        root.style.setProperty('--color-background-secondary', darkenColor(presetColors.bg, 3))
        root.style.setProperty('--color-card-hover', darkenColor(presetColors.card, 5))
        root.style.setProperty('--color-border', darkenColor(presetColors.card, 10))
      }
    } else {
      // Remove custom properties if no preset
      root.style.removeProperty('--color-background')
      root.style.removeProperty('--color-background-secondary')
      root.style.removeProperty('--color-card')
      root.style.removeProperty('--color-card-hover')
      root.style.removeProperty('--color-border')
      root.style.removeProperty('--color-preset-accent')
    }
    
    // Apply preset-specific class for ultra-dark (for compatibility)
    if (theme.preset === 'ultra-dark' && effectiveMode === 'dark') {
      root.classList.add('theme-ultra-dark')
    } else {
      root.classList.remove('theme-ultra-dark')
    }

    // Apply high contrast
    if (theme.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Apply reduced motion
    if (theme.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }

    // Apply accent color
    const accentColor = ACCENT_COLORS[theme.accentColor] || ACCENT_COLORS.violet
    root.style.setProperty('--color-primary', accentColor.primary)
    root.style.setProperty('--color-primary-hover', accentColor.secondary)

    // Apply border radius
    root.style.setProperty('--border-radius', `${theme.borderRadius}px`)
    root.style.setProperty('--border-radius-sm', `${theme.borderRadius / 2}px`)
    root.style.setProperty('--border-radius-lg', `${theme.borderRadius * 1.5}px`)

    // Apply font family
    const fontFamily = FONT_FAMILIES[theme.fontFamily] || FONT_FAMILIES.system
    root.style.setProperty('--font-family', fontFamily)
    document.body.style.fontFamily = fontFamily

    // Apply timer size
    root.style.setProperty('--timer-size', `${theme.timerSize}%`)

    // Apply effects
    root.style.setProperty('--glow-enabled', theme.glowEnabled ? '1' : '0')
    root.style.setProperty('--blur-enabled', theme.blurEnabled ? '1' : '0')

    // Apply gradient background if enabled
    if (theme.gradientBackground) {
      root.style.setProperty('--gradient-background', theme.gradientBackground)
      root.classList.add('has-gradient-background')
    } else {
      root.style.removeProperty('--gradient-background')
      root.classList.remove('has-gradient-background')
    }

    // Apply custom background image if enabled
    if (theme.customBackgroundUrl) {
      root.style.setProperty('--custom-background-url', `url(${theme.customBackgroundUrl})`)
      root.classList.add('has-custom-background')
    } else {
      root.style.removeProperty('--custom-background-url')
      root.classList.remove('has-custom-background')
    }

    // Store timer style as data attribute for conditional styling
    root.setAttribute('data-timer-style', theme.timerStyle)
    root.setAttribute('data-button-style', theme.buttonStyle)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme.mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const root = document.documentElement
      if (mediaQuery.matches) {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.remove('dark')
        root.classList.add('light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme.mode])

  return <>{children}</>
}

// Helper function to lighten a color
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((num >> 16) & 255) + Math.floor((255 - ((num >> 16) & 255)) * (percent / 100)))
  const g = Math.min(255, ((num >> 8) & 255) + Math.floor((255 - ((num >> 8) & 255)) * (percent / 100)))
  const b = Math.min(255, (num & 255) + Math.floor((255 - (num & 255)) * (percent / 100)))
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}

// Helper function to darken a color
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, ((num >> 16) & 255) - Math.floor(((num >> 16) & 255) * (percent / 100)))
  const g = Math.max(0, ((num >> 8) & 255) - Math.floor(((num >> 8) & 255) * (percent / 100)))
  const b = Math.max(0, (num & 255) - Math.floor((num & 255) * (percent / 100)))
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}
