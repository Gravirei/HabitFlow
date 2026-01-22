/**
 * AccessibleModal Component
 * Fully accessible modal wrapper with ARIA attributes and focus management
 * Use this for all modal implementations to ensure accessibility
 */

import React, { useId } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = '',
  size = 'md',
}) => {
  const prefersReducedMotion = useReducedMotion()
  const titleId = useId()
  const descId = useId()
  
  // Focus trap and keyboard handling
  const containerRef = useFocusTrap<HTMLDivElement>({
    isActive: isOpen,
    onEscape: onClose,
    restoreFocus: true,
  })

  // Prevent body scroll when modal is open
  useBodyScrollLock(isOpen)

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-xl z-50 ${!prefersReducedMotion && 'animate-in fade-in duration-300'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none"
        role="presentation"
      >
        {/* Modal Dialog */}
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          className={`relative w-full ${sizeClasses[size]} bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl shadow-2xl border border-white/10 pointer-events-auto ${!prefersReducedMotion && 'animate-in zoom-in-95 fade-in duration-300'} ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Visually Hidden Title (always present for screen readers) */}
          <h2 id={titleId} className="sr-only">
            {title}
          </h2>

          {/* Optional Description */}
          {description && (
            <p id={descId} className="sr-only">
              {description}
            </p>
          )}

          {/* Modal Content */}
          {children}
        </div>
      </div>
    </>
  )
}

/**
 * Screen Reader Only utility class
 * Add this to your global CSS if not already present:
 * 
 * .sr-only {
 *   position: absolute;
 *   width: 1px;
 *   height: 1px;
 *   padding: 0;
 *   margin: -1px;
 *   overflow: hidden;
 *   clip: rect(0, 0, 0, 0);
 *   white-space: nowrap;
 *   border-width: 0;
 * }
 */
