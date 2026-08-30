# HabitFlow

A modern, full-featured habit tracking and productivity application built with React, TypeScript, and Vite. Includes a multi-mode timer (stopwatch/countdown/intervals), achievements, AI insights, analytics, exports, social/messaging, integrations with Google/Notion/Slack/Spotify/Fit, and email + TOTP MFA authentication. Ships as a Vite web app, a Capacitor Android wrapper, and a static landing page. Backend is Supabase (Postgres + Edge Functions) with Cloudflare Turnstile bot protection.

## 🌳 Branch Structure

We follow a simplified two-branch flow:

- **`main`** — Production-ready code (protected)
- **`docs/*`, `feat/*`, `chore/*`, `fix/*`** — short-lived branches off `main`, squash-merged via PR

📖 See [CONTRIBUTING.md](./CONTRIBUTING.md) for the workflow details.

## ✨ Features

### Core

- ⚛️ **React 18** — Concurrent rendering
- 📘 **TypeScript (strict)** — Type safety end-to-end
- ⚡ **Vite 6** — Fast HMR and builds

### State, Data & Routing

- 🐻 **Zustand 5** — Lightweight state with persistence (8 global stores + 8 domain stores)
- 🗄️ **Supabase** — Postgres + Auth + Storage + Edge Functions (the only data layer)
- 🚀 **React Router 7** — Declarative routing

### Forms & Validation

- 📝 **React Hook Form** — Performant, flexible forms
- ✅ **Zod 3** — TypeScript-first schema validation

### UI & Styling

- 🎨 **Tailwind CSS 3** — Utility-first, with dark mode
- 🎬 **Framer Motion** — Animations
- 🧱 **dnd-kit** — Accessible drag-and-drop
- 📊 **Recharts** — Charts and analytics
- 🍞 **react-hot-toast** — Notifications
- 📄 **html2canvas + jspdf** — Premium exports

### Security & Auth

- 🔐 **Supabase Auth** — Email/password + JWT sessions
- 🛡️ **Custom TOTP MFA** — In `src/lib/auth/mfa.ts`
- 🤖 **Cloudflare Turnstile** — Bot protection on auth gateway
- 🪵 **Sentry 10** — Error monitoring (opt-in via `VITE_ENABLE_SENTRY`)

### Testing & Quality

- 🧪 **Vitest 4** — Unit + component tests (jsdom)
- 🧩 **React Testing Library** — Component tests
- ♿ **jest-axe** — Accessibility assertions
- 🎭 **Playwright** — E2E tests (Firefox)
- 📏 **ESLint 9** — Flat config, with `@ts-nocheck` debt awareness
- ✨ **Prettier 3** — Formatter with Tailwind plugin
- 🐶 **Husky 9** — Pre-commit hook (installed via `npm run prepare`)

### Utilities

- 📅 **date-fns** — Date utilities
- 🔧 **Custom Hooks** — `useDebounce`, `useLocalStorage`, etc.
- 📁 **Path Aliases** — `@/` maps to `src/`

## 📁 Project Structure

Feature-sliced architecture — domain code lives in `src/features/<domain>/`,
cross-domain primitives in `src/shared/` and the classic shared layers. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full architecture guide,
dependency rules, and testing policy.

```
.
├── src/
│   ├── features/       # Domain features (timer, social, tasks, habits,
│   │                   #   categories, today, integrations, auth,
│   │                   #   accessibility, onboarding)
│   ├── shared/         # Cross-domain UI primitives + layout shell
│   ├── lib/            # Framework-free logic (auth, storage, security, env, errors)
│   ├── store/          # Global persisted Zustand stores
│   ├── pages/          # Routing composition
│   ├── hooks/ utils/ schemas/ types/ constants/
│   ├── __tests__/      # Cross-cutting tests only
│   ├── App.tsx         # Main App component
│   └── main.tsx        # Application entry point
├── e2e/                # Playwright specs (Firefox)
├── scripts/            # Codegen tooling (leagues → constants)
├── public/             # Static assets
├── index.html          # HTML template
└── vite.config.ts      # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js **v20+**
- npm **v10+**
- A Supabase project (for the backend)
- Cloudflare Turnstile site key (for auth bot protection)

### Installation

```bash
# Install dependencies
npm ci

# Copy env template and fill in your values
cp .env.example .env

# Start the dev server (validates env on boot)
npm run dev

# Typecheck + production build
npm run build

# Preview the production build locally
npm run preview
```

## 📜 Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server (port 3000) |
| `npm run build` | Typecheck **then** Vite build |
| `npm run typecheck` | `tsc --noEmit` over the strict tsconfig |
| `npm run lint` | ESLint flat config |
| `npm run lint:strict` | ESLint with `--max-warnings 0` (gated on debt burn-down) |
| `npm run lint:debt` | ESLint in strict mode over `@ts-nocheck` files |
| `npm run lint:fix` | ESLint with `--fix` |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check (CI gate) |
| `npm test` | Vitest watch |
| `npm run test:coverage` | Vitest with v8 coverage |
| `npm run test:e2e` | Playwright (Firefox) |
| `npm run audit` | `npm audit --audit-level=high` |

## 🔧 Configuration

### Environment Variables

All `VITE_*` variables are validated at module load time by
[`src/lib/env.ts`](src/lib/env.ts). Required vars throw in production;
optional vars warn and fall through.

| Var | Required | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | yes | Supabase anon JWT |
| `VITE_API_URL` | no | Backend base URL (unused in current build) |
| `VITE_APP_NAME` | no | Display name (default: `HabitFlow`) |
| `VITE_APP_VERSION` | no | Display version (default: `unknown`) |
| `VITE_SENTRY_DSN` | no | Sentry DSN for error reporting |
| `VITE_ENABLE_SENTRY` | no | `true` to enable Sentry init |
| `VITE_ENABLE_ANALYTICS` | no | `true` to enable analytics |
| `VITE_TURNSTILE_SITE_KEY` | no | Cloudflare Turnstile site key |
| `VITE_TURNSTILE_DISABLED` | no | `true` to bypass Turnstile in dev |
| `VITE_GOOGLE_CLIENT_ID` / `_SECRET` / `_REDIRECT_URI` | no | Google integration |
| `VITE_NOTION_CLIENT_ID` / `_SECRET` / `_REDIRECT_URI` | no | Notion integration |
| `VITE_SLACK_CLIENT_ID` / `_SECRET` / `_REDIRECT_URI` | no | Slack integration |
| `VITE_SPOTIFY_CLIENT_ID` / `_SECRET` / `_REDIRECT_URI` | no | Spotify integration |
| `VITE_GOOGLE_FIT_REDIRECT_URI` | no | Google Fit integration |

In **production**, missing required vars throw on import — the build fails fast.
In **development**, missing required vars log to the console and fall back to
placeholders so the dev server can boot.

### Path Aliases

Imports use the `@/` alias (mapped to `src/` in both `tsconfig` and `vite.config.ts`):

```typescript
// Instead of
import Component from '../../../components/Component'

// You can use
import Component from '@/components/Component'
```

## 🧪 Testing

```bash
npm test              # Vitest in watch mode
npm run test:coverage # Vitest with v8 coverage report
npm run test:e2e      # Playwright (Firefox; install via `npx playwright install firefox`)
```

Tests are colocated with their subjects in `__tests__/` directories. Two
cross-cutting suites live in `src/__tests__/`. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#testing-policy) for the testing
policy and known-debt caveats.

## 📦 Building for Production

```bash
npm run build
```

The build runs `tsc --noEmit` first, then Vite. Output is in `dist/`,
ready to be deployed to any static hosting service.

## 🚀 Deployment

The app is configured for **dual-target** deployment — both kept intentionally:

- **Vercel** — `vercel.json` at the repo root
- **Netlify** — `netlify.toml` at the repo root

Both build the SPA statically; the Supabase backend is a separate concern
managed in the Supabase dashboard.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, branching strategy,
commit conventions, and the PR process.

## 📄 License

MIT