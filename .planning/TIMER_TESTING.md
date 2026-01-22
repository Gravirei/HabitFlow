# Timer Module - Testing Strategy

## Test Framework

- **Test Runner**: Vitest
- **Component Testing**: React Testing Library
- **User Interactions**: @testing-library/user-event
- **Accessibility Testing**: @axe-core/react
- **Fake Timers**: Vitest's `vi.useFakeTimers()`

## Test Organization

```
src/components/timer/__tests__/
├── TimerContainer.test.tsx      # Main container tests
├── hooks/                       # Hook unit tests
├── components/                  # Component unit tests
├── utils/                       # Utility function tests
├── integration/                 # Integration tests
├── accessibility/               # A11y audit tests
├── error/                       # Error handling tests
├── edge-cases/                  # Edge case tests
├── performance/                 # Performance benchmarks
└── constants/                   # Constants validation
```

## Current Test Coverage

### Hook Tests (174+ tests)

| Hook | Tests | Coverage |
|------|-------|----------|
| `useCountdown` | 44 | ✅ Comprehensive |
| `useIntervals` | 49 | ✅ Comprehensive |
| `useKeyboardShortcuts` | 38 | ✅ Comprehensive |
| `useTimerHistory` | 21 | ✅ Good |
| `useStopwatch` | 20 | ✅ Good |
| `useTimerSound` | 2 | ⚠️ Basic |

### Component Tests

| Component | Status |
|-----------|--------|
| `TimerDisplay` | ✅ Tested |
| `AnimatedTimerButton` | ✅ Tested |
| `WheelPicker` | ✅ Tested |
| `WheelPickerSound` | ✅ Tested |
| `TimerAnnouncer` | ✅ Tested |
| `TimerContainer` | ✅ Tested |

### Utility Tests

| Utility | Status |
|---------|--------|
| `soundManager` | ✅ Tested |
| `vibrationManager` | ✅ Tested |
| `notificationManager` | ✅ Tested |
| `timerPersistence` | ✅ Tested |
| `logger` | ✅ Tested |
| `validation` | ✅ Tested |
| `uuid` | ✅ Tested |
| `intervalStateMachine` | ✅ Tested |
| `intervalSwitchHandler` | ✅ Tested |
| `intervalCompletionHandler` | ✅ Tested |

### Integration Tests

| Test Suite | Focus |
|------------|-------|
| `timer-workflows.test.tsx` | Full timer workflows |
| `timer-persistence-integration.test.tsx` | State persistence |
| `logger-integration.test.ts` | Logging system |

### Accessibility Tests

| Test Suite | Focus |
|------------|-------|
| `axe-audit.test.tsx` | Automated a11y audit |
| `aria-labels.test.tsx` | ARIA attribute coverage |
| `timer-announcements.test.tsx` | Screen reader support |

### Error Handling Tests

| Test Suite | Focus |
|------------|-------|
| `TimerErrorBoundary.test.tsx` | Error boundary behavior |
| `error-recovery.test.tsx` | Recovery mechanisms |
| `error-scenarios.test.tsx` | Error conditions |
| `errorMessages.test.ts` | Error message handling |
| `hook-errors.test.ts` | Hook error handling |
| `storage-errors.test.ts` | Storage failure handling |
| `integration-errors.test.tsx` | Cross-component errors |

### Premium History Tests

```
premium-history/__tests__/sidebar/
├── Achievements.test.tsx
├── AIInsights.test.tsx
├── Archive.test.tsx
├── BasicIntegration.test.tsx
├── ExportData.test.tsx
├── FilterVisibility.test.tsx
├── GoalTracking.test.tsx
├── Notifications.test.tsx
├── SidebarIntegration.test.tsx
└── TimelineView.test.tsx
```

## Testing Patterns

### Hook Testing with Fake Timers

```typescript
import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should count down from selected time', async () => {
    const { result } = renderHook(() => useCountdown())
    
    // Set time
    act(() => {
      result.current.setSelectedMinutes(5)
    })
    
    // Start timer
    act(() => {
      result.current.startTimer()
    })
    
    // Advance time
    act(() => {
      vi.advanceTimersByTime(1000) // 1 second
    })
    
    // Verify countdown
    expect(result.current.timeLeft).toBeLessThan(5 * 60 * 1000)
  })
})
```

### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('TimerDisplay', () => {
  it('should display formatted time', () => {
    render(<TimerDisplay timeLeft={125000} progress={50} mode="Countdown" />)
    
    expect(screen.getByText('2:05')).toBeInTheDocument()
  })

  it('should show interval status when provided', () => {
    render(
      <TimerDisplay 
        timeLeft={60000} 
        progress={25} 
        mode="Intervals"
        currentInterval="work"
        intervalCount={2}
        showIntervalStatus
      />
    )
    
    expect(screen.getByText(/work/i)).toBeInTheDocument()
    expect(screen.getByText(/2/)).toBeInTheDocument()
  })
})
```

### Mocking Browser APIs

```typescript
// Mock Web Audio API
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    type: 'sine',
    frequency: { setValueAtTime: vi.fn() },
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
  })),
  destination: {},
  currentTime: 0,
}

vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext))

// Mock Vibration API
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
})

// Mock Notifications API
Object.defineProperty(window, 'Notification', {
  value: vi.fn().mockImplementation(() => ({
    close: vi.fn(),
  })),
  writable: true,
})
```

### Testing localStorage

```typescript
describe('timerPersistence', () => {
  const mockLocalStorage = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value }),
      removeItem: vi.fn((key: string) => { delete store[key] }),
      clear: vi.fn(() => { store = {} }),
    }
  })()

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })
    mockLocalStorage.clear()
  })

  it('should save timer state', () => {
    timerPersistence.saveState(mockState)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'flowmodoro_timer_state',
      expect.any(String)
    )
  })
})
```

### Accessibility Testing

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Timer Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<TimerContainer />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper ARIA labels', () => {
    render(<TimerContainer />)
    
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Timer modes')
    expect(screen.getByRole('tab', { name: /stopwatch/i })).toHaveAttribute('aria-selected')
  })
})
```

### Error Boundary Testing

```typescript
describe('TimerErrorBoundary', () => {
  const ThrowError = () => {
    throw new Error('Test error')
  }

  it('should catch errors and display fallback', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <TimerErrorBoundary>
        <ThrowError />
      </TimerErrorBoundary>
    )
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset timer/i })).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })

  it('should call onError callback', () => {
    const onError = vi.fn()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <TimerErrorBoundary onError={onError}>
        <ThrowError />
      </TimerErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
```

## Test Gaps & Recommendations

### High Priority Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| E2E tests | Critical user flows untested | Add Playwright/Cypress tests |
| Cloud sync tests | Supabase integration untested | Add integration tests with mocked Supabase |
| Premium History page | 679-line component with minimal tests | Add comprehensive component tests |
| Zustand stores | Store logic untested | Add store unit tests |

### Medium Priority Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| `useTimerSound` | Only 2 tests | Expand coverage for all sound types |
| Theme system | No tests | Add theme store and provider tests |
| AI Insights engine | Complex logic untested | Add unit tests for insight generation |
| Export utilities | PDF/CSV export untested | Add export function tests |

### Recommended E2E Test Scenarios

1. **Complete Timer Workflow**
   - Select countdown mode → Set time → Start → Pause → Resume → Complete
   - Verify history record created
   
2. **Timer Persistence**
   - Start timer → Refresh page → Verify resume modal → Resume timer
   
3. **Intervals Full Cycle**
   - Configure work/break → Start → Complete work → Auto-switch to break → Complete session
   
4. **Premium History**
   - Complete session → Navigate to history → Filter → Export

5. **Achievements**
   - Complete sessions → Verify achievement unlock → Check notifications

### Performance Test Coverage

```typescript
// benchmarks.test.ts
describe('Timer Performance', () => {
  it('should update display at 60fps', () => {
    const start = performance.now()
    // Render and measure
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(16.67) // 60fps threshold
  })

  it('should handle large history efficiently', () => {
    const largeHistory = Array.from({ length: 1000 }, generateMockSession)
    // Test rendering performance
  })
})
```

## Running Tests

```bash
# Run all timer tests
npm test src/components/timer

# Run specific test file
npm test src/components/timer/__tests__/hooks/useCountdown.test.ts

# Run with coverage
npm test -- --coverage src/components/timer

# Run accessibility tests only
npm test src/components/timer/__tests__/accessibility

# Watch mode
npm test -- --watch src/components/timer
```

## Test Configuration Notes

### Vitest Configuration for Timer Tests
- Fake timers configured per-test for timing control
- `getCurrentTime()` helper in `useBaseTimer` supports fake timers
- Browser APIs mocked in setup files

### Known Testing Challenges
1. **Animation testing** - Framer Motion animations require special handling
2. **Timer drift tests** - Need precise timing control
3. **Sound tests** - Web Audio API requires mocking
4. **Notification tests** - Permission API requires mocking
