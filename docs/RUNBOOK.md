# HabitFlow — Operational Runbook

This document is for whoever is paged when something goes wrong in production.
It's deliberately short and procedural. If a procedure here is wrong or
missing, fix it — don't grow this file.

## Contacts

- **Repo:** https://github.com/Gravirei/HabitFlow
- **Owner:** see `package.json` `homepage` / CODEOWNERS (if present)
- **Supabase project:** see Netlify/Vercel env vars

## Service map

| Component | Where it runs | URL |
|---|---|---|
| Web app (SPA) | Netlify + Vercel (dual-target) | production hostname |
| Backend | Supabase (Postgres + Edge Functions) | `*.supabase.co` |
| Error monitoring | Sentry | sentry.io |
| Bot protection | Cloudflare Turnstile | cloudflare.com |
| Container | `nginx:1.27-alpine` serving `dist/` | port 80 |

The web app is a static bundle. There is **no Node server** in production
to debug — the container only serves static files and proxies nothing.

## Common scenarios

### Sentry spike

1. Open Sentry → Issues → sort by `events` in the last 1h.
2. Click the top issue. Check the **Tags** tab:
   - `release` — which version is affected? Check whether `main` HEAD
     matches. If yes, it's a fresh regression. If no, it's been broken
     for a while.
   - `request_id` — pick one event and grep the logs / breadcrumbs tab
     for navigation history leading up to it.
   - `error_code` — present when the error was a typed `AppError`. Look
     it up in `src/lib/errors.ts`.
3. If it's a regression in the current release, hotfix as a normal PR.

### Bad deploy

1. Identify the bad commit via Sentry `release` tag.
2. **Netlify:** Dashboard → Deploys → previous deploy → "Publish deploy".
3. **Vercel:** Dashboard → Deployments → previous → "Promote to Production".
4. Both targets keep the last few builds. Rollback is one click.
5. After rollback, Sentry will continue receiving events tagged with
   the bad `release` for ~1 hour (until the SDK stops reporting it).
   Mark the Sentry issue as `Resolved in next release` once verified.

### Supabase outage

1. Check status.supabase.io — confirm it's not just us.
2. The app degrades gracefully:
   - Login/signup fail with a toast; user can retry.
   - Authenticated views show empty data (reads fail silently).
   - The `tieredStorage` (`src/lib/storage/tieredStorage.ts`) falls back
     to local-only when cloud sync fails — no data loss.
3. If the outage is prolonged, post a status banner. There is no
   built-in maintenance-mode toggle today — manually edit
   `src/shared/layout/AnnouncementBanner.tsx` (if you add one in the
   future, that's where it goes).

### Security incident

1. Check Sentry for `error_code=AuthError` or repeated 401s/403s from
   one IP / user — possible credential stuffing or token theft.
2. Suspend the affected account via Supabase Auth dashboard.
3. Rotate any leaked secrets:
   - Supabase: rotate service-role key + project URL.
   - Sentry: rotate DSN.
   - OAuth integrations: rotate client secrets for Google/Notion/Slack/Spotify.
4. Audit git history for accidentally committed secrets:
   `git log -p | grep -E '(sk_live|sk_test|AIza[0-9A-Za-z\\-_]{35})'`
5. Update env, redeploy, notify affected users.

### Build failure

1. Check `.github/workflows/ci.yml` — read the failing job's log.
2. If `typecheck` is red: someone added a `@ts-nocheck` or broke strict
   TS. Fix the type errors; do NOT add new headers (the debt ledger is
   tracked — see [ARCHITECTURE.md](./ARCHITECTURE.md#known-debt-tracked-do-not-silently-grow)).
3. If `lint` is red: same — don't disable rules.
4. If `vitest` is red and it's NOT a pre-existing flake (compare to
   [known debt](#known-flaky-tests)): investigate. Do NOT bump test
   thresholds to mask failures.

### Container healthcheck failing

The image runs `wget -qO- http://127.0.0.1/healthz` every 30s with 3
retries. If the container reports unhealthy:

1. Exec in: `docker exec -it <container> sh`
2. `wget -qO- http://127.0.0.1/healthz` — should print `ok`.
3. If it fails, check nginx: `nginx -t` (config test), then
   `tail /var/log/nginx/error.log`.
4. The `/healthz` endpoint is defined in the heredoc nginx config in
   the `Dockerfile`. If it 404s, the bundle didn't ship — rebuild.

## Known flaky tests

These fail intermittently and are tracked in the debt ledger. **Do not
treat them as regressions** unless the failure rate changes:

- Categories suites under parallel load (vitest pool contention)
- Some timer error-path tests (timing-sensitive)

Run a single test file in isolation to verify:
```bash
npx vitest run src/path/to/file.test.ts
```

## Useful commands

```bash
# Reproduce a Sentry event locally
npm run dev
# Trigger the action, check browser console + Sentry dashboard

# Check env validation is wired correctly
npm run dev  # missing VITE_SUPABASE_URL → console.error in dev
npm run build  # missing → build fails fast

# Coverage gate (Phase 6)
npm run test:coverage

# Audit high-severity npm vulns
npm run audit
```

## What this runbook is NOT

- A marketing description of how the app works. See [ARCHITECTURE.md](./ARCHITECTURE.md).
- A contributor guide. See [CONTRIBUTING.md](../CONTRIBUTING.md).
- An incident postmortem template. Use your standard one.

If something here is wrong, fix it in the same PR that revealed the bug.
If you found a new failure mode not covered here, add it — short and
procedural, no prose.