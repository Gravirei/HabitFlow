# External Integrations

**Analysis Date:** 2025-05-23

## APIs & External Services

**Backend-as-a-Service:**
- Supabase - Database, Auth, Storage, Edge Functions.
  - SDK: `@supabase/supabase-js`
  - Auth: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - Implementation: `src/lib/supabase.ts`

**Security:**
- Cloudflare Turnstile - CAPTCHA service.
  - SDK: `@marsidev/react-turnstile`
  - Auth: `VITE_TURNSTILE_SITE_KEY`
  - Implementation: Used in authentication flows for bot protection.

**Productivity & Workflow:**
- Google Calendar - Syncing events.
  - Implementation: `src/components/integrations/googleCalendar.ts`
- Notion - Task and note syncing.
  - Implementation: `src/components/integrations/notion.ts`
- Slack - Notifications and messaging.
  - Implementation: `src/components/integrations/slack.ts`
- Spotify - Media integration.
  - Implementation: `src/components/integrations/spotify.ts`
- IFTTT & Zapier - Webhook-based automations.
  - Implementation: `src/components/integrations/ifttt.ts`, `src/components/integrations/zapier.ts`

**Health & Fitness:**
- Apple Health - Health data syncing (Mobile).
  - Implementation: `src/components/integrations/appleHealth.ts`
- Google Fit - Health data syncing.
  - Implementation: `src/components/integrations/googleFit.ts`

## Data Storage

**Databases:**
- Supabase (PostgreSQL)
  - Connection: `VITE_SUPABASE_URL`
  - Client: `@supabase/supabase-js`
  - Logic managed via migrations in `supabase/migrations/`

**File Storage:**
- Supabase Storage - Avatar and category image storage.
  - Implementation: `src/lib/storage/imageStorage.ts`
- Local Filesystem (via Capacitor) - Potentially for local cache.
  - Implementation: `src/lib/storage/tieredStorage.ts`

**Caching:**
- Zustand with persistent storage (likely `localStorage`).
- Tiered Storage: `src/lib/storage/tieredStorage.ts` for managing local vs remote state.

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Implementation: `src/lib/auth/AuthContext.tsx`, `src/lib/auth/mfa.ts`
  - Security layers: Account lockout, device verification, and rate limiting implemented in `src/lib/security/`.

## Monitoring & Observability

**Error Tracking:**
- Sentry - Error monitoring.
  - SDK: `@sentry/react`
  - Implementation: `src/lib/sentry.ts`
  - Auth: `VITE_SENTRY_DSN`

**Logs:**
- Console logging in development.
- Sentry events for production errors.

## CI/CD & Deployment

**Hosting:**
- Netlify (`netlify.toml`)
- Vercel (`vercel.json`)
- Android via Capacitor (`android/` directory)

**CI Pipeline:**
- GitHub Actions: `.github/workflows/security.yml` for security scanning.

## Environment Configuration

**Required env vars:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SENTRY_DSN`
- `VITE_TURNSTILE_SITE_KEY`
- `VITE_GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_SECRET` (and other OAuth credentials)

**Secrets location:**
- Development: `.env` (local)
- Production: CI/CD platform environment variables or Supabase Edge Function secrets.

## Webhooks & Callbacks

**Incoming:**
- `VITE_*_REDIRECT_URI` - OAuth callback endpoints used by integrations.
- Supabase Edge Functions: `supabase/functions/` handles incoming requests for auth and messaging.

**Outgoing:**
- Supabase Edge Functions: `messaging-notifications` function for push notifications.

---

*Integration audit: 2025-05-23*
