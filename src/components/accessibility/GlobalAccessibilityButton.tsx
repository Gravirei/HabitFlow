import { useLocation } from 'react-router-dom'
import { AccessibilityButton } from '@/components/AccessibilityButton'
import { useAccessibilityStore } from '@/store/useAccessibilityStore'

const HIDDEN_ROUTES = new Set([
  '/',
  '/welcome',
  '/onboarding',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/2fa-verify',
  '/terms',
  '/privacy',
])

export function GlobalAccessibilityButton() {
  const location = useLocation()
  const showAccessibilityButton = useAccessibilityStore((s) => s.showAccessibilityButton)

  if (!showAccessibilityButton || HIDDEN_ROUTES.has(location.pathname)) {
    return null
  }

  return <AccessibilityButton />
}
