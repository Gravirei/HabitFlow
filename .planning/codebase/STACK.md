# Technology Stack

**Analysis Date:** 2025-05-23

## Languages

**Primary:**
- TypeScript 5.2.2 - Entire frontend application and Supabase Edge Functions.

**Secondary:**
- SQL (PostgreSQL) - Supabase migrations and database logic.
- CSS (Tailwind CSS) - Frontend styling.

## Runtime

**Environment:**
- Node.js (Vite) - Development and build environment.
- Capacitor 8.2.0 - Mobile integration for Android/iOS.
- Supabase Edge Functions (Deno) - Server-side functions.

**Package Manager:**
- npm - Package management.
- Lockfile: `package-lock.json` present.

## Frameworks

**Core:**
- React 18.2.0 - UI framework.
- React Router DOM 6.21.0 - Client-side routing.
- Zustand 4.4.7 - State management.

**Testing:**
- Vitest 4.0.16 - Unit and integration testing.
- Playwright 1.57.0 - End-to-end testing.
- React Testing Library (RTL) - Component testing.
- Vitest-Axe / Jest-Axe - Accessibility testing.

**Build/Dev:**
- Vite 6.4.1 - Build tool and development server.
- Tailwind CSS 3.4.0 - Utility-first CSS framework.
- PostCSS 8.4.32 - CSS processing.
- ESLint 8.55.0 - Linting.
- Prettier 3.1.1 - Code formatting.

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.90.1 - Backend interaction and authentication.
- @dnd-kit/core 6.3.1 - Drag and drop functionality.
- framer-motion 12.23.26 - Animations and transitions.
- react-hook-form 7.49.2 - Form handling.
- zod 3.22.4 - Schema validation.

**Infrastructure:**
- @sentry/react 10.32.1 - Error monitoring and reporting.
- @capacitor/core 8.2.0 - Native mobile capabilities.

## Configuration

**Environment:**
- Environment variables configured via `.env` (see `.env.example`).
- Keys for Supabase, Sentry, Turnstile, and various OAuth integrations (Google, Notion, Slack, Spotify).

**Build:**
- `vite.config.ts`: Vite build configuration.
- `tsconfig.json`: TypeScript configuration.
- `tailwind.config.js`: Tailwind CSS theme and plugin configuration.
- `capacitor.config.json`: Capacitor mobile configuration.
- `vercel.json` / `netlify.toml`: Deployment configurations.

## Platform Requirements

**Development:**
- Node.js environment.
- Supabase project for backend functionality.

**Production:**
- Web: Vercel or Netlify.
- Mobile: Android (via Capacitor) and potentially iOS.

---

*Stack analysis: 2025-05-23*
