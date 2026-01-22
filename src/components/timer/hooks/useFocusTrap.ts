/**
 * useFocusTrap Hook
 * Traps focus within a container (essential for accessible modals)
 * Prevents keyboard users from tabbing outside the modal
 */

import { useEffect, useRef, useCallback } from 'react'

interface UseFocusTrapOptions {
  isActive: boolean
  onEscape?: () => void
  restoreFocus?: boolean
}

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  isActive,
  onEscape,
  restoreFocus = true,
}: UseFocusTrapOptions) {
  const containerRef = useRef<T>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Store the element that had focus before modal opened
  useEffect(() => {
    if (isActive) {
      previousActiveElement.current = document.activeElement as HTMLElement
    }
  }, [isActive])

  // Focus first focusable element when modal opens
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const focusableElements = getFocusableElements(containerRef.current)
    
    if (focusableElements.length > 0) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        focusableElements[0].focus()
      }, 50)
    }
  }, [isActive])

  // Restore focus when modal closes
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [restoreFocus])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive || !containerRef.current) return

      // Handle Escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault()
        onEscape()
        return
      }

      // Handle Tab key (focus trap)
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements(containerRef.current)
        
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]
        const activeElement = document.activeElement

        // Shift + Tab on first element: go to last
        if (event.shiftKey && activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
        // Tab on last element: go to first
        else if (!event.shiftKey && activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    },
    [isActive, onEscape]
  )

  // Add/remove event listeners
  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, handleKeyDown])

  return containerRef
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  const elements = container.querySelectorAll<HTMLElement>(selector)
  return Array.from(elements).filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
  )
}
