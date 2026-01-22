import { useNavigate } from 'react-router-dom'

export function Welcome() {
  const navigate = useNavigate()

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth
    console.log('Google signup clicked')
  }

  const handleAppleSignup = () => {
    // TODO: Implement Apple Sign In
    console.log('Apple signup clicked')
  }

  const handleEmailSignup = () => {
    // Navigate to email signup page (to be created)
    navigate('/signup')
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleLater = () => {
    // Skip authentication for now and go to home
    navigate('/')
  }

  return (
    <div className="relative flex min-h-screen w-full bg-background-dark">
      {/* Top Bar - Later Button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={handleLater}
          className="text-white/80 hover:text-white text-base font-medium transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Container */}
      <div className="relative flex flex-col w-full max-w-md mx-auto px-6 py-12 justify-center">
        {/* Header */}
        <div className="mb-8 text-center">
          {/* App Logo */}
          <div className="inline-block mb-6">
            <div className="relative w-28 h-28">
              <div className="absolute inset-2 flex items-center justify-center">
                <svg className="overflow-visible w-full h-full" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="46" stroke="#13ec5b" strokeOpacity="0.2" strokeWidth="4"></circle>
                  <path d="M 50 4 A 46 46 0 1 1 10.7 25.8" stroke="#13ec5b" strokeLinecap="round" strokeWidth="4" fill="none"></path>
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                <span 
                  className="material-symbols-outlined text-[#13ec5b]" 
                  style={{ fontSize: '48px', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
                >
                  trending_up
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-white text-3xl font-bold leading-tight mb-3">
            Welcome to HabitFlow
          </h1>

          {/* Description */}
          <p className="text-white/80 text-base leading-normal max-w-xs mx-auto">
            Start your journey to better habits and achieve your goals
          </p>
        </div>

        {/* Sign Up Options Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-6">
          <div className="space-y-4">
            {/* Google Button */}
            <button
              onClick={handleGoogleSignup}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3.5 font-semibold text-slate-800 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98]"
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
              <span>Continue with Google</span>
            </button>

            {/* Apple Button */}
            <button
              onClick={handleAppleSignup}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3.5 font-semibold text-slate-800 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98]"
            >
              <svg className="h-5 w-5 text-slate-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span>Continue with Apple</span>
            </button>

            {/* Email Button */}
            <button
              onClick={handleEmailSignup}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3.5 font-semibold text-slate-800 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">
                mail
              </span>
              <span>Continue with Email</span>
            </button>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-white/80">
          Already have an account?{' '}
          <button
            onClick={handleLogin}
            className="font-semibold text-white hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
