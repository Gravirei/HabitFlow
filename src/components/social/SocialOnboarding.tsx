/**
 * Social Onboarding — First-time user flow (GAP 5)
 *
 * Shows ONLY when ALL are true:
 * - friends.length === 0
 * - totalXP === 0
 * - no unlocked badges
 * - hasSeenSocialOnboarding === false
 *
 * Single scrollable screen with welcome hero, feature preview cards,
 * quick-start checklist, and dismiss CTA.
 */

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSocialStore } from './socialStore'
import toast from 'react-hot-toast'

// ─── Feature Preview Card ───────────────────────────────────────────────────

function FeatureCard({ icon, title, subtitle, delay }: {
  icon: string
  title: string
  subtitle: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: 'easeOut' }}
      className="w-[160px] flex-shrink-0 rounded-2xl bg-white/[0.025] border border-white/[0.05] p-4 snap-start"
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
        <span
          className="material-symbols-outlined text-xl text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      <h3 className="text-[13px] font-bold text-white mb-1">{title}</h3>
      <p className="text-[11px] text-slate-400 leading-relaxed">{subtitle}</p>
    </motion.div>
  )
}

// ─── Checklist Item ─────────────────────────────────────────────────────────

function ChecklistItem({ label, onTap, delay }: {
  label: string
  onTap: () => void
  delay: number
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, ease: 'easeOut' }}
      onClick={onTap}
      className="w-full flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3.5 cursor-pointer hover:bg-white/[0.04] transition-all duration-200 group"
    >
      {/* Empty checkbox circle */}
      <div className="flex size-5 items-center justify-center rounded-full border-2 border-slate-600 group-hover:border-primary transition-colors duration-200">
        {/* empty */}
      </div>
      <span className="flex-1 text-left text-[13px] font-medium text-slate-300 group-hover:text-white transition-colors duration-200">
        {label}
      </span>
      <span className="material-symbols-outlined text-sm text-slate-600 group-hover:text-primary transition-colors duration-200">
        arrow_forward
      </span>
    </motion.button>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function SocialOnboarding() {
  const { dismissOnboarding } = useSocialStore()
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleDismiss = () => {
    dismissOnboarding()
  }

  return (
    <div className="space-y-8">
      {/* Section 1 — Welcome Hero */}
      <div className="relative flex flex-col items-center text-center pt-6 pb-2">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-8 size-32 rounded-full bg-primary/15 blur-3xl" />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="relative flex size-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 mb-5"
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-3xl bg-primary/10 blur-xl"
          />
          <span
            className="material-symbols-outlined text-4xl text-primary relative z-10"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            group
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xl font-bold text-white mb-2"
        >
          Meet Your Social Hub
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-[13px] text-slate-400 max-w-[260px]"
        >
          Compete, connect, and stay accountable with friends
        </motion.p>
      </div>

      {/* Section 2 — Feature Preview Cards (horizontal scroll) */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
          What you can do
        </h3>
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          <FeatureCard
            icon="shield"
            title="Join a League"
            subtitle="Compete with 30 users in weekly leagues"
            delay={0.3}
          />
          <FeatureCard
            icon="leaderboard"
            title="Climb the Rankings"
            subtitle="Earn XP for every habit you complete"
            delay={0.4}
          />
          <FeatureCard
            icon="group"
            title="Streak with Friends"
            subtitle="Nudge friends to keep them on track"
            delay={0.5}
          />
        </div>
      </div>

      {/* Section 3 — Quick Start Checklist */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
          Quick start
        </h3>
        <div className="space-y-2">
          <ChecklistItem
            label="Complete your first habit today"
            onTap={() => navigate('/')}
            delay={0.5}
          />
          <ChecklistItem
            label="Add your first friend"
            onTap={() =>
              toast('Coming soon!', {
                icon: '🚀',
                style: { background: '#1f2937', color: '#fff', borderRadius: '12px' },
              })
            }
            delay={0.6}
          />
          <ChecklistItem
            label="Reach Level 2"
            onTap={handleDismiss}
            delay={0.7}
          />
        </div>
      </div>

      {/* Section 4 — Dismiss CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="pt-2"
      >
        <button
          onClick={handleDismiss}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[14px] font-bold text-primary-content cursor-pointer shadow-lg shadow-primary/25 hover:bg-primary-focus active:scale-[0.98] transition-all duration-200"
        >
          Let's Go
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </motion.div>

      {/* Demo data notice */}
      <p className="text-[11px] text-slate-500 text-center px-4 pb-4">
        Leaderboard and league previews use sample data until you connect with friends.
      </p>
    </div>
  )
}
