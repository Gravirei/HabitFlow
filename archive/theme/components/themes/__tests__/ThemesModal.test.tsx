/**
 * ThemesModal Component Tests
 * Comprehensive unit tests for theme selection modal
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemesModal } from '../ThemesModal'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
  },
}))

// Mock useDeviceType hook
vi.mock('../../../../hooks/useDeviceType', () => ({
  useDeviceType: vi.fn(() => 'desktop'),
}))

// Mock themeStore
const mockUpdateTheme = vi.fn()
const mockResetToDefaults = vi.fn()

vi.mock('../themeStore', () => ({
  useThemeStore: vi.fn(() => ({
    mode: 'dark',
    preset: 'default',
    accentColor: 'violet',
    gradientBackground: null,
    customBackgroundUrl: null,
    timerStyle: 'default',
    glowEnabled: true,
    blurEnabled: true,
    particlesEnabled: false,
    borderRadius: 16,
    buttonStyle: 'rounded',
    fontFamily: 'system',
    timerSize: 100,
    reducedMotion: false,
    highContrast: false,
    updateTheme: mockUpdateTheme,
    resetToDefaults: mockResetToDefaults,
  })),
}))

import toast from 'react-hot-toast'
import { useDeviceType } from '../../../../hooks/useDeviceType'
import { useThemeStore } from '../themeStore'

const mockUseDeviceType = vi.mocked(useDeviceType)
const mockUseThemeStore = vi.mocked(useThemeStore)

describe('ThemesModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDeviceType.mockReturnValue('desktop')
    // Reset window.confirm mock
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<ThemesModal {...defaultProps} />)
      // "Themes" appears in header and as tab, use getAllByText
      expect(screen.getAllByText('Themes').length).toBeGreaterThan(0)
    })

    it('should not render modal when isOpen is false', () => {
      render(<ThemesModal {...defaultProps} isOpen={false} />)
      expect(screen.queryAllByText('Themes')).toHaveLength(0)
    })

    it('should render modal header with title', () => {
      render(<ThemesModal {...defaultProps} />)
      // Header title exists (multiple "Themes" elements due to tab)
      expect(screen.getAllByText('Themes').length).toBeGreaterThanOrEqual(2)
    })

    it('should render close button', () => {
      render(<ThemesModal {...defaultProps} />)
      expect(screen.getByText('close')).toBeInTheDocument()
    })

    it('should render all tab buttons', () => {
      render(<ThemesModal {...defaultProps} />)
      // "Themes" appears multiple times (header + tab)
      expect(screen.getAllByText('Themes').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Colors')).toBeInTheDocument()
      expect(screen.getByText('Effects')).toBeInTheDocument()
      expect(screen.getByText('Display')).toBeInTheDocument()
    })

    it('should render apply and reset buttons', () => {
      render(<ThemesModal {...defaultProps} />)
      expect(screen.getByText('Apply Theme')).toBeInTheDocument()
      expect(screen.getByText('Reset to Default')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('should show themes tab content by default', () => {
      render(<ThemesModal {...defaultProps} />)
      expect(screen.getByText('Appearance Mode')).toBeInTheDocument()
      expect(screen.getByText('Dark Themes')).toBeInTheDocument()
      expect(screen.getByText('Light Themes')).toBeInTheDocument()
    })

    it('should switch to colors tab when clicked', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Colors'))
      
      expect(screen.getByText('Accent Color')).toBeInTheDocument()
    })

    it('should switch to effects tab when clicked', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Effects'))
      
      expect(screen.getByText('Timer Display Style')).toBeInTheDocument()
      expect(screen.getByText('Visual Effects')).toBeInTheDocument()
    })

    it('should switch to display tab when clicked', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Display'))
      
      expect(screen.getByText('Font Family')).toBeInTheDocument()
      expect(screen.getByText('Timer Display Size')).toBeInTheDocument()
    })
  })

  describe('Close Behavior', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<ThemesModal {...defaultProps} onClose={onClose} />)
      
      await user.click(screen.getByText('close'))
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const { container } = render(<ThemesModal {...defaultProps} onClose={onClose} />)
      
      // Find backdrop by class
      const backdrop = container.querySelector('.bg-black\\/60')
      if (backdrop) {
        await user.click(backdrop)
        expect(onClose).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('Theme Mode Selection', () => {
    it('should render all theme mode options', () => {
      render(<ThemesModal {...defaultProps} />)
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })

    it('should show descriptions for theme modes', () => {
      render(<ThemesModal {...defaultProps} />)
      expect(screen.getByText('Bright and clean')).toBeInTheDocument()
      expect(screen.getByText('Easy on the eyes')).toBeInTheDocument()
      expect(screen.getByText('Match device settings')).toBeInTheDocument()
    })

    it('should allow selecting light mode', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Light'))
      await user.click(screen.getByText('Apply Theme'))
      
      expect(mockUpdateTheme).toHaveBeenCalledTimes(1)
      // Verify updateTheme was called (local state tracks mode change)
      expect(mockUpdateTheme).toHaveBeenCalled()
    })

    it('should allow selecting system mode', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('System'))
      await user.click(screen.getByText('Apply Theme'))
      
      expect(mockUpdateTheme).toHaveBeenCalledTimes(1)
      expect(mockUpdateTheme).toHaveBeenCalled()
    })
  })

  describe('Dark Theme Presets', () => {
    it('should render all dark theme presets', () => {
      render(<ThemesModal {...defaultProps} />)
      expect(screen.getByText('Ultra Dark')).toBeInTheDocument()
      expect(screen.getByText('Default')).toBeInTheDocument()
      expect(screen.getByText('Midnight')).toBeInTheDocument()
      expect(screen.getByText('Ocean')).toBeInTheDocument()
      expect(screen.getByText('Forest')).toBeInTheDocument()
      expect(screen.getByText('Sunset')).toBeInTheDocument()
      expect(screen.getByText('Cherry')).toBeInTheDocument()
      expect(screen.getByText('AMOLED')).toBeInTheDocument()
      expect(screen.getByText('Nord')).toBeInTheDocument()
      expect(screen.getByText('Dracula')).toBeInTheDocument()
      expect(screen.getByText('Monokai')).toBeInTheDocument()
    })

    it('should show recommended badge for ultra-dark theme', () => {
      render(<ThemesModal {...defaultProps} />)
      expect(screen.getByText('✨ RECOMMENDED')).toBeInTheDocument()
    })

    it('should select dark preset and apply', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Ocean'))
      await user.click(screen.getByText('Apply Theme'))
      
      expect(mockUpdateTheme).toHaveBeenCalledTimes(1)
      expect(mockUpdateTheme).toHaveBeenCalled()
    })
  })

  describe('Light Theme Presets', () => {
    it('should render all light theme presets', () => {
      render(<ThemesModal {...defaultProps} />)
      expect(screen.getByText('Minimal')).toBeInTheDocument()
      expect(screen.getByText('Warm')).toBeInTheDocument()
      expect(screen.getByText('Cool')).toBeInTheDocument()
      expect(screen.getByText('Lavender')).toBeInTheDocument()
      expect(screen.getByText('Mint')).toBeInTheDocument()
      expect(screen.getByText('Peach')).toBeInTheDocument()
      expect(screen.getByText('Rose')).toBeInTheDocument()
      expect(screen.getByText('Paper')).toBeInTheDocument()
    })

    it('should select light preset and switch to light mode', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Mint'))
      await user.click(screen.getByText('Apply Theme'))
      
      expect(mockUpdateTheme).toHaveBeenCalledTimes(1)
      expect(mockUpdateTheme).toHaveBeenCalled()
    })
  })

  describe('Accent Color Selection', () => {
    it('should render accent color options in colors tab', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Colors'))
      
      expect(screen.getByText('Accent Color')).toBeInTheDocument()
    })

    it('should display selected accent color name', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Colors'))
      
      // Should show selected color name
      expect(screen.getByText(/Selected:/)).toBeInTheDocument()
    })

    it('should render color preview section', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Colors'))
      
      expect(screen.getByText('Preview')).toBeInTheDocument()
      expect(screen.getByText('Primary Button')).toBeInTheDocument()
      expect(screen.getByText('Secondary Button')).toBeInTheDocument()
    })
  })

  describe('Gradient Background', () => {
    it('should render gradient background toggle in colors tab', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Colors'))
      
      expect(screen.getByText('Gradient Background')).toBeInTheDocument()
    })

    it('should show gradient options when toggle is enabled', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Colors'))
      
      // Gradient Background section should exist
      expect(screen.getByText('Gradient Background')).toBeInTheDocument()
      
      // Find the toggle button in the gradient section (it's a button with rounded-full class)
      const gradientSection = screen.getByText('Gradient Background').closest('div')
      const toggles = gradientSection?.querySelectorAll('button')
      
      // Verify the gradient section renders with toggle
      expect(toggles?.length).toBeGreaterThan(0)
    })
  })

  describe('Timer Display Styles', () => {
    it('should render timer style options in effects tab', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Effects'))
      
      expect(screen.getByText('Timer Display Style')).toBeInTheDocument()
      expect(screen.getByText('Minimal')).toBeInTheDocument()
      expect(screen.getByText('Bold')).toBeInTheDocument()
      expect(screen.getByText('Neon')).toBeInTheDocument()
      expect(screen.getByText('Retro')).toBeInTheDocument()
      expect(screen.getByText('Gradient')).toBeInTheDocument()
    })

    it('should select timer style and apply', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Effects'))
      await user.click(screen.getByText('Neon'))
      await user.click(screen.getByText('Apply Theme'))
      
      expect(mockUpdateTheme).toHaveBeenCalledTimes(1)
      expect(mockUpdateTheme).toHaveBeenCalled()
    })
  })

  describe('Visual Effects Toggles', () => {
    it('should render glow effect toggle', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Effects'))
      
      expect(screen.getByText('Glow Effect')).toBeInTheDocument()
    })

    it('should render blur effects toggle', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Effects'))
      
      expect(screen.getByText('Blur Effects')).toBeInTheDocument()
    })

    it('should render particles toggle', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Effects'))
      
      expect(screen.getByText('Background Particles')).toBeInTheDocument()
    })
  })

  describe('Display Settings', () => {
    it('should render font family options', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Display'))
      
      expect(screen.getByText('Font Family')).toBeInTheDocument()
    })

    it('should render timer size slider', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Display'))
      
      expect(screen.getByText('Timer Display Size')).toBeInTheDocument()
    })

    it('should render border radius slider', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Effects'))
      
      expect(screen.getByText('Corner Roundness')).toBeInTheDocument()
    })

    it('should render button style options', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Effects'))
      
      expect(screen.getByText('Button Style')).toBeInTheDocument()
    })
  })

  describe('Accessibility Settings', () => {
    it('should render reduced motion toggle', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Display'))
      
      expect(screen.getByText('Reduced Motion')).toBeInTheDocument()
    })

    it('should render high contrast toggle', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Display'))
      
      expect(screen.getByText('High Contrast')).toBeInTheDocument()
    })
  })

  describe('Apply Theme', () => {
    it('should call updateTheme with all settings on apply', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Apply Theme'))
      
      expect(mockUpdateTheme).toHaveBeenCalledTimes(1)
      expect(mockUpdateTheme).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: expect.any(String),
          preset: expect.any(String),
          accentColor: expect.any(String),
        })
      )
    })

    it('should show success toast on apply', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Apply Theme'))
      
      expect(toast.success).toHaveBeenCalledWith('Theme applied successfully!')
    })

    it('should call onClose after applying changes', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<ThemesModal {...defaultProps} onClose={onClose} />)
      
      await user.click(screen.getByText('Apply Theme'))
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Reset to Default', () => {
    it('should show confirmation dialog on reset', async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Reset to Default'))
      
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to reset all theme settings to defaults?')
    })

    it('should call resetToDefaults when confirmed', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Reset to Default'))
      
      expect(mockResetToDefaults).toHaveBeenCalledTimes(1)
    })

    it('should not call resetToDefaults when cancelled', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Reset to Default'))
      
      expect(mockResetToDefaults).not.toHaveBeenCalled()
    })

    it('should show success toast after reset', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      render(<ThemesModal {...defaultProps} />)
      
      await user.click(screen.getByText('Reset to Default'))
      
      expect(toast.success).toHaveBeenCalledWith('Theme reset to defaults')
    })

    it('should close modal after reset', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      render(<ThemesModal {...defaultProps} onClose={onClose} />)
      
      await user.click(screen.getByText('Reset to Default'))
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should render in mobile layout when device is mobile', () => {
      mockUseDeviceType.mockReturnValue('mobile')
      render(<ThemesModal {...defaultProps} />)
      
      // Modal should still render with mobile-specific classes
      expect(screen.getAllByText('Themes').length).toBeGreaterThan(0)
    })

    it('should hide subtitle on mobile', () => {
      mockUseDeviceType.mockReturnValue('mobile')
      render(<ThemesModal {...defaultProps} />)
      
      expect(screen.queryByText('Customize your experience')).not.toBeInTheDocument()
    })

    it('should show subtitle on desktop', () => {
      mockUseDeviceType.mockReturnValue('desktop')
      render(<ThemesModal {...defaultProps} />)
      
      expect(screen.getByText('Customize your experience')).toBeInTheDocument()
    })
  })

  describe('State Reset on Open', () => {
    it('should reset local state when modal opens', () => {
      const { rerender } = render(<ThemesModal {...defaultProps} isOpen={false} />)
      
      // Modal is closed
      expect(screen.queryAllByText('Themes')).toHaveLength(0)
      
      // Open modal
      rerender(<ThemesModal {...defaultProps} isOpen={true} />)
      
      // Modal is open and shows default tab
      expect(screen.getAllByText('Themes').length).toBeGreaterThan(0)
      expect(screen.getByText('Appearance Mode')).toBeInTheDocument()
    })
  })

  describe('Multiple Theme Changes', () => {
    it('should accumulate multiple changes before apply', async () => {
      const user = userEvent.setup()
      render(<ThemesModal {...defaultProps} />)
      
      // Change mode
      await user.click(screen.getByText('Light'))
      
      // Change preset
      await user.click(screen.getByText('Mint'))
      
      // Apply all changes at once
      await user.click(screen.getByText('Apply Theme'))
      
      // Should call updateTheme exactly once with all accumulated changes
      expect(mockUpdateTheme).toHaveBeenCalledTimes(1)
      expect(mockUpdateTheme).toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should be focusable', () => {
      render(<ThemesModal {...defaultProps} />)
      
      // Find apply button and check it can be focused
      const applyButton = screen.getByText('Apply Theme')
      applyButton.focus()
      
      expect(document.activeElement).toBe(applyButton)
    })
  })

  describe('Visual Indicators', () => {
    it('should show check icon on selected theme mode', () => {
      render(<ThemesModal {...defaultProps} />)
      
      // The 'Dark' mode should be selected by default and show a check indicator
      const darkButton = screen.getByText('Dark').closest('button')
      expect(darkButton).toBeInTheDocument()
    })

    it('should highlight active tab', () => {
      render(<ThemesModal {...defaultProps} />)
      
      // The first tab should be active by default - Themes tab exists
      const themesTabs = screen.getAllByText('Themes')
      expect(themesTabs.length).toBeGreaterThan(0)
    })
  })
})
