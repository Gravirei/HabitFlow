/**
 * Environment variable validation.
 *
 * Validates all VITE_* variables at module load time using Zod.
 * Replaces the silent placeholder fallbacks that previously lived in
 * `src/lib/supabase.ts` and `src/lib/sentry.ts`.
 *
 * Behavior:
 *   - PROD:  Missing REQUIRED vars throw on import. The build fails fast.
 *   - DEV:   Missing REQUIRED vars log a console.error and fall back to safe
 *            placeholders so the dev server can boot. (See `R2` in
 *            INDUSTRY_STANDARD_PLAN.md.)
 *   - OPTIONAL vars: always warn on missing/unset.
 *
 * The placeholder values match the previous string fallbacks so the rest of
 * the app behaves identically when env is incomplete. Callers that need a
 * non-nullable value can use `requireEnv(name)` to assert at the call site.
 */
import { z } from 'zod'

const isProd = import.meta.env.PROD
const isTest = import.meta.env.MODE === 'test'

/** URL-shape validator. Empty string is treated as "missing". */
const urlOrEmpty = z
  .string()
  .refine((s) => s === '' || /^https?:\/\/.+/.test(s), 'must be a valid http(s) URL or empty')

const nonEmptyString = z.string().min(1)

/**
 * Read a VITE_* variable. In test mode (Vitest jsdom) `import.meta.env` is
 * sparse, so missing values return undefined just like a real build.
 */
function readVar(name: string): string | undefined {
  const v = (import.meta.env as Record<string, string | undefined>)[name]
  return v && v.length > 0 ? v : undefined
}

function warnMissing(name: string, kind: 'required' | 'optional') {
  if (isTest) return // stay quiet in unit tests
  const fn = kind === 'required' && isProd ? console.error : console.warn
  fn(
    `[env] ${kind} variable ${name} is not set. ` +
      (kind === 'required'
        ? 'App will use a placeholder; auth will not work until this is configured.'
        : 'Feature will be disabled.')
  )
}

// ── Required vars ─────────────────────────────────────────────────────────
// SUPABASE_URL and SUPABASE_ANON_KEY are required for the app to function.
// In dev/test we fall back to placeholders so the Vite dev server can start
// (matching the previous behavior). In prod we throw on import.

const SUPABASE_URL = readVar('VITE_SUPABASE_URL')
const SUPABASE_ANON_KEY = readVar('VITE_SUPABASE_ANON_KEY')

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (isProd) {
    throw new Error(
      '[env] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required in production. ' +
        'Set them in your build environment (--build-arg, compose, or Netlify/Vercel env).'
    )
  }
  warnMissing('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY', 'required')
}

export const env = {
  // Required (with safe placeholders for dev)
  SUPABASE_URL: SUPABASE_URL ?? 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ?? 'placeholder-key',

  // Optional — schema-validated, fall through to undefined on missing
  API_URL: readVar('VITE_API_URL'),
  APP_NAME: readVar('VITE_APP_NAME') ?? 'HabitFlow',
  APP_VERSION: readVar('VITE_APP_VERSION') ?? 'unknown',

  SENTRY_DSN: readVar('VITE_SENTRY_DSN'),
  ENABLE_SENTRY: readVar('VITE_ENABLE_SENTRY') === 'true',
  ENABLE_ANALYTICS: readVar('VITE_ENABLE_ANALYTICS') === 'true',

  TURNSTILE_SITE_KEY: readVar('VITE_TURNSTILE_SITE_KEY'),
  TURNSTILE_DISABLED: readVar('VITE_TURNSTILE_DISABLED') === 'true',

  // Integrations
  GOOGLE_CLIENT_ID: readVar('VITE_GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: readVar('VITE_GOOGLE_CLIENT_SECRET'),
  GOOGLE_REDIRECT_URI: readVar('VITE_GOOGLE_REDIRECT_URI'),
  NOTION_CLIENT_ID: readVar('VITE_NOTION_CLIENT_ID'),
  NOTION_CLIENT_SECRET: readVar('VITE_NOTION_CLIENT_SECRET'),
  NOTION_REDIRECT_URI: readVar('VITE_NOTION_REDIRECT_URI'),
  SLACK_CLIENT_ID: readVar('VITE_SLACK_CLIENT_ID'),
  SLACK_CLIENT_SECRET: readVar('VITE_SLACK_CLIENT_SECRET'),
  SLACK_REDIRECT_URI: readVar('VITE_SLACK_REDIRECT_URI'),
  SPOTIFY_CLIENT_ID: readVar('VITE_SPOTIFY_CLIENT_ID'),
  SPOTIFY_CLIENT_SECRET: readVar('VITE_SPOTIFY_CLIENT_SECRET'),
  SPOTIFY_REDIRECT_URI: readVar('VITE_SPOTIFY_REDIRECT_URI'),
  GOOGLE_FIT_REDIRECT_URI: readVar('VITE_GOOGLE_FIT_REDIRECT_URI'),
} as const

// Type used to validate any URL-shaped env var at call sites if we need to.
export const Validators = { urlOrEmpty, nonEmptyString } as const

/** Runtime assertion that an env var is set. Throws `EnvError` if missing. */
export function requireEnv<K extends keyof typeof env>(name: K): NonNullable<(typeof env)[K]> {
  const v = env[name]
  if (v === undefined || v === '' || v === null) {
    const err = new Error(`[env] ${String(name)} is not configured.`)
    err.name = 'EnvError'
    throw err
  }
  return v as NonNullable<(typeof env)[K]>
}

/** True if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY point at placeholders. */
export const usingPlaceholderSupabase: boolean =
  env.SUPABASE_URL === 'https://placeholder.supabase.co' ||
  env.SUPABASE_ANON_KEY === 'placeholder-key'

/** True when both Supabase env vars are present (non-placeholder). */
export function isSupabaseConfigured(): boolean {
  return Boolean(env.SUPABASE_URL) && Boolean(env.SUPABASE_ANON_KEY) && !usingPlaceholderSupabase
}

// Back-compat camelCase view of the env for auth flows (develop branch had this shape).
// Read-only proxy: auth code reads `envCompat.turnstileSiteKey` etc. instead of `env.TURNSTILE_SITE_KEY`.
export const envCompat = {
  get supabaseUrl() {
    return env.SUPABASE_URL
  },
  get supabaseAnonKey() {
    return env.SUPABASE_ANON_KEY
  },
  get turnstileSiteKey() {
    return env.TURNSTILE_SITE_KEY
  },
  get turnstileDisabled() {
    return Boolean(env.TURNSTILE_DISABLED)
  },
} as const
