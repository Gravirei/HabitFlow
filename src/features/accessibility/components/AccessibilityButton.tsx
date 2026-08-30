import { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'

export function AccessibilityButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState(() => {
    // Load position from localStorage or use default
    const savedPosition = localStorage.getItem('accessibilityButtonPosition')
    if (savedPosition) {
      return JSON.parse(savedPosition)
    }
    return { x: window.innerWidth - 96, y: window.innerHeight - 96 }
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasMoved, setHasMoved] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [itemsAnimated, setItemsAnimated] = useState(false)

  // Handle drag start for mouse and touch
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
      setHasMoved(false)
      // Don't close modal here - let onClick handle it
      // Only close when actually dragging (handled in handleMouseMove)
    }
  }

  // Handle dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        setHasMoved(true)
        // Close modal when actually dragging (not just clicking)
        if (isOpen) {
          setIsOpen(false)
        }
        let newX = e.clientX - dragOffset.x
        let newY = e.clientY - dragOffset.y

        // Keep button within screen bounds
        const buttonSize = 64
        newX = Math.max(8, Math.min(window.innerWidth - buttonSize - 8, newX))
        newY = Math.max(8, Math.min(window.innerHeight - buttonSize - 8, newY))

        setPosition({ x: newX, y: newY })
      }
    }

    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false)

        // Snap to nearest edge
        const buttonSize = 64
        const centerX = position.x + buttonSize / 2
        const centerY = position.y + buttonSize / 2

        let finalX = position.x
        let finalY = position.y

        // Determine which edge is closest
        const distToLeft = centerX
        const distToRight = window.innerWidth - centerX
        const distToTop = centerY
        const distToBottom = window.innerHeight - centerY

        const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom)

        if (minDist === distToLeft) {
          finalX = 8 // Snap to left
        } else if (minDist === distToRight) {
          finalX = window.innerWidth - buttonSize - 8 // Snap to right
        }

        if (minDist === distToTop) {
          finalY = 8 // Snap to top
        } else if (minDist === distToBottom) {
          finalY = window.innerHeight - buttonSize - 8 // Snap to bottom
        }

        setPosition({ x: finalX, y: finalY })
      }
    }

    if (isDragging) {
      document.addEventListener('pointermove', handlePointerMove)
      document.addEventListener('pointerup', handlePointerUp)
      document.addEventListener('pointercancel', handlePointerUp)
    }

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [isDragging, dragOffset, position])

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('accessibilityButtonPosition', JSON.stringify(position))
  }, [position])

  const accessibilityFeatures = [
    {
      id: 'voiceover',
      name: 'VoiceOver',
      icon: 'campaign',
    },
    {
      id: 'zoom',
      name: 'Zoom',
      icon: 'zoom_in',
    },
    {
      id: 'magnifier',
      name: 'Magnifier',
      icon: 'search',
    },
    {
      id: 'display',
      name: 'Display & Text Size',
      icon: 'format_size',
    },
    {
      id: 'siri',
      name: 'Siri',
      icon: 'mic',
    },
    {
      id: 'shortcuts',
      name: 'Accessibility Shortcuts',
      icon: 'star',
    },
  ]

  // Reset animation state when modal opens
  useEffect(() => {
    if (isOpen) {
      setItemsAnimated(false)
      const timer = setTimeout(() => setItemsAnimated(true), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Inject spring animation keyframes
  useEffect(() => {
    const styleId = 'accessibility-spring-animation'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        @keyframes springIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          60% {
            opacity: 1;
            transform: scale(1.05) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes panelSpringIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes buttonFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  return (
    <>
      {/* Floating Accessibility Button - Glass/Frosted Effect with Siri Animation */}
      <button
        ref={buttonRef}
        onPointerDown={handlePointerDown}
        onClick={(e) => {
          if (!hasMoved) {
            // Stop event from reaching backdrop
            e.stopPropagation()
            // If panel is open, close it. If closed, open it.
            setIsOpen((prev) => !prev)
          }
        }}
        className={cn(
          'group fixed flex h-16 w-16 items-center justify-center rounded-full',
          'bg-white/20 backdrop-blur-xl dark:bg-white/10',
          'border border-white/30 dark:border-white/20',
          'shadow-2xl shadow-black/30',
          isDragging
            ? 'scale-110 cursor-grabbing'
            : 'cursor-grab transition-all duration-300 hover:scale-110 hover:bg-white/30 active:scale-95 dark:hover:bg-white/20'
        )}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 80,
          transition: isDragging ? 'none' : 'all 0.3s ease-out',
          touchAction: 'none',
        }}
        aria-label="Accessibility Options"
      >
        {/* Siri-like pulsing rings on hover */}
        {!isDragging && (
          <>
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 opacity-0 shadow-[0_0_30px_rgba(147,51,234,0.6)] group-hover:animate-ping group-hover:opacity-60"></div>
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 opacity-0 shadow-[0_0_40px_rgba(147,51,234,0.8)] group-hover:animate-pulse group-hover:opacity-50"></div>
          </>
        )}

        <span className="material-symbols-outlined relative z-10 text-3xl text-gray-900 dark:text-white">
          accessibility
        </span>
      </button>

      {/* Accessibility Panel - iOS Style */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="animate-in fade-in fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm duration-300"
            style={{ animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className="fixed z-[70] h-80 w-80 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 shadow-2xl dark:border-gray-800 dark:bg-gray-950"
            style={{
              left:
                position.x + 64 + 16 < window.innerWidth - 320
                  ? `${position.x + 64 + 16}px` // Right of button
                  : `${position.x - 320 - 16}px`, // Left of button
              top:
                position.y < window.innerHeight / 2
                  ? `${position.y}px` // Align to button top
                  : `${position.y + 64 - 320}px`, // Align to button bottom
              animation: 'springIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              transformOrigin: 'center center',
            }}
          >
            {/* Circular Arrangement of Features */}
            <div className="pointer-events-none absolute inset-0">
              {/* Center Option */}
              <div
                className="pointer-events-none absolute"
                style={{
                  left: '160px',
                  top: '160px',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <button
                  onClick={() => console.log('Settings clicked')}
                  className="group pointer-events-auto flex flex-col items-center gap-1 rounded-xl p-1.5 transition-all duration-200 hover:bg-white/10 active:bg-white/20"
                  style={{
                    animation: itemsAnimated
                      ? `springIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`
                      : 'none',
                    animationDelay: '0ms',
                    opacity: 0,
                  }}
                >
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-200 group-hover:bg-white/15 group-active:scale-95">
                    <span className="material-symbols-outlined text-xl text-white">settings</span>
                  </div>
                  {/* Label */}
                  <span className="max-w-[55px] text-center text-[10px] font-medium leading-tight text-white">
                    Settings
                  </span>
                </button>
              </div>

              {accessibilityFeatures.map((feature, index) => {
                // Calculate position in circle
                const angle = (index * 60 - 90) * (Math.PI / 180) // 60 degrees apart, starting from top
                const radius = 110 // Distance from center (increased to fit center option)
                const centerX = 160 // Half of 320px modal width
                const centerY = 160 // Half of 320px modal height
                const x = centerX + Math.cos(angle) * radius
                const y = centerY + Math.sin(angle) * radius

                return (
                  <div
                    key={feature.id}
                    className="pointer-events-none absolute"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <button
                      onClick={() => console.log(`${feature.name} clicked`)}
                      className="group pointer-events-auto flex flex-col items-center gap-1 rounded-xl p-1.5 transition-all duration-200 hover:bg-white/10 active:bg-white/20"
                      style={{
                        animation: itemsAnimated
                          ? `springIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`
                          : 'none',
                        animationDelay: `${index * 80}ms`,
                        opacity: 0,
                      }}
                    >
                      {/* Icon */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-200 group-hover:bg-white/15 group-active:scale-95">
                        <span className="material-symbols-outlined text-xl text-white">
                          {feature.icon}
                        </span>
                      </div>
                      {/* Label */}
                      <span className="max-w-[55px] text-center text-[10px] font-medium leading-tight text-white">
                        {feature.name}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
