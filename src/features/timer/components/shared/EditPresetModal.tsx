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

export const EditPresetModal: React.FC<EditPresetModalProps> = React.memo(({
  isOpen,
  onClose,
  onConfirm,
  presetLabel,
  presetIcon,
  presetColor,
  initialSeconds
}) => {
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

  const handleKeyDown = (type: 'hours' | 'minutes' | 'seconds' | 'label', e: React.KeyboardEvent<HTMLInputElement>) => {
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
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-white/10 pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative gradient overlay */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ 
              background: `linear-gradient(135deg, ${presetColor || '#13ec5b'}, transparent)` 
            }}
          />
          
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              {presetIcon && (
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `${presetColor || '#13ec5b'}15`,
                    color: presetColor || '#13ec5b'
                  }}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {presetIcon}
                  </span>
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
                      className="text-lg font-bold text-white bg-white/10 px-3 py-1 rounded-full outline-none border-2"
                      style={{ borderColor: presetColor || '#13ec5b', width: 'auto', minWidth: '150px', maxWidth: '250px' }}
                      maxLength={20}
                      autoFocus
                    />
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-white">{label}</h2>
                      <button
                        onClick={() => handleStartEdit('label')}
                        className="text-white/40 hover:text-white/70 transition-colors"
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
                  className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-95"
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
                      className="w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-bold text-white bg-transparent text-center outline-none"
                      style={{ borderColor: presetColor || '#13ec5b' }}
                      maxLength={2}
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-bold text-white cursor-pointer hover:bg-white/5 transition-colors"
                      style={{ borderColor: presetColor || '#13ec5b' }}
                      onClick={() => handleStartEdit('hours')}
                      title="Click to edit"
                    >
                      {hours.toString().padStart(2, '0')}
                    </div>
                  )}
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Hours</span>
                </div>
                <button
                  onClick={() => handleDecrement('hours')}
                  className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-white">expand_more</span>
                </button>
              </div>

              <span className="text-3xl font-bold text-white/20 mb-8">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleIncrement('minutes')}
                  className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-95"
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
                      className="w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-bold text-white bg-transparent text-center outline-none"
                      style={{ borderColor: presetColor || '#13ec5b' }}
                      maxLength={2}
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-bold text-white cursor-pointer hover:bg-white/5 transition-colors"
                      style={{ borderColor: presetColor || '#13ec5b' }}
                      onClick={() => handleStartEdit('minutes')}
                      title="Click to edit"
                    >
                      {minutes.toString().padStart(2, '0')}
                    </div>
                  )}
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Minutes</span>
                </div>
                <button
                  onClick={() => handleDecrement('minutes')}
                  className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-white">expand_more</span>
                </button>
              </div>

              <span className="text-3xl font-bold text-white/20 mb-8">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleIncrement('seconds')}
                  className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-95"
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
                      className="w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-bold text-white bg-transparent text-center outline-none"
                      style={{ borderColor: presetColor || '#13ec5b' }}
                      maxLength={2}
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-bold text-white cursor-pointer hover:bg-white/5 transition-colors"
                      style={{ borderColor: presetColor || '#13ec5b' }}
                      onClick={() => handleStartEdit('seconds')}
                      title="Click to edit"
                    >
                      {seconds.toString().padStart(2, '0')}
                    </div>
                  )}
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Seconds</span>
                </div>
                <button
                  onClick={() => handleDecrement('seconds')}
                  className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-white">expand_more</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative flex items-center gap-3 px-6 py-5 bg-white/5 backdrop-blur-xl border-t border-white/10">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-5 py-3 rounded-xl font-bold active:scale-95 transition-all text-black"
              style={{
                background: `linear-gradient(135deg, ${presetColor || '#13ec5b'}, ${presetColor ? presetColor + 'cc' : '#10d94f'})`,
                boxShadow: `0 4px 20px ${presetColor || '#13ec5b'}40`
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  )
})
