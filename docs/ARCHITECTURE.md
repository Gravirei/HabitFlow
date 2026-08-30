# HabitFlow — Architecture

This is the human-facing architecture doc. The agent-facing equivalent lives
in [AGENTS.md](../AGENTS.md); this one assumes you already know how to code
and just want to understand the lay of the land.

## Stack

| Layer | Choice |
|---|---|
| Build | Vite 6 |
| Language | TypeScript (strict) |
| UI | React 18, Tailwind CSS 3, framer-motion |
| State | Zustand 5 (persisted via `zustand/middleware`) |
| Routing | React Router 7 |
| Forms | React Hook Form + Zod 3 |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions Deno) |
| Bot protection | Cloudflare Turnstile |
| Error monitoring | Sentry 10 (opt-in) |
| Mobile | Capacitor 8 (Android) |
| Unit tests | Vitest 4 + React Testing Library + jest-axe |
| E2E tests | Playwright (Firefox) |
| Lint | ESLint 9 (flat config) |
| Format | Prettier 3 + Tailwind plugin |
| Hooks | Husky 9 (pre-commit) |

## Feature-sliced layout

```
src/
  features/
    timer/          # largest feature: components/{modes,settings,sidebar,
                    #   premium-history,shared,styles}, context/, hooks/,
                    #   store/ (8 domain stores), types/, utils/, constants/
    social/         # includes messaging subdomain (components/messaging/)
    tasks/ habits/ categories/ today/ integrations/ auth/
    accessibility/ onboarding/
  shared/
    ui/             # ConfirmDialog, AccessibleModal, ToggleSwitch, TurnstileWidget…
    layout/         # BottomNav, SideNav, ErrorBoundary
    hooks/
  lib/              # framework-free logic: auth context, storage tiering, logger,
                    #   security, env validation, typed errors
  store/            # GLOBAL persisted entity stores (habits, tasks, categories, profile…)
  pages/            # routing composition only (bottomNav/ + sideNav/ dirs kept for history)
  hooks/ utils/ schemas/ types/ constants/
```

### Dependency rules (enforced by ESLint `no-restricted-imports`)

- `lib/`, `hooks/`, `store/`, `utils/`, `schemas/`, `types/`, `constants/`,
  `shared/` may **never** import from `@/components/*`, `@/features/*`, or
  their relative forms.
- Cross-feature imports go through a feature's public barrel
  (`@/features/<name>` → its `index.ts`), not deep paths.
- `src/components/` no longer exists — any `@/components/*` import is stale.

### State organization

There are two kinds of Zustand stores:

1. **Global entity stores** in `src/store/` — habits, tasks, categories,
   profile, etc. These persist via `zustand/middleware/persist` and are
   the canonical source for entity data.
2. **Domain stores** in `src/features/<domain>/store/` — feature-local
   state (timer sessions, achievements, sync queues). Also persisted
   where it makes sense.

Components fetch via the stores, not via React Query or Axios. There is
no `Axios` and no `React Query` in this project — `supabase-js` is the
only network client.

## Runtime layers

### Env validation (`src/lib/env.ts`)

Every `VITE_*` variable is read at module load and validated by Zod.
Missing **required** vars throw in production (the build fails fast);
in development they log and fall back to placeholders so the dev server
can boot. Optional vars always warn.

This is why CI can ship placeholder Supabase credentials — the real
values are injected at build time via Netlify/Vercel env or `--build-arg`.

### Typed errors (`src/lib/errors.ts`)

All thrown errors in `src/lib/` descend from `AppError`, which carries a
`code`, optional `meta`, and an `httpStatus`. Use `requireEnv(name)` to
assert env at the call site — it throws an `EnvError`.

### Auth gateway (`supabase/functions/auth-gateway/`)

A Deno Edge Function that fronts Supabase Auth with Turnstile + rate
limit + account lockout. The frontend talks to it via
`src/lib/security/authGatewayClient.ts`.

There is currently a v1/v2 hybrid envelope (R7 flag-gating) — the
client sends both shapes during the rollout; the server picks one. See
`docs/auth-implementation-plan-full.md` (legacy) and the migration
commit messages.

### Storage tiering (`src/lib/storage/tieredStorage.ts`)

Local-first storage that fans out to Supabase Storage for premium users.
Integrity checks via `src/lib/storage/storageIntegrity.ts`.

## Testing policy

- **Unit tests** are colocated with subjects in `__tests__/` directories.
  Only two cross-cutting files remain in `src/__tests__/`: `App.test.tsx`
  and `toast-integration.test.tsx`.
- **E2E tests** live in `e2e/tests/`. Run via `npm run test:e2e`. Firefox
  must be installed via `npx playwright install firefox`.
- **`npm run build` doubles as the import-resolution oracle:** `tsc`
  can't see inside `@ts-nocheck` files, but Vite resolves every import.
  A green build means the module graph is wired correctly.

## Known debt (tracked, do not silently grow)

1. **Type-debt ledger:** 143 files (as of 2026-08-30) carry a first-line
   `// @ts-nocheck`. That's down from 153 at audit. Removing a header
   means fixing that file's errors — verify with `npm run typecheck`.
   Burn-down is ongoing; don't add new headers.
   ESLint auto-detects ledger files at config load and relaxes only
   mechanical rules for them, so deleting a header also tightens lint
   on that file.
2. **Lint warnings:** ~552 (mostly `no-explicit-any`). `lint:strict`
   (with `--max-warnings 0`) is the aspirational goal — gated on the
   debt burn-down.
3. **E2E:** Playwright specs exist under `e2e/` but some are also picked
   up by vitest (the vitest config excludes them). Firefox binary must
   be installed via `npx playwright install firefox`.

## Codegen (leagues → constants)

`scripts/gen_leagues.js` writes to stdout; pipe to `leagues_output.txt`
(gitignored), then `scripts/update_constants.cjs` regex-patches the
`LEAGUE_CONFIGS` block in `src/features/social/constants.ts`.
A re-run should produce a no-op diff apart from a known cosmetic `;;`
quirk — revert cosmetic churn.

## Deployment (dual-target, both kept)

- `netlify.toml` and `vercel.json` are both intentional. Do not remove either.
- Supabase migrations live under `supabase/migrations/`; Edge Functions
  under `supabase/functions/`.
- Secrets for Edge Functions are set via `supabase secrets set KEY=value`,
  not via `.env`.

## Conventions

- **Conventional Commits** (`<type>(<scope>): <summary>`). Phase-per-commit
  on `develop`; one-commit-per-PR on `main`.
- **Branch structure:** `main` (stable) ← short-lived `<type>/<name>` branches.
- **Imports** use the `@/` alias; relative `../..` chains inside features
  are avoided.
- **Pre-commit hook** runs Prettier on staged files. Installed via
  `npm run prepare` (Husky 9).

## Where to look first

| I want to… | Go here |
|---|---|
| Add a new domain feature | copy `src/features/today/` and update its `index.ts` barrel |
| Add a new env var | `src/lib/env.ts` + `.env.example` |
| Change auth flow | `src/lib/auth/` + `supabase/functions/auth-gateway/` |
| Add an integration | `src/features/integrations/` + new `<provider>/` client |
| Add a store | `src/store/` (global) or `src/features/<name>/store/` (domain) |
| Add a route | `src/pages/` + register in `src/App.tsx` |
| Add a UI primitive | `src/shared/ui/` |
| Debug a flaky test | `src/test/setup.ts` + Vitest config |

## Out of scope (this repo)

- The Android Capacitor project under `android/` pins SDK / Build Tools
  versions in `variables.gradle`. Any Android-side SDK bump is its own
  workstream — coordinate before touching it.
- The static landing page under `landing_page/` is built separately and
  doesn't share code with the main app.
- iOS / iPad builds are not configured. Capacitor supports them, but we
  haven't set up the signing or provisioning.