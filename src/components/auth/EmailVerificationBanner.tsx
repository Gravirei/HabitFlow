import { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { isEmailVerified, useAuth } from '@/lib/auth/AuthContext'
import { logout } from '@/lib/auth/logout'

/**
 * Shows a banner for users who are signed in but have not confirmed their email.
 * Provides a resend verification email action.
 */
export function EmailVerificationBanner() {
  const { user, isLoading } = useAuth()
  const [isResending, setIsResending] = useState(false)

  if (isLoading) return null
  if (!user) return null
  if (isEmailVerified(user)) return null

  const email = user.email

  return (
    <div className="sticky top-0 z-50 w-full bg-amber-500/90 text-white backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5">warning</span>
          <div>
            <p className="font-semibold">Verify your email to continue</p>
            <p className="text-sm text-white/90">
              {email ? (
                <>We sent a verification link to <span className="font-semibold">{email}</span>.</>
              ) : (
                <>We sent a verification link to your email.</>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isResending}
            onClick={async () => {
              if (!email) {
                toast.error('Missing email address on account')
                return
              }

              setIsResending(true)
              try {
                // Resend confirmation email
                const { error } = await supabase.auth.resend({
                  type: 'signup',
                  email,
                })

                if (error) throw error

                toast.success('Verification email resent')
              } catch (e: any) {
                console.error('Resend verification error:', e)
                toast.error(e?.message || 'Failed to resend verification email')
              } finally {
                setIsResending(false)
              }
            }}
            className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25 disabled:opacity-50"
          >
            {isResending ? 'Sending…' : 'Resend email'}
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                await logout()
                toast.success('Logged out')
              } catch (e: any) {
                toast.error(e?.message || 'Failed to log out')
              }
            }}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-white/90"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
