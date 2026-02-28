/**
 * Social Page — Top-level page shell for the Social Networking System
 * Clean app bar with ambient glow, content area, and navigation
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { BottomNav } from '@/components/BottomNav'
import { SideNav } from '@/components/SideNav'
import { SocialHub } from '@/components/social/SocialHub'
import { SocialBottomNav, type SocialTab } from '@/components/social/SocialBottomNav'
import { useSocialStore } from '@/components/social/socialStore'
import { getLevelForXP } from '@/components/social/constants'

export function Social() {
  const navigate = useNavigate()
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<SocialTab>('profile')
  const { totalXP } = useSocialStore()
  const level = getLevelForXP(totalXP)

  return (
    <div className="relative mx-auto flex h-auto min-h-screen w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl flex-col overflow-hidden bg-gray-950 text-slate-50 selection:bg-teal-500/30">
      <main className="flex-grow pb-32 relative z-0">
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-gray-950/80 border-b border-white/[0.04] shrink-0">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            {/* Back + Menu */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/today')}
                aria-label="Go back to Today"
                className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all duration-200"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </button>
              <button
                onClick={() => setIsSideNavOpen(true)}
                aria-label="Open navigation menu"
                className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all duration-200"
              >
                <span className="material-symbols-outlined text-xl">menu</span>
              </button>
            </div>

            {/* Title */}
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-primary text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                group
              </span>
              <h1 className="text-lg font-bold text-white tracking-tight">Social</h1>
            </div>

            {/* Level chip */}
            <div className="flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2 py-1">
              <span
                className="material-symbols-outlined text-primary text-[13px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {level.icon}
              </span>
              <span className="text-[11px] font-bold text-primary">Lv.{level.level}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 mt-4 max-w-3xl mx-auto">
          <SocialHub activeTab={activeTab} />
        </div>
      </main>

      <SideNav isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />
      <BottomNav />
      <AnimatePresence>
        <SocialBottomNav activeTab={activeTab} onChange={setActiveTab} />
      </AnimatePresence>
    </div>
  )
}
