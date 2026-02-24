/**
 * Supabase Client Configuration
 * Initializes and exports the Supabase client for use throughout the application
 *
 * ─── SESSION STORAGE SECURITY ANALYSIS ────────────────────────────────────────
 *
 * WHY localStorage IS USED (and why sessionStorage is NOT appropriate here)
 * -------------------------------------------------------------------------
 * The Supabase JS client v2 supports a custom `storage` option, allowing
 * session tokens to be stored in sessionStorage instead of localStorage.
 * sessionStorage would reduce the XSS exposure window (tokens cleared on tab
 * close), but it cannot be used in this app for the following reasons:
 *
 * 1. PERSISTENT "REMEMBER THIS DEVICE" FEATURE
 *    Login.tsx exposes a "Remember this device" checkbox. Users explicitly opt
 *    in to having their session survive browser restarts. Switching to
 *    sessionStorage silently breaks this UX contract — the session would be
 *    lost every time the tab is closed, regardless of user preference.
 *
 * 2. PERSISTENT DEVICE FINGERPRINTING
 *    deviceVerification.ts stores a cryptographic device ID
 *    (`habitflow_device_id`) in localStorage. This ID must survive page reloads
 *    and browser restarts so the server-side trusted-device system can
 *    recognise the same browser across sessions. sessionStorage cannot provide
 *    this guarantee.
 *
 * 3. OAUTH REDIRECT FLOWS
 *    Google and Apple sign-in use supabase.auth.signInWithOAuth(), which
 *    performs a full-page redirect. When the browser returns to the app,
 *    sessionStorage from the originating context may have been discarded by
 *    certain browsers or cross-origin redirect chains, making session recovery
 *    unreliable.
 *
 * 4. httpOnly COOKIES ARE NOT FEASIBLE FOR A PURE SPA
 *    httpOnly cookies require a server-side component to set and read them,
 *    making them inaccessible to JavaScript (which is the security benefit).
 *    HabitFlow is a pure client-side SPA with no BFF (Backend-for-Frontend)
 *    layer, so httpOnly cookies cannot be used without a significant
 *    architectural change (e.g. adding an SSR layer or proxy server).
 *
 * EXISTING XSS MITIGATIONS (defense-in-depth)
 * --------------------------------------------
 * The risk of XSS-based token theft is mitigated by multiple layers:
 *
 * • Auth Gateway Edge Function — All authentication flows (login, signup,
 *   password reset) go through a server-side Supabase Edge Function
 *   (`auth-gateway`) that enforces Cloudflare Turnstile bot detection, rate
 *   limiting, and account lockout. Credentials never hit the Supabase Auth
 *   REST API directly from the client.
 *
 * • Multi-Factor Authentication (TOTP) — MFA is implemented and enforced
 *   server-side. Even if tokens were stolen via XSS, an attacker cannot
 *   escalate to AAL2 without the TOTP secret.
 *
 * • DOMPurify sanitisation — User-controlled HTML (e.g. QR codes in
 *   TwoFactorSettings.tsx) is sanitised with DOMPurify before being rendered
 *   via dangerouslySetInnerHTML, reducing the XSS surface area.
 *
 * • Trusted device verification — Server-side trusted-device records add a
 *   second check; unfamiliar devices trigger additional verification even
 *   with a valid session token.
 *
 * • Defense-in-depth logout — logout.ts clears all localStorage / sessionStorage
 *   keys (not just Supabase's) on sign-out, limiting post-session residue.
 *
 * • Content-Security-Policy headers — A strict CSP (configured at the hosting/
 *   CDN level) should be maintained to prevent script injection. Ensure
 *   `script-src 'self'` is set and inline scripts / eval are disallowed.
 *
 * IF YOU WANT TO IMPROVE SECURITY FURTHER
 * ----------------------------------------
 * • Add a BFF/proxy layer (e.g. Next.js API routes, a Cloudflare Worker) that
 *   exchanges Supabase tokens for httpOnly, Secure, SameSite=Strict cookies.
 *   The SPA would then hold no tokens at all in JavaScript-accessible storage.
 * • Implement token rotation on every request (Supabase already does JWT
 *   refresh rotation; ensure `autoRefreshToken: true` stays enabled).
 * • Audit all third-party scripts for supply-chain XSS risk (use Subresource
 *   Integrity hashes where possible).
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  )
  // Create a dummy client to prevent app crashes
  // This allows the app to run without Supabase configured
}

const isTestEnv = import.meta.env.MODE === 'test'

const hasValidStorage = (() => {
  try {
    const s: any = window?.localStorage
    return !!s && typeof s.getItem === 'function' && typeof s.setItem === 'function'
  } catch {
    return false
  }
})()

// Create and export the Supabase client
//
// storage: localStorage is used intentionally — see the security analysis at
// the top of this file for the full rationale. Do NOT change this to
// sessionStorage without first removing the "Remember this device" feature and
// the persistent device-ID system, and verifying OAuth redirect flows work.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // In tests, avoid background refresh timers and avoid broken storage mocks.
      autoRefreshToken: !isTestEnv,
      persistSession: !isTestEnv && hasValidStorage,
      detectSessionInUrl: true,
      ...(hasValidStorage ? { storage: window.localStorage } : {}),
    },
  }
)

// Type helper for Supabase tables (add your table types here)
export type Database = {
  // Example structure - customize based on your actual database schema
  public: {
    Tables: {
      // Add your table definitions here
      // Example:
      // timer_sessions: {
      //   Row: {
      //     id: string
      //     user_id: string
      //     mode: string
      //     duration: number
      //     timestamp: string
      //     created_at: string
      //   }
      //   Insert: Omit<timer_sessions.Row, 'id' | 'created_at'>
      //   Update: Partial<timer_sessions.Insert>
      // }
    }
    Views: {
      // Add your view definitions here
    }
    Functions: {
      // Add your function definitions here
    }
    Enums: {
      // Add your enum definitions here
    }
  }
}
