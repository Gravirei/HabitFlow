/**
 * Auth Gateway Client
 *
 * Calls Supabase Edge Function `auth-gateway` which enforces:
 * - Cloudflare Turnstile server-side verification
 * - Rate limiting
 * - Account lockout
 *
 * Envelope:
 *   v1 (legacy): { ok, status, error, message, data, lockedUntil?, retryAfterMinutes?, mfa_required?, factor_id?, aal1_access_token? }
 *   v2 (opt-in): { ok, error: { code, message } | null, data, meta: { ... } | null }
 *
 * The client auto-sends `x-respond-shape: v2`. The Edge Function reads the
 * header and emits the matching shape. The public `AuthGatewayResponse`
 * supports both shapes via a union on `error`.
 */

import { supabase } from '@/lib/supabase'
import { env } from '@/lib/env'
import {
  AppError,
  AuthError,
  MfaError,
  NetworkError,
  RateLimitedError,
  ValidationError,
  toAppErrorFromAuthGateway,
  type AuthGatewayErrorCode,
} from '@/lib/errors'

export type AuthGatewayAction = 'signup' | 'login' | 'forgot-password' | 'verify-mfa'

/** v2 envelope (nested) */
export interface AuthGatewayV2Envelope<T = unknown> {
  ok: boolean
  error: { code: AuthGatewayErrorCode | string; message: string } | null
  data: T | null
  meta: Record<string, unknown> | null
}

/** v1 envelope (flat) — kept for the legacy code path. */
export interface AuthGatewayV1Envelope<T = any> {
  ok: boolean
  status: number
  data?: T
  error?: string
  message?: string
  lockedUntil?: string
  retryAfterMinutes?: number
  mfa_required?: boolean
  factor_id?: string
  aal1_access_token?: string
}

/**
 * Public response type.
 *
 * `error` is a union so legacy `res.error === 'rate_limited'` comparisons
 * keep working against v1 responses. When the server honors the
 * `x-respond-shape: v2` header, `error` is `{ code, message } | null`.
 * Either way, `meta.*` is populated, and the v1 top-level mirrors
 * (`mfa_required`, `factor_id`, etc.) are present.
 */
export interface AuthGatewayResponse<T = any> {
  ok: boolean
  status: number
  data: T | null
  /**
   * v1: a string error code (e.g. `'rate_limited'`).
   * v2: a `{ code, message }` object.
   * `null` on success.
   */
  error: string | { code: string; message: string } | null
  /** v2 nested meta. */
  meta: {
    lockedUntil?: string
    retryAfterMinutes?: number
    mfaRequired?: boolean
    factorId?: string
    aal1AccessToken?: string
  } | null
  // v1 top-level mirrors for legacy code paths
  mfa_required?: boolean
  factor_id?: string
  aal1_access_token?: string
  lockedUntil?: string
  retryAfterMinutes?: number
}

function getFunctionsBaseUrl() {
  const url = env.SUPABASE_URL
  return `${url}/functions/v1`
}

/** Extract the string code from a v1 or v2 error field. */
function getErrorCode(e: AuthGatewayResponse<unknown>['error']): string | undefined {
  if (e == null) return undefined
  return typeof e === 'string' ? e : e.code
}

/** v1 → public response. Preserves `error: string` for legacy comparisons. */
function v1ToPublic<T>(v1: AuthGatewayV1Envelope<T>, status: number): AuthGatewayResponse<T> {
  const meta = {
    lockedUntil: v1.lockedUntil,
    retryAfterMinutes: v1.retryAfterMinutes,
    mfaRequired: v1.mfa_required,
    factorId: v1.factor_id,
    aal1AccessToken: v1.aal1_access_token,
  }
  return {
    ok: !!v1.ok,
    status,
    data: v1.ok ? ((v1.data ?? null) as T | null) : null,
    error: v1.ok ? null : (v1.error ?? null),
    meta,
    ...meta,
  }
}

/** v2 → public response. `error` is the nested object. */
function v2ToPublic<T>(v2: AuthGatewayV2Envelope<T>, status: number): AuthGatewayResponse<T> {
  const meta = (v2.meta ?? null) as AuthGatewayResponse<T>['meta']
  return {
    ok: !!v2.ok,
    status,
    data: (v2.data ?? null) as T | null,
    error: v2.error ?? null,
    meta,
    ...meta,
  }
}

/**
 * Invoke the auth-gateway edge function.
 *
 * Sends `x-respond-shape: v2` so the Edge Function returns the new envelope.
 * The v2 path is opt-in for the server (R7 in the plan) — if the server is
 * still on v1, we transparently translate.
 */
export async function callAuthGateway<T = any>(
  action: AuthGatewayAction,
  payload: Record<string, unknown>,
  options: { shape?: 'v1' | 'v2' } = {},
): Promise<AuthGatewayResponse<T>> {
  const baseUrl = getFunctionsBaseUrl()
  const anonKey = env.SUPABASE_ANON_KEY
  const useV2 = (options.shape ?? 'v2') === 'v2'

  let resp: Response
  try {
    resp = await fetch(`${baseUrl}/auth-gateway/${action}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: anonKey,
        authorization: `Bearer ${anonKey}`,
        ...(useV2 ? { 'x-respond-shape': 'v2' } : {}),
      },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    throw new NetworkError(`[auth-gateway/${action}] network error: ${(e as Error).message}`, e)
  }

  const text = await resp.text()
  if (!resp.ok && import.meta.env.DEV) {
    console.warn(`[auth-gateway/${action}] HTTP ${resp.status}:`, text)
  }

  let parsed: unknown
  try {
    parsed = text ? JSON.parse(text) : undefined
  } catch {
    parsed = undefined
  }

  // v2 discriminator: `error` is an object with `code` or `null`.
  if (parsed && typeof parsed === 'object' && 'error' in (parsed as object)) {
    const errField = (parsed as { error: unknown }).error
    if (errField === null || (typeof errField === 'object' && 'code' in (errField as object))) {
      return v2ToPublic<T>(parsed as AuthGatewayV2Envelope<T>, resp.status)
    }
  }

  // v1 fallback (server didn't honor the header)
  return v1ToPublic<T>((parsed ?? {}) as AuthGatewayV1Envelope<T>, resp.status)
}

/**
 * Convert a v2 (or v1) error envelope into a typed `AppError`.
 * Throws nothing — returns the typed error so callers can decide.
 */
export function toTypedError(res: AuthGatewayResponse<unknown>): AppError {
  const code = getErrorCode(res.error) ?? 'UNKNOWN'
  const message =
    typeof res.error === 'object' && res.error
      ? res.error.message
      : (res.error ?? 'Request failed')
  return toAppErrorFromAuthGateway(code, message, res.meta ?? {}, res.status)
}

/**
 * Apply session returned by auth-gateway login.
 * Supabase `/token?grant_type=password` returns: access_token, refresh_token, expires_in, token_type, user
 */
export async function applySupabaseSessionFromGateway(data: unknown) {
  const d = data as { access_token?: string; refresh_token?: string } | null
  if (!d?.access_token || !d?.refresh_token) {
    throw new AuthError('Missing access_token/refresh_token from gateway response', 'GATEWAY_SESSION_INVALID')
  }

  const { error } = await supabase.auth.setSession({
    access_token: d.access_token,
    refresh_token: d.refresh_token,
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
  const res = await callAuthGateway(
    'verify-mfa',
    {
      aal1_access_token: params.aal1AccessToken,
      factor_id: params.factorId,
      code: params.code,
    },
    { shape: 'v2' },
  )

  if (!res.ok) {
    const code = getErrorCode(res.error)
    const message =
      typeof res.error === 'object' && res.error
        ? res.error.message
        : (res.error ?? 'MFA verification failed')
    switch (code) {
      case 'mfa_verification_failed':
        throw new MfaError(message ?? 'Invalid 2FA code', 'MFA_VERIFICATION_FAILED', res.meta ?? undefined)
      case 'rate_limited':
        throw new RateLimitedError(message, {
          retryAfterMinutes:
            typeof res.meta?.retryAfterMinutes === 'number' ? res.meta.retryAfterMinutes : undefined,
        })
      case 'invalid_code_format':
        throw new ValidationError(message ?? 'Enter a valid 6-digit code.', 'INVALID_CODE_FORMAT')
      default:
        throw toTypedError(res)
    }
  }

  // Apply the full aal2 session returned by the gateway
  await applySupabaseSessionFromGateway(res.data)
}
