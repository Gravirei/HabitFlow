/**
 * WheelPicker Component
 * Reusable wheel picker for selecting time values (Original Design)
 */

import React, { useRef, useState, useEffect } from 'react'
import type { WheelPickerProps } from '../types/timer.types'
import { soundManager } from '../utils/soundManager'

export const WheelPicker: React.FC<WheelPickerProps> = React.memo(({
  value,
  onChange,
  max,
  label,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const items = Array.from({ length: max + 1 }, (_, i) => i)
  
  // Calculate which items to display based on current value
  const getDisplayItems = () => {
    return [
      items[(value - 2 + items.length) % items.length],
      items[(value - 1 + items.length) % items.length],
      value,
      items[(value + 1) % items.length],
      items[(value + 2) % items.length],
    ]
  }

  const displayItems = getDisplayItems()

  const handleStart = (clientY: number) => {
    if (!disabled) {
      setIsDragging(true)
      setStartY(clientY)
    }
  }

  const handleMove = (clientY: number) => {
    if (isDragging && !disabled) {
      const deltaY = startY - clientY
      const itemHeight = 60 // approximate height for sensitivity
      
      if (Math.abs(deltaY) > itemHeight / 2) {
        const steps = Math.floor(Math.abs(deltaY) / (itemHeight / 2))
        if (deltaY > 0) {
          // Scrolling up = increase value
          onChange((value + steps) % (max + 1))
        } else {
          // Scrolling down = decrease value
          onChange((value - steps + (max + 1)) % (max + 1))
        }
        soundManager.playSound('tick', 20)
        setStartY(clientY)
      }
    }
  }

  const handleEnd = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (!disabled) {
      e.preventDefault()
      if (e.deltaY > 0) {
        // Scroll down = decrease
        onChange((value - 1 + (max + 1)) % (max + 1))
      } else {
        // Scroll up = increase
        onChange((value + 1) % (max + 1))
      }
      soundManager.playSound('tick', 20)
    }
  }

  const handleDisplayClick = () => {
    if (!disabled) {
      setIsEditing(true)
      setInputValue(value.toString())
      // Focus and select the input after state update
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // Only allow numeric input
    if (/^\d*$/.test(newValue)) {
      setInputValue(newValue)
    }
  }

  const handleInputConfirm = () => {
    const numValue = parseInt(inputValue, 10)
    if (!isNaN(numValue)) {
      // Clamp value to valid range
      const clampedValue = Math.max(0, Math.min(max, numValue))
      onChange(clampedValue)
    }
    setIsEditing(false)
    setInputValue('')
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleInputConfirm()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsEditing(false)
      setInputValue('')
    }
  }

  const handleInputBlur = () => {
    handleInputConfirm()
  }

  return (
    <div 
      ref={containerRef}
      className={`relative flex h-full flex-1 justify-center select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} group`}
      onMouseDown={(e) => handleStart(e.clientY)}
      onMouseMove={(e) => handleMove(e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onWheel={handleWheel}
      role="group"
      aria-label={`${label} picker`}
    >
      {/* Rotated label on the side */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-3 rotate-90 origin-center text-[10px] font-bold tracking-widest text-primary/40 pointer-events-none pt-0" id={`${label}-label`} aria-hidden="true">
        {label}
      </div>
      
      {/* Vertical list of items */}
      <div className="flex w-full flex-col items-center justify-center space-y-5 py-6 text-center pointer-events-none">
        <button
          onClick={() => {
            if (!disabled) {
              onChange((value - 2 + (max + 1)) % (max + 1))
              soundManager.playSound('tick', 20)
            }
          }}
          className="text-2xl font-medium text-white/5 scale-75 blur-[1px] pointer-events-auto"
          disabled={disabled}
          aria-label={`Set ${label} to ${displayItems[0]}`}
        >
          {displayItems[0].toString().padStart(2, '0')}
        </button>
        <button
          onClick={() => {
            if (!disabled) {
              onChange((value - 1 + (max + 1)) % (max + 1))
              soundManager.playSound('tick', 20)
            }
          }}
          className="text-4xl font-medium text-white/20 scale-90 hover:text-white/40 transition-colors pointer-events-auto"
          disabled={disabled}
          aria-label={`Set ${label} to ${displayItems[1]}`}
        >
          {displayItems[1].toString().padStart(2, '0')}
        </button>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            className="text-6xl font-bold text-primary scale-110 tracking-tighter drop-shadow-lg z-10 bg-transparent text-center outline-none border-2 border-primary/50 rounded-lg px-2 w-32 pointer-events-auto"
            maxLength={2}
            disabled={disabled}
            aria-label={`Edit ${label} value`}
            aria-labelledby={`${label}-label`}
          />
        ) : (
          <div 
            className="text-6xl font-bold text-primary scale-110 tracking-tighter drop-shadow-lg z-10 cursor-pointer hover:scale-115 transition-transform pointer-events-auto focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg"
            onClick={handleDisplayClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleDisplayClick()
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                onChange((value + 1) % (max + 1))
                soundManager.playSound('tick', 20)
              } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                onChange((value - 1 + (max + 1)) % (max + 1))
                soundManager.playSound('tick', 20)
              }
            }}
            title="Click to edit or use arrow keys"
            role="spinbutton"
            tabIndex={0}
            aria-valuenow={displayItems[2]}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={`${label}: ${displayItems[2]}. Use arrow keys to adjust or press Enter to edit`}
            aria-labelledby={`${label}-label`}
          >
            {displayItems[2].toString().padStart(2, '0')}
          </div>
        )}
        <button
          onClick={() => {
            if (!disabled) {
              onChange((value + 1) % (max + 1))
              soundManager.playSound('tick', 20)
            }
          }}
          className="text-4xl font-medium text-white/20 scale-90 hover:text-white/40 transition-colors pointer-events-auto"
          disabled={disabled}
          aria-label={`Set ${label} to ${displayItems[3]}`}
        >
          {displayItems[3].toString().padStart(2, '0')}
        </button>
        <button
          onClick={() => {
            if (!disabled) {
              onChange((value + 2) % (max + 1))
              soundManager.playSound('tick', 20)
            }
          }}
          className="text-2xl font-medium text-white/5 scale-75 blur-[1px] pointer-events-auto"
          disabled={disabled}
          aria-label={`Set ${label} to ${displayItems[4]}`}
        >
          {displayItems[4].toString().padStart(2, '0')}
        </button>
      </div>
    </div>
  )
})

WheelPicker.displayName = 'WheelPicker'
