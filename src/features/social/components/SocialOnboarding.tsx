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

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSocialStore } from '../store/socialStore'
import { AddFriendsModal } from './AddFriendsModal'

// ─── Feature Preview Card ───────────────────────────────────────────────────

function FeatureCard({
  icon,
  title,
  subtitle,
  delay,
}: {
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
      className="w-[160px] flex-shrink-0 snap-start rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4"
    >
      <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10">
        <span
          className="material-symbols-outlined text-xl text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      <h3 className="mb-1 text-[13px] font-bold text-white">{title}</h3>
      <p className="text-[11px] leading-relaxed text-slate-400">{subtitle}</p>
    </motion.div>
  )
}

// ─── Checklist Item ─────────────────────────────────────────────────────────

function ChecklistItem({
  label,
  onTap,
  delay,
}: {
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
      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3.5 transition-all duration-200 hover:bg-white/[0.04]"
    >
      {/* Empty checkbox circle */}
      <div className="flex size-5 items-center justify-center rounded-full border-2 border-slate-600 transition-colors duration-200 group-hover:border-primary">
        {/* empty */}
      </div>
      <span className="flex-1 text-left text-[13px] font-medium text-slate-300 transition-colors duration-200 group-hover:text-white">
        {label}
      </span>
      <span className="material-symbols-outlined text-sm text-slate-600 transition-colors duration-200 group-hover:text-primary">
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
  const [showAddFriends, setShowAddFriends] = useState(false)

  const handleDismiss = () => {
    dismissOnboarding()
  }

  return (
    <div className="space-y-8">
      {/* Section 1 — Welcome Hero */}
      <div className="relative flex flex-col items-center pb-2 pt-6 text-center">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-8 size-32 rounded-full bg-primary/15 blur-3xl" />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="relative mb-5 flex size-20 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10"
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-3xl bg-primary/10 blur-xl"
          />
          <span
            className="material-symbols-outlined relative z-10 text-4xl text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            group
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-2 text-xl font-bold text-white"
        >
          Meet Your Social Hub
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="max-w-[260px] text-[13px] text-slate-400"
        >
          Compete, connect, and stay accountable with friends
        </motion.p>
      </div>

      {/* Section 2 — Feature Preview Cards (horizontal scroll) */}
      <div>
        <h3 className="mb-3 px-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          What you can do
        </h3>
        <div
          ref={scrollRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
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
        <h3 className="mb-3 px-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          Quick start
        </h3>
        <div className="space-y-2">
          <ChecklistItem
            label="Complete your first habit today"
            onTap={() => navigate('/today')}
            delay={0.5}
          />
          <ChecklistItem
            label="Add your first friend"
            onTap={() => setShowAddFriends(true)}
            delay={0.6}
          />
          <ChecklistItem label="Reach Level 2" onTap={handleDismiss} delay={0.7} />
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
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[14px] font-bold text-primary-content shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary-focus active:scale-[0.98]"
        >
          Let's Go
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </motion.div>

      {/* Demo data notice */}
      <p className="px-4 pb-4 text-center text-[11px] text-slate-500">
        Leaderboard and league previews use sample data until you connect with friends.
      </p>

      {/* Add Friends Modal */}
      <AddFriendsModal isOpen={showAddFriends} onClose={() => setShowAddFriends(false)} />
    </div>
  )
}
