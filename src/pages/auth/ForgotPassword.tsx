import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { TurnstileWidget } from '@/components/shared/TurnstileWidget'
import { callAuthGateway } from '@/lib/security/authGatewayClient'

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
    
    // Check if Turnstile is configured and token is required
    const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
    if (turnstileSiteKey && !turnstileToken) {
      setEmailError('Please complete the security check')
      return
    }
    
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      toast.error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
      console.error('Missing Supabase configuration. Check SUPABASE_SETUP.md for setup instructions.')
      return
    }

    setIsLoading(true)

    try {
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
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Main Container */}
      <div className="relative flex flex-col w-full max-w-md mx-auto px-6 py-12 justify-center">
        {/* Header */}
        <div className="mb-8 text-center">
          {/* Logo */}
          <div className="inline-block mb-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-1 flex items-center justify-center">
                <svg className="overflow-visible w-full h-full" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="46" stroke="#13ec5b" strokeOpacity="0.2" strokeWidth="4"></circle>
                  <path d="M 50 4 A 46 46 0 1 1 10.7 25.8" stroke="#13ec5b" strokeLinecap="round" strokeWidth="4" fill="none"></path>
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                <span 
                  className="material-symbols-outlined text-[#13ec5b]" 
                  style={{ fontSize: '40px', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
                >
                  trending_up
                </span>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Forgot Password?
          </h1>
          <p className="text-white/80">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {!emailSent ? (
          <>
            {/* Form Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-6">
              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
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
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-800'
                      } pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none focus:ring-0`}
                      disabled={isLoading}
                    />
                  </div>
                  {emailError && (
                    <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
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
                  className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary-focus active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
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
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">mark_email_read</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Check Your Email
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  If an account exists for <strong>{email}</strong>, you'll receive password reset instructions shortly.
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-base align-middle mr-1">info</span>
                    Didn't receive an email? Check your spam folder, or make sure you entered the correct address and try again.
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
