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

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
      setHasMoved(false)
      // Close modal if open when starting to drag
      if (isOpen) {
        setIsOpen(false)
      }
    }
  }

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setHasMoved(true)
        let newX = e.clientX - dragOffset.x
        let newY = e.clientY - dragOffset.y

        // Keep button within screen bounds
        const buttonSize = 64
        newX = Math.max(8, Math.min(window.innerWidth - buttonSize - 8, newX))
        newY = Math.max(8, Math.min(window.innerHeight - buttonSize - 8, newY))

        setPosition({ x: newX, y: newY })
      }
    }

    const handleMouseUp = () => {
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
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
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
        onMouseDown={handleMouseDown}
        onClick={() => {
          if (!hasMoved) {
            setIsOpen(!isOpen)
          }
        }}
        className={cn(
          "fixed w-16 h-16 rounded-full flex items-center justify-center group relative",
          "bg-white/20 dark:bg-white/10 backdrop-blur-xl",
          "border border-white/30 dark:border-white/20",
          "shadow-2xl shadow-black/30",
          isDragging 
            ? 'cursor-grabbing scale-110' 
            : 'cursor-grab hover:bg-white/30 dark:hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-300'
        )}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 50,
          transition: isDragging ? 'none' : 'all 0.3s ease-out',
        }}
        aria-label="Accessibility Options"
      >
        {/* Siri-like pulsing rings on hover */}
        {!isDragging && (
          <>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 opacity-0 group-hover:opacity-60 group-hover:animate-ping pointer-events-none shadow-[0_0_30px_rgba(147,51,234,0.6)]"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 opacity-0 group-hover:opacity-50 group-hover:animate-pulse pointer-events-none shadow-[0_0_40px_rgba(147,51,234,0.8)]"></div>
          </>
        )}
        
        <span className="material-symbols-outlined text-3xl text-gray-900 dark:text-white relative z-10">
          accessibility
        </span>
      </button>

      {/* Accessibility Panel - iOS Style */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
            style={{ animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div 
            className="fixed z-50 w-80 h-80 bg-gray-50 dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
            style={{
              left: position.x + 64 + 16 < window.innerWidth - 320 
                ? `${position.x + 64 + 16}px` // Right of button
                : `${position.x - 320 - 16}px`, // Left of button
              top: position.y < window.innerHeight / 2
                ? `${position.y}px` // Align to button top
                : `${position.y + 64 - 320}px`, // Align to button bottom
              animation: 'springIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              transformOrigin: 'center center',
            }}
          >
            {/* Circular Arrangement of Features */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Center Option */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: '160px',
                  top: '160px',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <button
                  onClick={() => console.log('Settings clicked')}
                  className="flex flex-col items-center gap-1 hover:bg-white/10 active:bg-white/20 rounded-xl p-1.5 transition-all duration-200 group pointer-events-auto"
                  style={{
                    animation: itemsAnimated 
                      ? `springIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`
                      : 'none',
                    animationDelay: '0ms',
                    opacity: 0,
                  }}
                >
                  {/* Icon */}
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm group-hover:bg-white/15 group-active:scale-95 transition-all duration-200">
                    <span className="material-symbols-outlined text-white text-xl">
                      settings
                    </span>
                  </div>
                  {/* Label */}
                  <span className="text-[10px] text-white text-center font-medium leading-tight max-w-[55px]">
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
                    className="absolute pointer-events-none"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <button
                      onClick={() => console.log(`${feature.name} clicked`)}
                      className="flex flex-col items-center gap-1 hover:bg-white/10 active:bg-white/20 rounded-xl p-1.5 transition-all duration-200 group pointer-events-auto"
                      style={{
                        animation: itemsAnimated 
                          ? `springIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`
                          : 'none',
                        animationDelay: `${index * 80}ms`,
                        opacity: 0,
                      }}
                    >
                    {/* Icon */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm group-hover:bg-white/15 group-active:scale-95 transition-all duration-200">
                      <span className="material-symbols-outlined text-white text-xl">
                        {feature.icon}
                      </span>
                    </div>
                    {/* Label */}
                    <span className="text-[10px] text-white text-center font-medium leading-tight max-w-[55px]">
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
