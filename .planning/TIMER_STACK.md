# Timer Module - Technology Stack

## Overview
The Timer module is a comprehensive, feature-rich timer system built with React and TypeScript, featuring three timer modes, premium history features, analytics, achievements, and cloud sync capabilities.

## Languages
- **TypeScript 5.x** - Primary language with strict mode enabled
- **CSS/TailwindCSS** - Styling with utility-first approach

## Frontend Framework
- **React 18** - Functional components with hooks
- **Framer Motion 12** - Animations and transitions
- **React Router DOM 6** - Client-side routing

## State Management
- **Zustand 4.4** - Global state management with persistence
  - `achievementsStore.ts` - Achievement tracking
  - `goalsStore.ts` - Goal management
  - `syncStore.ts` - Cloud sync state
  - `themeStore.ts` - Theme preferences
  - `archiveStore.ts` - Session archiving
  - `tagStore.ts` - Custom tags
  - `templateStore.ts` - Session templates
  - `notificationStore.ts` - Notification settings
  - `shareStore.ts` - Team sharing
- **React Context** - Timer focus state (`TimerFocusContext`)
- **localStorage** - Settings and history persistence

## UI Components
- **Custom Components** - Hand-built timer UI components
- **Material Symbols** - Icon system
- **Recharts 3.6** - Analytics charts and visualizations
- **react-window 2.2** - Virtualized lists for performance

## Utilities
- **date-fns 3.x** - Date manipulation
- **clsx + tailwind-merge** - Conditional class management
- **zod 3.x** - Runtime validation
- **jspdf + html2canvas** - PDF export functionality

## Testing
- **Vitest** - Test runner
- **React Testing Library 14** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **@axe-core/react** - Accessibility testing

## Error Tracking
- **Sentry** - Error monitoring and reporting (via `@/lib/sentry`)

## Cloud Integration
- **Supabase** - Cloud sync via `tieredStorage` (`@/lib/storage`)
  - User authentication integration
  - Cloud backup and restore
  - Real-time sync

## Build & Development
- **Vite** - Build tool and dev server
- **TypeScript** - Type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Key Dependencies Graph
```
Timer Module
├── react (^18.2.0)
├── zustand (^4.4.7) - State management
├── framer-motion (^12.23.26) - Animations
├── react-router-dom (^6.21.0) - Routing
├── recharts (^3.6.0) - Charts
├── date-fns (^3.0.6) - Date utilities
├── react-window (^2.2.4) - Virtualization
├── jspdf (^4.0.0) - PDF export
├── html2canvas (^1.4.1) - Screenshot capture
└── zod (^3.22.4) - Validation
```

## Browser APIs Used
- **Web Audio API** - Sound effects (`soundManager`)
- **Vibration API** - Haptic feedback (`vibrationManager`)
- **Notifications API** - Browser notifications (`notificationManager`)
- **localStorage API** - State persistence
- **Performance API** - Timer accuracy
