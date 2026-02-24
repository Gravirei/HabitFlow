import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { TurnstileWidget } from '@/components/shared/TurnstileWidget'
import { callAuthGateway } from '@/lib/security/authGatewayClient'

// Password strength checker
const calculatePasswordStrength = (password: string) => {
  let strength = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  if (checks.length) strength += 20
  if (checks.lowercase) strength += 20
  if (checks.uppercase) strength += 20
  if (checks.number) strength += 20
  if (checks.special) strength += 20

  return { strength, checks }
}

const getStrengthColor = (strength: number) => {
  if (strength < 40) return 'bg-red-500'
  if (strength < 60) return 'bg-orange-500'
  if (strength < 80) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getStrengthText = (strength: number) => {
  if (strength < 40) return 'Weak'
  if (strength < 60) return 'Fair'
  if (strength < 80) return 'Good'
  return 'Strong'
}

export function Signup() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [rememberDevice, setRememberDevice] = useState(true) // Default to true for new users

  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setUsernameError('')
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')
    
    // Validate fields
    let hasError = false
    
    if (!username.trim()) {
      setUsernameError('Username is required')
      hasError = true
    }
    
    if (!email.trim()) {
      setEmailError('Email is required')
      hasError = true
    }
    
    if (!password.trim()) {
      setPasswordError('Password is required')
      hasError = true
    }
    
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password')
      hasError = true
    }
    
    if (hasError) {
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
    
    // Validation
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const res = await callAuthGateway('signup', {
        email,
        password,
        username,
        turnstileToken,
      })

      if (!res.ok) {
        if (res.error === 'rate_limited') {
          toast.error('Too many signup attempts. Please try again later.')
          return
        }
        if (res.error === 'turnstile_failed') {
          toast.error('Security verification failed. Please try again.')
          return
        }

        // If Supabase says user already exists
        const msg = (res.data as any)?.msg || (res.data as any)?.message
        if (msg && String(msg).toLowerCase().includes('user already registered')) {
          toast.error('This email is already registered. Please login instead.')
          navigate('/login')
          return
        }

        toast.error('Failed to create account')
        console.error('Signup gateway error:', res)
        return
      }

      // Save remember device preference for when user logs in
      if (rememberDevice) {
        localStorage.setItem('rememberDevice', 'true')
      } else {
        localStorage.removeItem('rememberDevice')
      }

      toast.success('Account created! Please check your email to verify your account.')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(error.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error('Google signup error:', error)
      toast.error(error.message || 'Failed to sign up with Google')
    }
  }

  const handleAppleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error('Apple signup error:', error)
      toast.error(error.message || 'Failed to sign up with Apple')
    }
  }

  return (
    <div className="relative flex min-h-screen w-full bg-background-dark">

      {/* Back Button */}
      <button
        onClick={() => navigate('/welcome')}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Main Container */}
      <div className="relative flex flex-col w-full max-w-md mx-auto px-6 py-12 justify-center">
        {/* Header */}
        <div className="mb-8 text-center">
          {/* Logo - matching Welcome page */}
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
            Create your account
          </h1>
          <p className="text-white/80">
            Join thousands building better habits
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-6">
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                  person
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (usernameError) setUsernameError('')
                  }}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Choose a username"
                  className={`w-full rounded-xl border-2 ${
                    usernameError
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                      : focusedField === 'username' 
                      ? 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800' 
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                  } pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none focus:ring-0`}
                  disabled={isLoading}
                />
              </div>
              {usernameError && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {usernameError}
                </p>
              )}
            </div>

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
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border-2 ${
                    emailError
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                      : focusedField === 'email' 
                      ? 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800' 
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
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

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (passwordError) setPasswordError('')
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Create a strong password"
                  className={`w-full rounded-xl border-2 ${
                    passwordError
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                      : focusedField === 'password' 
                      ? 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800' 
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                  } pl-12 pr-12 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none focus:ring-0`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {passwordError && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {passwordError}
                </p>
              )}

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Password strength
                    </span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength.strength < 40 ? 'text-red-500' :
                      passwordStrength.strength < 60 ? 'text-orange-500' :
                      passwordStrength.strength < 80 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {getStrengthText(passwordStrength.strength)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength.strength)}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className={`flex items-center gap-1.5 text-xs ${
                      passwordStrength.checks.length ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {passwordStrength.checks.length ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${
                      passwordStrength.checks.uppercase ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {passwordStrength.checks.uppercase ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>Uppercase</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${
                      passwordStrength.checks.lowercase ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {passwordStrength.checks.lowercase ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>Lowercase</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${
                      passwordStrength.checks.number ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {passwordStrength.checks.number ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>Number</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs col-span-2 ${
                      passwordStrength.checks.special ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {passwordStrength.checks.special ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>Special character (!@#$%...)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                  check_circle
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (confirmPasswordError) setConfirmPasswordError('')
                  }}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Confirm your password"
                  className={`w-full rounded-xl border-2 ${
                    confirmPasswordError
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                      : focusedField === 'confirmPassword' 
                      ? 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800' 
                      : confirmPassword && password === confirmPassword
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : confirmPassword && password !== confirmPassword
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                  } pl-12 pr-12 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none focus:ring-0`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {confirmPasswordError && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {confirmPasswordError}
                </p>
              )}
              {!confirmPasswordError && confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  Passwords do not match
                </p>
              )}
              {!confirmPasswordError && confirmPassword && password === confirmPassword && (
                <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Passwords match
                </p>
              )}
            </div>

            {/* Remember this device checkbox */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="sr-only peer"
                  disabled={isLoading}
                />
                <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 peer-checked:border-primary peer-checked:bg-primary/10 transition-all flex items-center justify-center">
                  {rememberDevice && (
                    <span className="material-symbols-outlined text-primary text-sm">
                      check
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">
                Remember this device
              </span>
            </label>

            {/* Turnstile Widget */}
            <TurnstileWidget
              onSuccess={(token) => {
                setTurnstileToken(token)
                if (emailError) setEmailError('')
              }}
              onError={() => setTurnstileToken(null)}
              onExpire={() => setTurnstileToken(null)}
            />

            {/* Signup Button */}
            <button
              type="submit"
              disabled={isLoading || passwordStrength.strength < 60}
              className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary-focus active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Creating your account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-2">
              By signing up, you agree to our{' '}
              <Link
                to="/terms"
                target="_blank"
                className="text-primary hover:underline font-medium"
              >
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link
                to="/privacy"
                target="_blank"
                className="text-primary hover:underline font-medium"
              >
                Privacy Policy
              </Link>
            </p>
          </form>

        </div>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <hr className="flex-grow border-t border-white/30" />
          <span className="px-4 text-sm font-medium text-white/80">Or continue with</span>
          <hr className="flex-grow border-t border-white/30" />
        </div>

        {/* Social Login Buttons */}
        <div className="flex gap-4 mb-8">
          {/* Google Button */}
          <button
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-white/50 px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-200 transition-all hover:border-white hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="hidden sm:inline">Google</span>
          </button>

          {/* Apple Button */}
          <button
            onClick={handleAppleSignup}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-white/50 px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-200 transition-all hover:border-white hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5 text-slate-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <span className="hidden sm:inline">Apple</span>
          </button>
        </div>

        {/* Already have account */}
        <p className="text-center text-sm text-white/80">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-semibold text-white hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
