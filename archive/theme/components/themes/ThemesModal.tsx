/**
 * Themes Modal
 * Customize app appearance with themes, colors, and visual preferences
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from './themeStore'
import toast from 'react-hot-toast'
import { useDeviceType } from '../../../hooks/useDeviceType'

interface ThemesModalProps {
  isOpen: boolean
  onClose: () => void
}

// Theme mode options
const THEME_MODES = [
  { id: 'light', label: 'Light', icon: 'light_mode', description: 'Bright and clean' },
  { id: 'dark', label: 'Dark', icon: 'dark_mode', description: 'Easy on the eyes' },
  { id: 'system', label: 'System', icon: 'settings_suggest', description: 'Match device settings' },
] as const

// Accent color presets
const ACCENT_COLORS = [
  { id: 'indigo', label: 'Indigo', primary: '#6366f1', secondary: '#818cf8' },
  { id: 'violet', label: 'Violet', primary: '#8b5cf6', secondary: '#a78bfa' },
  { id: 'purple', label: 'Purple', primary: '#a855f7', secondary: '#c084fc' },
  { id: 'pink', label: 'Pink', primary: '#ec4899', secondary: '#f472b6' },
  { id: 'rose', label: 'Rose', primary: '#f43f5e', secondary: '#fb7185' },
  { id: 'red', label: 'Red', primary: '#ef4444', secondary: '#f87171' },
  { id: 'orange', label: 'Orange', primary: '#f97316', secondary: '#fb923c' },
  { id: 'amber', label: 'Amber', primary: '#f59e0b', secondary: '#fbbf24' },
  { id: 'yellow', label: 'Yellow', primary: '#eab308', secondary: '#facc15' },
  { id: 'lime', label: 'Lime', primary: '#84cc16', secondary: '#a3e635' },
  { id: 'green', label: 'Green', primary: '#22c55e', secondary: '#4ade80' },
  { id: 'emerald', label: 'Emerald', primary: '#10b981', secondary: '#34d399' },
  { id: 'teal', label: 'Teal', primary: '#14b8a6', secondary: '#2dd4bf' },
  { id: 'cyan', label: 'Cyan', primary: '#06b6d4', secondary: '#22d3ee' },
  { id: 'sky', label: 'Sky', primary: '#0ea5e9', secondary: '#38bdf8' },
  { id: 'blue', label: 'Blue', primary: '#3b82f6', secondary: '#60a5fa' },
] as const

// Pre-built theme presets - Dark themes
const DARK_THEME_PRESETS = [
  { 
    id: 'ultra-dark', 
    name: 'Ultra Dark', 
    mode: 'dark', 
    accent: 'violet',
    preview: { bg: '#020617', card: '#0f172a', accent: '#8b5cf6' },
    description: '⭐ Deepest black',
    special: true
  },
  { 
    id: 'default', 
    name: 'Default', 
    mode: 'dark', 
    accent: 'indigo',
    preview: { bg: '#0f172a', card: '#1e293b', accent: '#6366f1' },
    description: 'Classic dark theme'
  },
  { 
    id: 'midnight', 
    name: 'Midnight', 
    mode: 'dark', 
    accent: 'violet',
    preview: { bg: '#0c0a1d', card: '#1a1730', accent: '#8b5cf6' },
    description: 'Deep purple vibes'
  },
  { 
    id: 'ocean', 
    name: 'Ocean', 
    mode: 'dark', 
    accent: 'cyan',
    preview: { bg: '#0a1929', card: '#0d2137', accent: '#06b6d4' },
    description: 'Deep sea blue'
  },
  { 
    id: 'forest', 
    name: 'Forest', 
    mode: 'dark', 
    accent: 'emerald',
    preview: { bg: '#0a1f1a', card: '#0d2a23', accent: '#10b981' },
    description: 'Nature inspired'
  },
  { 
    id: 'sunset', 
    name: 'Sunset', 
    mode: 'dark', 
    accent: 'orange',
    preview: { bg: '#1a1410', card: '#2a1f18', accent: '#f97316' },
    description: 'Warm golden hour'
  },
  { 
    id: 'cherry', 
    name: 'Cherry', 
    mode: 'dark', 
    accent: 'rose',
    preview: { bg: '#1a0a10', card: '#2a1520', accent: '#f43f5e' },
    description: 'Bold and vibrant'
  },
  { 
    id: 'amoled', 
    name: 'AMOLED', 
    mode: 'dark', 
    accent: 'indigo',
    preview: { bg: '#000000', card: '#0a0a0a', accent: '#6366f1' },
    description: 'Pure black for OLED'
  },
  { 
    id: 'nord', 
    name: 'Nord', 
    mode: 'dark', 
    accent: 'sky',
    preview: { bg: '#2e3440', card: '#3b4252', accent: '#88c0d0' },
    description: 'Arctic inspired'
  },
  { 
    id: 'dracula', 
    name: 'Dracula', 
    mode: 'dark', 
    accent: 'purple',
    preview: { bg: '#282a36', card: '#44475a', accent: '#bd93f9' },
    description: 'Popular dark theme'
  },
  { 
    id: 'monokai', 
    name: 'Monokai', 
    mode: 'dark', 
    accent: 'yellow',
    preview: { bg: '#272822', card: '#3e3d32', accent: '#f8f8f2' },
    description: 'Developer favorite'
  },
] as const

// Light theme presets
const LIGHT_THEME_PRESETS = [
  { 
    id: 'minimal-light', 
    name: 'Minimal', 
    mode: 'light', 
    accent: 'slate',
    preview: { bg: '#ffffff', card: '#f8fafc', accent: '#64748b' },
    description: 'Clean and simple'
  },
  { 
    id: 'warm-light', 
    name: 'Warm', 
    mode: 'light', 
    accent: 'amber',
    preview: { bg: '#fffbeb', card: '#fef3c7', accent: '#f59e0b' },
    description: 'Cozy and inviting'
  },
  { 
    id: 'cool-light', 
    name: 'Cool', 
    mode: 'light', 
    accent: 'sky',
    preview: { bg: '#f0f9ff', card: '#e0f2fe', accent: '#0ea5e9' },
    description: 'Fresh and calm'
  },
  { 
    id: 'lavender', 
    name: 'Lavender', 
    mode: 'light', 
    accent: 'violet',
    preview: { bg: '#faf5ff', card: '#f3e8ff', accent: '#8b5cf6' },
    description: 'Soft purple tones'
  },
  { 
    id: 'mint', 
    name: 'Mint', 
    mode: 'light', 
    accent: 'emerald',
    preview: { bg: '#ecfdf5', card: '#d1fae5', accent: '#10b981' },
    description: 'Fresh and natural'
  },
  { 
    id: 'peach', 
    name: 'Peach', 
    mode: 'light', 
    accent: 'orange',
    preview: { bg: '#fff7ed', card: '#ffedd5', accent: '#f97316' },
    description: 'Warm and friendly'
  },
  { 
    id: 'rose-light', 
    name: 'Rose', 
    mode: 'light', 
    accent: 'pink',
    preview: { bg: '#fdf2f8', card: '#fce7f3', accent: '#ec4899' },
    description: 'Soft and elegant'
  },
  { 
    id: 'paper', 
    name: 'Paper', 
    mode: 'light', 
    accent: 'stone',
    preview: { bg: '#fafaf9', card: '#f5f5f4', accent: '#78716c' },
    description: 'Like real paper'
  },
] as const

// Timer display styles
const TIMER_STYLES = [
  { id: 'default', name: 'Default', description: 'Standard digital display', icon: 'timer' },
  { id: 'minimal', name: 'Minimal', description: 'Clean and simple', icon: 'remove' },
  { id: 'bold', name: 'Bold', description: 'Large and prominent', icon: 'format_bold' },
  { id: 'neon', name: 'Neon', description: 'Glowing effect', icon: 'fluorescent' },
  { id: 'retro', name: 'Retro', description: 'Vintage LCD style', icon: 'looks_3' },
  { id: 'gradient', name: 'Gradient', description: 'Colorful gradient text', icon: 'gradient' },
] as const

// Background patterns
const BG_PATTERNS = [
  { id: 'none', name: 'None', preview: 'transparent' },
  { id: 'dots', name: 'Dots', preview: 'radial-gradient(circle, currentColor 1px, transparent 1px)' },
  { id: 'grid', name: 'Grid', preview: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)' },
  { id: 'diagonal', name: 'Diagonal', preview: 'repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)' },
  { id: 'waves', name: 'Waves', preview: 'url("data:image/svg+xml,...")' },
] as const

// Gradient backgrounds
const GRADIENT_BACKGROUNDS = [
  { id: 'purple-pink', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Purple Pink' },
  { id: 'pink-red', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Pink Red' },
  { id: 'blue-cyan', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Blue Cyan' },
  { id: 'green-cyan', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: 'Green Cyan' },
  { id: 'pink-yellow', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', name: 'Pink Yellow' },
  { id: 'purple-pink-light', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', name: 'Lavender' },
  { id: 'teal-purple', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', name: 'Teal Purple' },
  { id: 'peach', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', name: 'Peach' },
  { id: 'ocean-blue', gradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)', name: 'Ocean Blue' },
  { id: 'sunset-orange', gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', name: 'Sunset Orange' },
  { id: 'northern-lights', gradient: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)', name: 'Northern Lights' },
  { id: 'cosmic', gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', name: 'Cosmic' },
] as const

// Font options
const FONT_OPTIONS = [
  { id: 'system', label: 'System Default', family: 'system-ui' },
  { id: 'inter', label: 'Inter', family: 'Inter' },
  { id: 'roboto', label: 'Roboto', family: 'Roboto' },
  { id: 'poppins', label: 'Poppins', family: 'Poppins' },
  { id: 'mono', label: 'Monospace', family: 'JetBrains Mono' },
] as const

type TabType = 'themes' | 'colors' | 'effects' | 'display'

export function ThemesModal({ isOpen, onClose }: ThemesModalProps) {
  const theme = useThemeStore()
  const deviceType = useDeviceType()
  const isMobile = deviceType === 'mobile'
  const [activeTab, setActiveTab] = useState<TabType>('themes')
  
  // Local state for preview (changes not saved until Apply is clicked)
  const [selectedMode, setSelectedMode] = useState(theme.mode)
  const [selectedAccent, setSelectedAccent] = useState(theme.accentColor)
  const [selectedPreset, setSelectedPreset] = useState(theme.preset)
  const [selectedFont, setSelectedFont] = useState(theme.fontFamily)
  const [selectedTimerStyle, setSelectedTimerStyle] = useState(theme.timerStyle)
  const [selectedGradientBg, setSelectedGradientBg] = useState(theme.gradientBackground)
  const [timerSize, setTimerSize] = useState(theme.timerSize)
  const [reducedMotion, setReducedMotion] = useState(theme.reducedMotion)
  const [highContrast, setHighContrast] = useState(theme.highContrast)
  const [customBgEnabled, setCustomBgEnabled] = useState(!!theme.gradientBackground)
  const [glowEnabled, setGlowEnabled] = useState(theme.glowEnabled)
  const [blurEnabled, setBlurEnabled] = useState(theme.blurEnabled)
  const [particlesEnabled, setParticlesEnabled] = useState(theme.particlesEnabled)
  const [borderRadius, setBorderRadius] = useState(theme.borderRadius)
  const [buttonStyle, setButtonStyle] = useState(theme.buttonStyle)

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMode(theme.mode)
      setSelectedAccent(theme.accentColor)
      setSelectedPreset(theme.preset)
      setSelectedFont(theme.fontFamily)
      setSelectedTimerStyle(theme.timerStyle)
      setSelectedGradientBg(theme.gradientBackground)
      setTimerSize(theme.timerSize)
      setReducedMotion(theme.reducedMotion)
      setHighContrast(theme.highContrast)
      setCustomBgEnabled(!!theme.gradientBackground)
      setGlowEnabled(theme.glowEnabled)
      setBlurEnabled(theme.blurEnabled)
      setParticlesEnabled(theme.particlesEnabled)
      setBorderRadius(theme.borderRadius)
      setButtonStyle(theme.buttonStyle)
    }
  }, [isOpen, theme])

  const tabs = [
    { id: 'themes' as TabType, label: 'Themes', icon: 'palette' },
    { id: 'colors' as TabType, label: 'Colors', icon: 'colorize' },
    { id: 'effects' as TabType, label: 'Effects', icon: 'auto_awesome' },
    { id: 'display' as TabType, label: 'Display', icon: 'tune' },
  ]

  const handleApply = () => {
    // Apply all settings to the store
    theme.updateTheme({
      mode: selectedMode as any,
      preset: selectedPreset,
      accentColor: selectedAccent,
      gradientBackground: customBgEnabled ? selectedGradientBg : null,
      timerStyle: selectedTimerStyle as any,
      glowEnabled,
      blurEnabled,
      particlesEnabled,
      borderRadius,
      buttonStyle: buttonStyle as any,
      fontFamily: selectedFont as any,
      timerSize,
      reducedMotion,
      highContrast,
    })
    
    toast.success('Theme applied successfully!')
    onClose()
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all theme settings to defaults?')) {
      theme.resetToDefaults()
      toast.success('Theme reset to defaults')
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed z-50 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col ${
              isMobile 
                ? 'inset-0 rounded-none' 
                : 'inset-x-4 top-[5%] mx-auto max-w-3xl max-h-[90vh] rounded-3xl'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 ${
              isMobile ? 'px-4 py-3' : 'px-6 py-4'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg ${
                  isMobile ? 'w-8 h-8' : 'w-10 h-10'
                }`}>
                  <span className={`material-symbols-outlined text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>palette</span>
                </div>
                <div>
                  <h2 className={`font-bold text-slate-900 dark:text-white ${isMobile ? 'text-base' : 'text-lg'}`}>Themes</h2>
                  {!isMobile && <p className="text-xs text-slate-500 dark:text-slate-400">Customize your experience</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>

            {/* Tabs */}
            <div className={`flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 ${
              isMobile ? 'gap-1 p-2 overflow-x-auto' : 'gap-2 p-4'
            }`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center rounded-xl font-medium transition-all whitespace-nowrap ${
                    isMobile 
                      ? 'gap-1.5 px-3 py-2 text-xs flex-1 min-w-0 justify-center' 
                      : 'gap-2 px-4 py-2.5 text-sm'
                  } ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={`material-symbols-outlined ${isMobile ? 'text-base' : 'text-lg'}`}>{tab.icon}</span>
                  {isMobile ? (
                    <span className="truncate">{tab.label}</span>
                  ) : (
                    tab.label
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className={`overflow-y-auto flex-1 ${isMobile ? 'p-4' : 'p-6'}`}>
              {/* Themes Tab */}
              {activeTab === 'themes' && (
                <div className={isMobile ? 'space-y-6' : 'space-y-8'}>
                  {/* Theme Mode */}
                  <section>
                    <h3 className={`font-semibold text-slate-900 dark:text-white flex items-center gap-2 ${
                      isMobile ? 'text-xs mb-3' : 'text-sm mb-4'
                    }`}>
                      <span className={`material-symbols-outlined text-violet-500 ${isMobile ? 'text-base' : 'text-lg'}`}>contrast</span>
                      Appearance Mode
                    </h3>
                    <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-3 gap-3'}`}>
                      {THEME_MODES.map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setSelectedMode(mode.id)}
                          className={`relative rounded-2xl border-2 transition-all ${
                            isMobile ? 'p-3 flex items-center gap-3' : 'p-4'
                          } ${
                            selectedMode === mode.id
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          {selectedMode === mode.id && (
                            <div className="absolute top-2 right-2">
                              <span className={`material-symbols-outlined text-violet-500 ${isMobile ? 'text-base' : 'text-lg'}`}>check_circle</span>
                            </div>
                          )}
                          <div className={`rounded-xl flex items-center justify-center ${
                            isMobile ? 'w-10 h-10' : 'w-12 h-12 mb-3'
                          } ${
                            mode.id === 'light' 
                              ? 'bg-gradient-to-br from-amber-100 to-orange-200' 
                              : mode.id === 'dark'
                                ? 'bg-gradient-to-br from-slate-700 to-slate-900'
                                : 'bg-gradient-to-br from-slate-400 to-slate-600'
                          }`}>
                            <span className={`material-symbols-outlined ${isMobile ? 'text-xl' : 'text-2xl'} ${
                              mode.id === 'light' ? 'text-amber-600' : 'text-white'
                            }`}>
                              {mode.icon}
                            </span>
                          </div>
                          <div className={isMobile ? 'flex-1 text-left' : 'text-left'}>
                            <div className={`font-semibold text-slate-900 dark:text-white ${isMobile ? 'text-sm' : ''}`}>{mode.label}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{mode.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Dark Theme Presets */}
                  <section>
                    <h3 className={`font-semibold text-slate-900 dark:text-white flex items-center gap-2 ${
                      isMobile ? 'text-xs mb-3' : 'text-sm mb-4'
                    }`}>
                      <span className={`material-symbols-outlined text-violet-500 ${isMobile ? 'text-base' : 'text-lg'}`}>dark_mode</span>
                      Dark Themes
                    </h3>
                    <div className={`grid gap-2 ${isMobile ? 'grid-cols-3' : 'grid-cols-5 gap-3'}`}>
                      {DARK_THEME_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setSelectedPreset(preset.id)
                            setSelectedMode('dark')
                          }}
                          className={`relative group rounded-2xl overflow-hidden border-2 transition-all ${
                            selectedPreset === preset.id
                              ? 'border-violet-500 ring-2 ring-violet-500/20'
                              : 'special' in preset && preset.special
                                ? 'border-violet-500/50 hover:border-violet-500'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          {/* Special badge */}
                          {'special' in preset && preset.special && (
                            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[8px] font-bold text-center py-0.5">
                              ✨ RECOMMENDED
                            </div>
                          )}
                          {/* Preview */}
                          <div 
                            className={`aspect-[4/3] p-1.5 ${'special' in preset && preset.special ? 'pt-4' : ''}`}
                            style={{ backgroundColor: preset.preview.bg }}
                          >
                            <div 
                              className="h-full rounded-md p-1.5 flex flex-col gap-0.5"
                              style={{ backgroundColor: preset.preview.card }}
                            >
                              <div 
                                className="w-full h-1.5 rounded-full"
                                style={{ backgroundColor: preset.preview.accent }}
                              />
                              <div className="flex-1 flex gap-0.5">
                                <div className="w-1/3 rounded bg-white/10" />
                                <div className="flex-1 rounded bg-white/5" />
                              </div>
                            </div>
                          </div>
                          {/* Label */}
                          <div className={`p-1.5 text-center ${'special' in preset && preset.special ? 'bg-violet-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}>
                            <span className={`text-[10px] font-medium block truncate ${'special' in preset && preset.special ? 'text-violet-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {preset.name}
                            </span>
                          </div>
                          {/* Hover tooltip */}
                          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 z-10">
                            <span className="text-[10px] text-white text-center">{preset.description}</span>
                          </div>
                          {/* Selected indicator */}
                          {selectedPreset === preset.id && (
                            <div className="absolute top-1 right-1 z-20">
                              <span className="material-symbols-outlined text-violet-400 text-sm bg-slate-900 rounded-full">
                                check_circle
                              </span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Light Theme Presets */}
                  <section>
                    <h3 className={`font-semibold text-slate-900 dark:text-white flex items-center gap-2 ${
                      isMobile ? 'text-xs mb-3' : 'text-sm mb-4'
                    }`}>
                      <span className={`material-symbols-outlined text-amber-500 ${isMobile ? 'text-base' : 'text-lg'}`}>light_mode</span>
                      Light Themes
                    </h3>
                    <div className={`grid gap-2 ${isMobile ? 'grid-cols-3' : 'grid-cols-4 gap-3'}`}>
                      {LIGHT_THEME_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setSelectedPreset(preset.id)
                            setSelectedMode('light')
                          }}
                          className={`relative group rounded-2xl overflow-hidden border-2 transition-all ${
                            selectedPreset === preset.id
                              ? 'border-violet-500 ring-2 ring-violet-500/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          {/* Preview */}
                          <div 
                            className="aspect-[4/3] p-1.5"
                            style={{ backgroundColor: preset.preview.bg }}
                          >
                            <div 
                              className="h-full rounded-md p-1.5 flex flex-col gap-0.5 border border-slate-200"
                              style={{ backgroundColor: preset.preview.card }}
                            >
                              <div 
                                className="w-full h-1.5 rounded-full"
                                style={{ backgroundColor: preset.preview.accent }}
                              />
                              <div className="flex-1 flex gap-0.5">
                                <div className="w-1/3 rounded bg-black/5" />
                                <div className="flex-1 rounded bg-black/5" />
                              </div>
                            </div>
                          </div>
                          {/* Label */}
                          <div className="p-1.5 bg-slate-50 dark:bg-slate-800 text-center">
                            <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block truncate">
                              {preset.name}
                            </span>
                          </div>
                          {/* Hover tooltip */}
                          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                            <span className="text-[10px] text-white text-center">{preset.description}</span>
                          </div>
                          {/* Selected indicator */}
                          {selectedPreset === preset.id && (
                            <div className="absolute top-1 right-1 z-10">
                              <span className="material-symbols-outlined text-violet-500 text-sm bg-white rounded-full">
                                check_circle
                              </span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* Colors Tab */}
              {activeTab === 'colors' && (
                <div className={isMobile ? 'space-y-6' : 'space-y-8'}>
                  {/* Accent Color */}
                  <section>
                    <h3 className={`font-semibold text-slate-900 dark:text-white flex items-center gap-2 ${
                      isMobile ? 'text-xs mb-3' : 'text-sm mb-4'
                    }`}>
                      <span className={`material-symbols-outlined text-violet-500 ${isMobile ? 'text-base' : 'text-lg'}`}>colorize</span>
                      Accent Color
                    </h3>
                    <div className={`grid gap-2 ${isMobile ? 'grid-cols-6' : 'grid-cols-8'}`}>
                      {ACCENT_COLORS.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setSelectedAccent(color.id)}
                          className={`group relative aspect-square rounded-xl transition-transform hover:scale-110 ${
                            selectedAccent === color.id ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''
                          }`}
                          style={{ 
                            background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})`,
                            ringColor: color.primary
                          }}
                          title={color.label}
                        >
                          {selectedAccent === color.id && (
                            <span className="material-symbols-outlined text-white text-lg absolute inset-0 flex items-center justify-center">
                              check
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      Selected: <span className="font-medium text-slate-700 dark:text-slate-300">{ACCENT_COLORS.find(c => c.id === selectedAccent)?.label}</span>
                    </p>
                  </section>

                  {/* Gradient Backgrounds */}
                  <section>
                    <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
                      <h3 className={`font-semibold text-slate-900 dark:text-white flex items-center gap-2 ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        <span className={`material-symbols-outlined text-violet-500 ${isMobile ? 'text-base' : 'text-lg'}`}>wallpaper</span>
                        Gradient Background
                      </h3>
                      <button
                        onClick={() => setCustomBgEnabled(!customBgEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          customBgEnabled ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                            customBgEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    
                    {customBgEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-4 gap-3'}`}>
                          {GRADIENT_BACKGROUNDS.map((bg) => (
                            <button
                              key={bg.id}
                              onClick={() => setSelectedGradientBg(bg.id)}
                              className={`relative group aspect-video rounded-xl transition-all hover:scale-105 ${
                                selectedGradientBg === bg.id 
                                  ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' 
                                  : 'hover:ring-2 hover:ring-white/50'
                              }`}
                              style={{ background: bg.gradient }}
                            >
                              {selectedGradientBg === bg.id && (
                                <span className="material-symbols-outlined text-white text-lg absolute inset-0 flex items-center justify-center drop-shadow-lg">
                                  check
                                </span>
                              )}
                              <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity text-center bg-black/50 rounded px-1 py-0.5 truncate">
                                {bg.name}
                              </span>
                            </button>
                          ))}
                        </div>
                        
                        {/* Clear selection */}
                        {selectedGradientBg && (
                          <button 
                            onClick={() => setSelectedGradientBg(null)}
                            className="text-xs text-slate-500 hover:text-violet-500 transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                            Clear background
                          </button>
                        )}

                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                          <button className="w-full p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-500 hover:text-violet-500 transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">add_photo_alternate</span>
                            Upload Custom Image
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </section>

                  {/* Color Preview */}
                  <section>
                    <h3 className={`font-semibold text-slate-900 dark:text-white flex items-center gap-2 ${
                      isMobile ? 'text-xs mb-3' : 'text-sm mb-4'
                    }`}>
                      <span className={`material-symbols-outlined text-violet-500 ${isMobile ? 'text-base' : 'text-lg'}`}>preview</span>
                      Preview
                    </h3>
                    <div className={`rounded-2xl bg-slate-100 dark:bg-slate-800 ${isMobile ? 'p-3' : 'p-4'}`}>
                      <div className={`flex items-center mb-4 ${isMobile ? 'flex-col gap-2' : 'gap-4'}`}>
                        <button 
                          className={`rounded-xl text-white font-medium ${isMobile ? 'w-full px-3 py-2 text-xs' : 'px-4 py-2 text-sm'}`}
                          style={{ backgroundColor: ACCENT_COLORS.find(c => c.id === selectedAccent)?.primary }}
                        >
                          Primary Button
                        </button>
                        <button 
                          className={`rounded-xl font-medium border-2 ${isMobile ? 'w-full px-3 py-2 text-xs' : 'px-4 py-2 text-sm'}`}
                          style={{ 
                            borderColor: ACCENT_COLORS.find(c => c.id === selectedAccent)?.primary,
                            color: ACCENT_COLORS.find(c => c.id === selectedAccent)?.primary
                          }}
                        >
                          Secondary Button
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ACCENT_COLORS.find(c => c.id === selectedAccent)?.primary }}
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-300">Sample text with accent color</span>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* Effects Tab */}
              {activeTab === 'effects' && (
                <div className={isMobile ? 'space-y-6' : 'space-y-8'}>
                  {/* Timer Display Style */}
                  <section>
                    <h3 className={`font-semibold text-slate-900 dark:text-white flex items-center gap-2 ${
                      isMobile ? 'text-xs mb-3' : 'text-sm mb-4'
                    }`}>
                      <span className={`material-symbols-outlined text-violet-500 ${isMobile ? 'text-base' : 'text-lg'}`}>timer</span>
                      Timer Display Style
                    </h3>
                    <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 gap-3'}`}>
                      {TIMER_STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedTimerStyle(style.id)}
                          className={`rounded-2xl border-2 transition-all ${
                            isMobile ? 'p-3' : 'p-4'
                          } ${
                            selectedTimerStyle === style.id
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
                            <div className={`rounded-xl flex items-center justify-center ${
                              isMobile ? 'w-8 h-8' : 'w-10 h-10'
                            } ${
                              selectedTimerStyle === style.id 
                                ? 'bg-violet-500 text-white' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              <span className={`material-symbols-outlined ${isMobile ? 'text-base' : ''}`}>{style.icon}</span>
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <div className={`font-medium text-slate-900 dark:text-white ${isMobile ? 'text-xs truncate' : 'text-sm'}`}>{style.name}</div>
                              {!isMobile && <div className="text-xs text-slate-500">{style.description}</div>}
                            </div>
                          </div>
                          {selectedTimerStyle === style.id && (
                            <div className="mt-3 pt-3 border-t border-violet-200 dark:border-violet-800">
                              <span 
                                className={`font-mono text-2xl font-bold ${
                                  style.id === 'neon' ? 'text-violet-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]' :
                                  style.id === 'gradient' ? 'bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent' :
                                  style.id === 'retro' ? 'text-green-400 font-mono tracking-wider' :
                                  style.id === 'bold' ? 'text-4xl text-slate-900 dark:text-white' :
                                  style.id === 'minimal' ? 'text-xl text-slate-600 dark:text-slate-400 font-light' :
                                  'text-slate-900 dark:text-white'
                                }`}
                              >
                                12:34
                              </span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Visual Effects */}
                  <section>
                    <h3 className={`font-semibold text-slate-900 dark:text-white flex items-center gap-2 ${
                      isMobile ? 'text-xs mb-3' : 'text-sm mb-4'
                    }`}>
                      <span className={`material-symbols-outlined text-violet-500 ${isMobile ? 'text-base' : 'text-lg'}`}>blur_on</span>
                      Visual Effects
                    </h3>
                    <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
                      {/* Glow Effect */}
                      <div className={`flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 ${
                        isMobile ? 'p-3' : 'p-4'
                      }`}>
                        <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
                          <div className={`rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center ${
                            isMobile ? 'w-8 h-8' : 'w-10 h-10'
                          }`}>
                            <span className={`material-symbols-outlined text-violet-500 ${isMobile ? 'text-base' : ''}`}>flare</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-slate-900 dark:text-white ${isMobile ? 'text-sm' : ''}`}>Glow Effect</div>
                            {!isMobile && <div className="text-xs text-slate-500">Add subtle glow to timer</div>}
                          </div>
                        </div>
                        <button
                          onClick={() => setGlowEnabled(!glowEnabled)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            glowEnabled ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                              glowEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Blur Background */}
                      <div className={`flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 ${
                        isMobile ? 'p-3' : 'p-4'
                      }`}>
                        <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
                          <div className={`rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center ${
                            isMobile ? 'w-8 h-8' : 'w-10 h-10'
                          }`}>
                            <span className={`material-symbols-outlined text-cyan-500 ${isMobile ? 'text-base' : ''}`}>blur_circular</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-slate-900 dark:text-white ${isMobile ? 'text-sm' : ''}`}>Blur Effects</div>
                            {!isMobile && <div className="text-xs text-slate-500">Frosted glass appearance</div>}
                          </div>
                        </div>
                        <button
                          onClick={() => setBlurEnabled(!blurEnabled)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            blurEnabled ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                              blurEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Particles */}
                      <div className={`flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 ${
                        isMobile ? 'p-3' : 'p-4'
                      }`}>
                        <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
                          <div className={`rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center ${
                            isMobile ? 'w-8 h-8' : 'w-10 h-10'
                          }`}>
                            <span className={`material-symbols-outlined text-pink-500 ${isMobile ? 'text-base' : ''}`}>grain</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-slate-900 dark:text-white ${isMobile ? 'text-sm' : ''}`}>Background Particles</div>
                            {!isMobile && <div className="text-xs text-slate-500">Floating animated particles</div>}
                          </div>
                        </div>
                        <button
                          onClick={() => setParticlesEnabled(!particlesEnabled)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            particlesEnabled ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                              particlesEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Border Radius */}
                  <section>
                    <h3 className={`font-semibold text-slate-900 dark:text-white flex items-center gap-2 ${
                      isMobile ? 'text-xs mb-3' : 'text-sm mb-4'
                    }`}>
                      <span className={`material-symbols-outlined text-violet-500 ${isMobile ? 'text-base' : 'text-lg'}`}>rounded_corner</span>
                      Corner Roundness
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Sharp</span>
                        <span className="font-medium text-slate-900 dark:text-white">{borderRadius}px</span>
                        <span className="text-slate-500">Round</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="32"
                        value={borderRadius}
                        onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500"
                      />
                      <div className="flex gap-4 justify-center">
                        <div 
                          className="w-16 h-16 bg-violet-500"
                          style={{ borderRadius: `${borderRadius}px` }}
                        />
                        <div 
                          className="w-24 h-12 bg-violet-500"
                          style={{ borderRadius: `${borderRadius}px` }}
                        />
                        <div 
                          className="w-12 h-12 bg-violet-500"
                          style={{ borderRadius: `${borderRadius}px` }}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Button Style */}
                  <section>
                    <h3 className={`font-semibold text-slate-900 dark:text-white flex items-center gap-2 ${
                      isMobile ? 'text-xs mb-3' : 'text-sm mb-4'
                    }`}>
                      <span className={`material-symbols-outlined text-violet-500 ${isMobile ? 'text-base' : 'text-lg'}`}>smart_button</span>
                      Button Style
                    </h3>
                    <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-4 gap-3'}`}>
                      {[
                        { id: 'rounded', name: 'Rounded', preview: 'rounded-xl' },
                        { id: 'pill', name: 'Pill', preview: 'rounded-full' },
                        { id: 'sharp', name: 'Sharp', preview: 'rounded-none' },
                        { id: 'soft', name: 'Soft', preview: 'rounded-lg' },
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setButtonStyle(style.id)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            buttonStyle === style.id
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-full h-8 bg-violet-500 mb-2 ${style.preview}`} />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{style.name}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* Display Tab */}
              {activeTab === 'display' && (
                <div className={isMobile ? 'space-y-6' : 'space-y-8'}>
                  {/* Font */}
                  <section>
                    <h3 className={`font-semibold text-slate-900 dark:text-white flex items-center gap-2 ${
                      isMobile ? 'text-xs mb-3' : 'text-sm mb-4'
                    }`}>
                      <span className={`material-symbols-outlined text-violet-500 ${isMobile ? 'text-base' : 'text-lg'}`}>text_fields</span>
                      Font Family
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {FONT_OPTIONS.map((font) => (
                        <button
                          key={font.id}
                          onClick={() => setSelectedFont(font.id)}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            selectedFont === font.id
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span 
                              className="text-2xl font-medium text-slate-900 dark:text-white"
                              style={{ fontFamily: font.family }}
                            >
                              Aa
                            </span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{font.label}</span>
                          </div>
                          {selectedFont === font.id && (
                            <span className="material-symbols-outlined text-violet-500">check_circle</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Timer Size */}
                  <section>
                    <h3 className={`font-semibold text-slate-900 dark:text-white flex items-center gap-2 ${
                      isMobile ? 'text-xs mb-3' : 'text-sm mb-4'
                    }`}>
                      <span className={`material-symbols-outlined text-violet-500 ${isMobile ? 'text-base' : 'text-lg'}`}>format_size</span>
                      Timer Display Size
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Small</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{timerSize}%</span>
                        <span className="text-sm text-slate-500">Large</span>
                      </div>
                      <input
                        type="range"
                        min="75"
                        max="150"
                        value={timerSize}
                        onChange={(e) => setTimerSize(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500"
                      />
                      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                        <span 
                          className="font-mono font-bold text-slate-900 dark:text-white"
                          style={{ fontSize: `${timerSize * 0.32}px` }}
                        >
                          12:34:56
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Accessibility */}
                  <section>
                    <h3 className={`font-semibold text-slate-900 dark:text-white flex items-center gap-2 ${
                      isMobile ? 'text-xs mb-3' : 'text-sm mb-4'
                    }`}>
                      <span className={`material-symbols-outlined text-violet-500 ${isMobile ? 'text-base' : 'text-lg'}`}>accessibility_new</span>
                      Accessibility
                    </h3>
                    <div className="space-y-3">
                      {/* Reduced Motion */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Reduced Motion</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Minimize animations</div>
                        </div>
                        <button
                          onClick={() => setReducedMotion(!reducedMotion)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            reducedMotion ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                              reducedMotion ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* High Contrast */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">High Contrast</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Increase color contrast</div>
                        </div>
                        <button
                          onClick={() => setHighContrast(!highContrast)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            highContrast ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                              highContrast ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`flex items-center border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 ${
              isMobile ? 'flex-col gap-3 px-4 py-3' : 'justify-between px-6 py-4'
            }`}>
              <button
                onClick={handleReset}
                className={`font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 ${
                  isMobile ? 'w-full justify-center px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
                }`}
              >
                <span className={`material-symbols-outlined ${isMobile ? 'text-base' : 'text-lg'}`}>restart_alt</span>
                Reset to Default
              </button>
              <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
                <button
                  onClick={onClose}
                  className={`font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors ${
                    isMobile ? 'flex-1 px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className={`font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all ${
                    isMobile ? 'flex-1 px-4 py-2 text-xs' : 'px-6 py-2 text-sm'
                  }`}
                >
                  Apply Theme
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
