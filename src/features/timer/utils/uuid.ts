/**
 * UUID Generator Utility
 * Fallback implementation for browsers that don't support crypto.randomUUID()
 * Compatible with all browsers including older mobile browsers
 */

/**
 * Generates a UUID v4 using Web Crypto API if available,
 * falls back to a polyfill implementation for older browsers
 */
export const generateUUID = (): string => {
  // Use crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback for older browsers
  // Credit: RFC4122 version 4 compliant solution
  // Adapted from: https://stackoverflow.com/a/2117523/11037553
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0 // Random 0-15
    const v = c === 'x' ? r : (r & 0x3) | 0x8 // For 'y': bits 8-11 set to 010b
    return v.toString(16)
  })
}

/**
 * Generates a simple UUID v4 without dashes (for internal use)
 */
export const generateSimpleUUID = (): string => {
  return generateUUID().replace(/-/g, '')
}

/**
 * Type guard to check if crypto.randomUUID is supported
 */
export const isUUIDSupported = (): boolean => {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
}
