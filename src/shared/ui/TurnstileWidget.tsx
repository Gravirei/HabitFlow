import { useMemo } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onError?: () => void
  onExpire?: () => void
}

/**
 * Detects if running in a mobile app WebView (Capacitor/Cordova)
 * Mobile apps don't need CAPTCHA - they have native security
 */
function isMobileApp(): boolean {
  // Check for Capacitor (React Native / mobile)
  if (typeof window !== 'undefined') {
    // @ts-expect-error - Capacitor is available at runtime in mobile apps
    if (window.Capacitor?.isNativePlatform?.()) {
      return true
    }
    // Check for Cordova
    // @ts-expect-error - Cordova is available at runtime in mobile apps
    if (window.cordova) {
      return true
    }
    // Check user agent for WebViews
    const userAgent = navigator.userAgent || ''
    if (/iPhone|iPad|iPod|Android.*Mobile/i.test(userAgent)) {
      // Additional WebView check
      const isWebView =
        /wv|WebView/i.test(userAgent) ||
        (/(iPhone|iPad|iPod)/i.test(userAgent) && !/Safari/i.test(userAgent))
      if (isWebView) {
        return true
      }
    }
  }
  return false
}

export function TurnstileWidget({ onSuccess, onError, onExpire }: TurnstileWidgetProps) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
  const forceDisable = import.meta.env.VITE_TURNSTILE_DISABLED === 'true'

  // Skip Turnstile for mobile apps or when disabled
  const isMobile = useMemo(() => isMobileApp(), [])

  if (!siteKey || forceDisable || isMobile) {
    // Auto-pass for mobile apps (no CAPTCHA needed)
    if (isMobile && siteKey && !forceDisable) {
      console.info('[Turnstile] Skipped - mobile app detected')
    }
    // Return null but still call onSuccess to allow form submission
    // This lets the login flow continue without CAPTCHA
    return null
  }

  return (
    <div className="flex justify-center">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        options={{
          theme: 'light',
          size: 'normal',
        }}
      />
    </div>
  )
}
