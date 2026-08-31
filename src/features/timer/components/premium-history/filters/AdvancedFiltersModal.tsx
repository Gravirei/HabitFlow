/**
 * Advanced Filters Modal
 * Modal with duration filters and additional filter options
 */

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface AdvancedFiltersModalProps {
  isOpen: boolean
  onClose: () => void
  minDuration?: number
  maxDuration?: number
  onDurationChange: (min: number, max: number) => void
}

export function AdvancedFiltersModal({
  isOpen,
  onClose,
  minDuration = 0,
  maxDuration = 7200, // 2 hours default max
  onDurationChange,
}: AdvancedFiltersModalProps) {
  const [tempMinDuration, setTempMinDuration] = useState(minDuration)
  const [tempMaxDuration, setTempMaxDuration] = useState(maxDuration)

  // Duration presets in seconds
  const durationPresets = [
    { label: 'Anything', min: 0, max: 7200 },
    { label: '< 5m', min: 0, max: 300 },
    { label: '15-30m', min: 900, max: 1800 },
    { label: '30-60m', min: 1800, max: 3600 },
    { label: '> 1h', min: 3600, max: 7200 },
  ]

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  const handleApply = () => {
    onDurationChange(tempMinDuration, tempMaxDuration)
    onClose()
  }

  const handleReset = () => {
    setTempMinDuration(0)
    setTempMaxDuration(7200)
  }

  const handlePresetClick = (preset: (typeof durationPresets)[0]) => {
    setTempMinDuration(preset.min)
    setTempMaxDuration(preset.max)
  }

  // Keyboard navigation and focus management
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter') {
        handleApply()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, tempMinDuration, tempMaxDuration])

  if (!isOpen) return null

  // Calculate percentages for slider track
  // Hardcoded max of 7200 for slider logic visualization
  const ABSOLUTE_MAX = 7200
  const minPercent = (tempMinDuration / ABSOLUTE_MAX) * 100
  const maxPercent = (tempMaxDuration / ABSOLUTE_MAX) * 100

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-900/90 p-4 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-white to-slate-50 shadow-2xl dark:border-white/10 dark:from-[#1E1E24] dark:to-[#18181B]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative gradient blur */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 opacity-20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-400/20 opacity-20 blur-3xl" />

          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-slate-200/80 px-8 py-6 dark:border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-[20px] text-white">tune</span>
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-lg font-bold text-transparent dark:from-white dark:to-slate-300">
                  Advanced Filters
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Adjust session duration range
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-full bg-slate-100/80 text-slate-500 transition-all duration-200 hover:rotate-90 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="relative space-y-6 px-8 py-6">
            {/* Custom Duration Range - Dual Slider Simulation */}
            <div className="space-y-5">
              {/* Values Display */}
              <div className="flex items-center justify-between">
                <div className="flex min-w-[100px] flex-col items-start rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 px-4 py-3 shadow-lg dark:border-white/5 dark:from-[#2A2A31] dark:to-[#202026]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Minimum
                  </span>
                  <span className="text-lg font-bold leading-tight text-slate-800 dark:text-white">
                    {formatDuration(tempMinDuration)}
                  </span>
                </div>
                <div className="h-[2px] w-12 rounded-full bg-gradient-to-r from-slate-200 via-primary/50 to-slate-200 dark:from-white/10 dark:via-primary/30 dark:to-white/10" />
                <div className="flex min-w-[100px] flex-col items-end rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 px-4 py-3 shadow-lg dark:border-white/5 dark:from-[#2A2A31] dark:to-[#202026]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Maximum
                  </span>
                  <span className="text-lg font-bold leading-tight text-slate-800 dark:text-white">
                    {formatDuration(tempMaxDuration)}
                  </span>
                </div>
              </div>

              {/* Slider Components */}
              <div className="relative h-8 pb-3 pt-5">
                {/* Active Range Track (Gradient) */}
                <div
                  className="pointer-events-none absolute top-1/2 z-[2] h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/30"
                  style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                />

                {/* Background Track */}
                <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-slate-200 dark:bg-white/10" />

                {/* Input Min */}
                <input
                  type="range"
                  min={0}
                  max={ABSOLUTE_MAX}
                  step={60}
                  value={tempMinDuration}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), tempMaxDuration - 300)
                    setTempMinDuration(val)
                  }}
                  className="absolute top-0 z-20 h-full w-full cursor-pointer opacity-0"
                  style={{ pointerEvents: 'none' }}
                />
                {/* Custom Thumb Min */}
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-3 pointer-events-none absolute top-1/2 z-30 size-6 -translate-x-1/2 rounded-full border-primary bg-white shadow-lg shadow-primary/30 transition-all"
                  style={{ left: `${minPercent}%`, transform: `translate(-50%, -50%)` }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-purple-600 opacity-0 transition-opacity hover:opacity-100" />
                </motion.div>

                {/* Input Max */}
                <input
                  type="range"
                  min={0}
                  max={ABSOLUTE_MAX}
                  step={60}
                  value={tempMaxDuration}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), tempMinDuration + 300)
                    setTempMaxDuration(val)
                  }}
                  className="absolute top-0 z-20 h-full w-full cursor-pointer opacity-0"
                  style={{ pointerEvents: 'none' }}
                />
                {/* Custom Thumb Max */}
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-3 pointer-events-none absolute top-1/2 z-30 size-6 -translate-x-1/2 rounded-full border-primary bg-white shadow-lg shadow-primary/30 transition-all"
                  style={{ left: `${maxPercent}%`, transform: `translate(-50%, -50%)` }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-purple-600 opacity-0 transition-opacity hover:opacity-100" />
                </motion.div>

                {/* 
                      Hack to make inputs clickable only on their thumbs is tough in pure CSS/React without libs.
                      So we rely on standard range inputs being full width and z-index usage.
                      Actually, standard inputs with pointer-events-none and explicit thumb styling is needed.
                      For simplicity in this constrained environment without adding CSS modules:
                      I'll just style the actual inputs to have transparent tracks and visible thumbs if possible,
                      OR use the standard inputs but styled heavily.
                      
                      Let's revert to a simpler "Two Slider" stacked approach but visually optimized if the dual-thumb hack is too risky.
                      
                      ACTUALLY: The best way without extra libs is:
                      Two range inputs, absolute position, same coordinates.
                      input[type=range] { pointer-events: none; }
                      input[type=range]::-webkit-slider-thumb { pointer-events: auto; }
                    */}
                <style>{`
                        input[type=range]::-webkit-slider-thumb {
                            pointer-events: auto;
                            width: 24px;
                            height: 24px;
                            -webkit-appearance: none; 
                            background: white;
                            border: 2px solid #6366f1; /* Primary color */
                            border-radius: 50%;
                            cursor: pointer;
                            margin-top: -10px; /* Center thumb on track */
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        }
                        input[type=range]::-moz-range-thumb {
                            pointer-events: auto;
                            width: 24px;
                            height: 24px;
                            background: white;
                            border: 2px solid #6366f1;
                            border-radius: 50%;
                            cursor: pointer;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        }
                        /* Remove default track */
                        input[type=range] {
                            -webkit-appearance: none; 
                            background: transparent; 
                        }
                        input[type=range]::-webkit-slider-runnable-track {
                            background: transparent;
                        }
                    `}</style>
              </div>
            </div>

            {/* Presets - Modern Chips */}
            <div>
              <label className="mb-3 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Quick Presets
              </label>
              <div className="grid grid-cols-3 gap-3">
                {durationPresets.map((preset) => {
                  const isActive = tempMinDuration === preset.min && tempMaxDuration === preset.max
                  return (
                    <motion.button
                      key={preset.label}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePresetClick(preset)}
                      className={`relative overflow-hidden rounded-2xl px-4 py-2.5 text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg shadow-primary/30'
                          : 'border border-slate-200/50 bg-gradient-to-br from-white to-slate-50 text-slate-600 hover:from-primary/10 hover:to-purple-500/10 dark:border-white/5 dark:from-[#2A2A31] dark:to-[#202026] dark:text-slate-400 dark:hover:from-primary/20 dark:hover:to-purple-600/20'
                      } `}
                    >
                      {isActive && (
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 transition-transform duration-1000 group-hover:translate-x-full" />
                      )}
                      {preset.label}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="relative flex gap-3 border-t border-slate-200/80 px-8 py-5 dark:border-white/5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="flex-1 rounded-2xl py-3.5 text-sm font-bold text-slate-600 transition-all duration-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Reset
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApply}
              className="hover:from-primary-dark flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-purple-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/30 transition-all duration-200 hover:to-purple-700"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Apply Filters
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
