/**
 * ThemeProvider Component Tests
 * Comprehensive unit tests for theme context provider
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { ThemeProvider } from '../ThemeProvider'
import { useThemeStore } from '../themeStore'

// Mock the themeStore
vi.mock('../themeStore', () => ({
  useThemeStore: vi.fn(),
}))

const mockUseThemeStore = vi.mocked(useThemeStore)

// Default mock theme state
const createMockTheme = (overrides = {}) => ({
  mode: 'dark' as const,
  preset: 'default',
  accentColor: 'violet',
  gradientBackground: null,
  customBackgroundUrl: null,
  timerStyle: 'default' as const,
  glowEnabled: true,
  blurEnabled: true,
  particlesEnabled: false,
  borderRadius: 16,
  buttonStyle: 'rounded' as const,
  fontFamily: 'system' as const,
  timerSize: 100,
  reducedMotion: false,
  highContrast: false,
  ...overrides,
})

describe('ThemeProvider', () => {
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    // Reset DOM state
    document.documentElement.className = ''
    document.documentElement.removeAttribute('style')
    document.documentElement.removeAttribute('data-timer-style')
    document.documentElement.removeAttribute('data-button-style')
    document.body.style.fontFamily = ''

    // Mock matchMedia
    originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    // Set default mock
    mockUseThemeStore.mockReturnValue(createMockTheme())
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render children correctly', () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Test Child</div>
        </ThemeProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should render multiple children', () => {
      render(
        <ThemeProvider>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </ThemeProvider>
      )

      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
    })

    it('should render nested children', () => {
      render(
        <ThemeProvider>
          <div data-testid="parent">
            <span data-testid="nested-child">Nested</span>
          </div>
        </ThemeProvider>
      )

      expect(screen.getByTestId('parent')).toBeInTheDocument()
      expect(screen.getByTestId('nested-child')).toBeInTheDocument()
    })

    it('should render with no children without error', () => {
      expect(() => {
        render(<ThemeProvider>{null}</ThemeProvider>)
      }).not.toThrow()
    })
  })

  describe('Dark/Light Mode', () => {
    it('should apply dark class when mode is dark', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ mode: 'dark' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.classList.contains('light')).toBe(false)
    })

    it('should apply light class when mode is light', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ mode: 'light' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should apply dark class when system prefers dark', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))

      mockUseThemeStore.mockReturnValue(createMockTheme({ mode: 'system' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should apply light class when system prefers light', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: light)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))

      mockUseThemeStore.mockReturnValue(createMockTheme({ mode: 'system' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains('light')).toBe(true)
    })
  })

  describe('Theme Presets', () => {
    it('should apply preset colors for ultra-dark theme', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ preset: 'ultra-dark', mode: 'dark' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--color-background')).toBe('#020617')
      expect(root.style.getPropertyValue('--color-card')).toBe('#0f172a')
      expect(root.classList.contains('theme-ultra-dark')).toBe(true)
    })

    it('should apply preset colors for default theme', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ preset: 'default', mode: 'dark' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--color-background')).toBe('#0f172a')
      expect(root.style.getPropertyValue('--color-card')).toBe('#1e293b')
    })

    it('should apply preset colors for ocean theme', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ preset: 'ocean', mode: 'dark' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--color-background')).toBe('#0a1929')
      expect(root.style.getPropertyValue('--color-card')).toBe('#0d2137')
    })

    it('should apply preset colors for minimal-light theme', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ preset: 'minimal-light', mode: 'light' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--color-background')).toBe('#ffffff')
      expect(root.style.getPropertyValue('--color-card')).toBe('#f8fafc')
    })

    it('should remove theme-ultra-dark class for non-ultra-dark presets', () => {
      document.documentElement.classList.add('theme-ultra-dark')
      mockUseThemeStore.mockReturnValue(createMockTheme({ preset: 'ocean', mode: 'dark' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains('theme-ultra-dark')).toBe(false)
    })

    it('should handle missing/unknown preset gracefully', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ preset: 'unknown-preset' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      // Should remove custom properties when preset not found
      expect(root.style.getPropertyValue('--color-background')).toBe('')
      expect(root.style.getPropertyValue('--color-card')).toBe('')
    })
  })

  describe('Accent Colors', () => {
    it('should apply violet accent color', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ accentColor: 'violet' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--color-primary')).toBe('#8b5cf6')
      expect(root.style.getPropertyValue('--color-primary-hover')).toBe('#a78bfa')
    })

    it('should apply indigo accent color', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ accentColor: 'indigo' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--color-primary')).toBe('#6366f1')
      expect(root.style.getPropertyValue('--color-primary-hover')).toBe('#818cf8')
    })

    it('should apply cyan accent color', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ accentColor: 'cyan' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--color-primary')).toBe('#06b6d4')
      expect(root.style.getPropertyValue('--color-primary-hover')).toBe('#22d3ee')
    })

    it('should apply emerald accent color', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ accentColor: 'emerald' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--color-primary')).toBe('#10b981')
      expect(root.style.getPropertyValue('--color-primary-hover')).toBe('#34d399')
    })

    it('should fallback to violet for unknown accent color', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ accentColor: 'unknown-color' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--color-primary')).toBe('#8b5cf6')
      expect(root.style.getPropertyValue('--color-primary-hover')).toBe('#a78bfa')
    })
  })

  describe('Border Radius', () => {
    it('should apply border radius CSS variables', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ borderRadius: 16 }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--border-radius')).toBe('16px')
      expect(root.style.getPropertyValue('--border-radius-sm')).toBe('8px')
      expect(root.style.getPropertyValue('--border-radius-lg')).toBe('24px')
    })

    it('should apply zero border radius', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ borderRadius: 0 }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--border-radius')).toBe('0px')
      expect(root.style.getPropertyValue('--border-radius-sm')).toBe('0px')
      expect(root.style.getPropertyValue('--border-radius-lg')).toBe('0px')
    })

    it('should apply large border radius', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ borderRadius: 24 }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--border-radius')).toBe('24px')
      expect(root.style.getPropertyValue('--border-radius-sm')).toBe('12px')
      expect(root.style.getPropertyValue('--border-radius-lg')).toBe('36px')
    })
  })

  describe('Font Family', () => {
    it('should apply system font family', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ fontFamily: 'system' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const expectedFont = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      expect(document.documentElement.style.getPropertyValue('--font-family')).toBe(expectedFont)
      expect(document.body.style.fontFamily).toBe(expectedFont)
    })

    it('should apply inter font family', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ fontFamily: 'inter' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.style.getPropertyValue('--font-family')).toBe('Inter, system-ui, sans-serif')
    })

    it('should apply mono font family', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ fontFamily: 'mono' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.style.getPropertyValue('--font-family')).toBe('"JetBrains Mono", "Fira Code", Consolas, monospace')
    })

    it('should fallback to system font for unknown family', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ fontFamily: 'unknown' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const expectedFont = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      expect(document.documentElement.style.getPropertyValue('--font-family')).toBe(expectedFont)
    })
  })

  describe('Timer Size', () => {
    it('should apply default timer size', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ timerSize: 100 }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.style.getPropertyValue('--timer-size')).toBe('100%')
    })

    it('should apply small timer size', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ timerSize: 75 }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.style.getPropertyValue('--timer-size')).toBe('75%')
    })

    it('should apply large timer size', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ timerSize: 150 }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.style.getPropertyValue('--timer-size')).toBe('150%')
    })
  })

  describe('Visual Effects', () => {
    it('should enable glow effect', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ glowEnabled: true }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.style.getPropertyValue('--glow-enabled')).toBe('1')
    })

    it('should disable glow effect', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ glowEnabled: false }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.style.getPropertyValue('--glow-enabled')).toBe('0')
    })

    it('should enable blur effect', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ blurEnabled: true }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.style.getPropertyValue('--blur-enabled')).toBe('1')
    })

    it('should disable blur effect', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ blurEnabled: false }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.style.getPropertyValue('--blur-enabled')).toBe('0')
    })
  })

  describe('Accessibility', () => {
    it('should apply high contrast class when enabled', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ highContrast: true }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains('high-contrast')).toBe(true)
    })

    it('should remove high contrast class when disabled', () => {
      document.documentElement.classList.add('high-contrast')
      mockUseThemeStore.mockReturnValue(createMockTheme({ highContrast: false }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains('high-contrast')).toBe(false)
    })

    it('should apply reduced motion class when enabled', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ reducedMotion: true }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains('reduced-motion')).toBe(true)
    })

    it('should remove reduced motion class when disabled', () => {
      document.documentElement.classList.add('reduced-motion')
      mockUseThemeStore.mockReturnValue(createMockTheme({ reducedMotion: false }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.classList.contains('reduced-motion')).toBe(false)
    })
  })

  describe('Gradient Background', () => {
    it('should apply gradient background when enabled', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ gradientBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--gradient-background')).toBe('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
      expect(root.classList.contains('has-gradient-background')).toBe(true)
    })

    it('should remove gradient background when null', () => {
      document.documentElement.classList.add('has-gradient-background')
      document.documentElement.style.setProperty('--gradient-background', 'test')
      
      mockUseThemeStore.mockReturnValue(createMockTheme({ gradientBackground: null }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--gradient-background')).toBe('')
      expect(root.classList.contains('has-gradient-background')).toBe(false)
    })
  })

  describe('Custom Background', () => {
    it('should apply custom background URL when set', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ customBackgroundUrl: 'https://example.com/bg.jpg' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--custom-background-url')).toBe('url(https://example.com/bg.jpg)')
      expect(root.classList.contains('has-custom-background')).toBe(true)
    })

    it('should remove custom background when null', () => {
      document.documentElement.classList.add('has-custom-background')
      document.documentElement.style.setProperty('--custom-background-url', 'url(test)')
      
      mockUseThemeStore.mockReturnValue(createMockTheme({ customBackgroundUrl: null }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--custom-background-url')).toBe('')
      expect(root.classList.contains('has-custom-background')).toBe(false)
    })
  })

  describe('Data Attributes', () => {
    it('should set timer style data attribute', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ timerStyle: 'neon' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.getAttribute('data-timer-style')).toBe('neon')
    })

    it('should set button style data attribute', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ buttonStyle: 'pill' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.getAttribute('data-button-style')).toBe('pill')
    })

    it('should update data attributes when style changes', () => {
      const { rerender } = render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.getAttribute('data-timer-style')).toBe('default')

      mockUseThemeStore.mockReturnValue(createMockTheme({ timerStyle: 'gradient' }))
      
      rerender(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.getAttribute('data-timer-style')).toBe('gradient')
    })
  })

  describe('System Theme Listener', () => {
    it('should set up media query listener when mode is system', () => {
      const addEventListenerMock = vi.fn()
      const removeEventListenerMock = vi.fn()
      
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
      }))

      mockUseThemeStore.mockReturnValue(createMockTheme({ mode: 'system' }))

      const { unmount } = render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))

      unmount()

      expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should not set up listener when mode is not system', () => {
      const addEventListenerMock = vi.fn()
      
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        addEventListener: addEventListenerMock,
        removeEventListener: vi.fn(),
      }))

      mockUseThemeStore.mockReturnValue(createMockTheme({ mode: 'dark' }))

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      // Should not add listener for non-system mode
      expect(addEventListenerMock).not.toHaveBeenCalled()
    })
  })

  describe('Theme Updates', () => {
    it('should update theme when store changes', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({ accentColor: 'violet' }))

      const { rerender } = render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#8b5cf6')

      mockUseThemeStore.mockReturnValue(createMockTheme({ accentColor: 'cyan' }))

      rerender(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#06b6d4')
    })

    it('should update multiple properties simultaneously', () => {
      mockUseThemeStore.mockReturnValue(createMockTheme({
        accentColor: 'violet',
        mode: 'dark',
        borderRadius: 16,
      }))

      const { rerender } = render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      mockUseThemeStore.mockReturnValue(createMockTheme({
        accentColor: 'emerald',
        mode: 'light',
        borderRadius: 8,
      }))

      rerender(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      const root = document.documentElement
      expect(root.style.getPropertyValue('--color-primary')).toBe('#10b981')
      expect(root.classList.contains('light')).toBe(true)
      expect(root.style.getPropertyValue('--border-radius')).toBe('8px')
    })
  })
})
