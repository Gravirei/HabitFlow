# Timer Module - Integrations

## Overview

The Timer module integrates with browser APIs, external services, and internal app systems to provide a full-featured timer experience.

## Browser API Integrations

### Web Audio API (`soundManager.ts`)

**Purpose**: Play timer completion and interaction sounds

**Features**:
- Multiple sound types: beep, bell, chime, digital, tick
- Volume control (0-100)
- Programmatic sound generation (oscillators)

**Usage**:
```typescript
import { soundManager } from './utils/soundManager'

// Play completion sound
soundManager.playSound('bell', 80) // type, volume
```

**Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

---

### Vibration API (`vibrationManager.ts`)

**Purpose**: Haptic feedback for timer events

**Patterns**:
- `short`: Quick pulse
- `long`: Extended vibration
- `pulse`: Pattern vibration

**Usage**:
```typescript
import { vibrationManager } from './utils/vibrationManager'

vibrationManager.vibrate('pulse')
```

**Browser Support**: Mobile browsers, some desktop (Chrome)

---

### Notifications API (`notificationManager.ts`)

**Purpose**: Browser notifications for timer completion

**Features**:
- Permission request handling
- Timer completion notifications
- Custom notification messages
- Icon and badge support

**Usage**:
```typescript
import { notificationManager } from './utils/notificationManager'

// Request permission
await notificationManager.requestPermission()

// Show notification
notificationManager.showTimerComplete(
  'Great job!',           // message
  'Countdown',            // mode
  1500                    // duration in seconds
)
```

**Browser Support**: All modern browsers (requires HTTPS in production)

---

### localStorage API

**Purpose**: Persist timer state, settings, and history

**Keys Used**:
```
Timer State:
├── flowmodoro_timer_state        # Active timer for resume
├── flowmodoro_active_timer       # Current timer mode
└── flowmodoro_repeat_session     # Repeat session config

History (per mode):
├── timer-stopwatch-history
├── timer-countdown-history
└── timer-intervals-history

Settings & Preferences:
├── timer-settings
├── timer-custom-presets
├── timer-custom-interval-presets
├── timer-theme-settings

Zustand Stores:
├── timer-sidebar-achievements
├── timer-sidebar-goals
├── timer-cloud-sync
├── timer-premium-history-archive
├── timer-premium-history-tags
├── timer-premium-history-templates
└── timer-premium-history-notifications
```

**Storage Limits**: ~5MB per origin (browser-dependent)

---

### Performance API

**Purpose**: Accurate timing for timer precision

**Usage**:
- `getCurrentTime()` helper uses `Date.now()` for wall-clock time
- Prevents timer drift during background tab throttling

---

## Cloud Integrations

### Supabase (via `tieredStorage`)

**Purpose**: Cloud sync, backup, and cross-device support

**Integration Point**: `@/lib/storage` → `tieredStorage`

**Features**:
- Real-time sync to cloud
- Backup and restore
- Authentication-aware syncing
- Offline-first with sync on reconnect

**Usage** (in `syncStore.ts`):
```typescript
import { tieredStorage } from '@/lib/storage'

// Check login status
if (tieredStorage.isLoggedIn()) {
  // Sync to cloud
  await tieredStorage.syncToCloud()
  
  // Refresh from cloud
  await tieredStorage.refreshFromCloud()
  
  // Get sync status
  const status = tieredStorage.getSyncStatus()
}
```

**Sync Flow**:
```
User Action → Local State → localStorage
                    ↓
             tieredStorage.syncToCloud()
                    ↓
              Supabase Database
                    ↓
            Other Devices (via refresh)
```

**Sync Settings** (configurable):
- `autoSync`: Enable/disable automatic sync
- `syncInterval`: Sync frequency (minutes)
- `syncOnLogin`: Sync when user logs in
- `syncOnLogout`: Sync before logout
- `backupBeforeSync`: Create backup before syncing
- `maxBackups`: Maximum stored backups

---

### Sentry (Error Tracking)

**Purpose**: Production error monitoring

**Integration Point**: `@/lib/sentry` → `captureError`

**Usage** (in `TimerErrorBoundary.tsx`):
```typescript
import { captureError } from '@/lib/sentry'

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  captureError(error, {
    component: 'TimerErrorBoundary',
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
  })
}
```

**Tracked Events**:
- Error boundary catches
- Critical failures in timer operations
- Storage errors

---

## Internal App Integrations

### React Router

**Purpose**: Navigation between timer pages

**Routes**:
```typescript
/timer                    → Timer.tsx (main entry)
/timer/premium-history    → PremiumHistory.tsx
/timer/analytics          → Analytics.tsx
/timer/goals              → Goals.tsx
/timer/achievements       → Achievements.tsx
/timer/ai-insights        → AIInsights.tsx
/timer/timeline           → Timeline.tsx
/timer/export             → Export.tsx
```

**Protected Routes**: All timer routes require authentication (`RequireAuth`) and verified email (`RequireVerifiedEmail`)

---

### Authentication System

**Integration Point**: Auth wrappers in `App.tsx`

**Features**:
- Timer routes protected behind auth
- Cloud sync triggered on auth state change
- User-specific data storage

**Auth Change Handler** (`SyncOnAuthChange.tsx`):
```typescript
// Automatically syncs when user logs in
export function SyncOnAuthChange() {
  // Listens for auth state changes
  // Triggers sync on login if enabled
}
```

---

### Theme System

**Integration Point**: `ThemeProvider` wraps app

**Features**:
- Dark/light mode
- Custom accent colors
- Timer-specific styling
- Reduced motion support
- High contrast mode

**Theme Settings**:
```typescript
interface ThemeSettings {
  mode: 'dark' | 'light' | 'system'
  preset: string
  accentColor: string
  timerStyle: 'default' | 'minimal' | 'classic'
  glowEnabled: boolean
  blurEnabled: boolean
  particlesEnabled: boolean
  reducedMotion: boolean
  highContrast: boolean
  // ...
}
```

---

## Third-Party Libraries

### Recharts

**Purpose**: Analytics visualizations

**Used In**:
- `AnalyticsDashboard.tsx`
- `TimeSeriesChart.tsx`
- `SessionDistributionChart.tsx`
- `ProductivityHeatmap.tsx`
- `PeakHoursChart.tsx`

**Chart Types**:
- Line charts (time series)
- Bar charts (distribution)
- Area charts (trends)
- Heatmaps (productivity)

---

### Framer Motion

**Purpose**: Animations and transitions

**Used For**:
- Mode switching animations
- Timer display transitions
- Modal animations
- Button interactions
- List animations (AnimatePresence)

---

### date-fns

**Purpose**: Date manipulation and formatting

**Used For**:
- Session timestamps
- Date range filtering
- Calendar view
- Timeline grouping
- Relative time display

---

### jspdf + html2canvas

**Purpose**: PDF export functionality

**Used In**: `exportUtils.ts`

**Features**:
- Export session history as PDF
- Styled PDF output
- Multi-page support

---

### react-window

**Purpose**: List virtualization for performance

**Used In**: `VirtualizedSessionList.tsx`

**Benefits**:
- Handles large history lists efficiently
- Renders only visible items
- Smooth scrolling

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           User Interaction                               │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Timer Components                                │
│  (TimerContainer, CountdownTimer, StopwatchTimer, IntervalsTimer)       │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌───────────┐   ┌───────────┐   ┌───────────┐
            │   Hooks   │   │  Browser  │   │  Zustand  │
            │           │   │   APIs    │   │  Stores   │
            └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
                  │               │               │
                  │    ┌──────────┴──────────┐    │
                  │    │                     │    │
                  │    ▼                     ▼    │
                  │ ┌──────┐            ┌──────┐  │
                  │ │Sound │            │Notif │  │
                  │ │Vibra │            │      │  │
                  │ └──────┘            └──────┘  │
                  │                               │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                        ┌─────────────────┐
                        │   localStorage  │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  tieredStorage  │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │    Supabase     │
                        │   (Cloud DB)    │
                        └─────────────────┘
```

## Environment Variables

Required for cloud features:
```
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

Sentry (optional):
```
VITE_SENTRY_DSN=<sentry-dsn>
```
