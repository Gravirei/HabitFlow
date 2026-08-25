/**
 * Auth API surface
 *
 * The only module features/pages should use for Supabase auth operations.
 * Keeps `@/lib/supabase` as an implementation detail of `src/lib` — call
 * sites never touch the raw client directly.
 */

import { supabase } from '@/lib/supabase'

type OAuthSignInProvider = Parameters<typeof supabase.auth.signInWithOAuth>[0]['provider']

export function signInWithPassword(credentials: { email: string; password: string }) {
  return supabase.auth.signInWithPassword(credentials)
}

export function signInWithOAuth(provider: OAuthSignInProvider, redirectTo?: string) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  })
}

export function signUpAccount(params: { email: string; password: string; username?: string }) {
  const { email, password, username } = params
  return supabase.auth.signUp({
    email,
    password,
    options: username ? { data: { username } } : undefined,
  })
}

export function resendVerificationEmail(email: string) {
  return supabase.auth.resend({ type: 'signup', email })
}

export function resetPasswordForEmail(email: string, redirectTo?: string) {
  return supabase.auth.resetPasswordForEmail(email, { redirectTo })
}

export function updateUserPassword(password: string) {
  return supabase.auth.updateUser({ password })
}

export function getAuthSession() {
  return supabase.auth.getSession()
}

export function signOutSession(scope: 'local' | 'global' = 'local') {
  return supabase.auth.signOut({ scope })
}
