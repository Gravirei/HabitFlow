import { Navigate, useLocation } from 'react-router-dom'
import { isEmailVerified, useAuth } from './AuthContext'

/**
 * Blocks access to children when the user is signed in but email is not verified.
 * Sends them to /settings (where banner is visible) or /welcome.
 */
export function RequireVerifiedEmail({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (!user) return children

  if (!isEmailVerified(user)) {
    // Keep user in the app but prevent protected flows until verified
    return <Navigate to="/settings" state={{ from: location.pathname }} replace />
  }

  return children
}
