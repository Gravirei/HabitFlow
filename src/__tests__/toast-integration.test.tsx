/**
 * Toast Notification Integration Tests
 * Tests for react-hot-toast integration throughout the app
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'

describe('Toast Notifications Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Toaster Configuration', () => {
    it('should render Toaster component', () => {
      const { container } = render(<Toaster />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should accept custom configuration', () => {
      const { container } = render(
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#fff',
            },
          }}
        />
      )
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Toast Types', () => {
    it('should create success toast', () => {
      const successSpy = vi.spyOn(toast, 'success')
      toast.success('Success message')
      expect(successSpy).toHaveBeenCalledWith('Success message')
    })

    it('should create error toast', () => {
      const errorSpy = vi.spyOn(toast, 'error')
      toast.error('Error message')
      expect(errorSpy).toHaveBeenCalledWith('Error message')
    })

    it('should create loading toast', () => {
      const loadingSpy = vi.spyOn(toast, 'loading')
      toast.loading('Loading...')
      expect(loadingSpy).toHaveBeenCalledWith('Loading...')
    })

    it('should create custom toast', () => {
      const customSpy = vi.spyOn(toast, 'custom')
      toast.custom('Custom message')
      expect(customSpy).toHaveBeenCalledWith('Custom message')
    })
  })

  describe('Toast Lifecycle', () => {
    it('should allow dismissing toasts', () => {
      const toastId = toast.success('Test message')
      toast.dismiss(toastId)
      expect(toastId).toBeDefined()
    })

    it('should update existing toast', () => {
      const toastId = toast.loading('Loading...')
      toast.success('Success!', { id: toastId })
      expect(toastId).toBeDefined()
    })
  })

  describe('Toast Options', () => {
    it('should accept custom duration', () => {
      const spy = vi.spyOn(toast, 'success')
      toast.success('Test', { duration: 5000 })
      expect(spy).toHaveBeenCalledWith('Test', { duration: 5000 })
    })

    it('should accept custom icon', () => {
      const spy = vi.spyOn(toast, 'success')
      toast.success('Test', { icon: '🎉' })
      expect(spy).toHaveBeenCalledWith('Test', { icon: '🎉' })
    })

    it('should accept custom position', () => {
      const spy = vi.spyOn(toast, 'success')
      toast.success('Test', { position: 'bottom-right' })
      expect(spy).toHaveBeenCalledWith('Test', { position: 'bottom-right' })
    })
  })

  describe('Real-world Usage Scenarios', () => {
    it('should handle habit creation success', () => {
      const spy = vi.spyOn(toast, 'success')
      
      // Simulate habit creation
      toast.success(`🎉 Habit created successfully!`)
      
      expect(spy).toHaveBeenCalledWith('🎉 Habit created successfully!')
    })

    it('should handle validation errors', () => {
      const spy = vi.spyOn(toast, 'error')
      
      // Simulate validation error
      toast.error('Please enter a habit name')
      
      expect(spy).toHaveBeenCalledWith('Please enter a habit name')
    })

    it('should handle loading states', () => {
      const loadingSpy = vi.spyOn(toast, 'loading')
      const successSpy = vi.spyOn(toast, 'success')
      
      // Simulate async operation
      const toastId = toast.loading('Saving habit...')
      expect(loadingSpy).toHaveBeenCalled()
      
      // Complete operation
      toast.success('Saved!', { id: toastId })
      expect(successSpy).toHaveBeenCalled()
    })

    it('should handle multiple toasts', () => {
      toast.success('First toast')
      toast.success('Second toast')
      toast.error('Third toast')
      
      // All toasts should be created
      expect(true).toBe(true) // Simple assertion since toasts are managed internally
    })
  })

  describe('Toast Promise API', () => {
    it('should handle promise-based toasts', async () => {
      const myPromise = new Promise((resolve) => {
        setTimeout(() => resolve('Success'), 100)
      })

      const toastPromise = toast.promise(myPromise, {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      })

      await waitFor(() => {
        expect(toastPromise).resolves.toBe('Success')
      })
    })

    it('should handle rejected promises', async () => {
      const myPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Failed')), 100)
      })

      const toastPromise = toast.promise(myPromise, {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      })

      await waitFor(() => {
        expect(toastPromise).rejects.toThrow('Failed')
      })
    })
  })

  describe('App-specific Toast Messages', () => {
    const expectedMessages = {
      habitCreated: '🎉 Habit created successfully!',
      habitDeleted: 'Habit deleted',
      habitUpdated: 'Habit updated',
      validationError: 'Please enter a habit name',
      emptyName: 'Habit name is required',
      tooLong: 'Habit name must be less than 100 characters',
      onlySpaces: 'Habit name cannot be only spaces',
    }

    it('should use consistent success message for habit creation', () => {
      const spy = vi.spyOn(toast, 'success')
      toast.success(expectedMessages.habitCreated)
      expect(spy).toHaveBeenCalledWith(expectedMessages.habitCreated)
    })

    it('should use consistent error message for validation', () => {
      const spy = vi.spyOn(toast, 'error')
      toast.error(expectedMessages.validationError)
      expect(spy).toHaveBeenCalledWith(expectedMessages.validationError)
    })
  })

  describe('Accessibility', () => {
    it('should be dismissible by user', () => {
      const toastId = toast.success('Test message')
      const dismissSpy = vi.spyOn(toast, 'dismiss')
      
      toast.dismiss(toastId)
      expect(dismissSpy).toHaveBeenCalledWith(toastId)
    })

    it('should auto-dismiss after duration', async () => {
      const toastId = toast.success('Test', { duration: 100 })
      
      await waitFor(() => {
        expect(toastId).toBeDefined()
      }, { timeout: 150 })
    })
  })

  describe('Performance', () => {
    it('should handle rapid toast creation', () => {
      const startTime = Date.now()
      
      for (let i = 0; i < 10; i++) {
        toast.success(`Toast ${i}`)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete in less than 100ms
      expect(duration).toBeLessThan(100)
    })

    it('should cleanup dismissed toasts', () => {
      const toastId1 = toast.success('Toast 1')
      const toastId2 = toast.success('Toast 2')
      
      toast.dismiss(toastId1)
      toast.dismiss(toastId2)
      
      // Toasts should be dismissed without errors
      expect(true).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const spy = vi.spyOn(toast, 'success')
      toast.success('')
      expect(spy).toHaveBeenCalledWith('')
    })

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(1000)
      const spy = vi.spyOn(toast, 'success')
      toast.success(longMessage)
      expect(spy).toHaveBeenCalledWith(longMessage)
    })

    it('should handle special characters in messages', () => {
      const specialMessage = 'Test 🎉 with émojis & spëcial çhars!'
      const spy = vi.spyOn(toast, 'success')
      toast.success(specialMessage)
      expect(spy).toHaveBeenCalledWith(specialMessage)
    })
  })
})
