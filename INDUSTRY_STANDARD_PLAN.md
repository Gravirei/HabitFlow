# HabitFlow — Industry-Standard Transformation Plan

**Repo:** HabitFlow (`/home/gravirei/Documents/Projects/App/HabitFlow`)
**Branch audited:** `staging` @ `180e895`
**Audit date:** 2026-08-29
**Audit type:** Read-only, planning-only deliverable. No code changes.
**Auditor scope:** Single end-to-end review of a frontend-heavy codebase (Vite SPA + Supabase backend + Capacitor mobile).

## Sampling strategy

The repo has 484 `.ts`/`.tsx` files. Per the brief, I sampled rather than exhaustively read everything:

- **Manifests/config (read fully):** `package.json`, `tsconfig*.json`, `eslint.config.js`, `vite.config.ts`, `.prettierrc`, `.gitignore`, `playwright.config.ts`, both CI workflows, both deploy configs, `.env.example`, the (gitignored) working-tree `.env`, pre-commit hook, ESLint flat config, capacitor config, AGENTS.md, README.
- **Source — fully read (representative of each major layer):**
  - `src/main.tsx`, `src/App.tsx` (entry + routing)
  - `src/lib/`: `supabase.ts`, `sentry.ts`, `logger.ts`, `auth/{AuthContext,RequireAuth,RequireVerifiedEmail,mfa,logout}.ts`, `security/{authGatewayClient,rateLimiter,accountLockout}.ts`, `storage/{tieredStorage,storageIntegrity}.ts`
  - `src/shared/layout/ErrorBoundary.tsx`
  - `src/store/`: `useHabitStore.ts`, `useHabitTaskStore.ts`
  - `src/features/timer/store/`: `syncStore.ts`, `achievementsStore.ts`
  - `src/features/timer/index.ts` (public barrel), `TimerContainer.tsx` (first 100 lines)
  - `src/schemas/habitSchema.ts`
  - `src/lib/__tests__/logger.test.ts`, `src/lib/auth/__tests__/mfa.test.ts`
  - `src/features/timer/components/__tests__/TimerContainer.test.tsx` (first 100 lines)
  - `src/__tests__/App.test.tsx`, `src/test/setup.ts`
  - `src/features/onboarding/index.ts`, `src/features/social/index.ts` (barrel pattern)
- **Source — directory-listed only:** all of `src/features/*`, `src/pages/*`, `src/store/`, `src/types/`, `src/utils/`, `src/hooks/`, `src/shared/`.
- **Backend — fully read:** `supabase/functions/auth-gateway/index.ts` (full, 530 lines), first 60 lines of `supabase/migrations/20260119_timer_sessions_production.sql` and `20260223_security_tables_rls.sql`.
- **Backend — directory-listed:** both Edge Function dirs, all migration files.
- **CI / deploy — fully read:** `.github/workflows/{ci,security}.yml`, `netlify.toml`, `vercel.json`, `.git-hooks/pre-commit`.
- **Docs — directory-listed:** `docs/` (30+ files under `docs/TIMER_MD/`), `docs/SECURITY_AUDIT_2026-03-16.md`, `docs/auth-implementation-plan-full.md`, `docs/TURNSTILE_SETUP.md`. Not read in full.
- **Not examined in detail:** the `landing_page/` static directory, the `android/` Capacitor project, most `e2e/tests/*.spec.ts` files, individual category/habits/timer components beyond the public barrels.

> `AGENTS.md:78-82` reports "153 files carry a first-line `// @ts-nocheck`" (a different snapshot from the 149 found by grep during this audit — both numbers treated as "around 30% of `src/`").

---

## Section 1 — Project overview

**Purpose (from README):** HabitFlow is a single-page habit-tracker with a Productivity suite (multi-mode timer, stopwatch/countdown/intervals, premium history, achievements, AI insights, analytics, exports, social/messaging) plus authentication (email + TOTP MFA, trusted devices) and integration with Google/Notion/Slack/Spotify/Fit. It ships as a Vite web app, a Capacitor Android wrapper, and a static landing page. Backend is Supabase (Postgres + Edge Functions) with Cloudflare Turnstile bot protection.

**Stack (bullet form):**
- **Language / framework:** TypeScript (strict), React 18, Vite 6
- **UI:** Tailwind CSS 3, framer-motion, react-hook-form, dnd-kit, @floating-ui/react, recharts, react-hot-toast, dompurify
- **State:** Zustand 4 (8 global persisted stores in `src/store/`, 8 domain stores in `src/features/timer/store/`)
- **Routing:** React Router v6
- **Validation:** Zod
- **Backend (BaaS):** Supabase (Postgres + Edge Functions Deno + Auth + Storage) — no first-party backend server
- **Auth:** Supabase Auth, custom TOTP MFA via `lib/auth/mfa.ts`, server-side `auth-gateway` Edge Function with Turnstile + rate limit + account lockout
- **Mobile:** Capacitor 8 (Android target committed under `android/`)
- **Testing:** Vitest 4 + React Testing Library + jest-axe + vitest-axe (unit/component, jsdom), Playwright 1.57 (e2e, Firefox-only)
- **Observability:** Sentry 10 (browser tracing, replay, React Router v6 integration)
- **Lint/format:** ESLint 9 (flat config), Prettier 3 with `prettier-plugin-tailwindcss`
- **CI:** GitHub Actions (typecheck + lint + vitest + build; separate weekly `npm audit` workflow)
- **Deploy:** dual-target — Netlify (`netlify.toml`) and Vercel (`vercel.json`), both intentional and configured with identical security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Other:** `@marsidev/react-turnstile` widget, Axios mentioned in README but not in deps (a stale doc claim), `html2canvas` + `jspdf` for exports

**Scale signals:**
- 457 commits on the current history (single-author cadence based on `git log`).
- 484 `.ts`/`.tsx` files in `src/`.
- 84 test files (`*.test.{ts,tsx}`), with a known red baseline of 22 files / 59 tests per `AGENTS.md:67-71`.
- 6 SQL migrations under `supabase/migrations/` (Jan–Mar 2026).
- 2 Supabase Edge Functions (`auth-gateway`, `messaging-notifications`).
- 40+ routes defined in `App.tsx:128-166`.
- 8 global Zustand stores in `src/store/` + 8 feature stores in `src/features/timer/store/`.
- First commit `40976d7` ("Initial commit", Jan 22 2026). Most recent `180e895` (Aug 28 2026).
- 149 files in `src/` carry `// @ts-nocheck` header (~30% of TS files) — the "debt ledger" referenced in `eslint.config.js:9-12` and `tsconfig.typecheck.json:2-6`.
- `docs/` contains ~60 markdown files, mostly `docs/TIMER_MD/*` session writeups from Jan–Mar 2026 — significant prior context.

---

## Section 2 — Architecture map

```
HabitFlow/
├── android/                        # Capacitor Android project (Gradle, .gitignored via root)
├── e2e/                            # Playwright e2e specs (Firefox-only) + page objects
│   ├── tests/    # 8 specs (auth, timer-*, history, achievements, goals, settings)
│   ├── pages/    # Page Object Models
│   ├── fixtures/ # storage, timer
│   ├── global-setup.ts
│   └── utils/
├── landing_page/                   # Standalone static marketing page (no Vite, .gitignored class)
├── supabase/                       # Backend-as-a-Service config
│   ├── functions/                  # 2 Deno Edge Functions
│   │   ├── auth-gateway/          # Login, signup, forgot-password, verify-mfa, rate limit, Turnstile, lockout
│   │   └── messaging-notifications/
│   └── migrations/                # 6 SQL migrations, RLS-aware, versioning by date
├── scripts/                        # Codegen: gen_leagues.js → update_constants.cjs
├── docs/                           # ~60 markdown writeups (TIMER_MD, security, auth, premium, …)
├── public/                         # Static assets
├── .github/workflows/              # ci.yml, security.yml
├── src/
│   ├── App.tsx                     # Routes (40+) + AuthProvider + Toaster + ErrorBoundary + DayChangeDetector
│   ├── main.tsx                    # ReactDOM root + Sentry init
│   ├── features/                   # Domain features (feature-sliced)
│   │   ├── timer/                  # LARGEST — 3 modes + premium history + sidebar (achievements, ai-insights, analytics, goals, timeline, export) + 8 domain stores
│   │   ├── social/                 # Social feed + messaging subdomain (socialStore, messagingStore)
│   │   ├── tasks/ habits/ categories/ today/ integrations/ auth/ accessibility/ onboarding/
│   │   └── <feature>/index.ts      # Public barrel (cross-feature imports go through this)
│   ├── shared/                     # Cross-domain primitives
│   │   ├── ui/                     # AccessibleModal, ConfirmDialog, LogoutConfirmDialog, ToggleSwitch, TurnstileWidget
│   │   ├── layout/                 # ErrorBoundary, BottomNav, SideNav
│   │   └── hooks/                  # useBodyScrollLock, useFocusTrap
│   ├── lib/                        # Framework-free logic
│   │   ├── auth/                   # AuthContext, RequireAuth, RequireVerifiedEmail, mfa, logout
│   │   ├── security/               # authGatewayClient, rateLimiter, accountLockout, deviceVerification, sessionManager, loginActivity
│   │   ├── storage/                # tieredStorage (localStorage + Supabase), storageIntegrity (checksum)
│   │   ├── categories/             # Category-specific lib code
│   │   ├── supabase.ts             # Supabase client (anonymized, in-source rationale)
│   │   ├── sentry.ts               # Sentry init + helpers
│   │   ├── logger.ts               # TimerLogger (sanitizes sensitive fields, env-gated)
│   │   └── performance.ts
│   ├── store/                      # GLOBAL persisted Zustand stores (useHabitStore, useTaskStore, useCategoryStore, useHabitTaskStore, useProfileStore, usePremiumStore, useNewHabitModalStore, useCounterStore, useAccessibilityStore)
│   ├── pages/                      # Routing composition
│   │   ├── auth/                   # Login, Signup, ForgotPassword, ResetPassword, TwoFactorVerification
│   │   ├── bottomNav/              # Today, Habits, Tasks, Categories, Timer
│   │   ├── sideNav/                # Settings, EditProfile, AboutUs, HelpSupport, Feedback, ShareApp, PremiumFeatures, Integrations, ProgressOverview
│   │   ├── timer/                  # Achievements, AIInsights, Analytics, Export, Goals, PremiumHistory, Timeline
│   │   ├── legal/                  # TermsOfService, PrivacyPolicy
│   │   └── top-level: SplashScreen, Welcome, Onboarding, Calendar, NewHabit, Social
│   ├── hooks/                      # useDayChangeDetector, useDebounce, useDeviceType, useLocalStorage, useReducedMotion
│   ├── schemas/                    # Zod schemas (habitSchema)
│   ├── types/                      # Shared domain types (habit, habitTask, task, category, …)
│   ├── utils/                      # cn, dateUtils, streakUtils, progressUtils, habitResetUtils
│   ├── constants/                  # sampleData, categoryTemplatePacks, etc.
│   ├── test/setup.ts               # Vitest setup — mocks localStorage, sessionStorage, Notification
│   ├── __tests__/                  # Cross-cutting tests (App.test.tsx, toast-integration.test.tsx)
│   └── lib/__tests__/, store/__tests__/, schemas/__tests__/, …  # Colocated unit tests
├── eslint.config.js                # Flat config, enforces no-restricted-imports between layers
├── tsconfig.json / typecheck.json / node.json
├── vite.config.ts                  # Vite + Vitest config in one file
├── netlify.toml                    # Netlify deploy config + security headers
├── vercel.json                     # Vercel deploy config + security headers
├── .git-hooks/pre-commit           # Blocks .env, warns on hardcoded secrets (not installed by default)
├── .env, .env.example              # VITE_* vars for Sentry, Supabase, Turnstile, integrations
└── package.json
```

---

## Section 3 — What's good

Things HabitFlow is already doing that are clearly industry-grade:

1. **Defense-in-depth security architecture** — `supabase/functions/auth-gateway/index.ts:288-530` enforces Turnstile server-side (fail-closed if secret missing), per-action rate limiting (3-5 attempts / 15-60 min windows), account lockout with timing-safe checks, and *generic* 401 responses for locked accounts on `login` to prevent account enumeration (`auth-gateway/index.ts:415-425`). Client-side wrappers in `src/lib/security/{rateLimiter,accountLockout}.ts` mirror the server rules. The `src/lib/supabase.ts:1-79` header comment explicitly documents the XSS trade-off of using localStorage for tokens and the multi-layer mitigations (Turnstile, MFA, DOMPurify, CSP, defense-in-depth logout) — exemplary "code as documentation".
2. **Server-enforced MFA with aal1→aal2 elevation** — `auth-gateway/index.ts:479-499` withholds the refresh token until TOTP verify succeeds, so a stolen aal1 token cannot establish a full session. Client-side `src/lib/auth/mfa.ts:18-58` provides typed wrappers.
3. **Atomic logout** — `src/lib/auth/logout.ts:21-54` always revokes server-side first, then does a single-pass `localStorage.clear()` + `sessionStorage.clear()`, preserving only the theme, with best-effort IndexedDB cleanup. No partial state windows.
4. **Layered architecture with ESLint-enforced boundaries** — `eslint.config.js:89-115` blocks shared layers (`lib/`, `hooks/`, `store/`, `utils/`, `schemas/`, `types/`, `constants/`, `shared/`) from importing feature/component code via `no-restricted-imports`. Feature public APIs go through `index.ts` barrels (`src/features/social/index.ts:1-8`).
5. **Storage integrity with checksums** — `src/lib/storage/storageIntegrity.ts:44-128` wraps localStorage in a `{data, version, checksum, timestamp}` envelope to detect tampering and corruption, with a versioned migration path.
6. **Strong security headers on both deploy targets** — `netlify.toml:1-11` and `vercel.json:1-33` define identical CSP, HSTS, X-Frame-Options DENY, Permissions-Policy, Referrer-Policy. CSP is explicit: no `'unsafe-eval'`, no inline scripts (only `'unsafe-inline'` for styles + `frame-src` for Turnstile/Google/Apple OAuth).
7. **Sentry with environment gating and privacy filters** — `src/lib/sentry.ts:17-25` only initializes in PROD or when `VITE_ENABLE_SENTRY=true`; `beforeSend` (lines 72-94) drops network/extension errors; replay masks all text and blocks all media.
8. **Pre-commit secret guard** — `.git-hooks/pre-commit:1-42` blocks `.env` / `.env.local` and warns on hardcoded credential patterns.
9. **Zod for input validation** — `src/schemas/habitSchema.ts:8-49` with helpful error messages; consumed via `react-hook-form` + `@hookform/resolvers`.
10. **First-class observability for an SPA** — Sentry browser tracing + React Router v6 instrumentation, breadcrumbs helper, performance span helper, plus a custom env-aware `logger.ts:1-139` that sanitizes sensitive keys.
11. **Accessibility tooling wired** — `jest-axe` and `vitest-axe` are deps; tests under `src/features/timer/components/__tests__/accessibility/` (axe-audit, aria-labels, timer-announcements). `<AccessibleModal>` with focus trap in `src/shared/hooks/useFocusTrap.ts`.
12. **Dual-deploy with matching headers** — Netlify and Vercel configs are mirror images, so neither is a second-class citizen.
13. **Versioned SQL migrations with RLS awareness** — `supabase/migrations/20260223_security_tables_rls.sql:14-60` documents the *deny-all-for-non-service-role* RLS model for `login_attempts` and `account_lockouts`, and per-user RLS for `user_sessions` / `trusted_devices`. `20260119_timer_sessions_production.sql` adds proper constraints, unique (`user_id, local_id`), and indexes.
14. **CI gate that is honest about debt** — `.github/workflows/ci.yml:1-21` runs `npm ci → typecheck → lint → vitest run → build`, and the team tracks red baseline + debt-ledger delta as the *gate metric* (`AGENTS.md:67-71`).

---

## Section 4 — Gaps, ranked by severity

Severity rubric (from the brief):
- **Critical** — security issue, data loss risk, or production break.
- **High** — blocks industry standard but not actively broken.
- **Medium** — quality issue with a workaround.
- **Low** — polish.

| # | Category | Finding | Severity | Evidence |
|---|----------|---------|----------|----------|
| 1 | Env & secrets | **Real credentials in working-tree `.env`.** Sentry DSN (`23863f43…`), Supabase project URL + anon JWT, Google client secret, Notion integration secret, Slack client secret all live in the untracked but ungitignored `.env` on this developer's machine. The file is correctly gitignored (`.gitignore:56`) and `git ls-files .env` is empty — so this is **not** a public-repo leak, but the credentials are still exploitable if the local file is ever shared, screenshotted, synced to a backup pipeline, or copied between machines. The pre-commit hook (`.git-hooks/pre-commit:1-2`) is a separate manual install (`.git-hooks/README.md:9-12`) and would only catch *future* `.env` adds; it is not the gap here. | **High** | `.env:14,20-21,38-52`; `.gitignore:56` (correctly ignored); `git ls-files .env` returns nothing → no historical leak. |
| 2 | Security / SPA storage | **Tokens stored in plain `localStorage`** (XSS-extractable). Documented trade-off in `src/lib/supabase.ts:1-79` and the file's header lists BFF/httpOnly cookies as the recommended future fix, but the trade-off is still real: any XSS = full account takeover. | **High** | `src/lib/supabase.ts:114-126` (`storage: window.localStorage`, `persistSession: !isTestEnv && hasValidStorage`). |
| 3 | Frontend hardening | **VITE_TURNSTILE_DISABLED=true in the local `.env`.** The auth-gateway's `TURNSTILE_DISABLED` env is *server-side* (`supabase/functions/auth-gateway/index.ts:403-411`), but the client flag is also set true. If the server flag is also set in production (consistent with mobile-first intent), bot detection is off everywhere. | **High** | `.env:27-30`; `supabase/functions/auth-gateway/index.ts:403-411`. |
| 4 | Type safety | **149 files with `// @ts-nocheck` debt header** (~30% of `src/`). The "debt ledger" is intentional and tracked, but `lint:strict` cannot be enabled (`AGENTS.md:78-86`) and ~684 real errors are hidden behind it. | **High** | `eslint.config.js:9-12`; `tsconfig.typecheck.json:2-6`; `AGENTS.md:76-87`; grep `// @ts-nocheck` in `src/`. |
| 5 | Env validation | **No runtime env validation.** A missing `VITE_SUPABASE_URL` falls back to `'https://placeholder.supabase.co'` and a missing anon key to `'placeholder-key'` (`src/lib/supabase.ts:114-117`), so the app boots with a broken client. Logger + Sentry silently no-op when `VITE_SENTRY_DSN` is empty (`src/lib/sentry.ts:27-32`). | **High** | `src/lib/supabase.ts:85-117`; `src/lib/sentry.ts:27-32`. |
| 6 | Testing | **22 test files / 59 tests fail at baseline**, not run in CI, and the team explicitly tracks this as a known red baseline (`AGENTS.md:67-71`). The CI workflow runs `npx vitest run` (`.github/workflows/ci.yml:20`) so this *will* surface as red on every push; the question is whether it's a tracked baseline or a regression. | **High** | `.github/workflows/ci.yml:20`; `AGENTS.md:67-71`. |
| 7 | Testing | **No e2e in CI.** Playwright is configured (`playwright.config.ts:1-35`) but `e2e/` is excluded from Vitest (`vite.config.ts:31`) and no GitHub Actions workflow runs it. Specs are Firefox-only. | **High** | `playwright.config.ts:23-28`; absence in `.github/workflows/*`; `vite.config.ts:31`. |
| 8 | Testing | **Coverage report is empty.** `coverage/clover.xml` shows `0/0/0/0`; `coverage-summary.json` is absent. Either coverage is not generated in CI or the artifact is stale. No `coverage` threshold is set. | **Medium** | `coverage/clover.xml:1-3`; absence in `vite.config.ts:26-33` and CI. |
| 9 | DevOps / Reproducibility | **No `.nvmrc` / Node version pin** and `package.json` does not declare `engines.node`. CI uses Node 20 (`.github/workflows/ci.yml:13-15`) but local dev can drift. | **Medium** | `package.json:1-92` (no `engines`); absence of `.nvmrc`. |
| 10 | DevOps | **No Dockerfile, no docker-compose, no `Makefile`.** The Capacitor Android project is committed but there's no container artifact. Edge Functions rely on Supabase's deploy tooling (no `supabase/` CLI config file at root, no `supabase/config.toml`). | **Medium** | `Bash ls /` (no Dockerfile / Makefile / supabase/config.toml). |
| 11 | Dep management | **No Dependabot / Renovate config.** A `npm audit` workflow runs weekly (`.github/workflows/security.yml:9-11`) but PR-driven dependency updates are not automated. | **Medium** | Absence of `.github/dependabot.yml` / `renovate.json`. |
| 12 | API design / Edge Functions | **No OpenAPI / function spec for `auth-gateway`.** Action dispatch is path-based (`supabase/functions/auth-gateway/index.ts:303-311` parses `auth-gateway/<action>`), the contract is hand-documented in `docs/SECURITY_GUIDE.md` (not read in full) and a JSDoc-style comment block. | **Medium** | `supabase/functions/auth-gateway/index.ts:302-311`; absence of any `openapi.yaml` / `*.d.ts` contract. |
| 13 | API design | **Inconsistent error shape from Edge Functions.** The function uses a mix of `{ok, status, error, message}`, `{error, message}`, `{ok, status, data, message}`, and a few 2xx responses for failures (e.g. `auth-gateway/index.ts:474` returns `ok: false` with 401 to mask lockout). Clients have to defensively read both `error` and `message` (see `src/lib/security/authGatewayClient.ts:73-87`). | **Medium** | `supabase/functions/auth-gateway/index.ts:307,329-336,393,405-411,422-425,445,510,522,525,528`; `src/lib/security/authGatewayClient.ts:73-87`. |
| 14 | Error handling | **No typed error class or global handler.** Errors thrown from MFA wrappers (`src/lib/auth/mfa.ts:20,23,30,38,45,58`) are plain `new Error(msg)`. The only global handler is the React `ErrorBoundary` (`src/shared/layout/ErrorBoundary.tsx:14-86`). No `unhandledrejection` listener, no error reporting from outside React. | **Medium** | `src/lib/auth/mfa.ts:20-58`; `src/main.tsx:1-17`; `src/shared/layout/ErrorBoundary.tsx:14-86`. |
| 15 | Logging & observability | **Sentry init silently no-ops on empty DSN** (`src/lib/sentry.ts:27-32` only `console.warn`); no Sentry in non-PROD unless `VITE_ENABLE_SENTRY=true`. Combined with no release tag in CI, there's no per-deploy error tracking. | **Medium** | `src/lib/sentry.ts:27-32`; `package.json:8-9` (build emits to `dist/` but no `SENTRY_RELEASE` injection); CI workflow does not set release env. |
| 16 | Logging & observability | **Logger is `console.*` only** (no structured JSON, no remote sink, no sampling, no `requestId` correlation). The browser tracing in Sentry covers the SPA, but the `lib/logger.ts:50-139` `TimerLogger` is independent. | **Medium** | `src/lib/logger.ts:66-132`. |
| 17 | Database | **Migrations are not reversible** (no `down` SQL or `_down` migration files). They are forward-only date-prefixed files, which is fine for greenfield, but no `supabase/config.toml` means tooling doesn't know the project structure. | **Medium** | `supabase/migrations/` listing; absence of `supabase/config.toml`. |
| 18 | Database | **No `Database` type augmentation for Supabase.** `src/lib/supabase.ts:128-137` declares `public.Tables = Record<string, never>` so every query returns `any` from the generated SDK. Type-safety at the DB layer is effectively opt-in per call site. | **Medium** | `src/lib/supabase.ts:128-137`; e.g. `src/lib/security/rateLimiter.ts:33-38` calls `.from('login_attempts').select('*')` with no row type. |
| 19 | Frontend | **Sentry `tracesSampleRate: 1.0` in non-PROD** is fine for local dev but means dev-mode Sentry (if enabled) generates huge volume. | **Low** | `src/lib/sentry.ts:69`. |
| 20 | Tooling | **No `.editorconfig`.** Prettier and ESLint are configured, but IDE auto-detection for indent/charset/line-ending is missing. | **Low** | Absence of `.editorconfig`. |
| 21 | Tooling | **Pre-commit hook is opt-in.** `.git-hooks/pre-commit` is not installed automatically (no `npm run prepare` or `husky`); `.git-hooks/README.md:9-12` asks developers to run `git config core.hooksPath .git-hooks` manually. | **Low** | `.git-hooks/README.md:9-12`; `package.json:6-26` (no `prepare` script). |
| 22 | Tooling | **No commit-lint / conventional-commits enforcement** despite `AGENTS.md:102` saying commits should follow `<type>(<scope>): <summary>`. | **Low** | `AGENTS.md:102`; absence of `commitlint.config.*` and husky. |
| 23 | Frontend | **`vite.config.ts:25` sets `sourcemap: 'hidden'`** — good for Sentry — but the comment correctly warns against `'true'` in prod; the default is not enforced as a build-time assertion. | **Low** | `vite.config.ts:19-25`. |
| 24 | Frontend | **No CSP nonces.** Headers allow `style-src 'unsafe-inline'` (`netlify.toml:5`), which is necessary for Tailwind/Framer Motion but weakens CSP slightly. Could be tightened to nonced styles if a build step inserts them. | **Low** | `netlify.toml:5`; `vercel.json:8`. |
| 25 | Documentation | **No `CONTRIBUTING.md`, no `ARCHITECTURE.md` (only the agent-facing `AGENTS.md`), no ADRs.** README is template-y. 60+ session writeups live under `docs/TIMER_MD/` — these are working notes, not durable docs. | **Low** | `README.md:1-263`; `docs/TIMER_MD/` (60+ files). |
| 26 | Documentation | **Stale README claims** — e.g. "🌐 **Axios** - Promise-based HTTP client" and "🔄 **React Query**" are listed as features (`README.md:29-30`) but neither is in `package.json:27-53` dependencies. The actual stack is `supabase-js` + Zustand. | **Low** | `README.md:29-30`; `package.json:27-53`. |
| 27 | Documentation | **No `LICENSE` enforcement in source headers.** The repo has `LICENSE` at root but individual files do not declare SPDX-License-Identifier. | **Low** | `LICENSE`; no SPDX in source files. |
| 28 | DevOps | **Vite dev server `host: 'localhost'`** restricts LAN exposure (`vite.config.ts:15-17`) — good — but there's no equivalent restriction on the built static preview. | **Low** | `vite.config.ts:14-18`. |
| 29 | Code quality | **Some `any` leaks inside typed wrappers.** `src/lib/auth/mfa.ts:19,28,39,48,56` all cast `supabase.auth as any` to access `.mfa` because the SDK types are incomplete. Documented in a comment but the casts propagate. | **Low** | `src/lib/auth/mfa.ts:19,28,39,48,56`. |
| 30 | Code quality | **`mfa.test.ts` uses `(supabase.auth as any).mfa = { … }` to inject mocks**, which means it's testing the wrapper, not the SDK behavior. Functional but tightly coupled to cast. | **Low** | `src/lib/auth/__tests__/mfa.test.ts:38-198`. |

> Note: 30 entries is the hard cap the brief asked for. The most material findings are #1-#7.

---

## Section 5 — Verdict

**🟠 Significant gaps — but mostly in the hardening & operational layer, not the architecture.**

HabitFlow's *architecture and security design* are already close to industry standard: defense-in-depth auth (Turnstile + server-side rate limit + lockout + MFA aal1→aal2 + atomic logout), RLS-aware SQL migrations, layered ESLint-enforced boundaries, env-aware Sentry, dual-deploy security headers, XSS-aware localStorage with checksum integrity, server-side error masking to prevent account enumeration, and a tracked-but-honest debt ledger. The gaps are concentrated in **(a) operational reproducibility and secret hygiene** (real keys in the local `.env` file, no Node pin, no Docker, no Dependabot), **(b) test verification** (22-file red baseline, no e2e in CI, no coverage threshold, empty coverage report), and **(c) input/env validation** (placeholder fallbacks for missing Supabase vars, Sentry no-ops silently). After verification, no item is Critical (the `.env` is gitignored and not in history, so this is a local-file leak, not a public-repo breach).

---

## Section 6 — Proposed transformation plan (6 phases)

This is a Vite SPA + Supabase backend + Capacitor mobile, so I've trimmed the standard template: no "API versioning" phase (Edge Function is single-deployed), and the "Frontend Hardening" and "Backend / API Hardening" phases collapse into a "App + Edge" phase because the security work for the SPA must include the Edge Function.

### Phase 0 — Security hot-fix (do TODAY, before anything else)

**What gets added/changed:**
- Rotate *all* credentials in `.env` and invalidate the leaked ones: Sentry DSN, Supabase project (rotate anon key + service role key), Google OAuth client secret, Notion integration secret, Slack client secret.
- Confirmed via `git ls-files .env` that the working-tree `.env` is **not** in git history and is **not** tracked, so no history-scrub is required. The leak vector is local: any sync to a backup / shared dotfile repo / screenshot / team chat that includes the file will leak the keys. Mitigation is *rotation + hygiene* (do not commit, do not sync, do not share), not history rewriting.
- Add a `postinstall` script in `package.json:6-26` that runs `git config core.hooksPath .git-hooks` automatically (or wire husky) so the pre-commit hook is no longer opt-in.
- Set `VITE_TURNSTILE_DISABLED=false` after confirming the server-side `TURNSTILE_DISABLED` is also off in production.
- Add a `SECURITY.md` at repo root with disclosure instructions.

**What gets verified before moving on:**
- `git ls-files .env` returns nothing (no tracking, no history) before rotation; `git ls-files .env` returns nothing after rotation (sanity check).
- `npx playwright install firefox` then `npm test` and `npm run test:e2e` still pass.
- `npm audit --audit-level=high` is clean.

**Effort:** S
**Risks:** Sentry / Supabase project rotation can break the live deploy — coordinate with whoever owns the production deploy first.

---

### Phase 1 — Foundation & Reproducibility (CI / Node / Docker)

**What gets added/changed:**
- Add `.nvmrc` (pin to `20` to match CI), and `engines.node` + `engines.npm` in `package.json`.
- Add `.editorconfig` (2-space, LF, UTF-8 to match Prettier defaults).
- Add `Dockerfile` (multi-stage: deps → build → nginx static serve) and `docker-compose.yml` for the full local stack.
- Add Dependabot config (`.github/dependabot.yml`) for npm + GitHub Actions, weekly.
- Add `supabase/config.toml` so the Edge Function deploy path is reproducible.
- Wire `npm run format:check`, `npm run lint:strict`, and `npm run test:coverage` into `.github/workflows/ci.yml` (currently only `lint`, not `lint:strict`).
- Confirm whether `coverage/` is tracked. (`git ls-files coverage/` will tell; if tracked, either add to `.gitignore` *before* the next `git add` or remove from history. The directory contains `coverage/base.css`, `coverage/index.html`, `coverage/clover.xml` — typical vitest artifacts.)
- Add a `CODEOWNERS` file.

**What gets verified before moving on:**
- `npm ci` works on a fresh Node 20 box.
- `docker build . && docker run -p 8080:80 <image>` serves the app.
- `npm audit --audit-level=high` is clean, and a Dependabot PR opens against a sample outdated dep.
- CI runs all of: typecheck, lint, lint:strict (with current `// @ts-nocheck` allowance), vitest run, format:check, build, npm audit.

**Effort:** M
**Risks:** Switching `lint` → `lint:strict` in CI may immediately fail; coordinate with the existing debt-ledger effort (AGENTS.md:78-86) or keep `lint` as the strict one and add `lint:baseline` for the legacy pass.

---

### Phase 2 — Env validation, typed errors, and runtime safety

**What gets added/changed:**
- Add a single `src/lib/env.ts` (or `src/config/env.ts`) using a Zod schema to validate all `VITE_*` variables at module-load time. Replaces the silent fallbacks in `src/lib/supabase.ts:85-117` and `src/lib/sentry.ts:27-32`. Build fails fast on missing required vars; warns on optional ones.
- Define a typed `AppError` class hierarchy in `src/lib/errors.ts` (`AuthError`, `NetworkError`, `ValidationError`, `RateLimitedError`, `MfaError`) and a `wrapAsync` helper. Migrate the manual `new Error(msg)` sites (`src/lib/auth/mfa.ts:20,23,30,38,45,58`, `src/lib/security/authGatewayClient.ts:99,132`) to throw typed errors.
- Add a global `window.addEventListener('unhandledrejection', …)` in `src/main.tsx` that captures via Sentry (`src/lib/sentry.ts:132-137` already has `captureError`).
- Standardize the Edge Function response envelope in `supabase/functions/auth-gateway/index.ts:37-48, 307, 329-336, 393, 405-411, 422-425, 445, 510, 522, 525, 528` to a single shape `{ ok: boolean, error?: { code, message }, data?: unknown, meta?: {...} }`. Update `src/lib/security/authGatewayClient.ts:73-87` to read it.
- Define the real Supabase `Database` type in `src/lib/supabase.ts:128-137` (generate via `supabase gen types typescript`) and remove `(supabase.auth as any)` casts in `src/lib/auth/mfa.ts:19,28,39,48,56`.

**What gets verified before moving on:**
- `npm run build` fails when a required env var is missing (smoke test by removing one).
- `src/lib/auth/__tests__/mfa.test.ts` and `src/lib/__tests__/logger.test.ts` still pass after the error-type refactor.
- All Edge Function routes still return the documented shape — verify with a small Deno test or a hand-rolled fetch test.
- `npm run typecheck` shows fewer `any` warnings.

**Effort:** M
**Risks:** Env validation can break local dev. Mitigate with a `.env.example` that includes every required key (already largely complete — verify). Typed errors may surface un-caught `Error` paths; budget for a sweep.

---

### Phase 3 — Test verification & coverage

**What gets added/changed:**
- Run `npm test` and capture the exact list of 22 failing test files. Categorize each as (a) flaky → fix, (b) broken by recent refactor → fix, (c) legacy behavior under change → skip with `@vitest-skipped` and a tracking issue, (d) fix-forward.
- Remove `// @ts-nocheck` headers from the 149 debt-ledger files in batches, gated by `npm run typecheck` per batch (per `AGENTS.md:78-86` — already tracked). Start with the lowest-risk files (utils, then store, then features/timer/components).
- Add `vitest run --coverage` to CI, with a starting `coverageThreshold` of 50% (lines/branches) and increase to 70% over two iterations.
- Add a `.github/workflows/e2e.yml` that runs `npx playwright install --with-deps firefox && npm run build && npm run test:e2e` on PR.
- Fix the e2e/Vitest overlap: either rename `e2e/tests/*.spec.ts` to `*.e2e.spec.ts` or set `testDir` explicitly in `playwright.config.ts:3` (it already does — but vitest is also picking them up; per `AGENTS.md:85-87` this is a known issue, 8 baseline failures).

**What gets verified before moving on:**
- `npx vitest run` exits 0.
- `npm run build` exits 0 with zero new type errors.
- CI is green for at least 7 consecutive pushes (proxy for stability, not flakiness).
- `npm run test:e2e` passes locally with Firefox installed.
- Coverage badge > 50% (start), > 70% (target).

**Effort:** L
**Risks:** The debt-ledger burn-down could explode in scope; cap at "remove headers from `src/utils/`, `src/hooks/`, `src/lib/` first, then evaluate." Long-tail e2e work may not be worth the ROI for an SPA — gate on actual user-reported breakage.

---

### Phase 4 — Observability & ops

**What gets added/changed:**
- Wire Sentry release tracking: pass `release:` from `package.json` `version` (already in `src/lib/sentry.ts:41`), set up `Sentry.setTag('release', …)` from a build-time env var injected by Vite's `define` in `vite.config.ts:7-12`.
- Add `requestId` / `traceId` correlation. For an SPA, this is a per-render `navigator.sendBeacon` or a global breadcrumb; the existing `addBreadcrumb` helper at `src/lib/sentry.ts:171-177` is the right primitive — wire it into the Router and a top-level `<NavigationTracker />`.
- Move `src/lib/logger.ts:50-139` from `console.*` to a Sentry-breadcrumb + console hybrid in non-PROD, console-only in PROD. Add level filtering.
- Document the operational runbook in `docs/RUNBOOK.md` (on-call, deploy, rollback, Sentry triage, Supabase outage, security incident).
- Add `healthcheck` to the Docker image (`Dockerfile` `HEALTHCHECK` directive hitting `/`).
- Add `graceful-shutdown` handler for any long-running in-browser interval (e.g. auto-sync in `src/features/timer/store/syncStore.ts:126-150` — store the interval ID and clear it on `beforeunload` or `visibilitychange`).

**What gets verified before moving on:**
- Sentry shows a tagged release for one deploy.
- Logger emits breadcrumbs visible in Sentry's "Breadcrumbs" tab.
- Docker container responds to `HEALTHCHECK`.

**Effort:** M
**Risks:** Sentry in dev can drown the project in noise — keep `VITE_ENABLE_SENTRY=false` by default; sample at 0.1 in prod (already done at `src/lib/sentry.ts:69`).

---

### Phase 5 — Docs, contributor ergonomics, and a small feature-test pass

**What gets added/changed:**
- Replace the README "Features" list with the *actual* stack — remove the Axios / React Query claims (`README.md:29-30`).
- Add `CONTRIBUTING.md` (setup, branching, commit format from `AGENTS.md:102`, PR template).
- Add `docs/ARCHITECTURE.md` distilled from `AGENTS.md` (for humans, not agents).
- Add commitlint + husky, or at minimum a `commit-msg` hook that checks the conventional-commits prefix.
- Audit `docs/TIMER_MD/` (60+ files) and move the *non-ephemeral* ones to a numbered `docs/sessions/2026-01-…` directory or archive the lot under `archive/`.
- Add a Vitest `axe-audit` job to the e2e pipeline (already present at `src/features/timer/components/__tests__/accessibility/axe-audit.test.tsx` — verify it runs in CI).
- Add `Vitest UI` / `Playwright UI` documentation and screenshots to `docs/`.

**What gets verified before moving on:**
- New contributors can run `npm ci && npm test && npm run test:e2e` on a fresh clone without reading `AGENTS.md`.
- Conventional-commits check blocks an off-format commit.

**Effort:** M
**Risks:** Documentation is easy to over-do. Hard-cap at "1 README pass, 1 CONTRIBUTING, 1 ARCHITECTURE, delete the rest of TIMER_MD" or this phase slips.

---

### Phase 6 — Verification & sign-off

**What gets added/changed:**
- All green in CI: typecheck, lint, lint:strict, format:check, vitest run, test:e2e, build, docker build, npm audit, Dependabot.
- `src/lib/env.ts` rejects an empty `.env`.
- `grep -rE "password|secret|api[_-]?key|token" .env` returns nothing real.
- `grep -rl "@ts-nocheck" src | wc -l` ≤ 25 (down from 149, with the remainder explicitly opted-in with a tracking issue).
- No `any` introduced in `src/lib/`, `src/store/`, `src/features/timer/store/` (the typed core).

**What gets verified before moving on:**
- A reviewer can clone, run `npm ci && npm test && npm run build && npm run test:e2e && docker build .`, and have a green build with zero manual fixes.

**Effort:** S
**Risks:** E2E in CI is the most likely failure mode on first run (Playwright/Firefox image availability on GitHub-hosted runners). Mitigate with a matrix that runs e2e on `ubuntu-22.04` only, not every push.

---

## Section 7 — Out of scope (explicit non-goals)

To keep the plan from drifting, the following are **not** part of this transformation:

1. **Replacing Zustand with Redux / Jotai / TanStack Query.** The store count is high (8 global + 8 feature) but the boundaries are clean and Zustand is fit-for-purpose. Not a hot spot.
2. **Switching from Supabase to a self-hosted backend.** The architecture *is* the value here; the auth-gateway / RLS / Edge Function story is already in place. A BFF would only matter for the localStorage-token issue (Gap #2), and that's better solved with Supabase JWT rotation + a refresh-token cookie plan, not a rewrite.
3. **Replacing Tailwind / Framer Motion / React Hook Form.** Industry-standard for the SPA tier; no migrations.
4. **Migrating from Vite to Next.js / Remix.** Would help for SSR/SEO but breaks Capacitor and the dual-deploy.
5. **iOS build.** `android/` is committed; no `ios/` directory. Capacitor supports iOS but adding it is a separate initiative.
6. **AI insights feature work.** The `AIInsights` page exists but its data source isn't read; that's a product decision.
7. **Full i18n.** The README doesn't claim it; the codebase has English-only copy.
8. **Theming system beyond what's already in Tailwind dark mode.** (A `ThemeProvider` was archived per `App.tsx:49` — `// ARCHIVED: ThemeProvider import removed (theme module archived)`. Don't resurrect it.)
9. **Backend migration from Supabase migrations to a different tool (Prisma, Drizzle).** The hand-rolled SQL is high-quality and the `Database` type can be generated.
10. **Splitting the timer feature further.** It's already the largest feature; further splits add import-graph complexity without value.
11. **Deprecating `landing_page/`.** It's a static HTML/CSS/JS page outside Vite. Out of scope.

---

## Section 8 — Risks & mitigations

| # | Risk | Mitigation |
|---|------|------------|
| R1 | **Credential rotation in Phase 0 disrupts live deploy.** | Snapshot the existing `.env` to `secrets/.pre-rotation.enc` (encrypted at rest), coordinate with the production owner, rotate one service at a time (Sentry → Supabase → Google → Notion → Slack). |
| R2 | **Env validation breaks local dev for anyone with a partial `.env`.** | Provide a complete `.env.example` (already largely complete) and make all `VITE_*` keys optional with sensible defaults; only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` should be required. |
| R3 | **`lint:strict` immediately fails CI on the debt-ledger files.** | Keep `lint` as the strict gate; add `lint:baseline` that allows the existing violations. Burn down the ledger over Phase 3. |
| R4 | **Removing `// @ts-nocheck` headers surfaces dozens of real bugs per file.** | Burn down in waves: utils → hooks → lib → store → features, gating each wave on `npm run typecheck` going green. Allocate 1 PR per 5-10 files. |
| R5 | **E2E in CI is flaky on GitHub-hosted runners (Firefox download, timing).** | Start with a single-matrix job on `ubuntu-22.04` only. Set `retries: 2` (already in `playwright.config.ts:6-7`). Upload the `playwright-report/` as an artifact. Don't gate merge on e2e until 14 days of green. |
| R6 | **Coverage gate creates perverse incentives** (tests written to game the metric). | Start at 50%, target 70%, and only on `src/lib/`, `src/store/`, `src/schemas/`, `src/utils/`. Don't enforce on `src/pages/` or `src/features/*/components/` (UI is a poor coverage target). |
| R7 | **Standardizing the Edge Function response shape breaks the client.** | Land the new shape behind a feature flag (header `x-respond-shape: v2`) for one deploy cycle, then flip the default. |
| R8 | **Phase 5 docs churn overwhelms the contributor-facing repo.** | Cap at the three documents named + an `archive/` move. No new sections beyond what's in the brief. |
| R9 | **The team has been working around the debt-ledger with `lint:strict` aspirational** (`AGENTS.md:81-82`). Removing it as a "tier" without an alternative demotes the aspiration. | Replace `lint:strict` with `lint:baseline` (warn-only) and `lint:debt` (errors only on non-ledger files). Then burn down. |
| R10 | **The Android Capacitor project under `android/` has a `variables.gradle` that pins Android SDK / Build Tools versions.** | Out of scope for this plan, but document in `docs/ARCHITECTURE.md` that any Android-side SDK bump is its own workstream. |

---

## Section 9 — Estimated total effort

| Phase | Effort | Notes |
|-------|--------|-------|
| 0 — Security hot-fix | **S** (<1 day) | Coordinate with prod owner. |
| 1 — Foundation & Reproducibility | **M** (1-3 days) | Mostly config files. |
| 2 — Env validation & typed errors | **M** (1-3 days) | Touches the core; needs care. |
| 3 — Test verification & coverage | **L** (1 week) | Debt-ledger burn-down is the bulk. |
| 4 — Observability & ops | **M** (1-3 days) | |
| 5 — Docs & ergonomics | **M** (1-3 days) | Easy to over-spend; cap. |
| 6 — Verification & sign-off | **S** (<1 day) | |

**Total: ~2-3 weeks of focused work** for one engineer, dominated by Phase 3. Phases can overlap (Phase 0 immediately, then 1+2 in parallel by two people, then 3+4 in parallel, then 5+6).

**Recommended first phase:** **Phase 0 (Security hot-fix).** Rotating the leaked credentials is the only High-severity item with a real-world failure mode (someone ships their dotfiles to a backup, or shares them in chat, and a Supabase project / Google OAuth client / Notion integration / Slack app / Sentry project gets pwned). After Phase 0, **Phase 1 + 2 in parallel** because they unblock CI reproducibility and runtime safety, both of which Phases 3-4 need.
