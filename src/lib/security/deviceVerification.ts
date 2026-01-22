/**
 * Device Verification
 * Manages trusted devices and verifies new devices
 */

import { supabase } from '@/lib/supabase'
import { parseUserAgent, type DeviceInfo } from './loginActivity'

export interface TrustedDevice {
  id: string
  user_id: string
  device_id: string
  device_name: string
  device_info: DeviceInfo
  ip_address: string
  is_trusted: boolean
  last_used: string
  created_at: string
}

/**
 * Generate a device fingerprint (simplified)
 */
export function generateDeviceId(): string {
  const userAgent = navigator.userAgent
  const screenResolution = `${screen.width}x${screen.height}`
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const language = navigator.language

  const fingerprint = `${userAgent}-${screenResolution}-${timezone}-${language}`
  
  // Create a simple hash (in production, use a proper hashing library)
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  
  return `device_${Math.abs(hash).toString(36)}`
}

/**
 * Generate a device name
 */
export function generateDeviceName(deviceInfo: DeviceInfo): string {
  const parts = []
  
  if (deviceInfo.browser) parts.push(deviceInfo.browser)
  if (deviceInfo.os) parts.push(deviceInfo.os)
  if (deviceInfo.device) parts.push(deviceInfo.device)
  
  return parts.join(' on ') || 'Unknown Device'
}

/**
 * Check if device is trusted
 */
export async function isDeviceTrusted(
  userId: string,
  deviceId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('trusted_devices')
      .select('*')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .eq('is_trusted', true)
      .single()

    if (error || !data) {
      return false
    }

    // Update last used
    await supabase
      .from('trusted_devices')
      .update({ last_used: new Date().toISOString() })
      .eq('id', data.id)

    return true
  } catch (error) {
    console.error('Device trust check exception:', error)
    return false
  }
}

/**
 * Add a trusted device
 */
export async function addTrustedDevice(
  userId: string,
  deviceId: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  try {
    const deviceInfo = parseUserAgent(userAgent)
    const deviceName = generateDeviceName(deviceInfo)

    await supabase.from('trusted_devices').insert({
      user_id: userId,
      device_id: deviceId,
      device_name: deviceName,
      device_info: deviceInfo,
      ip_address: ipAddress,
      is_trusted: true,
    })
  } catch (error) {
    console.error('Failed to add trusted device:', error)
  }
}

/**
 * Get all trusted devices for a user
 */
export async function getTrustedDevices(userId: string): Promise<TrustedDevice[]> {
  try {
    const { data, error } = await supabase
      .from('trusted_devices')
      .select('*')
      .eq('user_id', userId)
      .eq('is_trusted', true)
      .order('last_used', { ascending: false })

    if (error) {
      console.error('Failed to fetch trusted devices:', error)
      return []
    }

    return (data || []) as TrustedDevice[]
  } catch (error) {
    console.error('Get trusted devices exception:', error)
    return []
  }
}

/**
 * Remove a trusted device
 */
export async function removeTrustedDevice(deviceId: string): Promise<void> {
  try {
    await supabase
      .from('trusted_devices')
      .update({ is_trusted: false })
      .eq('id', deviceId)
  } catch (error) {
    console.error('Failed to remove trusted device:', error)
  }
}

/**
 * Check if device verification is needed
 */
export async function requiresDeviceVerification(
  userId: string,
  deviceId: string
): Promise<boolean> {
  const isTrusted = await isDeviceTrusted(userId, deviceId)
  return !isTrusted
}
