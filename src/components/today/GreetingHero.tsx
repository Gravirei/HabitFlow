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
  "Small steps every day lead to big changes.",
  "Consistency is the key to transformation.",
  "Every habit is a vote for the person you want to become.",
  "Progress, not perfection.",
  "The secret of your future is hidden in your daily routine.",
  "Build the life you want, one habit at a time.",
  "Discipline is choosing between what you want now and what you want most.",
  "Your only competition is who you were yesterday.",
  "Show up every day — that's the whole strategy.",
  "Motivation gets you started. Habit keeps you going.",
]

const GREETING_PHRASES = [
  "Ready to crush it?",
  "Make today count.",
  "You've got this!",
  "Stay consistent.",
  "One habit at a time.",
  "Keep the streak alive.",
  "Small wins matter.",
  "Be proud of yourself.",
]

const getTimeGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const getRingColor = (pct: number) => {
  if (pct >= 80) return { stroke: '#22C55E', glow: 'rgba(34,197,94,0.35)', track: 'rgba(34,197,94,0.15)' }
  if (pct >= 50) return { stroke: '#F59E0B', glow: 'rgba(245,158,11,0.35)', track: 'rgba(245,158,11,0.15)' }
  if (pct >= 25) return { stroke: '#3B82F6', glow: 'rgba(59,130,246,0.35)', track: 'rgba(59,130,246,0.15)' }
  return { stroke: '#6366F1', glow: 'rgba(99,102,241,0.35)', track: 'rgba(99,102,241,0.15)' }
}

const CIRCUMFERENCE = 2 * Math.PI * 42

export function GreetingHero({ completedHabits, totalHabits, progressPercentage, progressMessage }: GreetingHeroProps) {
  const ring = getRingColor(progressPercentage)
  const offset = CIRCUMFERENCE * (1 - progressPercentage / 100)

  // ── Cycling state ────────────────────────────────────────────────────────────
  const [quoteIndex, setQuoteIndex] = useState(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    return dayOfYear % QUOTES.length
  })
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex(i => (i + 1) % QUOTES.length)
    }, 6000)
    const phraseTimer = setInterval(() => {
      setPhraseIndex(i => (i + 1) % GREETING_PHRASES.length)
    }, 6000)
    return () => {
      clearInterval(quoteTimer)
      clearInterval(phraseTimer)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full overflow-hidden rounded-3xl p-5 sm:p-6 lg:p-8"
      style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
      }}
    >
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: ring.stroke }} />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-36 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: '#3B82F6' }} />

      {/* Grid dot pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="relative flex items-center justify-between gap-4">
        {/* Left: Greeting + quote + stats */}
        <div className="flex flex-col gap-3 min-w-0 flex-1">
          {/* Greeting — small & elegant, cycling */}
          <div>
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>

            {/* Cycling greeting phrase */}
            <div className="mt-0.5 overflow-hidden" style={{ height: '1.75rem' }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIndex}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-base sm:text-lg font-bold text-white leading-tight"
                >
                  {getTimeGreeting()} — {GREETING_PHRASES[phraseIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Cycling quote */}
            <div className="mt-1 overflow-hidden" style={{ height: '2.2rem' }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={quoteIndex}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                  className="text-[11px] sm:text-xs text-slate-500 leading-snug max-w-[200px] sm:max-w-[240px] italic"
                >
                  "{QUOTES[quoteIndex]}"
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: ring.stroke }}>
              Daily Goal
            </p>
            <p className="text-3xl sm:text-4xl font-black text-white leading-none tracking-tight">
              {progressMessage}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              <span className="font-bold text-white tabular-nums">{completedHabits}</span>
              <span className="text-slate-600"> / </span>
              <span className="tabular-nums">{totalHabits}</span>
              <span className="ml-1">habits done</span>
            </p>
          </div>

          {/* Segmented dots */}
          {totalHabits > 0 && (
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: totalHabits }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(100 / totalHabits, 12)}%`,
                    minWidth: 6,
                    maxWidth: 20,
                    backgroundColor: i < completedHabits ? ring.stroke : 'rgba(255,255,255,0.08)',
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.25, ease: 'easeOut' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Big progress ring */}
        <div className="relative shrink-0 flex items-center justify-center"
          style={{ filter: `drop-shadow(0 0 20px ${ring.glow})` }}>
          <svg
            className="size-28 sm:size-36 lg:size-44 -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Track */}
            <circle cx="50" cy="50" r="42" fill="none"
              stroke={ring.track} strokeWidth="7" />
            {/* Progress */}
            <motion.circle
              cx="50" cy="50" r="42" fill="none"
              stroke={ring.stroke} strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <motion.span
              className="text-2xl sm:text-3xl lg:text-4xl font-black tabular-nums"
              style={{ color: ring.stroke }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {Math.round(progressPercentage)}%
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
