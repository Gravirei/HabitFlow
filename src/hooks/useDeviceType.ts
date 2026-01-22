/**
 * Device Type Detection Hook
 * Detects if the user is on a mobile, tablet, or desktop device
 * Used for conditional rendering of features like keyboard shortcuts
 */

import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * Hook to detect the current device type
 * @returns DeviceType - 'mobile', 'tablet', or 'desktop'
 */
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth

      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    // Initial check
    checkDevice()

    // Listen for window resize
    window.addEventListener('resize', checkDevice)

    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return deviceType
}

/**
 * Hook to detect if the user is on a mobile device
 * Combines multiple detection methods for accuracy:
 * - User agent string (detects mobile browsers)
 * - Screen width (detects small screens)
 * - Touch capabilities (detects touch-only devices)
 *
 * @returns boolean - true if mobile device detected
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      // Check 1: User Agent (most reliable for actual mobile devices)
      const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )

      // Check 2: Screen width (catches small screens)
      const smallScreen = window.innerWidth < 768

      // Check 3: Touch capability (has touch points)
      const touchCapable = navigator.maxTouchPoints > 0

      // Mobile if: mobile user agent OR (small screen AND touch capable)
      // This ensures iPads with keyboards aren't classified as mobile
      const isMobileDevice = mobileUserAgent || (smallScreen && touchCapable)

      setIsMobile(isMobileDevice)
    }

    // Initial check
    checkMobile()

    // Listen for window resize
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

/**
 * Hook to detect if the user is on a desktop device
 * @returns boolean - true if desktop device detected
 */
export function useIsDesktop(): boolean {
  const deviceType = useDeviceType()
  return deviceType === 'desktop'
}

/**
 * Hook to detect if the user is on a tablet device
 * @returns boolean - true if tablet device detected
 */
export function useIsTablet(): boolean {
  const deviceType = useDeviceType()
  return deviceType === 'tablet'
}
