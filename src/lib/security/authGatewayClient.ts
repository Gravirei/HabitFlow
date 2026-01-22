/**
 * Auth Gateway Client
 * Calls Supabase Edge Function `auth-gateway` which enforces:
 * - Cloudflare Turnstile server-side verification
 * - Rate limiting
 * - Account lockout
 */

import { supabase } from '@/lib/supabase'

export type AuthGatewayAction = 'signup' | 'login' | 'forgot-password'

export interface AuthGatewayResponse<T = any> {
  ok: boolean
  status: number
  data?: T
  error?: string
  message?: string
  lockedUntil?: string
  retryAfterMinutes?: number
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
