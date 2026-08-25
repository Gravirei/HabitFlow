# HabitFlow — Architecture Guide

Guide for AI agents and contributors. Read this before making structural changes.

## Stack

- **Build:** Vite 6, TypeScript (strict), React 18
- **Backend:** Supabase (auth, DB, storage)
- **State:** Zustand — global entity stores in `src/store/`, domain stores inside features
- **Styling:** Tailwind CSS
- **Mobile:** Capacitor (Android)
- **Testing:** Vitest 4 + React Testing Library (unit), Playwright/Firefox (e2e, port 3000)
- **Observability:** Sentry
- **Animation:** framer-motion

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck **then** vite build (typecheck is part of build) |
| `npm run typecheck` | `tsc -p tsconfig.typecheck.json --noEmit` |
| `npm run lint` | ESLint flat config |
| `npm run test` | Vitest (watch); `npx vitest run` for CI-style single pass |
| `npm run test:e2e` | Playwright (Firefox; requires browser install) |
| Codegen | see [Codegen](#codegen-leagues--constants) |

## Architecture

Feature-sliced layout. Domain code lives in `src/features/<domain>/`; cross-domain
primitives live in `src/shared/` and the classic shared layers (`src/lib`, `src/hooks`,
`src/store`, `src/utils`, `src/schemas`, `src/types`, `src/constants`).

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
  lib/              # framework-free logic: auth context, storage tiering, logger, security
  store/            # GLOBAL persisted entity stores (habits, tasks, categories, profile…)
  pages/            # routing composition only (bottomNav/ + sideNav/ dirs kept for history)
  hooks/ utils/ schemas/ types/ constants/
```

### Dependency rules (enforced by ESLint)

`no-restricted-imports` blocks these directions:

- `lib/`, `hooks/`, `store/`, `utils/`, `schemas/`, `types/`, `constants/`, `shared/`
  may **never** import from `@/components/*`, `@/features/*`, or their relative forms.
- Cross-feature imports go through a feature's public barrel (`@/features/<name>`
  → its `index.ts`), not deep paths.
- `src/components/` no longer exists — any `@/components/*` import is stale.

## Testing policy

- Unit tests are colocated with subjects in `__tests__/` directories.
  Only two cross-cutting files remain in `src/__tests__/`: `App.test.tsx` and
  `toast-integration.test.tsx`.
- **Known red baseline:** 22 test files / 59 tests fail at baseline (flaky
  Categories suites under parallel load, e2e specs collected by vitest,
  legacy timer error-path tests). Structural work is gated on *delta*: never
  introduce a NEW failure; fix-forward or document.
- `npm run build` doubles as the import-resolution oracle: tsc cannot see
  inside `@ts-nocheck` files, but vite resolves every import.

## Known debt (tracked, do not silently grow)

1. **Type-debt ledger:** 153 files carry a first-line `// @ts-nocheck`
   (~684 real errors behind them: missing imports, unused vars, implicit anys).
   Removing a header means fixing that file's errors — verify with
   `npm run typecheck`. Burn-down is ongoing; don't add new headers.
   ESLint auto-detects ledger files at config load and relaxes only mechanical
   rules for them, so deleting a header also tightens lint on that file.
2. **Lint warnings:** ~552 (mostly `no-explicit-any`). `lint:strict` is aspirational.
3. **E2E:** Playwright specs exist under `e2e/` but are also picked up by vitest
   (8 baseline suite failures). Firefox binary must be installed via
   `npx playwright install firefox`.

## Codegen (leagues → constants)

`scripts/gen_leagues.js` writes to stdout; pipe to `leagues_output.txt`
(gitignored), then `scripts/update_constants.cjs` regex-patches the
`LEAGUE_CONFIGS` block in `src/features/social/constants.ts`.
A re-run should produce a no-op diff apart from a known cosmetic `;;` quirk —
revert cosmetic churn.

## Deployment (dual-target, both kept)

- `netlify.toml` and `vercel.json` are both intentional. Do not remove either.

## Conventions

- Conventional Commits (`<type>(<scope>): <summary>`), phase-per-commit on `develop`.
- Branch structure: `main` (stable) ← `develop` (integration).
- Imports use the `@/` alias; relative `../..` chains inside features are avoided.
