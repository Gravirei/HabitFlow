/// <reference types="vite/client" />

/**
 * Typed public environment variables.
 *
 * Everything here is safe to ship in the client bundle. Secrets must NEVER be
 * added — integration OAuth secrets and the Turnstile secret key live in
 * Supabase Edge Function secrets (see .env.example and supabase/functions/).
 *
 * Variables are optional (`?`) because they may legitimately be unset;
 * access them through `src/lib/env.ts` or handle undefined at the call site.
 */
interface ImportMetaEnv {
  /** Supabase project URL */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase anon key (public by design; RLS protects data) */
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Cloudflare Turnstile site key (public) */
  readonly VITE_TURNSTILE_SITE_KEY?: string
  /** Set to 'true' to disable Turnstile (e.g. mobile-only builds) */
  readonly VITE_TURNSTILE_DISABLED?: string
  /** Sentry DSN for error monitoring */
  readonly VITE_SENTRY_DSN?: string
  /** Enable Sentry outside production */
  readonly VITE_ENABLE_SENTRY?: string
  /** Analytics feature flag */
  readonly VITE_ENABLE_ANALYTICS?: string
  /** Displayed app name/version */
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_VERSION?: string
  /** Legacy API base URL */
  readonly VITE_API_URL?: string

  // ── Integrations (OAuth) ────────────────────────────────────────────────
  // Client IDs and redirect URIs are public. Client SECRETS are server-side
  // only (supabase functions/secrets) — do not add them here.
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_GOOGLE_REDIRECT_URI?: string
  readonly VITE_GOOGLE_FIT_CLIENT_ID?: string
  readonly VITE_GOOGLE_FIT_REDIRECT_URI?: string
  readonly VITE_NOTION_CLIENT_ID?: string
  readonly VITE_NOTION_REDIRECT_URI?: string
  readonly VITE_SLACK_CLIENT_ID?: string
  readonly VITE_SLACK_REDIRECT_URI?: string
  readonly VITE_SPOTIFY_CLIENT_ID?: string
  readonly VITE_SPOTIFY_REDIRECT_URI?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
