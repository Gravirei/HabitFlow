# Contributing to HabitFlow

Thanks for contributing. This document covers everything you need to make a
change and ship it.

## Quick start

```bash
# 1. Clone & install
git clone https://github.com/<org>/HabitFlow.git
cd HabitFlow
npm ci

# 2. Configure env
cp .env.example .env
# fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY at minimum

# 3. Verify the toolchain works
npm run typecheck
npm run lint
npm test
npm run build
```

If those four commands pass on a fresh clone, you're set up correctly.

## Branching

We use a simple short-lived branch flow:

- **`main`** — production. Protected. Squash-merged only.
- **`<type>/<short-kebab-description>`** — your branch, off `main`.
  - `feat/<description>` — new user-facing feature
  - `fix/<description>` — bug fix
  - `chore/<description>` — tooling, refactor, deps, docs
  - `docs/<description>` — docs-only changes
  - `refactor/<description>` — internal restructure, no behavior change

Branch names should describe the change, not the PR number.
Example: `feat/timer-interval-presets`, `fix/auth-gateway-429-on-cold-start`.

Keep branches short-lived — one PR, one concern. If a branch has been open
for more than a few days, split it up.

## Commits

We use **Conventional Commits** enforced by a pre-commit hook:

```
<type>(<scope>): <summary>

[optional body]

[optional footer(s)]
```

- **Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`, `style`
- **Scope:** the area affected, e.g. `timer`, `auth`, `lib`, `deps`, `ci`
- **Summary:** imperative mood, lowercase, no trailing period, ≤72 chars

Examples:

```
feat(timer): add interval presets to countdown mode
fix(auth): clear stale session on 401 from auth-gateway
chore(deps): bump zustand from 4.5.7 to 5.0.15
ci(workflows): enable prettier format:check on all PRs
```

The pre-commit hook runs on every commit. To skip for a one-off (rarely
needed), use `git commit --no-verify` — but mention why in the PR body.

## Pull Requests

1. **Open a PR as soon as your branch is non-empty.** Even a draft PR is
   better than working silently — CI will tell you if you're off-base.
2. **One PR = one concern.** If you find yourself writing "and also..." in
   the description, split the PR.
3. **PR title must be a conventional commit line.** It becomes the squash
   commit message on merge.
4. **PR body** — keep it short. Cover:
   - **Why** (the problem or motivation)
   - **What** (the change, at a high level)
   - **How to verify** (steps for the reviewer)
   - **Screenshots** if there's UI
5. **All CI must be green** before merge. If CI is red, fix it — don't
   merge around it.
6. **Self-review your diff** before requesting review. Run the full local
   toolchain (`typecheck`, `lint`, `test`, `build`) and paste results.

### Review expectations

- Reviewer responds within 1 business day.
- Author responds to comments within 1 business day.
- If a comment is wrong or out of scope, push back — don't silently comply.
- Use suggestions (`Add a suggestion`) for small fixes; use comments for
  anything that needs discussion.

## Code style

- **TypeScript strict mode is the law.** Don't add `@ts-nocheck` to silence
  errors — fix them. If a file is too messy, that's a debt burn-down
  task, not a reason to opt out.
- **No `any`** unless you've added a comment explaining why. ESLint will
  warn.
- **Imports use the `@/` alias.** Avoid `../../../` chains.
- **Prettier handles formatting.** Don't fight it. The `format:check` CI
  job is the source of truth.
- **ESLint flat config** — `npm run lint` runs the same rules CI runs.
  Fix warnings before pushing; the warning list should be monotonically
  shrinking, not growing.

## Testing policy

- **Unit/component tests** colocate with their subjects in `__tests__/`.
  Use `*.test.ts` / `*.test.tsx`.
- **Cross-cutting tests** live in `src/__tests__/`. Only two files
  belong there: `App.test.tsx` and `toast-integration.test.tsx`.
- **E2E tests** live in `e2e/tests/`. Run via `npm run test:e2e`.
  Playwright Firefox must be installed: `npx playwright install firefox`.
- **Known-debt baseline** — see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#known-debt-tracked-do-not-silently-grow).
  Don't introduce *new* failures; fix-forward or document.

## Where to look first

- **Architecture & dependency rules** → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **AI-agent guide** (also applies to humans) → [AGENTS.md](AGENTS.md)
- **Environment variables** → [src/lib/env.ts](src/lib/env.ts)
- **Auth flow** → `src/lib/auth/` and `supabase/functions/auth-gateway/`

## Questions?

Open a discussion or draft PR. There's no such thing as a stupid question
— there are only undocumented assumptions.