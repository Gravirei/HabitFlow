import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

function calculatePasswordStrength(password: string) {
  let strength = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  if (checks.length) strength += 30
  if (checks.uppercase) strength += 15
  if (checks.lowercase) strength += 15
  if (checks.number) strength += 20
  if (checks.special) strength += 20

  return { strength, checks }
}

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  const strength = useMemo(() => calculatePasswordStrength(password), [password])

  useEffect(() => {
    // When user lands here from the recovery email, Supabase will put tokens in the URL.
    // supabase-js will pick them up (detectSessionInUrl: true).
    // We can optionally validate that a session exists.
    (async () => {
      const { data } = await supabase.auth.getSession()
      // If there is no session, the user likely opened this page directly.
      if (!data.session) {
        // Don't hard-block; just inform.
        console.warn('No recovery session detected. User may have opened reset page directly.')
      }
    })()
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    setPasswordError('')
    setConfirmPasswordError('')

    let hasError = false

    if (!password.trim()) {
      setPasswordError('New password is required')
      hasError = true
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your new password')
      hasError = true
    }

    if (hasError) return

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return
    }

    if (strength.strength < 60) {
      setPasswordError('Please choose a stronger password')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      toast.success('Password updated successfully. Please sign in.')
      navigate('/login')
    } catch (error: any) {
      console.error('Reset password error:', error)
      toast.error(error?.message || 'Failed to update password')
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

      <div className="relative flex flex-col w-full max-w-md mx-auto px-6 py-12 justify-center">
        {/* Header */}
        <div className="mb-8 text-center">
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
                  lock_reset
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Reset password</h1>
          <p className="text-white/80">Choose a new password for your account.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-6">
          <form onSubmit={handleReset} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">New password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (passwordError) setPasswordError('')
                  }}
                  placeholder="Enter a new password"
                  className={`w-full rounded-xl border-2 ${
                    passwordError
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-800'
                  } pl-12 pr-12 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none focus:ring-0`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {passwordError && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {passwordError}
                </p>
              )}
              <div className="mt-2">
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      strength.strength < 40 ? 'bg-red-500' : strength.strength < 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, strength.strength)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Use 8+ chars with a mix of letters, numbers, and symbols.
                </p>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm new password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">check_circle</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (confirmPasswordError) setConfirmPasswordError('')
                  }}
                  placeholder="Confirm new password"
                  className={`w-full rounded-xl border-2 ${
                    confirmPasswordError
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                      : confirmPassword && password === confirmPassword
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-slate-400 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-800'
                  } pl-12 pr-12 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none focus:ring-0`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {confirmPasswordError && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {confirmPasswordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary-focus active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/80">
          After updating your password, you’ll be redirected to sign in.
        </p>
      </div>
    </div>
  )
}
