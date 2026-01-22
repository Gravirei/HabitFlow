import { supabase } from '@/lib/supabase'

// Supabase-js has `auth.mfa` at runtime, but some TS setups may not include the types.
// Provide minimal typed wrappers so the app can compile.

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

export async function enrollTotp(friendlyName: string): Promise<EnrollTotpResult> {
  const mfa: any = (supabase.auth as any).mfa
  if (!mfa) throw new Error('MFA is not available in this Supabase client')

  const { data, error } = await mfa.enroll({ factorType: 'totp', friendlyName })
  if (error) throw error
  return data as EnrollTotpResult
}

export async function challengeFactor(factorId: string): Promise<{ id: string; expires_at: string }> {
  const mfa: any = (supabase.auth as any).mfa
  const { data, error } = await mfa.challenge({ factorId })
  if (error) throw error
  return data
}

export async function verifyFactor(params: {
  factorId: string
  challengeId: string
  code: string
}): Promise<void> {
  const mfa: any = (supabase.auth as any).mfa
  const { error } = await mfa.verify({
    factorId: params.factorId,
    challengeId: params.challengeId,
    code: params.code,
  })
  if (error) throw error
}

export async function listFactors(): Promise<any[]> {
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) throw error
  // shape: { all: [], totp: [] }
  return data?.totp ?? []
}

export async function unenrollFactor(factorId: string): Promise<void> {
  const mfa: any = (supabase.auth as any).mfa
  const { error } = await mfa.unenroll({ factorId })
  if (error) throw error
}
