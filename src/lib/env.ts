/**
 * Centralized access to public (VITE_-prefixed) environment variables.
 *
 * Only variables that are safe to ship to the browser live here. Secrets
 * (integration client secrets, Turnstile secret key) belong server-side in
 * Edge Function secrets — never add them to this module or to `.env`.
 */

function read(name: string): string {
  // Read dynamically off import.meta.env so test code can stub values at runtime.
  return (import.meta.env as Record<string, string | undefined>)[name] ?? ''
}

export const env = {
  /** Supabase project URL */
  get supabaseUrl() {
    return read('VITE_SUPABASE_URL')
  },
  /** Supabase anon key — public by design, RLS protects data */
  get supabaseAnonKey() {
    return read('VITE_SUPABASE_ANON_KEY')
  },
  /** Cloudflare Turnstile site key (public); empty means Turnstile not configured */
  get turnstileSiteKey() {
    return read('VITE_TURNSTILE_SITE_KEY')
  },
  /** True when Turnstile is explicitly disabled via VITE_TURNSTILE_DISABLED=true */
  get turnstileDisabled() {
    return read('VITE_TURNSTILE_DISABLED') === 'true'
  },
}

/** True when both Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey)
}
