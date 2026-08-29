/**
 * Account Lockout Utility
 * Manages account lockouts after multiple failed attempts
 */

import { supabase } from '@/lib/supabase'

export interface LockoutStatus {
  isLocked: boolean
  lockedUntil?: Date
  reason?: string
}

/**
 * Check if an account is locked
 */
export async function isAccountLocked(email: string): Promise<LockoutStatus> {
  try {
    const { data: lockouts, error } = await supabase
      .from('account_lockouts')
      .select('*')
      .eq('email', email)
      .eq('is_locked', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Lockout check error:', error)
      return { isLocked: false }
    }

    if (!lockouts || lockouts.length === 0) {
      return { isLocked: false }
    }

    const lockout = lockouts[0]
    const lockedUntil = new Date(lockout.locked_until)

    // Check if lockout has expired
    if (lockedUntil < new Date()) {
      // Unlock the account
      await unlockAccount(email)
      return { isLocked: false }
    }

    return {
      isLocked: true,
      lockedUntil,
      reason: lockout.reason,
    }
  } catch (error) {
    console.error('Lockout check exception:', error)
    return { isLocked: false }
  }
}

/**
 * Lock an account
 */
export async function lockAccount(
  email: string,
  userId: string | null,
  reason: string,
  durationMinutes: number = 30
): Promise<void> {
  try {
    const lockedUntil = new Date(Date.now() + durationMinutes * 60 * 1000)

    await supabase.from('account_lockouts').insert({
      user_id: userId,
      email,
      reason,
      locked_until: lockedUntil.toISOString(),
      is_locked: true,
    })
  } catch (error) {
    console.error('Failed to lock account:', error)
  }
}

/**
 * Unlock an account
 */
export async function unlockAccount(email: string): Promise<void> {
  try {
    await supabase
      .from('account_lockouts')
      .update({ is_locked: false })
      .eq('email', email)
      .eq('is_locked', true)
  } catch (error) {
    console.error('Failed to unlock account:', error)
  }
}

/**
 * Check failed attempts and lock if threshold exceeded
 */
export async function checkAndLockAccount(
  email: string,
  maxFailedAttempts: number = 5,
  windowMinutes: number = 15,
  lockoutMinutes: number = 30
): Promise<LockoutStatus> {
  try {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)

    // Count failed attempts in window
    const { data: attempts, error } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('email', email)
      .eq('success', false)
      .gte('created_at', windowStart.toISOString())

    if (error) {
      console.error('Failed attempt check error:', error)
      return { isLocked: false }
    }

    const failedAttempts = attempts?.length || 0

    if (failedAttempts >= maxFailedAttempts) {
      const userId = attempts?.[0]?.user_id || null
      await lockAccount(
        email,
        userId,
        `Too many failed login attempts (${failedAttempts})`,
        lockoutMinutes
      )

      return {
        isLocked: true,
        lockedUntil: new Date(Date.now() + lockoutMinutes * 60 * 1000),
        reason: 'Too many failed login attempts',
      }
    }

    return { isLocked: false }
  } catch (error) {
    console.error('Check and lock exception:', error)
    return { isLocked: false }
  }
}
