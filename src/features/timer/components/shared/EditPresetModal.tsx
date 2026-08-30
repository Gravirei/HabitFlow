/**
 * EditPresetModal Component
 * Modal for editing preset time values before starting countdown
 */

import React, { useState, useEffect } from 'react'

interface EditPresetModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (totalSeconds: number, label: string) => void
  presetLabel: string
  presetIcon?: string
  presetColor?: string
  initialSeconds: number
}

export const EditPresetModal: React.FC<EditPresetModalProps> = React.memo(
  ({ isOpen, onClose, onConfirm, presetLabel, presetIcon, presetColor, initialSeconds }) => {
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)
    const [seconds, setSeconds] = useState(0)
    const [label, setLabel] = useState(presetLabel)

    // Edit mode states
    const [editingHours, setEditingHours] = useState(false)
    const [editingMinutes, setEditingMinutes] = useState(false)
    const [editingSeconds, setEditingSeconds] = useState(false)
    const [editingLabel, setEditingLabel] = useState(false)

    const [inputHours, setInputHours] = useState('')
    const [inputMinutes, setInputMinutes] = useState('')
    const [inputSeconds, setInputSeconds] = useState('')
    const [inputLabel, setInputLabel] = useState('')

    // Update state when initialSeconds changes
    useEffect(() => {
      if (isOpen) {
        setHours(Math.floor(initialSeconds / 3600))
        setMinutes(Math.floor((initialSeconds % 3600) / 60))
        setSeconds(initialSeconds % 60)
        setLabel(presetLabel)
      }
    }, [isOpen, initialSeconds, presetLabel])

    if (!isOpen) return null

    const handleConfirm = () => {
      const totalSeconds = hours * 3600 + minutes * 60 + seconds
      onConfirm(totalSeconds, label)
      onClose()
    }

    const handleIncrement = (type: 'hours' | 'minutes' | 'seconds') => {
      if (type === 'hours' && hours < 23) setHours(hours + 1)
      if (type === 'minutes' && minutes < 59) setMinutes(minutes + 1)
      if (type === 'seconds' && seconds < 59) setSeconds(seconds + 1)
    }

    const handleDecrement = (type: 'hours' | 'minutes' | 'seconds') => {
      if (type === 'hours' && hours > 0) setHours(hours - 1)
      if (type === 'minutes' && minutes > 0) setMinutes(minutes - 1)
      if (type === 'seconds' && seconds > 0) setSeconds(seconds - 1)
    }

    // Edit mode handlers
    const handleStartEdit = (type: 'hours' | 'minutes' | 'seconds' | 'label') => {
      if (type === 'hours') {
        setEditingHours(true)
        setInputHours(hours.toString())
      } else if (type === 'minutes') {
        setEditingMinutes(true)
        setInputMinutes(minutes.toString())
      } else if (type === 'seconds') {
        setEditingSeconds(true)
        setInputSeconds(seconds.toString())
      } else if (type === 'label') {
        setEditingLabel(true)
        setInputLabel(label)
      }
    }

    const handleInputChange = (type: 'hours' | 'minutes' | 'seconds' | 'label', value: string) => {
      if (type === 'label') {
        setInputLabel(value)
      } else if (/^\d*$/.test(value)) {
        if (type === 'hours') setInputHours(value)
        else if (type === 'minutes') setInputMinutes(value)
        else if (type === 'seconds') setInputSeconds(value)
      }
    }

    const handleConfirmEdit = (type: 'hours' | 'minutes' | 'seconds' | 'label') => {
      if (type === 'hours') {
        const numValue = parseInt(inputHours, 10)
        if (!isNaN(numValue)) {
          setHours(Math.max(0, Math.min(23, numValue)))
        }
        setEditingHours(false)
      } else if (type === 'minutes') {
        const numValue = parseInt(inputMinutes, 10)
        if (!isNaN(numValue)) {
          setMinutes(Math.max(0, Math.min(59, numValue)))
        }
        setEditingMinutes(false)
      } else if (type === 'seconds') {
        const numValue = parseInt(inputSeconds, 10)
        if (!isNaN(numValue)) {
          setSeconds(Math.max(0, Math.min(59, numValue)))
        }
        setEditingSeconds(false)
      } else if (type === 'label') {
        if (inputLabel.trim()) {
          setLabel(inputLabel.trim())
        }
        setEditingLabel(false)
      }
    }

    const handleKeyDown = (
      type: 'hours' | 'minutes' | 'seconds' | 'label',
      e: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleConfirmEdit(type)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        if (type === 'hours') setEditingHours(false)
        else if (type === 'minutes') setEditingMinutes(false)
        else if (type === 'seconds') setEditingSeconds(false)
        else if (type === 'label') setEditingLabel(false)
      }
    }

    return (
      <>
        {/* Backdrop */}
        <div
          className="animate-in fade-in fixed inset-0 z-50 bg-black/70 backdrop-blur-md duration-200"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="animate-in zoom-in-95 pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 via-black to-gray-900 shadow-2xl duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                background: `linear-gradient(135deg, ${presetColor || '#13ec5b'}, transparent)`,
              }}
            />

            {/* Header */}
            <div className="relative border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                {presetIcon && (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${presetColor || '#13ec5b'}15`,
                      color: presetColor || '#13ec5b',
                    }}
                  >
                    <span className="material-symbols-outlined text-2xl">{presetIcon}</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {editingLabel ? (
                      <input
                        type="text"
                        value={inputLabel}
                        onChange={(e) => handleInputChange('label', e.target.value)}
                        onKeyDown={(e) => handleKeyDown('label', e)}
                        onBlur={() => handleConfirmEdit('label')}
                        className="rounded-full border-2 bg-white/10 px-3 py-1 text-lg font-bold text-white outline-none"
                        style={{
                          borderColor: presetColor || '#13ec5b',
                          width: 'auto',
                          minWidth: '150px',
                          maxWidth: '250px',
                        }}
                        maxLength={20}
                        autoFocus
                      />
                    ) : (
                      <>
                        <h2 className="text-xl font-bold text-white">{label}</h2>
                        <button
                          onClick={() => handleStartEdit('label')}
                          className="text-white/40 transition-colors hover:text-white/70"
                          title="Edit preset name"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">Customize duration</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="relative px-6 py-8">
              <div className="flex items-center justify-center gap-4">
                {/* Hours */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => handleIncrement('hours')}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:bg-white/10 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-white">expand_less</span>
                  </button>
                  <div className="flex flex-col items-center gap-1">
                    {editingHours ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputHours}
                        onChange={(e) => handleInputChange('hours', e.target.value)}
                        onKeyDown={(e) => handleKeyDown('hours', e)}
                        onBlur={() => handleConfirmEdit('hours')}
                        className="flex h-20 w-16 items-center justify-center rounded-2xl border-2 bg-transparent text-center text-3xl font-bold text-white outline-none"
                        style={{ borderColor: presetColor || '#13ec5b' }}
                        maxLength={2}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="flex h-20 w-16 cursor-pointer items-center justify-center rounded-2xl border-2 text-3xl font-bold text-white transition-colors hover:bg-white/5"
                        style={{ borderColor: presetColor || '#13ec5b' }}
                        onClick={() => handleStartEdit('hours')}
                        title="Click to edit"
                      >
                        {hours.toString().padStart(2, '0')}
                      </div>
                    )}
                    <span className="text-xs uppercase tracking-wider text-gray-400">Hours</span>
                  </div>
                  <button
                    onClick={() => handleDecrement('hours')}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:bg-white/10 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-white">expand_more</span>
                  </button>
                </div>

                <span className="mb-8 text-3xl font-bold text-white/20">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => handleIncrement('minutes')}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:bg-white/10 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-white">expand_less</span>
                  </button>
                  <div className="flex flex-col items-center gap-1">
                    {editingMinutes ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputMinutes}
                        onChange={(e) => handleInputChange('minutes', e.target.value)}
                        onKeyDown={(e) => handleKeyDown('minutes', e)}
                        onBlur={() => handleConfirmEdit('minutes')}
                        className="flex h-20 w-16 items-center justify-center rounded-2xl border-2 bg-transparent text-center text-3xl font-bold text-white outline-none"
                        style={{ borderColor: presetColor || '#13ec5b' }}
                        maxLength={2}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="flex h-20 w-16 cursor-pointer items-center justify-center rounded-2xl border-2 text-3xl font-bold text-white transition-colors hover:bg-white/5"
                        style={{ borderColor: presetColor || '#13ec5b' }}
                        onClick={() => handleStartEdit('minutes')}
                        title="Click to edit"
                      >
                        {minutes.toString().padStart(2, '0')}
                      </div>
                    )}
                    <span className="text-xs uppercase tracking-wider text-gray-400">Minutes</span>
                  </div>
                  <button
                    onClick={() => handleDecrement('minutes')}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:bg-white/10 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-white">expand_more</span>
                  </button>
                </div>

                <span className="mb-8 text-3xl font-bold text-white/20">:</span>

                {/* Seconds */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => handleIncrement('seconds')}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:bg-white/10 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-white">expand_less</span>
                  </button>
                  <div className="flex flex-col items-center gap-1">
                    {editingSeconds ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputSeconds}
                        onChange={(e) => handleInputChange('seconds', e.target.value)}
                        onKeyDown={(e) => handleKeyDown('seconds', e)}
                        onBlur={() => handleConfirmEdit('seconds')}
                        className="flex h-20 w-16 items-center justify-center rounded-2xl border-2 bg-transparent text-center text-3xl font-bold text-white outline-none"
                        style={{ borderColor: presetColor || '#13ec5b' }}
                        maxLength={2}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="flex h-20 w-16 cursor-pointer items-center justify-center rounded-2xl border-2 text-3xl font-bold text-white transition-colors hover:bg-white/5"
                        style={{ borderColor: presetColor || '#13ec5b' }}
                        onClick={() => handleStartEdit('seconds')}
                        title="Click to edit"
                      >
                        {seconds.toString().padStart(2, '0')}
                      </div>
                    )}
                    <span className="text-xs uppercase tracking-wider text-gray-400">Seconds</span>
                  </div>
                  <button
                    onClick={() => handleDecrement('seconds')}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:bg-white/10 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-white">expand_more</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative flex items-center gap-3 border-t border-white/10 bg-white/5 px-6 py-5 backdrop-blur-xl">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-gray-300 transition-all hover:bg-white/10 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-xl px-5 py-3 font-bold text-black transition-all active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${presetColor || '#13ec5b'}, ${presetColor ? presetColor + 'cc' : '#10d94f'})`,
                  boxShadow: `0 4px 20px ${presetColor || '#13ec5b'}40`,
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }
)
