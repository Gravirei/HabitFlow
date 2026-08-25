/**
 * Auth Gateway Client
 * Calls Supabase Edge Function `auth-gateway` which enforces:
 * - Cloudflare Turnstile server-side verification
 * - Rate limiting
 * - Account lockout
 */

import { supabase } from '@/lib/supabase'

export type AuthGatewayAction = 'signup' | 'login' | 'forgot-password' | 'verify-mfa'

export interface AuthGatewayResponse<T = any> {
  ok: boolean
  status: number
  data?: T
  error?: string
  message?: string
  /**
   * Only returned for non-login actions (e.g. signup, forgot-password) when an
   * account lockout is detected. For the `login` action, lockouts are deliberately
   * masked as generic 401 `invalid_credentials` to prevent account enumeration —
   * so `lockedUntil` will never be present in a login response.
   */
  lockedUntil?: string
  retryAfterMinutes?: number
  // MFA fields — returned by login when user has TOTP enrolled
  mfa_required?: boolean
  factor_id?: string
  aal1_access_token?: string
}

function getFunctionsBaseUrl() {
  const url = import.meta.env.VITE_SUPABASE_URL
  if (!url) throw new Error('Missing VITE_SUPABASE_URL')
  return `${url}/functions/v1`
}

/**
 * Invoke the auth-gateway edge function.
 */
export async function callAuthGateway<T = any>(
  action: AuthGatewayAction,
  payload: Record<string, unknown>
): Promise<AuthGatewayResponse<T>> {
  const baseUrl = getFunctionsBaseUrl()

  // Use anon key to call public edge function
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!anonKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY')

  const resp = await fetch(`${baseUrl}/auth-gateway/${action}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(payload),
  })

  const text = await resp.text()

  // Helpful debugging for Edge Function errors
  if (!resp.ok) {
    console.warn(`[auth-gateway/${action}] HTTP ${resp.status}:`, text)
  }
  let json: any = undefined
  try {
    json = text ? JSON.parse(text) : undefined
  } catch {
    json = undefined
  }

  if (json) {
    return {
      ok: !!json.ok,
      status: json.status ?? resp.status,
      ...json,
    }
  }

  return {
    ok: resp.ok,
    status: resp.status,
    data: text as any,
  }
}

/**
 * Apply session returned by auth-gateway login.
 * Supabase `/token?grant_type=password` returns: access_token, refresh_token, expires_in, token_type, user
 */
export async function applySupabaseSessionFromGateway(data: any) {
  const access_token = data?.access_token
  const refresh_token = data?.refresh_token

  if (!access_token || !refresh_token) {
    throw new Error('Missing access_token/refresh_token from gateway response')
  }

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  })

  if (error) throw error
}

/**
 * Complete server-side MFA verification via auth-gateway.
 * Called after login returns mfa_required: true.
 * On success, applies the full aal2 session and returns.
 */
export async function verifyMfaWithGateway(params: {
  aal1AccessToken: string
  factorId: string
  code: string
}): Promise<void> {
  const res = await callAuthGateway('verify-mfa', {
    aal1_access_token: params.aal1AccessToken,
    factor_id: params.factorId,
    code: params.code,
  })

  if (!res.ok) {
    const msg =
      res.error === 'mfa_verification_failed' ? (res.message ?? 'Invalid 2FA code') :
      res.error === 'rate_limited' ? 'Too many attempts. Please try again later.' :
      res.error === 'invalid_code_format' ? 'Enter a valid 6-digit code.' :
      'MFA verification failed. Please try again.'
    throw new Error(msg)
  }

  // Apply the full aal2 session returned by the gateway
  await applySupabaseSessionFromGateway(res.data)
}
