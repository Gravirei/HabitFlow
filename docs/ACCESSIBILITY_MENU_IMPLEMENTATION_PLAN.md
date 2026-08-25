# Accessibility Menu Implementation Plan

## Objective

Implement the six non-settings actions in the floating accessibility menu as real product features that fit the current HabitFlow architecture.

Menu source:
- `src/components/AccessibilityButton.tsx`

Relevant existing architecture:
- `src/pages/sideNav/Settings.tsx`
- `src/components/timer/shared/AccessibleModal.tsx`
- `src/hooks/useReducedMotion.ts`
- `src/hooks/useLocalStorage.ts`
- `src/hooks/useDeviceType.ts`
- `src/pages/bottomNav/Tasks.tsx`

Important constraint:
- Several menu labels currently map to OS-level capabilities, not pure web-app features.
- We will implement honest in-app equivalents where possible and capability-gated handoff/fallback where the OS owns the feature.

## Scope

Included menu items:
1. `VoiceOver`
2. `Zoom`
3. `Magnifier`
4. `Display & Text Size`
5. `Siri`
6. `Accessibility Shortcuts`

Excluded:
- `Settings` center action
- unrelated global settings refactors outside accessibility scope

## Implementation Principles

- One shared accessibility state model for all entry points.
- No fake toggles that do nothing.
- Reuse existing app patterns: Zustand-style stores, shared modals, hook-based capability detection.
- Prefer app-owned accessibility features first.
- Gate OS/native-only behavior behind capability checks.
- Mobile-first implementation and acceptance checks.

## Proposed State Shape

File:
- `src/store/useAccessibilityStore.ts`

```ts
type UiZoom = 1 | 1.1 | 1.25 | 1.4
type TextSize = 'small' | 'medium' | 'large' | 'xlarge'
type MagnifierMode = 'off' | 'tap'
type ShortcutProfile = 'default' | 'reading' | 'low-motion' | 'high-contrast'

interface AccessibilityCapabilities {
  speechRecognition: boolean
  nativePlatform: boolean
  vibration: boolean
}

interface AccessibilityState {
  reduceMotion: boolean
  highContrast: boolean
  screenReaderMode: boolean
  hapticFeedback: boolean
  uiZoom: UiZoom
  textSize: TextSize
  magnifierMode: MagnifierMode
  voiceCommandsEnabled: boolean
  shortcutProfile: ShortcutProfile
  capabilities: AccessibilityCapabilities

  toggleReduceMotion: () => void
  toggleHighContrast: () => void
  toggleScreenReaderMode: () => void
  toggleHapticFeedback: () => void
  setUiZoom: (value: UiZoom) => void
  setTextSize: (value: TextSize) => void
  setMagnifierMode: (value: MagnifierMode) => void
  setVoiceCommandsEnabled: (value: boolean) => void
  setShortcutProfile: (value: ShortcutProfile) => void
  detectCapabilities: () => void
  resetAccessibilityPreferences: () => void
}
```

## Wave 1: Foundation

### Goals

Create a shared accessibility state and controller layer so the menu and Settings page stop using isolated placeholder behavior.

### Files

New:
- `src/store/useAccessibilityStore.ts`
- `src/lib/accessibility/capabilities.ts`
- `src/components/accessibility/AccessibilityController.tsx`

Update:
- `src/App.tsx`

### Tasks

1. Create `useAccessibilityStore.ts` with persisted state for accessibility preferences.
2. Add `capabilities.ts` for browser/native feature detection.
3. Add `AccessibilityController.tsx` to:
   - apply root `data-*` attributes and CSS variables
   - react to store changes
   - initialize capability detection
4. Mount `AccessibilityController` near the top of `App.tsx`.

### Acceptance Criteria

- Accessibility preferences survive reloads.
- Capability detection runs once at app startup.
- Root DOM reflects store state through stable selectors such as:
  - `data-reduce-motion`
  - `data-high-contrast`
  - `data-screen-reader-mode`
  - `data-ui-zoom`
  - `data-text-size`
- No feature behavior depends on page-local accessibility state after this wave.

## Wave 2: Settings Page Integration

### Goals

Unify the existing Settings accessibility controls with the new shared store.

### Files

Update:
- `src/pages/sideNav/Settings.tsx`

### Tasks

1. Replace local accessibility `useState` values with `useAccessibilityStore`.
2. Keep the current Settings UI shape, but wire it to real persistent state.
3. Add missing controls for:
   - `uiZoom`
   - `textSize`
4. Ensure the Accessibility section becomes the canonical preferences editor.

### Acceptance Criteria

- Toggling accessibility settings in Settings updates the shared store.
- Reloading the page preserves those values.
- Settings and accessibility menu entry points read the same state.
- No duplicate accessibility state remains in `Settings.tsx`.

## Wave 3: Accessibility Menu Wiring

### Goals

Replace placeholder `console.log` handlers in the radial menu with real actions.

### Files

Update:
- `src/components/AccessibilityButton.tsx`
- `src/pages/bottomNav/Tasks.tsx` or a shared shell if moved global

### Tasks

1. Replace menu item click handlers with real actions or modal launches.
2. Decide whether the accessibility button remains Tasks-only or becomes app-wide.
3. If app-wide, move the button mount out of `Tasks.tsx` and into a shared shell.
4. Close the radial menu before launching any nested modal or action.
5. Add disabled or fallback states for unsupported features.

### Acceptance Criteria

- No menu item logs to console as its only behavior.
- Every menu item either:
  - opens a real modal
  - toggles a real store-backed setting
  - launches a capability-gated action with clear feedback
- Menu interactions work on mobile and desktop.

## Wave 4: Display & Text Size Modal

### Goals

Implement the highest-value accessibility surface first.

### Files

New:
- `src/components/accessibility/AccessibilityDisplayModal.tsx`

Update:
- `src/components/AccessibilityButton.tsx`
- `src/index.css`

### Tasks

1. Build `AccessibilityDisplayModal.tsx` using `AccessibleModal`.
2. Include controls for:
   - `textSize`
   - `uiZoom`
   - `highContrast`
   - `reduceMotion`
3. Add a live preview panel inside the modal.
4. Add root CSS variables/selectors for text scaling and UI zoom.
5. Wire the `Display & Text Size` radial action to open this modal.

### Acceptance Criteria

- The modal is fully keyboard accessible.
- The modal layout works on narrow mobile screens.
- Changing values updates the live preview immediately.
- Closing and reopening the modal preserves user choices.
- Text size and zoom changes visibly affect the app shell.

## Wave 5: Global Visual Accessibility Application

### Goals

Make zoom, text size, contrast, and motion settings actually affect the UI.

### Files

Update:
- `src/index.css`
- `src/components/accessibility/AccessibilityController.tsx`

Targeted audit candidates:
- `src/components/BottomNav.tsx`
- `src/components/AccessibilityButton.tsx`
- `src/pages/Social.tsx`
- modal-heavy screens using `AccessibleModal`

### Tasks

1. Add CSS variable strategy for text and spacing scale.
2. Add high-contrast root class/selectors.
3. Add reduced-motion root class/selectors that complement `useReducedMotion`.
4. Audit fixed/floating UI against new scaling.
5. Reduce animation intensity when `reduceMotion` is enabled.

### Acceptance Criteria

- Bottom nav, floating buttons, and modal layouts remain usable at large text/zoom settings.
- High contrast improves readability of text, borders, and focus states.
- Reduced motion disables or tones down decorative animations where expected.
- No severe clipping or overlap appears at largest supported scale.

## Wave 6: VoiceOver as Screen Reader Mode

### Goals

Implement real in-app screen-reader support instead of pretending to toggle OS VoiceOver.

### Files

New:
- `src/components/accessibility/AccessibilityLiveRegion.tsx`
- `src/hooks/useAccessibilityAnnouncements.ts`

Update:
- `src/components/AccessibilityButton.tsx`
- selected interactive components over time

### Tasks

1. Add a reusable live region announcer.
2. Add a helper hook for triggering announcements.
3. Enable stronger hints and announcements when `screenReaderMode` is on.
4. Improve ARIA labels and focus semantics for:
   - accessibility menu
   - accessibility modal
   - critical interactive surfaces
5. Rename internal behavior to “screen reader mode” even if menu label remains `VoiceOver`.

### Acceptance Criteria

- Enabling this mode changes real accessibility behavior inside the app.
- Dynamic updates can be announced through a shared live region.
- Focus is trapped and restored correctly in accessibility modals.
- Screen reader mode does not break pointer or touch interactions.

## Wave 7: Haptics and Accessibility Shortcuts

### Goals

Implement device feedback and preset accessibility profiles.

### Files

New:
- `src/lib/accessibility/haptics.ts`
- `src/lib/accessibility/shortcutProfiles.ts`

Update:
- `src/components/AccessibilityButton.tsx`
- `src/pages/sideNav/Settings.tsx`

### Tasks

1. Add a capability-gated haptics helper using:
   - browser vibration where available
   - future native path when added
2. Trigger haptics only when enabled in store.
3. Define preset shortcut profiles:
   - `reading`
   - `low-motion`
   - `high-contrast`
4. Wire `Accessibility Shortcuts` menu action to:
   - open a small picker, or
   - apply a default profile with confirmation

### Acceptance Criteria

- Unsupported devices do not throw errors when haptics are triggered.
- Shortcut profiles apply multiple store settings consistently.
- Applying a profile is reversible from Settings or the display modal.
- Shortcut behavior is clear and not mistaken for OS-level accessibility shortcuts.

## Wave 8: Siri as Voice Commands

### Goals

Provide an honest app-owned voice command feature instead of fake Siri integration.

### Files

New:
- `src/lib/accessibility/speechRecognition.ts`
- `src/components/accessibility/VoiceCommandsController.tsx`

Update:
- `src/components/AccessibilityButton.tsx`

### Tasks

1. Detect browser speech recognition support.
2. Add a small controller for starting/stopping a voice command session.
3. Support a minimal command set:
   - open today
   - open tasks
   - open categories
   - open social
   - open timer
4. If unsupported, show a clear fallback message.
5. Keep the UI copy honest if actual Siri/native assistant integration is not present.

### Acceptance Criteria

- Supported browsers can start a voice command session.
- Unsupported browsers show a clear non-broken fallback state.
- Commands only trigger whitelisted app navigation or safe actions.
- No voice feature blocks the rest of the accessibility menu.

## Wave 9: Magnifier

### Goals

Implement an app-owned magnification aid only if the product wants real in-app magnification.

### Files

New:
- `src/components/accessibility/MagnifierOverlay.tsx`
- `src/components/accessibility/MagnifyTarget.tsx`

Update:
- selected content-heavy components after initial rollout

### Tasks

1. Decide whether magnifier is:
   - a real in-app overlay, or
   - a system-help/handoff action
2. If implemented:
   - add `MagnifyTarget` wrapper
   - add tap-to-expand reading overlay
   - scope v1 to text-heavy surfaces only

### Acceptance Criteria

- If implemented as a feature, magnifier produces a real enlarged reading experience.
- If not implemented as a feature, the UI clearly communicates that it opens help/system guidance instead.
- No dead menu item remains.

## Wave 10: Testing and Validation

### Goals

Prevent regressions and confirm that mobile behavior is first-class.

### Files

New:
- `src/components/accessibility/__tests__/useAccessibilityStore.test.ts`
- `src/components/accessibility/__tests__/AccessibilityDisplayModal.test.tsx`
- `src/components/accessibility/__tests__/AccessibilityButton.test.tsx`
- `src/components/accessibility/__tests__/AccessibilityController.test.tsx`

Possible additions:
- integration tests for scaling and settings persistence

### Tasks

1. Add store persistence tests.
2. Add modal accessibility tests.
3. Add menu interaction tests.
4. Add capability fallback tests.
5. Add regression tests for:
   - mobile drag behavior
   - modal open/close behavior
   - persisted settings reload

### Acceptance Criteria

- Shared accessibility state is test-covered.
- Menu actions are test-covered for both supported and unsupported paths.
- Display modal is keyboard accessible in tests.
- No critical regression to existing floating button behavior.

## Delivery Order

Recommended sequence:
1. Wave 1
2. Wave 2
3. Wave 3
4. Wave 4
5. Wave 5
6. Wave 6
7. Wave 7
8. Wave 8
9. Wave 9
10. Wave 10

## Definition of Done

This feature set is done when:
- all 6 non-settings menu items have real behavior
- all shared accessibility preferences live in one persisted store
- Settings page and accessibility menu are unified
- visual accessibility settings visibly affect the app
- unsupported OS-level features have clear fallback behavior
- mobile usage is validated as a first-class path
- automated tests cover the new shared infrastructure
