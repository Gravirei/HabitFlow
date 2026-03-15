import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { TurnstileWidget } from '@/components/shared/TurnstileWidget'
import { callAuthGateway } from '@/lib/security/authGatewayClient'
import { supabase } from '@/lib/supabase'

/**
 * Detects if running in a mobile app WebView (Capacitor/Cordova)
 * Mobile apps don't need CAPTCHA - they have native security
 */
function isMobileApp(): boolean {
  if (typeof window !== 'undefined') {
    // @ts-expect-error - Capacitor is available at runtime in mobile apps
    if (window.Capacitor?.isNativePlatform?.()) {
      return true
    }
    // @ts-expect-error - Cordova is available at runtime in mobile apps
    if (window.cordova) {
      return true
    }
    const userAgent = navigator.userAgent || ''
    if (/iPhone|iPad|iPod|Android.*Mobile/i.test(userAgent)) {
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

export function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setEmailError('')

    // Validate field
    if (!email.trim()) {
      setEmailError('Email is required')
      return
    }

    // Check if Turnstile is configured and token is required (not needed for mobile)
    const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
    const turnstileDisabled = import.meta.env.VITE_TURNSTILE_DISABLED === 'true'
    const isMobile = isMobileApp()
    const isTurnstileRequired = turnstileSiteKey && !turnstileDisabled && !isMobile

    if (isTurnstileRequired && !turnstileToken) {
      setEmailError('Please complete the security check')
      return
    }

    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      toast.error(
        'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
      )
      console.error(
        'Missing Supabase configuration. Check SUPABASE_SETUP.md for setup instructions.'
      )
      return
    }

    setIsLoading(true)

    try {
      const useDirectAuth = turnstileDisabled || !turnstileSiteKey

      if (useDirectAuth) {
        // use direct Supabase auth
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
          toast.error(error.message || 'Failed to send reset email')
          console.error('Forgot-password error:', error)
          return
        }
      } else {
        const res = await callAuthGateway('forgot-password', {
          email,
          turnstileToken,
        })

        if (!res.ok) {
          if (res.error === 'rate_limited') {
            toast.error('Too many reset requests. Please try again later.')
            return
          }
          if (res.error === 'turnstile_failed') {
            toast.error('Security verification failed. Please try again.')
            return
          }
          toast.error('Failed to send reset email')
          console.error('Forgot-password gateway error:', res)
          return
        }
      }

      setEmailSent(true)
      toast.success("If an account exists for that email, you'll receive a reset link shortly.")
    } catch (error: any) {
      console.error('Error sending reset email:', error)
      toast.error(error.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full bg-background-dark">
      {/* Back Button */}
      <button
        onClick={() => navigate('/login')}
        className="absolute left-6 top-6 z-10 flex items-center gap-2 text-white/80 transition-colors hover:text-white"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Main Container */}
      <div className="relative mx-auto flex w-full max-w-md flex-col justify-center px-6 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          {/* Logo */}
          <div className="mb-4 inline-block">
            <div className="relative h-20 w-20">
              <div className="absolute inset-1 flex items-center justify-center">
                <svg
                  className="h-full w-full overflow-visible"
                  fill="none"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    stroke="#13ec5b"
                    strokeOpacity="0.2"
                    strokeWidth="4"
                  ></circle>
                  <path
                    d="M 50 4 A 46 46 0 1 1 10.7 25.8"
                    stroke="#13ec5b"
                    strokeLinecap="round"
                    strokeWidth="4"
                    fill="none"
                  ></path>
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                <span
                  className="material-symbols-outlined text-[#13ec5b]"
                  style={{
                    fontSize: '40px',
                    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48",
                  }}
                >
                  trending_up
                </span>
              </div>
            </div>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-white">Forgot Password?</h1>
          <p className="text-white/80">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {!emailSent ? (
          <>
            {/* Form Card */}
            <div className="mb-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-800">
              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      mail
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (emailError) setEmailError('')
                      }}
                      placeholder="you@example.com"
                      className={`w-full rounded-xl border-2 ${
                        emailError
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                          : 'border-slate-200 bg-slate-50 focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:focus:border-slate-500 dark:focus:bg-slate-800'
                      } py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-0 dark:text-white dark:placeholder-slate-500`}
                      disabled={isLoading}
                    />
                  </div>
                  {emailError && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Turnstile Widget */}
                <TurnstileWidget
                  onSuccess={(token) => {
                    setTurnstileToken(token)
                    if (emailError) setEmailError('')
                  }}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary-focus active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin">
                        progress_activity
                      </span>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </div>

            {/* Back to Login */}
            <p className="text-center text-sm text-white/80">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-semibold text-white hover:underline"
              >
                Sign in
              </button>
            </p>
          </>
        ) : (
          <>
            {/* Success Card */}
            <div className="mb-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-800">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">
                    mark_email_read
                  </span>
                </div>
                <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                  Check Your Email
                </h2>
                <p className="mb-6 text-slate-600 dark:text-slate-400">
                  If an account exists for <strong>{email}</strong>, you'll receive password reset
                  instructions shortly.
                </p>
                <div className="mb-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined mr-1 align-middle text-base">
                      info
                    </span>
                    Didn't receive an email? Check your spam folder, or make sure you entered the
                    correct address and try again.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEmailSent(false)
                    setEmail('')
                  }}
                  className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary-focus active:scale-[0.98]"
                >
                  Send Again
                </button>
              </div>
            </div>

            {/* Back to Login */}
            <p className="text-center text-sm text-white/80">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-semibold text-white hover:underline"
              >
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
