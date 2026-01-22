/**
 * Session Management
 * Manages user sessions across devices and provides session control
 */

import { supabase } from '@/lib/supabase'
import { parseUserAgent, type DeviceInfo } from './loginActivity'

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  ip_address: string
  user_agent: string
  device_info: DeviceInfo
  is_active: boolean
  last_activity: string
  expires_at: string
  created_at: string
}

/**
 * Create a new session
 */
export async function createSession(
  userId: string,
  sessionToken: string,
  ipAddress: string,
  userAgent: string,
  expiresInHours: number = 24
): Promise<void> {
  try {
    const deviceInfo = parseUserAgent(userAgent)
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

    await supabase.from('user_sessions').insert({
      user_id: userId,
      session_token: sessionToken,
      ip_address: ipAddress,
      user_agent: userAgent,
      device_info: deviceInfo,
      is_active: true,
      expires_at: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Failed to create session:', error)
  }
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<UserSession[]> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_activity', { ascending: false })

    if (error) {
      console.error('Failed to fetch sessions:', error)
      return []
    }

    return (data || []) as UserSession[]
  } catch (error) {
    console.error('Get sessions exception:', error)
    return []
  }
}

/**
 * Update session last activity
 */
export async function updateSessionActivity(sessionToken: string): Promise<void> {
  try {
    await supabase
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_token', sessionToken)
  } catch (error) {
    console.error('Failed to update session activity:', error)
  }
}

/**
 * Terminate a specific session
 */
export async function terminateSession(sessionId: string): Promise<void> {
  try {
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)
  } catch (error) {
    console.error('Failed to terminate session:', error)
  }
}

/**
 * Terminate all sessions except current
 */
export async function terminateAllOtherSessions(
  userId: string,
  currentSessionToken: string
): Promise<void> {
  try {
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .neq('session_token', currentSessionToken)
      .eq('is_active', true)
  } catch (error) {
    console.error('Failed to terminate other sessions:', error)
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanExpiredSessions(): Promise<void> {
  try {
    const now = new Date().toISOString()
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .lt('expires_at', now)
      .eq('is_active', true)
  } catch (error) {
    console.error('Failed to clean expired sessions:', error)
  }
}

/**
 * Check if session is valid
 */
export async function isSessionValid(sessionToken: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return false
    }

    const expiresAt = new Date(data.expires_at)
    if (expiresAt < new Date()) {
      await terminateSession(data.id)
      return false
    }

    return true
  } catch (error) {
    console.error('Session validation exception:', error)
    return false
  }
}
