/**
 * Rate Limiting Utility
 * Prevents brute-force attacks by limiting authentication attempts
 */

import { supabase } from '@/lib/supabase'

export interface RateLimitConfig {
  maxAttempts: number
  windowMinutes: number
  lockoutMinutes: number
}

// Default configurations
export const RATE_LIMIT_CONFIGS = {
  login: { maxAttempts: 5, windowMinutes: 15, lockoutMinutes: 30 },
  signup: { maxAttempts: 3, windowMinutes: 60, lockoutMinutes: 60 },
  forgotPassword: { maxAttempts: 3, windowMinutes: 60, lockoutMinutes: 60 },
}

/**
 * Check if an IP/email has exceeded rate limit
 */
export async function checkRateLimit(
  email: string,
  ipAddress: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remainingAttempts: number; resetAt?: Date }> {
  try {
    const windowStart = new Date(Date.now() - config.windowMinutes * 60 * 1000)

    // Check attempts in the time window
    const { data: attempts, error } = await supabase
      .from('login_attempts')
      .select('*')
      .or(`email.eq.${email},ip_address.eq.${ipAddress}`)
      .gte('created_at', windowStart.toISOString())
      .eq('success', false)

    if (error) {
      console.error('Rate limit check error:', error)
      // On error, allow the attempt (fail open for better UX)
      return { allowed: true, remainingAttempts: config.maxAttempts }
    }

    const attemptCount = attempts?.length || 0
    const remainingAttempts = Math.max(0, config.maxAttempts - attemptCount)

    if (attemptCount >= config.maxAttempts) {
      const resetAt = new Date(Date.now() + config.lockoutMinutes * 60 * 1000)
      return { allowed: false, remainingAttempts: 0, resetAt }
    }

    return { allowed: true, remainingAttempts }
  } catch (error) {
    console.error('Rate limit check exception:', error)
    return { allowed: true, remainingAttempts: config.maxAttempts }
  }
}

/**
 * Record a login attempt
 */
export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  userId?: string
): Promise<void> {
  try {
    await supabase.from('login_attempts').insert({
      user_id: userId || null,
      email,
      ip_address: ipAddress,
      user_agent: userAgent,
      success,
    })
  } catch (error) {
    console.error('Failed to record login attempt:', error)
  }
}

/**
 * Get client IP address (simplified for now)
 */
export function getClientIP(): string {
  // In production, you'd get this from headers or a service
  // For now, return a placeholder
  return 'unknown'
}

/**
 * Get user agent
 */
export function getUserAgent(): string {
  return navigator.userAgent || 'unknown'
}

/**
 * Clear old login attempts (cleanup function)
 */
export async function clearOldAttempts(daysOld: number = 7): Promise<void> {
  try {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
    await supabase
      .from('login_attempts')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
  } catch (error) {
    console.error('Failed to clear old attempts:', error)
  }
}
