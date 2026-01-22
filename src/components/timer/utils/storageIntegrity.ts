/**
 * Storage Integrity Utility
 * Provides integrity checks for localStorage data using checksums
 * 
 * Security: Detects tampering and corruption of stored data
 */

import { logger } from './logger'

/**
 * Simple hash function for generating checksums
 * Not cryptographically secure, but sufficient for detecting accidental corruption
 */
function simpleHash(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

interface StorageData<T> {
  data: T
  version: number
  checksum: string
  timestamp: number
}

/**
 * Current storage version for migration purposes
 */
const STORAGE_VERSION = 1

/**
 * Safely saves data to localStorage with integrity checking
 * 
 * @param key - Storage key
 * @param data - Data to store
 * @returns Success boolean
 */
export function secureSetItem<T>(key: string, data: T): boolean {
  try {
    const dataString = JSON.stringify(data)
    const checksum = simpleHash(dataString)
    
    const storageData: StorageData<T> = {
      data,
      version: STORAGE_VERSION,
      checksum,
      timestamp: Date.now()
    }
    
    localStorage.setItem(key, JSON.stringify(storageData))
    return true
  } catch (error) {
    logger.error('Failed to securely save to localStorage', error, {
      context: 'storageIntegrity',
      data: { key }
    })
    return false
  }
}

/**
 * Safely retrieves data from localStorage with integrity verification
 * 
 * @param key - Storage key
 * @param defaultValue - Default value if data not found or corrupted
 * @returns Data or default value
 */
export function secureGetItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue
    
    const storageData = JSON.parse(item) as StorageData<T>
    
    // Check if it's wrapped data (has checksum)
    if (!storageData.checksum) {
      // Old format without integrity check - migrate
      logger.warn('Data stored without integrity check, migrating', {
        context: 'storageIntegrity',
        data: { key }
      })
      return item ? JSON.parse(item) : defaultValue
    }
    
    // Verify checksum
    const dataString = JSON.stringify(storageData.data)
    const expectedChecksum = simpleHash(dataString)
    
    if (storageData.checksum !== expectedChecksum) {
      logger.error('Storage integrity check failed - data may be corrupted', undefined, {
        context: 'storageIntegrity',
        data: { 
          key, 
          expected: expectedChecksum, 
          actual: storageData.checksum 
        }
      })
      return defaultValue
    }
    
    // Version check (for future migrations)
    if (storageData.version !== STORAGE_VERSION) {
      logger.info('Storage version mismatch, may need migration', {
        context: 'storageIntegrity',
        data: { 
          key, 
          currentVersion: STORAGE_VERSION, 
          dataVersion: storageData.version 
        }
      })
      // For now, still return data - implement migration logic here if needed
    }
    
    return storageData.data
  } catch (error) {
    logger.error('Failed to securely retrieve from localStorage', error, {
      context: 'storageIntegrity',
      data: { key }
    })
    return defaultValue
  }
}

/**
 * Checks if stored data is valid and not corrupted
 * 
 * @param key - Storage key
 * @returns True if data is valid
 */
export function verifyStorageIntegrity(key: string): boolean {
  try {
    const item = localStorage.getItem(key)
    if (!item) return true // No data is valid
    
    const storageData = JSON.parse(item) as StorageData<any>
    if (!storageData.checksum) return true // Old format, can't verify
    
    const dataString = JSON.stringify(storageData.data)
    const expectedChecksum = simpleHash(dataString)
    
    return storageData.checksum === expectedChecksum
  } catch {
    return false
  }
}

/**
 * Gets storage metadata without loading the full data
 * 
 * @param key - Storage key
 * @returns Metadata or null
 */
export function getStorageMetadata(key: string): { version: number; timestamp: number; size: number } | null {
  try {
    const item = localStorage.getItem(key)
    if (!item) return null
    
    const storageData = JSON.parse(item) as StorageData<any>
    
    return {
      version: storageData.version || 0,
      timestamp: storageData.timestamp || 0,
      size: item.length
    }
  } catch {
    return null
  }
}

/**
 * Migrates old localStorage data to new format with integrity checks
 * 
 * @param key - Storage key
 */
export function migrateToSecureStorage<T>(key: string): boolean {
  try {
    const item = localStorage.getItem(key)
    if (!item) return true
    
    const data = JSON.parse(item)
    
    // Check if already migrated
    if (data.checksum) return true
    
    // Migrate to new format
    return secureSetItem(key, data)
  } catch (error) {
    logger.error('Failed to migrate storage data', error, {
      context: 'storageIntegrity',
      data: { key }
    })
    return false
  }
}
