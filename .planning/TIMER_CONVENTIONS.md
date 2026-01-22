# Timer Module - Code Conventions

## TypeScript

### Strict Mode
- TypeScript strict mode is enabled
- No implicit `any` types
- Explicit return types on exported functions

### Types vs Interfaces
```typescript
// Interfaces for component props and object shapes
interface TimerDisplayProps {
  timeLeft: number
  progress: number
  mode: TimerMode
}

// Types for unions, primitives, and utility types
type TimerMode = 'Stopwatch' | 'Countdown' | 'Intervals'
type IntervalType = 'work' | 'break'
```

### Type Organization
- All shared types in `types/timer.types.ts`
- Feature-specific types co-located in feature directories
- Export types from barrel files

## React Patterns

### Functional Components Only
```typescript
// ✅ Correct
export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, progress }) => {
  // ...
}

// ✅ Also correct (preferred for simple components)
export function TimerDisplay({ timeLeft, progress }: TimerDisplayProps) {
  // ...
}

// ❌ No class components (except ErrorBoundary)
```

### Hook Patterns
```typescript
// Custom hooks return objects with named properties
export const useCountdown = (options?: UseCountdownOptions): UseCountdownReturn => {
  // State
  const [timeLeft, setTimeLeft] = useState(0)
  
  // Refs for non-reactive values
  const hasCompletedRef = useRef(false)
  
  // Memoized callbacks
  const startTimer = useCallback(() => {
    // ...
  }, [dependencies])
  
  // Effects with cleanup
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    // ...
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [dependencies])
  
  return { timeLeft, startTimer, /* ... */ }
}
```

### Component Composition
```typescript
// Parent orchestrates, children are focused
<TimerContainer>
  <TimerTopNav />
  <ModeSelector mode={mode} onModeChange={setMode} />
  <TimerErrorBoundary>
    {mode === 'Countdown' && <CountdownTimer />}
    {mode === 'Stopwatch' && <StopwatchTimer />}
    {mode === 'Intervals' && <IntervalsTimer />}
  </TimerErrorBoundary>
</TimerContainer>
```

### Context Usage
```typescript
// Provider wraps consumers
<TimerFocusProvider>
  <TimerContent />
</TimerFocusProvider>

// Consumer hook with safety check
export const useTimerFocus = () => {
  const context = useContext(TimerFocusContext)
  if (!context) {
    throw new Error('useTimerFocus must be used within TimerFocusProvider')
  }
  return context
}
```

## State Management

### Zustand Store Pattern
```typescript
// Store with persist middleware
export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      // State
      achievements: [],
      
      // Actions (defined in store)
      initializeAchievements: () => {
        // ...
        set({ achievements: initialAchievements })
      },
      
      // Selectors (using get())
      getUnlockedAchievements: () => {
        return get().achievements.filter((a) => a.unlocked)
      },
    }),
    {
      name: 'timer-sidebar-achievements', // localStorage key
      version: 1, // For migrations
    }
  )
)
```

### localStorage Keys
```typescript
// Consistent naming pattern: {app}_{feature}_{subfeature}
const STORAGE_KEY = 'flowmodoro_timer_state'
const ACTIVE_TIMER_KEY = 'flowmodoro_active_timer'

// For Zustand stores: {feature}-{subfeature}
name: 'timer-sidebar-achievements'
name: 'timer-theme-settings'
```

## Naming Conventions

### Variables & Functions
```typescript
// camelCase for variables and functions
const timeLeft = 300
const isActive = true
const handleStart = () => {}

// UPPER_SNAKE_CASE for constants
const MAX_SAFE_DURATION = 24 * 60 * 60 * 1000
const MS_PER_SECOND = 1000
```

### Components
```typescript
// PascalCase for components
export function TimerContainer() {}
export const CountdownTimer: React.FC = () => {}

// Props interfaces match component name
interface TimerContainerProps {}
interface CountdownTimerProps {}
```

### Hooks
```typescript
// useX naming pattern
export const useCountdown = () => {}
export const useTimerSettings = () => {}
export const useBaseTimer = () => {}

// Return type interfaces: UseXReturn
interface UseCountdownReturn {}
interface UseTimerSettingsReturn {}
```

### Files & Directories
```typescript
// Components: PascalCase.tsx
TimerDisplay.tsx
CountdownTimer.tsx

// Hooks: camelCase with use prefix
useCountdown.ts
useTimerSettings.ts

// Utils: camelCase
soundManager.ts
timerPersistence.ts

// Stores: camelCase with Store suffix
achievementsStore.ts
goalsStore.ts

// Types: camelCase.types.ts
timer.types.ts
session.types.ts

// Constants: camelCase.constants.ts
timer.constants.ts
performance.constants.ts

// Tests: match source with .test suffix
useCountdown.test.ts
TimerDisplay.test.tsx
```

## Error Handling

### Error Boundary Pattern
```typescript
// Wrap risky components
<TimerErrorBoundary
  key={mode} // Reset on mode change
  onError={(error, errorInfo) => {
    console.error(`Error in ${mode} timer:`, error)
  }}
>
  {timerComponent}
</TimerErrorBoundary>
```

### Try-Catch in Async Operations
```typescript
try {
  await tieredStorage.syncToCloud()
} catch (error: any) {
  console.error('[SyncStore] Sync failed:', error)
  set((state) => ({
    syncStatus: {
      ...state.syncStatus,
      syncError: error?.message || 'Sync failed',
    },
  }))
}
```

### Structured Error Logging
```typescript
import { logError, ErrorCategory, ErrorSeverity } from '../utils/errorMessages'

try {
  soundManager.playSound(settings.soundType)
} catch (error) {
  logError(
    error,
    'Failed to play sound',
    { soundType: settings.soundType },
    ErrorCategory.SOUND,
    ErrorSeverity.LOW
  )
}
```

## Styling

### TailwindCSS Classes
```typescript
// Inline classes for simple styling
<div className="flex items-center gap-4 p-4">

// Template literals for conditional classes
<button className={`
  rounded-full px-4 py-2 font-bold
  ${isActive ? 'text-primary' : 'text-white/50'}
  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
`}>

// clsx/tailwind-merge for complex conditions
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const cn = (...inputs) => twMerge(clsx(inputs))

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-classes'
)}>
```

### Constant Classes
```typescript
// Reusable class strings in constants
export const TIMER_CLASSES = {
  button: {
    primary: 'flex h-24 w-24 cursor-pointer items-center justify-center rounded-full bg-primary...',
    secondary: 'flex h-16 w-16 cursor-pointer items-center...',
  },
  timerRing: {
    container: 'flex flex-grow items-center justify-center px-4 py-8',
    // ...
  }
}
```

## Animation

### Framer Motion Patterns
```typescript
import { motion, AnimatePresence } from 'framer-motion'

// Basic animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>

// AnimatePresence for exit animations
<AnimatePresence mode="popLayout">
  {items.map((item) => (
    <motion.div key={item.id} exit={{ opacity: 0 }}>
      {item.content}
    </motion.div>
  ))}
</AnimatePresence>

// Layout animations
<motion.button layout>
```

## Accessibility

### ARIA Attributes
```typescript
<button
  role="tab"
  aria-selected={isActive}
  aria-controls={`${mode.toLowerCase()}-panel`}
  aria-label={`${mode} timer mode`}
  tabIndex={isActive ? 0 : -1}
>

<div
  role="tabpanel"
  aria-labelledby={`${mode.toLowerCase()}-tab`}
>
```

### Screen Reader Announcements
```typescript
// Use TimerAnnouncer for dynamic content
<TimerAnnouncer message={`Timer started: ${formatTime(duration)}`} />

// Live regions for status updates
<div role="status" aria-live="polite" className="sr-only">
  {announcement}
</div>
```

### Keyboard Navigation
```typescript
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleAction()
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    handleNext()
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    handlePrevious()
  }
}
```

## Testing

### Test File Location
```
// Co-located in __tests__ directories
src/components/timer/__tests__/hooks/useCountdown.test.ts
src/components/timer/__tests__/components/TimerDisplay.test.tsx
```

### Test Structure
```typescript
describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should start countdown from selected time', () => {
    const { result } = renderHook(() => useCountdown())
    // ...
  })

  describe('when timer completes', () => {
    it('should trigger completion callback', () => {
      // ...
    })
  })
})
```

### Mock Patterns
```typescript
// Mock browser APIs
vi.mock('../utils/soundManager', () => ({
  soundManager: {
    playSound: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
```

## Documentation

### JSDoc Comments
```typescript
/**
 * Timer Persistence Utility
 * 
 * Handles saving and restoring timer state to/from localStorage.
 * Allows users to resume timers after browser refresh.
 * 
 * @module timerPersistence
 */

/**
 * Sanitizes a string to prevent XSS attacks
 * @param input - The input to sanitize
 * @returns Sanitized string
 */
function sanitizeString(input: unknown): string {
  // ...
}
```

### Component Documentation
```typescript
/**
 * TimerContainer Component
 * Main container that orchestrates all timer modes
 * 
 * CRITICAL FIX: Added error boundaries around timer mode components
 * to prevent crashes from propagating to the entire app.
 */
```

### README Files
- `hooks/README.md` - Hook architecture documentation
- Feature directories include implementation notes
