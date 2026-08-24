# Timer Hooks Architecture

This directory contains the timer hooks that power the three timer modes: Countdown, Stopwatch, and Intervals.

## 🏗️ Architecture Overview

All timer hooks are built on a shared foundation: **`useBaseTimer`**

```
useBaseTimer (shared base)
    ↓
    ├── useCountdown  (duration-based timer)
    ├── useStopwatch  (elapsed time tracker)
    └── useIntervals  (work/break cycles)
```

## 📚 Core Hooks

### useBaseTimer
**File:** `useBaseTimer.ts`  
**Purpose:** Shared timer state and methods

**Provides:**
- Common state: `isActive`, `isPaused`, `timerStartTime`, `pausedElapsed`
- Shared methods: `pauseTimer()`, `continueTimer()`, `killTimer()`
- Settings integration
- Mode-specific hooks for customization

**Usage:**
```typescript
const baseTimer = useBaseTimer({ 
  mode: 'Countdown',
  onPause: () => { /* custom pause logic */ }
})
```

### useCountdown
**File:** `useCountdown.ts`  
**Purpose:** Countdown timer with duration tracking

**Features:**
- Set hours, minutes, seconds
- Auto-stop when time reaches zero
- Completion callbacks
- Auto-save to history
- Time presets

**API:**
```typescript
const countdown = useCountdown({ 
  onSessionComplete: (duration) => { /* save to history */ },
  onTimerComplete: () => { /* show completion modal */ }
})
```

### useStopwatch
**File:** `useStopwatch.ts`  
**Purpose:** Elapsed time tracker with lap support

**Features:**
- Count up from zero
- Lap tracking with splits
- No time limit
- Persistence support

**API:**
```typescript
const stopwatch = useStopwatch()
stopwatch.startTimer()
stopwatch.addLap()
```

### useIntervals
**File:** `useIntervals.ts`  
**Purpose:** Work/break interval timer

**Features:**
- Configurable work and break durations
- Loop counting with optional target
- Session naming
- Auto-switch between work/break
- Completion callbacks

**API:**
```typescript
const intervals = useIntervals({
  onSessionComplete: (duration, count, name, target) => { /* save session */ }
})
intervals.startTimer('Focus Session', 4) // 4 loops
```

## 🔧 Supporting Hooks

### useTimerSettings
**File:** `useTimerSettings.ts`  
**Purpose:** Timer configuration and preferences

**Settings:**
- Sound enabled/volume
- Vibration enabled
- Notifications enabled
- Auto-start after break
- Keyboard shortcuts enabled

### useTimerHistory
**File:** `useTimerHistory.ts`  
**Purpose:** Timer session history tracking

**Features:**
- Save completed sessions
- Load history with filtering
- Delete records
- Clear all history
- Validation (min duration 1 second)

### useTimerPersistence
**File:** `useTimerPersistence.ts`  
**Purpose:** Save/restore timer state across page reloads

**Features:**
- Auto-save timer state to localStorage
- Restore on mount
- Clear on unmount
- Modal to resume interrupted timers

### useTimerFocus
**File:** `useTimerFocus.ts`  
**Purpose:** Manage timer focus context

**Features:**
- Track which timer mode is active
- Prevent multiple timers running
- Route-based focus management

### useCustomPresets
**File:** `useCustomPresets.ts`  
**Purpose:** Manage custom countdown presets

**Features:**
- Add custom time presets
- Edit existing presets
- Delete presets
- LocalStorage persistence

### useCustomIntervalPresets
**File:** `useCustomIntervalPresets.ts`  
**Purpose:** Manage custom interval presets

**Features:**
- Save work/break combinations
- Named presets
- Edit and delete
- LocalStorage persistence

### useTimerSound
**File:** `useTimerSound.ts`  
**Purpose:** Sound effects for timer events

**Features:**
- Play completion sounds
- Volume control
- Muted state management

### useKeyboardShortcuts
**File:** `useKeyboardShortcuts.ts`  
**Purpose:** Keyboard controls for timer

**Shortcuts:**
- `Space`: Play/Pause
- `K`: Kill timer
- `R`: Reset
- `L`: Add lap (stopwatch)
- `?`: Show help

## 🧪 Testing

All hooks have comprehensive test coverage in `__tests__/hooks/`:

```
useCountdown.test.ts      44 tests ✓
useStopwatch.test.ts      20 tests ✓
useIntervals.test.ts      49 tests ✓
useTimerHistory.test.ts   21 tests ✓
useKeyboardShortcuts.test.ts  38 tests ✓
useTimerSound.test.ts      2 tests ✓
```

## 🔄 State Flow

### Timer Lifecycle

```
[Idle] ──start()──> [Active]
                       │
                       ├──pause()──> [Paused]
                       │                │
                       │                └──continue()──> [Active]
                       │
                       ├──killTimer()──> [Idle]
                       │
                       └──onComplete──> [Completed] ──> [Idle]
```

### Shared State Management

```typescript
// Base timer manages common state
useBaseTimer {
  isActive: boolean         // Timer is running
  isPaused: boolean         // Timer is paused
  timerStartTime: number    // Wall-clock start time
  pausedElapsed: number     // Time elapsed before pause
}

// Each mode adds specific state
useCountdown {
  ...baseTimer
  timeLeft: number          // Remaining time
  totalDuration: number     // Original duration
  selectedHours/Minutes/Seconds
}

useStopwatch {
  ...baseTimer
  timeLeft: number          // Elapsed time
  laps: Lap[]               // Lap records
}

useIntervals {
  ...baseTimer
  timeLeft: number          // Current interval remaining
  currentInterval: 'work' | 'break'
  intervalCount: number     // Completed intervals
  workMinutes: number
  breakMinutes: number
}
```

## 📦 Dependencies

```
useBaseTimer
└── useTimerSettings
    └── useLocalStorage

useCountdown
└── useBaseTimer

useStopwatch
└── useBaseTimer

useIntervals
└── useBaseTimer

useTimerPersistence
└── useCountdown | useStopwatch | useIntervals

useTimerHistory
└── useLocalStorage
```

## 🎯 Best Practices

### When to use which hook?

**Use `useCountdown`** when:
- You need a timer that counts down to zero
- You want to set a specific duration
- Example: Focus session, cooking timer, workout sets

**Use `useStopwatch`** when:
- You need to track elapsed time
- No specific end time required
- You want lap tracking
- Example: Running splits, task duration tracking

**Use `useIntervals`** when:
- You need alternating work/break periods
- You want to track multiple cycles
- Example: Pomodoro technique, HIIT workouts, study sessions

### Adding a new timer mode

```typescript
// 1. Create new hook using base timer
export const useMyTimer = () => {
  const baseTimer = useBaseTimer({ 
    mode: 'MyTimer',
    onPause: () => { /* custom pause logic */ },
    onResume: () => { /* custom resume logic */ }
  })
  
  // 2. Add mode-specific state
  const [mySpecificState, setMySpecificState] = useState(...)
  
  // 3. Implement mode-specific methods
  const mySpecificMethod = useCallback(() => {
    // Use baseTimer state and methods
    if (baseTimer.isActive) {
      // ...
    }
  }, [baseTimer])
  
  // 4. Return combined API
  return {
    ...baseTimer,
    mySpecificState,
    mySpecificMethod
  }
}
```

## 🐛 Common Issues & Solutions

### Issue: Timer loses accuracy over time
**Solution:** Use `getCurrentTime()` from `useBaseTimer` for wall-clock timing instead of incrementing counters.

### Issue: Timer state lost on page reload
**Solution:** Use `useTimerPersistence` to auto-save/restore state.

### Issue: Multiple timers running simultaneously
**Solution:** Use `useTimerFocus` to manage timer exclusivity.

### Issue: Tests failing with fake timers
**Solution:** `getCurrentTime()` helper automatically detects and uses vitest's fake timers.

## 📖 Further Reading

- [Timer Refactoring Summary](../../../TIMER_MD/TIMER_REFACTORING_SUMMARY.md) - Complete architecture documentation
- [Timer Analysis](../../../TIMER_MD/TIMER_REFACTORING_ANALYSIS.md) - Original refactoring analysis
- [Error Handling](../../../TIMER_MD/ERROR_HANDLING_IMPLEMENTATION.md) - Error handling patterns
- [Testing Guide](../../../TIMER_MD/TEST_IMPLEMENTATION_COMPLETE.md) - Comprehensive test documentation

---

**Last Updated:** December 25, 2024  
**Version:** 2.0 (Post-refactoring)
