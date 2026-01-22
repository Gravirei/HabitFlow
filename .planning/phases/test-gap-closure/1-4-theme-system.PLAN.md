# Plan: 1-4 - Theme System Tests (ThemeProvider)

## Objective
Create comprehensive unit tests for the ThemeProvider component and its helper functions.

## Context
- ThemeProvider applies theme settings to document.documentElement
- Uses useThemeStore for state
- Modifies CSS custom properties and class names
- Includes helper functions for color manipulation (lightenColor, darkenColor)
- Listens for system theme changes

## Dependencies
- Plan 1-1 (themeStore tests) - should be complete first for store mocking patterns
- Wave 2

## Tasks

<task type="auto">
<name>Create ThemeProvider tests</name>
<files>src/components/timer/themes/__tests__/ThemeProvider.test.tsx</files>
<action>
Create comprehensive tests for `ThemeProvider`:

1. **Setup**:
   - Mock useThemeStore with vi.mock
   - Mock window.matchMedia for system theme detection
   - Access document.documentElement for assertions
   - Reset DOM state between tests

2. **Mock Setup**:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { ThemeProvider } from '../ThemeProvider'
import { useThemeStore } from '../themeStore'

// Mock the store
vi.mock('../themeStore', () => ({
  useThemeStore: vi.fn(),
}))

const mockTheme = {
  mode: 'dark',
  preset: 'ultra-dark',
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
}

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => ({
  matches,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})
```

3. **Test Groups**:

**Dark/Light Mode**:
- mode 'dark': adds 'dark' class, removes 'light' class
- mode 'light': adds 'light' class, removes 'dark' class
- mode 'system' with dark preference: adds 'dark' class
- mode 'system' with light preference: adds 'light' class

**Theme Presets**:
- Applies preset colors from THEME_PRESET_COLORS
- Sets --color-background, --color-card, --color-preset-accent
- Sets secondary colors based on dark/light mode
- Removes custom properties when preset not found
- 'ultra-dark' preset adds 'theme-ultra-dark' class

**Accent Colors**:
- Sets --color-primary and --color-primary-hover
- Falls back to violet if unknown color

**Border Radius**:
- Sets --border-radius, --border-radius-sm, --border-radius-lg
- Calculates sm (half) and lg (1.5x) correctly

**Font Family**:
- Sets --font-family CSS property
- Sets document.body.style.fontFamily
- Handles all font options: system, inter, roboto, poppins, mono

**Timer Size**:
- Sets --timer-size as percentage

**Effects**:
- Sets --glow-enabled to '1' or '0'
- Sets --blur-enabled to '1' or '0'

**Accessibility**:
- highContrast: true adds 'high-contrast' class
- reducedMotion: true adds 'reduced-motion' class

**Gradient Background**:
- Sets --gradient-background when provided
- Adds 'has-gradient-background' class
- Removes property and class when null

**Custom Background**:
- Sets --custom-background-url with url() wrapper
- Adds 'has-custom-background' class
- Removes when null

**Data Attributes**:
- Sets data-timer-style attribute
- Sets data-button-style attribute

**System Theme Listener**:
- Adds event listener when mode is 'system'
- Removes listener on cleanup
- Does not add listener when mode is 'dark' or 'light'

**Children Rendering**:
- Renders children correctly
- Fragment wrapper doesn't add extra DOM elements

4. **Helper Function Tests** (lightenColor, darkenColor):
Note: These are not exported, so test them indirectly through ThemeProvider effects or extract and export them for direct testing.

If testing directly (recommend extracting):
```typescript
describe('lightenColor', () => {
  it('should lighten #000000 by 50%', () => {
    expect(lightenColor('#000000', 50)).toBe('#7f7f7f')
  })
})

describe('darkenColor', () => {
  it('should darken #ffffff by 50%', () => {
    expect(darkenColor('#ffffff', 50)).toBe('#7f7f7f')
  })
})
```
</action>
<verify>Run `npm test src/components/timer/themes/__tests__/ThemeProvider.test.tsx` - all tests pass</verify>
<done>ThemeProvider has 25+ tests covering all theme application logic, CSS properties, classes, and system theme detection</done>
</task>

<task type="auto">
<name>Create ThemesModal tests</name>
<files>src/components/timer/themes/__tests__/ThemesModal.test.tsx</files>
<action>
Create tests for `ThemesModal` component:

1. **Setup**:
   - Mock useThemeStore
   - Use React Testing Library for rendering and interactions

2. **Test Groups**:

**Rendering**:
- Renders when open prop is true
- Does not render when open prop is false
- Displays modal title/header

**Theme Preset Selection**:
- Displays all available presets
- Calls setPreset when preset is clicked
- Shows current preset as selected

**Accent Color Selection**:
- Displays color options
- Calls setAccentColor when color is clicked
- Shows current color as selected

**Mode Toggle**:
- Displays mode options (dark/light/system)
- Calls setMode when mode is changed

**Effects Toggles**:
- Shows glow toggle, calls setGlowEnabled
- Shows blur toggle, calls setBlurEnabled
- Shows particles toggle, calls setParticlesEnabled

**Sliders**:
- Border radius slider calls setBorderRadius
- Timer size slider calls setTimerSize

**Accessibility Options**:
- Reduced motion toggle calls setReducedMotion
- High contrast toggle calls setHighContrast

**Reset Button**:
- Calls resetToDefaults when clicked

**Close Button**:
- Calls onClose when close button clicked
- Closes on escape key (if implemented)
- Closes on backdrop click (if implemented)
</action>
<verify>Run `npm test src/components/timer/themes/__tests__/ThemesModal.test.tsx` - all tests pass</verify>
<done>ThemesModal has 15+ tests covering rendering, interactions, and all customization options</done>
</task>

## Success Criteria
- Both test files created
- 40+ total tests covering ThemeProvider effects and ThemesModal interactions
- All tests pass
- CSS property application thoroughly tested

## Verification
```bash
npm test src/components/timer/themes/__tests__/ThemeProvider.test.tsx
npm test src/components/timer/themes/__tests__/ThemesModal.test.tsx
```
