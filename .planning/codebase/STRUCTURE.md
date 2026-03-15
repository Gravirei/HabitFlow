# Codebase Structure

**Analysis Date:** 2025-01-24

## Directory Layout

```
HabitFlow/
├── android/            # Capacitor-generated Android project files
├── docs/               # Technical and feature documentation
├── e2e/                # Playwright E2E tests and page objects
├── landing_page/       # Independent static landing page code
├── public/             # Static assets (images, manifest, icons)
├── src/                # Primary React application source code
│   ├── components/     # Modular UI components
│   ├── constants/      # App-wide constants and data templates
│   ├── hooks/          # Global React hooks
│   ├── lib/            # Library wrappers and core services
│   ├── pages/          # Full page components and route targets
│   ├── schemas/        # Zod validation schemas
│   ├── store/          # Zustand global state stores
│   ├── types/          # Shared TypeScript interfaces
│   ├── utils/          # Generic utility/helper functions
│   └── __tests__/      # Unit and integration tests
├── supabase/           # Backend migrations and edge functions
└── index.html          # Web entry point
```

## Directory Purposes

**src/components/:**
- Purpose: Building blocks of the UI. Highly modular features (like `timer/`) are grouped here.
- Contains: React component files (`.tsx`), feature-specific hooks, and local utils.
- Key files: `src/components/timer/index.ts`, `src/components/OnboardingModal.tsx`.

**src/pages/:**
- Purpose: Represents the main views of the application linked to the router.
- Contains: Composed components for specific routes.
- Key files: `src/pages/SplashScreen.tsx`, `src/pages/bottomNav/Today.tsx`.

**src/store/:**
- Purpose: Centralized state management using Zustand.
- Contains: Global state stores with persistence configuration.
- Key files: `src/store/useHabitStore.ts`, `src/store/useTaskStore.ts`.

**src/lib/:**
- Purpose: External service initializations and core logic wrappers.
- Contains: Supabase, Sentry, Auth, and Storage service implementations.
- Key files: `src/lib/supabase.ts`, `src/lib/storage/tieredStorage.ts`.

**supabase/:**
- Purpose: Server-side infrastructure and logic.
- Contains: SQL migrations and Deno edge functions.
- Key files: `supabase/migrations/`, `supabase/functions/`.

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React DOM initialization.
- `src/App.tsx`: Routing and global configuration.

**Configuration:**
- `package.json`: Dependencies and build scripts.
- `vite.config.ts`: Vite build and server settings.
- `tailwind.config.js`: CSS framework configuration.
- `capacitor.config.json`: Capacitor mobile platform settings.

**Core Logic:**
- `src/lib/storage/tieredStorage.ts`: Main sync and persistence logic.
- `src/utils/streakUtils.ts`: Habit streak calculation logic.

**Testing:**
- `src/__tests__/`: Unit and integration test suites.
- `e2e/tests/`: End-to-end browser tests.

## Naming Conventions

**Files:**
- Components: PascalCase (`MyComponent.tsx`)
- Hooks: camelCase starting with `use` (`useMyHook.ts`)
- Stores: camelCase starting with `use` (`useMyStore.ts`)
- Utils/Libs: camelCase (`myUtil.ts`)
- Tests: `[filename].test.ts` or `[filename].spec.ts`

**Directories:**
- Features/Categories: lowercase or kebab-case (`timer/`, `side-nav/`)

## Where to Add New Code

**New Feature:**
- Logic/Hooks: `src/hooks/` or within a subfolder in `src/components/[feature]/hooks/`.
- UI: Create a new directory in `src/components/[feature]/` and a route target in `src/pages/`.
- Tests: `src/__tests__/` or co-located with the feature.

**New Global Store:**
- Implementation: `src/store/use[Name]Store.ts`.

**Utilities:**
- Implementation: `src/utils/` if generic, or `src/components/[feature]/utils/` if specific to a feature.

## Special Directories

**archive/:**
- Purpose: Contains legacy or removed code preserved for reference.
- Generated: No
- Committed: Yes

**dist/:**
- Purpose: Compiled production build output.
- Generated: Yes
- Committed: No

---

*Structure analysis: 2025-01-24*
