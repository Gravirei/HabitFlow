/**
 * Login Activity Monitoring
 * Tracks and logs user login activities for security monitoring
 */

import { supabase } from '@/lib/supabase'

export interface DeviceInfo {
  browser?: string
  os?: string
  device?: string
  isMobile?: boolean
}

export interface LoginActivityEntry {
  id: string
  user_id: string
  email: string
  ip_address: string
  user_agent: string
  device_info: DeviceInfo
  location?: {
    country?: string
    city?: string
  }
  login_type: string
  created_at: string
}

/**
 * Parse user agent to extract device info
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
  const info: DeviceInfo = {
    browser: 'Unknown',
    os: 'Unknown',
    device: 'Unknown',
    isMobile: false,
  }

  // Detect mobile
  info.isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)

  // Detect browser
  if (userAgent.includes('Chrome')) info.browser = 'Chrome'
  else if (userAgent.includes('Firefox')) info.browser = 'Firefox'
  else if (userAgent.includes('Safari')) info.browser = 'Safari'
  else if (userAgent.includes('Edge')) info.browser = 'Edge'
  else if (userAgent.includes('Opera')) info.browser = 'Opera'

  // Detect OS
  if (userAgent.includes('Windows')) info.os = 'Windows'
  else if (userAgent.includes('Mac')) info.os = 'macOS'
  else if (userAgent.includes('Linux')) info.os = 'Linux'
  else if (userAgent.includes('Android')) info.os = 'Android'
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad'))
    info.os = 'iOS'

  // Detect device type
  if (info.isMobile) {
    if (userAgent.includes('iPhone')) info.device = 'iPhone'
    else if (userAgent.includes('iPad')) info.device = 'iPad'
    else if (userAgent.includes('Android')) info.device = 'Android Device'
    else info.device = 'Mobile Device'
  } else {
    info.device = 'Desktop'
  }

  return info
}

/**
 * Record a login activity
 */
export async function recordLoginActivity(
  userId: string,
  email: string,
  ipAddress: string,
  userAgent: string,
  loginType: 'password' | '2fa' | 'magic_link' | 'oauth' = 'password'
): Promise<void> {
  try {
    const deviceInfo = parseUserAgent(userAgent)

    await supabase.from('login_activity').insert({
      user_id: userId,
      email,
      ip_address: ipAddress,
      user_agent: userAgent,
      device_info: deviceInfo,
      login_type: loginType,
    })
  } catch (error) {
    console.error('Failed to record login activity:', error)
  }
}

/**
 * Get user's login history
 */
export async function getUserLoginHistory(
  userId: string,
  limit: number = 10
): Promise<LoginActivityEntry[]> {
  try {
    const { data, error } = await supabase
      .from('login_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch login history:', error)
      return []
    }

    return (data || []) as LoginActivityEntry[]
  } catch (error) {
    console.error('Login history exception:', error)
    return []
  }
}

/**
 * Check for suspicious activity
 */
export async function checkSuspiciousActivity(
  userId: string,
  currentIp: string
): Promise<{ isSuspicious: boolean; reason?: string }> {
  try {
    // Get recent login activities
    const recentLogins = await getUserLoginHistory(userId, 5)

    if (recentLogins.length === 0) {
      return { isSuspicious: false }
    }

    // Check if IP address is significantly different
    const recentIPs = recentLogins.map((login) => login.ip_address)
    const ipChanges = recentIPs.filter((ip) => ip !== currentIp)

    // If all recent IPs are different from current, flag as suspicious
    if (ipChanges.length === recentIPs.length && recentIPs.length >= 3) {
      return {
        isSuspicious: true,
        reason: 'Login from new location',
      }
    }

    // Check for rapid location changes (multiple IPs in short time)
    const uniqueRecentIPs = new Set(recentIPs)
    if (uniqueRecentIPs.size >= 3 && recentLogins.length <= 5) {
      return {
        isSuspicious: true,
        reason: 'Multiple locations detected',
      }
    }

    return { isSuspicious: false }
  } catch (error) {
    console.error('Suspicious activity check exception:', error)
    return { isSuspicious: false }
  }
}
