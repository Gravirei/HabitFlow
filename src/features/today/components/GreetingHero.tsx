import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'

interface GreetingHeroProps {
  completedHabits: number
  totalHabits: number
  progressPercentage: number
  progressMessage: string
}

const QUOTES = [
  'Small steps lead to big changes.',
  'Consistency is the key to transformation.',
  'Every habit is a vote for your future self.',
  'Progress, not perfection.',
  'Build the life you want, one habit at a time.',
  'Discipline is choosing what you want most.',
  'Your competition is who you were yesterday.',
  'Show up every day.',
  'Motivation starts it. Habit sustains it.',
]

const GREETING_PHRASES = [
  'Ready to crush it?',
  'Make today count.',
  "You've got this!",
  'Stay consistent.',
  'Keep the streak alive.',
  'Small wins matter.',
  'Be proud of yourself.',
]

const getTimeGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const getRingColor = (pct: number) => {
  // Teal to Orange gradient feel logic
  if (pct >= 80)
    return { stroke: '#2DD4BF', glow: 'rgba(45,212,191,0.5)', track: 'rgba(45,212,191,0.1)' } // Teal 400
  if (pct >= 50)
    return { stroke: '#38BDF8', glow: 'rgba(56,189,248,0.5)', track: 'rgba(56,189,248,0.1)' } // Sky 400
  if (pct >= 25)
    return { stroke: '#818CF8', glow: 'rgba(129,140,248,0.5)', track: 'rgba(129,140,248,0.1)' } // Indigo 400
  return { stroke: '#FB923C', glow: 'rgba(251,146,60,0.5)', track: 'rgba(251,146,60,0.1)' } // Orange 400
}

const CIRCUMFERENCE = 2 * Math.PI * 52 // Larger ring radius

export function GreetingHero({
  completedHabits,
  totalHabits,
  progressPercentage,
  progressMessage,
}: GreetingHeroProps) {
  const ring = getRingColor(progressPercentage)
  const offset = CIRCUMFERENCE * (1 - progressPercentage / 100)

  // ── Cycling state ────────────────────────────────────────────────────────────
  const [quoteIndex, setQuoteIndex] = useState(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    )
    return dayOfYear % QUOTES.length
  })
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length)
    }, 8000) // Slower cycle
    const phraseTimer = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % GREETING_PHRASES.length)
    }, 6000)
    return () => {
      clearInterval(quoteTimer)
      clearInterval(phraseTimer)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative isolate w-full overflow-hidden rounded-[24px] p-4 sm:rounded-[32px] sm:p-6 md:p-8"
    >
      {/* Glass Background */}
      <div className="absolute inset-0 -z-10 border border-white/10 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-950/90 backdrop-blur-2xl" />

      {/* Ambient Glows */}
      <div
        className="absolute -right-24 -top-24 -z-10 size-64 rounded-full opacity-30 blur-[100px]"
        style={{ backgroundColor: ring.stroke }}
      />
      <div className="absolute -bottom-24 -left-24 -z-10 size-64 rounded-full bg-teal-900/40 blur-[80px]" />

      <div className="relative flex items-center justify-between gap-3 sm:gap-6 md:gap-8">
        {/* Left: Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 py-1 sm:gap-4 sm:py-2">
          {/* Date & Greeting */}
          <div>
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-200/60 sm:mb-1 sm:text-xs">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>

            <div className="relative h-6 overflow-hidden sm:h-8 md:h-9">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={phraseIndex}
                  initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute inset-0 whitespace-nowrap text-lg font-black tracking-tight text-white sm:text-2xl md:text-3xl"
                >
                  {getTimeGreeting()}
                </motion.h2>
              </AnimatePresence>
            </div>

            <div className="relative mt-1 h-8 overflow-hidden sm:mt-2 sm:h-10 md:h-12">
              <AnimatePresence mode="wait">
                <motion.p
                  key={quoteIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-sm text-xs font-medium leading-relaxed text-slate-400 sm:text-sm md:text-base"
                >
                  "{QUOTES[quoteIndex]}"
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Stats & Dots */}
          <div className="mt-auto">
            <div className="mb-3 flex items-end gap-2">
              <span className="bg-gradient-to-br from-white to-slate-400 bg-clip-text text-2xl font-black tracking-tighter text-transparent sm:text-4xl md:text-5xl">
                {Math.round(progressPercentage)}%
              </span>
              <div className="flex flex-col pb-1">
                <p className="text-xs font-bold leading-none text-white sm:text-sm">
                  {progressMessage}
                </p>
                <p className="text-[10px] font-medium text-slate-500 sm:text-xs">completed</p>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            {totalHabits > 0 && (
              <div className="flex h-1.5 w-full max-w-[200px] gap-1.5">
                {Array.from({ length: totalHabits }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-full flex-1 rounded-full"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{
                      opacity: 1,
                      scaleX: 1,
                      backgroundColor: i < completedHabits ? ring.stroke : 'rgba(255,255,255,0.1)',
                    }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Ring Visualization */}
        <div className="relative flex shrink-0 items-center justify-center p-2 sm:p-4">
          {/* Outer Glow Ring */}
          <div
            className="absolute inset-0 rounded-full opacity-20 blur-2xl"
            style={{ background: ring.stroke }}
          />

          <svg
            className="size-20 -rotate-90 drop-shadow-2xl sm:size-32 lg:size-40"
            viewBox="0 0 120 120"
          >
            {/* Track */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={ring.track}
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Progress */}
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={ring.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className="material-symbols-outlined text-xl text-slate-400 sm:text-3xl"
              style={{ color: ring.stroke }}
            >
              {progressPercentage >= 100 ? 'emoji_events' : 'bolt'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
