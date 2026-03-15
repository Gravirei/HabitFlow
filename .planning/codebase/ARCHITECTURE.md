# Architecture

**Analysis Date:** 2025-01-24

## Pattern Overview

**Overall:** Layered Architecture with a focus on **Offline-First** and **Tiered Storage**.

**Key Characteristics:**
- **Modular Monolith:** Features (like the Timer) are organized into highly modular directories with their own internal hooks, components, and state logic.
- **Offline-First:** Data is primarily stored in `localStorage` for immediate availability and responsiveness, then synced to the cloud.
- **Tiered Storage Strategy:** Seamlessly transitions between `localStorage` for guest users and synced Supabase storage for authenticated users.

## Layers

**UI Layer (Presentation):**
- Purpose: Renders the interface and handles user interactions.
- Location: `src/pages/` and `src/components/`
- Contains: React components, styled with Tailwind CSS.
- Depends on: State Layer (Zustand stores) and Logic Layer (Custom hooks).
- Used by: End users via the browser or Capacitor-wrapped app.

**State Layer (Management):**
- Purpose: Manages global application state and local persistence.
- Location: `src/store/`
- Contains: Zustand stores with persistence middleware.
- Depends on: Logic Layer (Utils) and Types.
- Used by: UI Layer to access and modify data.

**Logic Layer (Business Logic):**
- Purpose: Encapsulates domain-specific rules and cross-cutting concerns.
- Location: `src/hooks/`, `src/utils/`, and `src/schemas/`
- Contains: Custom React hooks (`useCountdown.ts`), utility functions (`streakUtils.ts`), and Zod validation schemas (`habitSchema.ts`).
- Depends on: Data Layer (Services) and External libraries.
- Used by: UI Layer and State Layer.

**Data/Persistence Layer (Infrastructure):**
- Purpose: Handles data storage and synchronization.
- Location: `src/lib/` and `supabase/`
- Contains: External library wrappers (`supabase.ts`), core services (`tieredStorage.ts`), and database migrations.
- Depends on: External services (Supabase).
- Used by: State Layer and Logic Layer.

## Data Flow

**Offline-First Sync Flow:**

1. **User Action:** A user completes a habit or finishes a timer session.
2. **State Update:** The UI triggers a store method (e.g., `toggleHabitCompletion` in `useHabitStore.ts`).
3. **Local Save:** The store updates its state, and Zustand's `persist` middleware automatically saves it to `localStorage`.
4. **Cloud Sync (Tiered):** For certain data (like timer sessions), the `TieredStorageService` (`src/lib/storage/tieredStorage.ts`) is called to:
    - Save to an offline queue if the user is offline.
    - Upsert the data to Supabase if the user is logged in and online.
5. **Background Sync:** A `SyncOnAuthChange` component (`src/components/timer/premium-history/cloud-sync/SyncOnAuthChange.tsx`) listens for login/logout and triggers full syncs or migrations.

**State Management:**
- **Global State:** Managed by Zustand (`src/store/`). Stores are typically persistent across reloads using `localStorage`.
- **Feature State:** Managed locally within modules (e.g., `TimerContext` in `src/components/timer/context/`).
- **Auth State:** Managed by a custom `AuthProvider` (`src/lib/auth/AuthContext.tsx`) wrapping Supabase Auth.

## Key Abstractions

**Tiered Storage Service:**
- Purpose: Abstracts the complexity of managing local vs. cloud storage and offline syncing.
- Examples: `src/lib/storage/tieredStorage.ts`
- Pattern: Service Pattern with a Singleton instance.

**Zustand Stores:**
- Purpose: Centralized state management with built-in persistence.
- Examples: `src/store/useHabitStore.ts`, `src/store/useTaskStore.ts`
- Pattern: Flux-like state management.

**Modular Components:**
- Purpose: Encapsulating complex features into self-contained units.
- Examples: `src/components/timer/` - This directory contains everything needed for the timer feature (components, hooks, types, utils, tests).

## Entry Points

**Web Main:**
- Location: `src/main.tsx`
- Triggers: Browser loading the page.
- Responsibilities: Initializes Sentry, wraps the app in `AuthProvider`, and renders the React root.

**App Root:**
- Location: `src/App.tsx`
- Triggers: React initialization.
- Responsibilities: Configures routing (`react-router-dom`), global providers (Toaster, ErrorBoundary), and cross-cutting logic components (DayChangeDetector, SyncOnAuthChange).

## Error Handling

**Strategy:** Multi-layered approach combining graceful UI degradation with centralized tracking.

**Patterns:**
- **Global Error Boundary:** Wraps the entire application in `App.tsx` using `src/components/ErrorBoundary.tsx`.
- **Feature Error Boundaries:** Modular boundaries like `TimerErrorBoundary.tsx` ensure failures in one feature don't crash the whole app.
- **Error Tracking:** Centralized initialization of Sentry in `src/lib/sentry.ts`.
- **Toast Notifications:** User-facing errors are displayed using `react-hot-toast`.

## Cross-Cutting Concerns

**Logging:** Custom logging service for specific features (e.g., `src/components/timer/utils/logger.ts`).
**Validation:** Centralized Zod schemas in `src/schemas/` ensure data integrity.
**Authentication:** Protected routes using `RequireAuth` and `RequireVerifiedEmail` wrappers in `src/App.tsx`.
**Mobile Compatibility:** Uses Capacitor to bridge the web app to native mobile functionality (`capacitor.config.json`).

---

*Architecture analysis: 2025-01-24*
