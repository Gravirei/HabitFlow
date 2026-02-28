import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function SplashScreen() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 30)

    // Navigate to home after 3 seconds
    const timer = setTimeout(() => {
      navigate('/today')
    }, 3000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(timer)
    }
  }, [navigate])

  return (
    <div className="relative flex h-screen w-full max-w-md mx-auto flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Main Content - Centered */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        {/* App Logo with Animation */}
        <div className="mb-6">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-primary/20">
            {/* Pulsing Ring Animation */}
            <div className="absolute inset-0 animate-pulse rounded-full border-2 border-primary opacity-50"></div>
            {/* Icon */}
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: '64px', fontVariationSettings: "'FILL' 1" }}
            >
              trending_up
            </span>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-slate-900 dark:text-white font-display text-[40px] font-bold leading-tight tracking-tight px-4 text-center pb-2">
          HabitFlow
        </h1>

        {/* Tagline */}
        <p className="text-slate-600 dark:text-slate-300 font-display text-lg font-normal leading-normal px-4 text-center">
          Build Better Habits, One Day at a Time.
        </p>
      </div>

      {/* Loading Indicator Section - Bottom */}
      <div className="flex flex-col items-center justify-end p-8 pb-12 pb-safe">
        {/* Progress Bar */}
        <div className="flex w-full max-w-xs flex-col gap-3">
          <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
