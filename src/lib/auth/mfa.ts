import { getMfaClient, type MfaApi } from '@/lib/supabase'
import { MfaError, AppError } from '@/lib/errors'

// Supabase-js has `auth.mfa` at runtime, but some TS setups may not include
// the types. We expose a narrow typed surface via `getMfaClient()` (see
// src/lib/supabase.ts) and throw `MfaError` if it's unavailable.

export type MfaFactorType = 'totp'

export interface EnrollTotpResult {
  id: string
  type: 'totp'
  totp: {
    qr_code: string
    secret: string
    uri: string
  }
}

function requireMfa(): MfaApi {
  const mfa = getMfaClient()
  if (!mfa) {
    throw new MfaError('MFA is not available in this Supabase client', 'MFA_NOT_AVAILABLE')
  }
  return mfa
}

function toAppError(e: unknown, fallbackCode: string): AppError {
  if (e instanceof AppError) return e
  // Supabase SDK errors are plain objects with a `message` field. Accept
  // both `Error` instances and `{ message: string }`-shaped objects.
  let message: string
  if (e instanceof Error) {
    message = e.message
  } else if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    message = (e as { message: string }).message
  } else {
    message = String(e)
  }
  return new AppError(message, fallbackCode, { cause: e })
}

export async function enrollTotp(friendlyName: string): Promise<EnrollTotpResult> {
  const mfa = requireMfa()
  const { data, error } = await mfa.enroll({ factorType: 'totp', friendlyName })
  if (error) throw toAppError(error, 'MFA_ENROLL_FAILED')
  return data as EnrollTotpResult
}

export async function challengeFactor(factorId: string): Promise<{ id: string; expires_at: string }> {
  const mfa = requireMfa()
  const { data, error } = await mfa.challenge({ factorId })
  if (error) throw toAppError(error, 'MFA_CHALLENGE_FAILED')
  return data as { id: string; expires_at: string }
}

export async function verifyFactor(params: {
  factorId: string
  challengeId: string
  code: string
}): Promise<void> {
  const mfa = requireMfa()
  const { error } = await mfa.verify({
    factorId: params.factorId,
    challengeId: params.challengeId,
    code: params.code,
  })
  if (error) throw toAppError(error, 'MFA_VERIFICATION_FAILED')
}

export async function listFactors(): Promise<any[]> {
  // listFactors lives on the standard auth.mfa surface in @supabase/supabase-js,
  // but we still use the narrow `MfaApi` handle for consistency. Falls back to
  // supabase.auth.mfa.listFactors if the handle doesn't expose it.
  const handle = requireMfa()
  if (handle.listFactors) {
    const { data, error } = await handle.listFactors()
    if (error) throw toAppError(error, 'MFA_LIST_FAILED')
    return (data?.totp as any[]) ?? []
  }
  // Last-resort fallback for SDKs that expose listFactors only on `supabase.auth.mfa` directly.
  const fallback = (getMfaClient() as unknown as { listFactors?: () => Promise<any> } | null)?.listFactors
  if (!fallback) {
    throw new MfaError('MFA listFactors is not available', 'MFA_NOT_AVAILABLE')
  }
  const out = await fallback()
  return out?.data?.totp ?? []
}

export async function unenrollFactor(factorId: string): Promise<void> {
  const mfa = requireMfa()
  const { error } = await mfa.unenroll({ factorId })
  if (error) throw toAppError(error, 'MFA_UNENROLL_FAILED')
}
