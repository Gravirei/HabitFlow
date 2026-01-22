# Timer Module - Directory Structure

## Overview

```
src/
├── components/timer/           # Main timer components
├── pages/timer/                # Timer-related pages
└── pages/bottomNav/Timer.tsx   # Entry point
```

## Detailed Structure

### Core Timer (`src/components/timer/`)

```
src/components/timer/
├── index.ts                    # Barrel exports
├── TimerContainer.tsx          # Main orchestrator component
│
├── modes/                      # Timer mode components
│   ├── StopwatchTimer.tsx      # Elapsed time tracker
│   ├── CountdownTimer.tsx      # Duration-based timer
│   └── IntervalsTimer.tsx      # Work/break cycles
│
├── hooks/                      # Custom React hooks
│   ├── README.md               # Hook architecture docs
│   ├── useBaseTimer.ts         # Shared timer logic (foundation)
│   ├── useCountdown.ts         # Countdown-specific logic
│   ├── useStopwatch.ts         # Stopwatch-specific logic
│   ├── useIntervals.ts         # Intervals-specific logic
│   ├── useTimerSettings.ts     # User preferences
│   ├── useTimerHistory.ts      # Session history management
│   ├── useTimerPersistence.ts  # Browser refresh survival
│   ├── useTimerFocus.ts        # Timer focus context consumer
│   ├── useTimerSound.ts        # Sound effect management
│   ├── useCustomPresets.ts     # Custom countdown presets
│   ├── useCustomIntervalPresets.ts # Custom interval presets
│   ├── useKeyboardShortcuts.ts # Keyboard controls
│   ├── useAnimationFrame.ts    # RAF-based updates
│   ├── useBodyScrollLock.ts    # Prevent scroll during timer
│   └── useFocusTrap.ts         # Modal focus management
│
├── shared/                     # Shared UI components
│   ├── TimerDisplay.tsx        # Circular progress display
│   ├── AnimatedTimerButton.tsx # Play/pause/stop button
│   ├── WheelPicker.tsx         # iOS-style time picker
│   ├── TimerPresets.tsx        # Countdown preset buttons
│   ├── IntervalPresets.tsx     # Interval preset buttons
│   ├── TimerTopNav.tsx         # Header navigation
│   ├── TimerMenuSidebar.tsx    # Side menu
│   ├── HistoryModal.tsx        # Quick history view
│   ├── TimerCompletionModal.tsx # Session complete dialog
│   ├── ResumeTimerModal.tsx    # Resume after refresh
│   ├── SessionSetupModal.tsx   # Interval session config
│   ├── EditPresetModal.tsx     # Edit countdown presets
│   ├── EditIntervalPresetModal.tsx # Edit interval presets
│   ├── KeyboardHelpModal.tsx   # Shortcuts reference
│   ├── AccessibleModal.tsx     # Base accessible modal
│   ├── TimerAnnouncer.tsx      # Screen reader announcements
│   ├── TimerErrorBoundary.tsx  # Error isolation
│   └── SyncStatusIndicator.tsx # Cloud sync status
│
├── context/                    # React Context providers
│   └── TimerContext/
│       ├── index.ts            # Barrel exports
│       ├── TimerFocusContext.tsx # Context definition
│       ├── TimerFocusProvider.tsx # Provider component
│       └── types.ts            # Context types
│
├── settings/                   # Settings components
│   ├── index.ts
│   ├── TimerSettingsModal.tsx  # Main settings modal
│   ├── SoundSettings.tsx       # Sound preferences
│   ├── VibrationSettings.tsx   # Haptic preferences
│   ├── NotificationSettings.tsx # Notification preferences
│   ├── KeyboardSettings.tsx    # Shortcut preferences
│   ├── AutoStartSettings.tsx   # Auto-start options
│   ├── HistorySettings.tsx     # History preferences
│   ├── ResetSection.tsx        # Reset options
│   ├── SettingsHeader.tsx      # Modal header
│   ├── SettingsSection.tsx     # Section wrapper
│   ├── SliderControl.tsx       # Volume/value slider
│   ├── ToggleSwitch.tsx        # On/off toggle
│   └── ConfirmDialog.tsx       # Confirmation modal
│
├── themes/                     # Theme system
│   ├── index.ts
│   ├── ThemeProvider.tsx       # Theme context provider
│   ├── ThemesModal.tsx         # Theme selection UI
│   ├── themeStore.ts           # Zustand theme store
│   └── types.ts                # Theme type definitions
│
├── utils/                      # Utility functions
│   ├── soundManager.ts         # Web Audio API wrapper
│   ├── vibrationManager.ts     # Vibration API wrapper
│   ├── notificationManager.ts  # Notifications API wrapper
│   ├── timerPersistence.ts     # State save/restore
│   ├── storageIntegrity.ts     # Storage validation
│   ├── logger.ts               # Logging utility
│   ├── errorMessages.ts        # Error handling
│   ├── validation.ts           # Input validation
│   ├── uuid.ts                 # UUID generation
│   ├── intervalStateMachine.ts # Interval state logic
│   ├── intervalSwitchHandler.ts # Work/break transitions
│   └── intervalCompletionHandler.ts # Loop completion
│
├── constants/                  # Configuration constants
│   ├── timer.constants.ts      # Timer config, presets, classes
│   └── performance.constants.ts # Performance thresholds
│
├── types/                      # TypeScript definitions
│   └── timer.types.ts          # All timer types
│
└── styles/                     # CSS styles
    └── animations.css          # Timer animations
```

### Premium History (`src/components/timer/premium-history/`)

```
premium-history/
├── index.ts                    # Barrel exports
│
├── layout/                     # Layout components
│   ├── index.ts
│   ├── PremiumHistoryLayout.tsx # Main layout wrapper
│   ├── PremiumHistoryHeader.tsx # Page header
│   ├── PremiumHistorySidebar.tsx # Navigation sidebar
│   └── PremiumHistorySettingsSidebar.tsx # Settings panel
│
├── filters/                    # Filter components
│   ├── index.ts
│   ├── FilterBar.tsx           # Main filter bar
│   ├── ModeFilter.tsx          # Timer mode filter
│   ├── DateRangePicker.tsx     # Date range selection
│   ├── DateRangePickerModal.tsx # Date picker modal
│   ├── AdvancedFilters.tsx     # Advanced filter options
│   ├── AdvancedFiltersModal.tsx # Advanced filters modal
│   ├── FilterSettingsModal.tsx # Filter preferences
│   ├── ClearFiltersButton.tsx  # Reset filters
│   └── SettingsButton.tsx      # Settings access
│
├── cards/                      # Session card components
│   ├── index.ts
│   ├── SessionCard.tsx         # Base session card
│   ├── StopwatchCard.tsx       # Stopwatch session card
│   ├── CountdownCard.tsx       # Countdown session card
│   └── IntervalsCard.tsx       # Intervals session card
│
├── modals/                     # Modal dialogs
│   ├── index.ts
│   ├── SessionDetailsModal.tsx # Session details view
│   ├── ClearHistoryModal.tsx   # Clear history confirm
│   └── UpgradeModal.tsx        # Premium upsell
│
├── shared/                     # Shared components
│   ├── index.ts
│   ├── EmptyState.tsx          # No data state
│   ├── SessionGroup.tsx        # Grouped sessions
│   ├── VirtualizedSessionList.tsx # Performance list
│   ├── LiveRegionAnnouncer.tsx # A11y announcements
│   └── PremiumHistoryErrorBoundary.tsx # Error handling
│
├── export/                     # Export functionality
│   ├── index.ts
│   ├── ExportModal.tsx         # Export options modal
│   ├── ExportPanel.tsx         # Export UI
│   └── exportUtils.ts          # CSV/JSON/PDF export
│
├── archive/                    # Archive feature
│   ├── index.ts
│   ├── ArchiveModal.tsx        # Archive management
│   ├── ArchiveList.tsx         # Archived sessions
│   ├── archiveStore.ts         # Zustand store
│   └── archiveUtils.ts         # Archive helpers
│
├── notifications/              # Notification settings
│   ├── index.ts
│   ├── NotificationSettingsModal.tsx
│   ├── notificationService.ts
│   ├── notificationStore.ts
│   └── types.ts
│
├── cloud-sync/                 # Cloud synchronization
│   ├── index.ts
│   ├── CloudSyncModal.tsx      # Sync UI
│   ├── SyncOnAuthChange.tsx    # Auth-triggered sync
│   ├── syncStore.ts            # Zustand store
│   └── types.ts
│
├── calendar-view/              # Calendar visualization
│   ├── index.ts
│   ├── CalendarViewModal.tsx
│   ├── calendarUtils.ts
│   └── types.ts
│
├── compare-sessions/           # Session comparison
│   ├── index.ts
│   ├── CompareSessionsModal.tsx
│   ├── compareUtils.ts
│   └── types.ts
│
├── smart-reports/              # AI-powered reports
│   ├── index.ts
│   ├── SmartReportsModal.tsx
│   ├── reportUtils.ts
│   └── types.ts
│
├── session-templates/          # Session templates
│   ├── index.ts
│   ├── SessionTemplatesModal.tsx
│   ├── CreateTemplateModal.tsx
│   ├── templateStore.ts
│   └── types.ts
│
├── custom-tags/                # Custom tagging
│   ├── index.ts
│   ├── CustomTagsModal.tsx
│   ├── TagSelector.tsx
│   ├── tagStore.ts
│   └── types.ts
│
├── team-sharing/               # Team collaboration
│   ├── index.ts
│   ├── TeamSharingModal.tsx
│   ├── shareStore.ts
│   └── types.ts
│
├── hooks/                      # Premium history hooks
│   ├── index.ts
│   ├── useFilterPersistence.ts # Save filter state
│   └── useFilterVisibility.ts  # Filter UI state
│
└── types/                      # Type definitions
    └── session.types.ts        # Session types
```

### Sidebar Features (`src/components/timer/sidebar/`)

```
sidebar/
├── achievements/               # Achievement system
│   ├── index.ts
│   ├── AchievementsPanel.tsx   # Main achievements view
│   ├── AchievementCard.tsx     # Individual achievement
│   ├── AchievementToast.tsx    # Unlock notification
│   ├── AchievementNotifications.tsx # Notification handler
│   ├── AchievementProgressWidget.tsx # Progress indicator
│   ├── AchievementsModal.tsx   # Full achievements modal
│   ├── AchievementUnlockModal.tsx # Unlock celebration
│   ├── achievementsStore.ts    # Zustand store
│   ├── achievementDefinitions.ts # Achievement configs
│   ├── achievementTracking.ts  # Progress tracking
│   ├── useAchievementSync.ts   # Sync hook
│   └── types.ts
│
├── ai-insights/                # AI-powered insights
│   ├── index.ts
│   ├── AIInsightsModal.tsx     # Main insights view
│   ├── aiInsightsEngine.ts     # Insight generation
│   ├── insightGenerators.ts    # Specific generators
│   ├── InsightCard.tsx         # Individual insight
│   ├── ProductivityScoreCard.tsx # Score display
│   ├── RecommendationsList.tsx # AI recommendations
│   ├── WeeklySummaryCard.tsx   # Weekly summary
│   ├── types.ts
│   └── charts/
│       └── PeakHoursChart.tsx  # Peak hours visualization
│
├── analytics/                  # Analytics dashboard
│   ├── index.ts
│   ├── AnalyticsDashboard.tsx  # Main dashboard
│   ├── ProductivityHeatmap.tsx # Activity heatmap
│   ├── SessionDistributionChart.tsx # Distribution chart
│   ├── StatisticsCards.tsx     # Stat cards
│   └── TimeSeriesChart.tsx     # Time series graph
│
├── goals/                      # Goal tracking
│   ├── index.ts
│   ├── GoalsDashboard.tsx      # Main goals view
│   ├── GoalCard.tsx            # Individual goal
│   ├── CreateGoalModal.tsx     # Create goal form
│   ├── GoalsModal.tsx          # Goals modal
│   ├── goalsStore.ts           # Zustand store
│   ├── goalTracking.ts         # Goal progress
│   └── types.ts
│
├── timeline/                   # Timeline view
│   ├── index.ts
│   ├── TimelineView.tsx        # Main timeline
│   ├── TimelineDay.tsx         # Day grouping
│   ├── TimelineSession.tsx     # Session item
│   ├── TimelineControls.tsx    # View controls
│   ├── timelineUtils.ts        # Helpers
│   └── types.ts
│
└── export/                     # Export from sidebar
    ├── index.ts
    └── ExportModal.tsx
```

### Timer Pages (`src/pages/timer/`)

```
pages/timer/
├── PremiumHistory.tsx          # History page (679 lines)
├── Achievements.tsx            # Achievements page
├── Analytics.tsx               # Analytics dashboard page
├── Goals.tsx                   # Goals tracking page
├── AIInsights.tsx              # AI insights page
├── Timeline.tsx                # Timeline view page
├── Export.tsx                  # Export page
└── __tests__/
    └── PremiumHistoryRepeatResume.test.tsx
```

### Tests (`src/components/timer/__tests__/`)

```
__tests__/
├── TimerContainer.test.tsx     # Container tests
│
├── hooks/                      # Hook tests
│   ├── useCountdown.test.ts    # 44 tests
│   ├── useStopwatch.test.ts    # 20 tests
│   ├── useIntervals.test.ts    # 49 tests
│   ├── useTimerHistory.test.ts # 21 tests
│   ├── useKeyboardShortcuts.test.ts # 38 tests
│   └── useTimerSound.test.ts   # 2 tests
│
├── components/                 # Component tests
│   ├── TimerDisplay.test.tsx
│   ├── AnimatedTimerButton.test.tsx
│   ├── WheelPicker.test.tsx
│   ├── WheelPickerSound.test.tsx
│   └── TimerAnnouncer.test.tsx
│
├── utils/                      # Utility tests
│   ├── soundManager.test.ts
│   ├── vibrationManager.test.ts
│   ├── notificationManager.test.ts
│   ├── timerPersistence.test.ts
│   ├── logger.test.ts
│   ├── validation.test.ts
│   ├── uuid.test.ts
│   ├── intervalStateMachine.test.ts
│   ├── intervalSwitchHandler.test.ts
│   └── intervalCompletionHandler.test.ts
│
├── integration/                # Integration tests
│   ├── timer-workflows.test.tsx
│   ├── timer-persistence-integration.test.tsx
│   └── logger-integration.test.ts
│
├── accessibility/              # A11y tests
│   ├── axe-audit.test.tsx
│   ├── aria-labels.test.tsx
│   └── timer-announcements.test.tsx
│
├── error/                      # Error handling tests
│   ├── TimerErrorBoundary.test.tsx
│   ├── error-recovery.test.tsx
│   ├── error-scenarios.test.tsx
│   ├── errorMessages.test.ts
│   ├── hook-errors.test.ts
│   ├── storage-errors.test.ts
│   └── integration-errors.test.tsx
│
├── edge-cases/                 # Edge case tests
│   └── timer-drift.test.ts
│
├── performance/                # Performance tests
│   └── benchmarks.test.ts
│
└── constants/                  # Constant tests
    └── performance.constants.test.ts
```

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `TimerDisplay.tsx` |
| Hooks | camelCase with `use` prefix | `useCountdown.ts` |
| Stores | camelCase with `Store` suffix | `achievementsStore.ts` |
| Utils | camelCase | `soundManager.ts` |
| Types | camelCase or `.types.ts` suffix | `timer.types.ts` |
| Tests | `.test.ts(x)` suffix | `useCountdown.test.ts` |
| Constants | `.constants.ts` suffix | `timer.constants.ts` |
