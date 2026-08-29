/**
 * EditIntervalPresetModal Component
 * Modal for editing interval preset values with Focus/Break tabs
 */

import React, { useState, useEffect } from 'react'

interface EditIntervalPresetModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (work: number, breakTime: number, loopCount: number, label: string) => void
  presetLabel: string
  presetIcon?: string
  presetColor?: string
  initialWork: number // in minutes
  initialBreak: number // in minutes
  initialLoopCount: number // number of loops
}

type TabType = 'focus' | 'break' | 'loops'

export const EditIntervalPresetModal: React.FC<EditIntervalPresetModalProps> = React.memo(
  ({
    isOpen,
    onClose,
    onConfirm,
    presetLabel,
    presetIcon,
    presetColor,
    initialWork,
    initialBreak,
    initialLoopCount,
  }) => {
    const [activeTab, setActiveTab] = useState<TabType>('focus')
    const [workMinutes, setWorkMinutes] = useState(initialWork)
    const [breakMinutes, setBreakMinutes] = useState(initialBreak)
    const [loopCount, setLoopCount] = useState(initialLoopCount)
    const [label, setLabel] = useState(presetLabel)

    // Edit mode states
    const [editingWork, setEditingWork] = useState(false)
    const [editingBreak, setEditingBreak] = useState(false)
    const [editingLoops, setEditingLoops] = useState(false)
    const [editingLabel, setEditingLabel] = useState(false)
    const [inputWork, setInputWork] = useState('')
    const [inputBreak, setInputBreak] = useState('')
    const [inputLoops, setInputLoops] = useState('')
    const [inputLabel, setInputLabel] = useState('')

    // Update state when initial values change
    useEffect(() => {
      if (isOpen) {
        setWorkMinutes(initialWork)
        setBreakMinutes(initialBreak)
        setLoopCount(initialLoopCount)
        setLabel(presetLabel)
        setActiveTab('focus')
      }
    }, [isOpen, initialWork, initialBreak, initialLoopCount, presetLabel])

    const handleConfirm = () => {
      onConfirm(workMinutes, breakMinutes, loopCount, label)
      onClose()
    }

    const handleIncrement = (type: 'work' | 'break' | 'loops') => {
      if (type === 'work' && workMinutes < 120) setWorkMinutes(workMinutes + 1)
      if (type === 'break' && breakMinutes < 120) setBreakMinutes(breakMinutes + 1)
      if (type === 'loops' && loopCount < 20) setLoopCount(loopCount + 1)
    }

    const handleDecrement = (type: 'work' | 'break' | 'loops') => {
      if (type === 'work' && workMinutes > 1) setWorkMinutes(workMinutes - 1)
      if (type === 'break' && breakMinutes > 1) setBreakMinutes(breakMinutes - 1)
      if (type === 'loops' && loopCount > 1) setLoopCount(loopCount - 1)
    }

    // Edit mode handlers
    const handleStartEdit = (type: 'work' | 'break' | 'loops' | 'label') => {
      if (type === 'work') {
        setEditingWork(true)
        setInputWork(workMinutes.toString())
      } else if (type === 'break') {
        setEditingBreak(true)
        setInputBreak(breakMinutes.toString())
      } else if (type === 'loops') {
        setEditingLoops(true)
        setInputLoops(loopCount.toString())
      } else if (type === 'label') {
        setEditingLabel(true)
        setInputLabel(label)
      }
    }

    const handleInputChange = (type: 'work' | 'break' | 'loops' | 'label', value: string) => {
      if (type === 'label') {
        setInputLabel(value)
      } else if (/^\d*$/.test(value)) {
        if (type === 'work') setInputWork(value)
        else if (type === 'break') setInputBreak(value)
        else if (type === 'loops') setInputLoops(value)
      }
    }

    const handleConfirmEdit = (type: 'work' | 'break' | 'loops' | 'label') => {
      if (type === 'work') {
        const numValue = parseInt(inputWork, 10)
        if (!isNaN(numValue)) {
          setWorkMinutes(Math.max(1, Math.min(120, numValue)))
        }
        setEditingWork(false)
      } else if (type === 'break') {
        const numValue = parseInt(inputBreak, 10)
        if (!isNaN(numValue)) {
          setBreakMinutes(Math.max(1, Math.min(120, numValue)))
        }
        setEditingBreak(false)
      } else if (type === 'loops') {
        const numValue = parseInt(inputLoops, 10)
        if (!isNaN(numValue)) {
          setLoopCount(Math.max(1, Math.min(20, numValue)))
        }
        setEditingLoops(false)
      } else if (type === 'label') {
        if (inputLabel.trim()) {
          setLabel(inputLabel.trim())
        }
        setEditingLabel(false)
      }
    }

    const handleKeyDown = (
      type: 'work' | 'break' | 'loops' | 'label',
      e: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleConfirmEdit(type)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        if (type === 'work') setEditingWork(false)
        else if (type === 'break') setEditingBreak(false)
        else if (type === 'loops') setEditingLoops(false)
        else if (type === 'label') setEditingLabel(false)
      }
    }

    if (!isOpen) return null

    return (
      <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-200">
        <div
          className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-gray-900 to-black shadow-2xl"
          style={{ boxShadow: `0 20px 60px ${presetColor || '#13ec5b'}30` }}
        >
          {/* Header */}
          <div className="relative px-6 pb-4 pt-6">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/40 transition-colors hover:text-white/70"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <div className="mb-2 flex items-center gap-3">
              {presetIcon && (
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `${presetColor || '#13ec5b'}20`,
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
                <p className="text-sm text-white/50">
                  {workMinutes}m / {breakMinutes}m · {loopCount} loops
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('focus')}
              className={`relative flex-1 py-3 text-sm font-bold transition-all ${
                activeTab === 'focus' ? 'text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              Focus
              {activeTab === 'focus' && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: presetColor || '#13ec5b' }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('break')}
              className={`relative flex-1 py-3 text-sm font-bold transition-all ${
                activeTab === 'break' ? 'text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              Break
              {activeTab === 'break' && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: presetColor || '#13ec5b' }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('loops')}
              className={`relative flex-1 py-3 text-sm font-bold transition-all ${
                activeTab === 'loops' ? 'text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              Loops
              {activeTab === 'loops' && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: presetColor || '#13ec5b' }}
                />
              )}
            </button>
          </div>

          {/* Tab Content with slide animation */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform:
                  activeTab === 'focus'
                    ? 'translateX(0)'
                    : activeTab === 'break'
                      ? 'translateX(-100%)'
                      : 'translateX(-200%)',
              }}
            >
              {/* Focus Tab */}
              <div className="w-full flex-shrink-0 px-6 py-8">
                <div className="flex flex-col items-center gap-4">
                  {/* Up Arrow */}
                  <button
                    onClick={() => handleIncrement('work')}
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:bg-white/5 active:scale-95"
                    style={{ color: presetColor || '#13ec5b' }}
                  >
                    <span className="material-symbols-outlined text-3xl">expand_less</span>
                  </button>

                  {/* Time Display */}
                  <div className="flex flex-col items-center gap-1">
                    {editingWork ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputWork}
                        onChange={(e) => handleInputChange('work', e.target.value)}
                        onKeyDown={(e) => handleKeyDown('work', e)}
                        onBlur={() => handleConfirmEdit('work')}
                        className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 bg-transparent text-center text-4xl font-bold text-white outline-none"
                        style={{ borderColor: presetColor || '#13ec5b' }}
                        maxLength={3}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-2xl border-2 text-4xl font-bold text-white transition-colors hover:bg-white/5"
                        style={{ borderColor: presetColor || '#13ec5b' }}
                        onClick={() => handleStartEdit('work')}
                        title="Click to edit"
                      >
                        {workMinutes.toString().padStart(2, '0')}
                      </div>
                    )}
                    <span className="text-xs uppercase tracking-wider text-gray-400">Minutes</span>
                  </div>

                  {/* Down Arrow */}
                  <button
                    onClick={() => handleDecrement('work')}
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:bg-white/5 active:scale-95"
                    style={{ color: presetColor || '#13ec5b' }}
                  >
                    <span className="material-symbols-outlined text-3xl">expand_more</span>
                  </button>
                </div>
              </div>

              {/* Break Tab */}
              <div className="w-full flex-shrink-0 px-6 py-8">
                <div className="flex flex-col items-center gap-4">
                  {/* Up Arrow */}
                  <button
                    onClick={() => handleIncrement('break')}
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:bg-white/5 active:scale-95"
                    style={{ color: presetColor || '#13ec5b' }}
                  >
                    <span className="material-symbols-outlined text-3xl">expand_less</span>
                  </button>

                  {/* Time Display */}
                  <div className="flex flex-col items-center gap-1">
                    {editingBreak ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputBreak}
                        onChange={(e) => handleInputChange('break', e.target.value)}
                        onKeyDown={(e) => handleKeyDown('break', e)}
                        onBlur={() => handleConfirmEdit('break')}
                        className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 bg-transparent text-center text-4xl font-bold text-white outline-none"
                        style={{ borderColor: presetColor || '#13ec5b' }}
                        maxLength={3}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-2xl border-2 text-4xl font-bold text-white transition-colors hover:bg-white/5"
                        style={{ borderColor: presetColor || '#13ec5b' }}
                        onClick={() => handleStartEdit('break')}
                        title="Click to edit"
                      >
                        {breakMinutes.toString().padStart(2, '0')}
                      </div>
                    )}
                    <span className="text-xs uppercase tracking-wider text-gray-400">Minutes</span>
                  </div>

                  {/* Down Arrow */}
                  <button
                    onClick={() => handleDecrement('break')}
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:bg-white/5 active:scale-95"
                    style={{ color: presetColor || '#13ec5b' }}
                  >
                    <span className="material-symbols-outlined text-3xl">expand_more</span>
                  </button>
                </div>
              </div>

              {/* Loops Tab */}
              <div className="w-full flex-shrink-0 px-6 py-8">
                <div className="flex flex-col items-center gap-4">
                  {/* Up Arrow */}
                  <button
                    onClick={() => handleIncrement('loops')}
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:bg-white/5 active:scale-95"
                    style={{ color: presetColor || '#13ec5b' }}
                  >
                    <span className="material-symbols-outlined text-3xl">expand_less</span>
                  </button>

                  {/* Loop Count Display */}
                  <div className="flex flex-col items-center gap-1">
                    {editingLoops ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputLoops}
                        onChange={(e) => handleInputChange('loops', e.target.value)}
                        onKeyDown={(e) => handleKeyDown('loops', e)}
                        onBlur={() => handleConfirmEdit('loops')}
                        className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 bg-transparent text-center text-4xl font-bold text-white outline-none"
                        style={{ borderColor: presetColor || '#13ec5b' }}
                        maxLength={2}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-2xl border-2 text-4xl font-bold text-white transition-colors hover:bg-white/5"
                        style={{ borderColor: presetColor || '#13ec5b' }}
                        onClick={() => handleStartEdit('loops')}
                        title="Click to edit"
                      >
                        {loopCount.toString().padStart(2, '0')}
                      </div>
                    )}
                    <span className="text-xs uppercase tracking-wider text-gray-400">Loops</span>
                  </div>

                  {/* Down Arrow */}
                  <button
                    onClick={() => handleDecrement('loops')}
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:bg-white/5 active:scale-95"
                    style={{ color: presetColor || '#13ec5b' }}
                  >
                    <span className="material-symbols-outlined text-3xl">expand_more</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 px-6 pb-6 pt-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-white/5 px-5 py-3 font-bold text-white transition-all hover:bg-white/10 active:scale-95"
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
    )
  }
)
