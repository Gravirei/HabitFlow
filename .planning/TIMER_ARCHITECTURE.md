# Timer Module - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Timer Module                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Entry Points                                  │   │
│  │  /timer → Timer.tsx → TimerContainer                                │   │
│  │  /timer/premium-history → PremiumHistory.tsx                        │   │
│  │  /timer/analytics → Analytics.tsx                                   │   │
│  │  /timer/achievements → Achievements.tsx                             │   │
│  │  /timer/goals → Goals.tsx                                           │   │
│  │  /timer/ai-insights → AIInsights.tsx                                │   │
│  │  /timer/timeline → Timeline.tsx                                     │   │
│  │  /timer/export → Export.tsx                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      TimerContainer                                  │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ TimerFocusProvider (Context)                                 │   │   │
│  │  │  ┌───────────────────────────────────────────────────────┐  │   │   │
│  │  │  │ Mode Selector: [Stopwatch] [Countdown] [Intervals]    │  │   │   │
│  │  │  └───────────────────────────────────────────────────────┘  │   │   │
│  │  │                          │                                   │   │   │
│  │  │          ┌───────────────┼───────────────┐                  │   │   │
│  │  │          ▼               ▼               ▼                  │   │   │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │   │   │
│  │  │  │ Stopwatch   │ │ Countdown   │ │ Intervals   │           │   │   │
│  │  │  │ Timer       │ │ Timer       │ │ Timer       │           │   │   │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘           │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Architecture Pattern

**Component-Based Architecture** with:
- **Container/Presentation Pattern** - TimerContainer orchestrates modes
- **Custom Hooks Pattern** - Logic extracted to reusable hooks
- **Composition Pattern** - Shared components composed into modes
- **Context Pattern** - Timer focus state shared across components
- **Error Boundary Pattern** - Isolated error handling per mode

## Core Architecture: Hook Hierarchy

```
useBaseTimer (shared foundation)
    │
    ├── useCountdown (duration-based timer)
    │   ├── Time selection (hours, minutes, seconds)
    │   ├── Progress tracking
    │   ├── Auto-save on completion
    │   └── Preset support
    │
    ├── useStopwatch (elapsed time tracker)
    │   ├── Count-up timing
    │   ├── Lap tracking with splits
    │   └── No time limit
    │
    └── useIntervals (work/break cycles)
        ├── Work/break alternation
        ├── Loop counting
        ├── Session naming
        └── Target loop support
```

## Data Flow

### Timer State Flow
```
User Action
    │
    ▼
Timer Hook (useCountdown/useStopwatch/useIntervals)
    │
    ├─── useBaseTimer (shared state management)
    │       ├── isActive, isPaused
    │       ├── timerStartTime
    │       └── pausedElapsed
    │
    ├─── useTimerSettings (preferences)
    │       └── Sound, vibration, notifications
    │
    ├─── useTimerPersistence (browser refresh survival)
    │       └── localStorage save/restore
    │
    └─── useTimerHistory (session records)
            └── localStorage per mode
    │
    ▼
Component Re-render → UI Update
```

### Session History Flow
```
Timer Completion
    │
    ▼
useTimerHistory.addRecord()
    │
    ▼
localStorage (timer-{mode}-history)
    │
    ▼
PremiumHistory Page
    │
    ├── Filter/Sort/Search
    ├── Export (CSV/JSON/PDF)
    ├── Archive
    └── Cloud Sync (Supabase)
```

## State Management Architecture

### Zustand Stores (Persisted)
```
┌─────────────────────────────────────────────────────────────────┐
│                       Zustand Stores                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  achievementsStore ──► timer-sidebar-achievements                │
│  goalsStore ────────► timer-sidebar-goals                        │
│  themeStore ────────► timer-theme-settings                       │
│  syncStore ─────────► timer-cloud-sync                           │
│  archiveStore ──────► timer-premium-history-archive              │
│  tagStore ──────────► timer-premium-history-tags                 │
│  templateStore ─────► timer-premium-history-templates            │
│  notificationStore ─► timer-premium-history-notifications        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### React Context
```
TimerFocusContext
├── isTimerActive: boolean
├── activeTimer: TimerMode | null
├── focusTimer(mode): void
└── unfocusTimer(): void
```

### localStorage Keys
```
Timer State:
├── flowmodoro_timer_state      - Active timer state for resume
├── flowmodoro_active_timer     - Currently active timer mode
└── flowmodoro_repeat_session   - Repeat session configuration

History (per mode):
├── timer-stopwatch-history
├── timer-countdown-history
└── timer-intervals-history

Settings:
├── timer-settings              - User preferences
├── timer-custom-presets        - Custom countdown presets
└── timer-custom-interval-presets - Custom interval presets
```

## Component Architecture

### Timer Modes (src/components/timer/modes/)
```
StopwatchTimer.tsx
├── useStopwatch hook
├── TimerDisplay
├── AnimatedTimerButton
├── Lap list display
└── History modal

CountdownTimer.tsx
├── useCountdown hook
├── WheelPicker (time selection)
├── TimerDisplay
├── TimerPresets
├── AnimatedTimerButton
└── Completion modal

IntervalsTimer.tsx
├── useIntervals hook
├── IntervalPresets
├── SessionSetupModal
├── TimerDisplay (with interval status)
├── AnimatedTimerButton
└── Work/Break indicator
```

### Shared Components (src/components/timer/shared/)
```
TimerDisplay.tsx        - Circular progress with time
AnimatedTimerButton.tsx - Play/pause/stop controls
WheelPicker.tsx         - iOS-style time selector
TimerPresets.tsx        - Preset buttons (countdown)
IntervalPresets.tsx     - Preset buttons (intervals)
TimerTopNav.tsx         - Navigation header
HistoryModal.tsx        - Quick history view
TimerErrorBoundary.tsx  - Error isolation
TimerAnnouncer.tsx      - Screen reader announcements
KeyboardHelpModal.tsx   - Keyboard shortcuts help
ResumeTimerModal.tsx    - Resume after refresh
```

## Premium Features Architecture

### Premium History (src/components/timer/premium-history/)
```
PremiumHistoryLayout
├── PremiumHistoryHeader
├── FilterBar
│   ├── ModeFilter
│   ├── DateRangePicker
│   ├── AdvancedFilters
│   └── ClearFiltersButton
├── SessionGroup
│   └── SessionCard (Countdown/Stopwatch/Intervals variants)
├── Modals
│   ├── SessionDetailsModal
│   ├── ClearHistoryModal
│   ├── ExportModal
│   ├── ArchiveModal
│   ├── CalendarViewModal
│   ├── CompareSessionsModal
│   ├── SmartReportsModal
│   ├── CustomTagsModal
│   ├── SessionTemplatesModal
│   ├── TeamSharingModal
│   ├── CloudSyncModal
│   └── NotificationSettingsModal
└── VirtualizedSessionList (performance)
```

### Sidebar Features (src/components/timer/sidebar/)
```
achievements/
├── AchievementsPanel
├── AchievementCard
├── AchievementNotifications
├── achievementsStore (Zustand)
└── achievementTracking

ai-insights/
├── AIInsightsModal
├── aiInsightsEngine
├── InsightCard
├── ProductivityScoreCard
├── RecommendationsList
└── WeeklySummaryCard

analytics/
├── AnalyticsDashboard
├── ProductivityHeatmap
├── SessionDistributionChart
├── StatisticsCards
└── TimeSeriesChart

goals/
├── GoalsDashboard
├── GoalCard
├── CreateGoalModal
├── goalsStore (Zustand)
└── goalTracking

timeline/
├── TimelineView
├── TimelineDay
├── TimelineSession
└── TimelineControls
```

## Error Handling Architecture

```
App Level
└── TimerErrorBoundary (src/pages/bottomNav/Timer.tsx)
    └── TimerContainer
        └── TimerErrorBoundary (per mode)
            ├── StopwatchTimer
            ├── CountdownTimer
            └── IntervalsTimer
```

**Error Recovery Options:**
1. Reset Timer - Clears corrupted state
2. Reload Page - Full refresh
3. Go to Home - Navigate away

**Error Logging:**
- Console logging (development)
- Sentry integration (production)
- Structured error categories (SOUND, VIBRATION, NOTIFICATION, STORAGE, etc.)

## Security Considerations

### Input Validation (timerPersistence.ts)
- XSS prevention via string sanitization
- Number range validation
- Timestamp validation (2000-2100 range)
- Timer mode whitelist validation
- Maximum safe values enforced:
  - MAX_SAFE_DURATION: 24 hours
  - MAX_SAFE_LOOP_COUNT: 1000
  - MAX_SAFE_LAP_COUNT: 10000
  - MAX_STRING_LENGTH: 500 characters

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| useBaseTimer hook | Eliminates ~200 lines of duplicate code across timer modes |
| Zustand for global state | Simpler than Redux, built-in persistence middleware |
| localStorage for history | Works offline, no backend required for basic features |
| Supabase for cloud sync | Real-time sync, authentication integration |
| Error boundaries per mode | Isolates failures, prevents full app crashes |
| Wall-clock timing | Prevents drift, accurate even with tab backgrounding |
| Virtualized lists | Performance for large history lists |
