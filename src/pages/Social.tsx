/**
 * Social Page — Top-level page shell for the Social Networking System
 * Clean app bar with ambient glow, content area, and navigation
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { BottomNav } from '@/components/BottomNav'
import { SideNav } from '@/components/SideNav'
import { SocialHub } from '@/components/social/SocialHub'
import { SocialBottomNav, type SocialTab } from '@/components/social/SocialBottomNav'
import { useSocialStore } from '@/components/social/socialStore'
import { getLevelForXP } from '@/components/social/constants'

const SOCIAL_ACTIVE_TAB_STORAGE_KEY = 'social-active-tab'
const DEFAULT_SOCIAL_TAB: SocialTab = 'profile'

function readInitialSocialTab(): SocialTab {
  if (typeof window === 'undefined') return DEFAULT_SOCIAL_TAB
  const storedTab = window.localStorage.getItem(SOCIAL_ACTIVE_TAB_STORAGE_KEY)
  const validTabs: SocialTab[] = ['profile', 'leaderboard', 'friends', 'league', 'messages']
  return validTabs.includes(storedTab as SocialTab) ? (storedTab as SocialTab) : DEFAULT_SOCIAL_TAB
}

export function Social() {
  const navigate = useNavigate()
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<SocialTab>(readInitialSocialTab)
  const { totalXP } = useSocialStore()
  const level = getLevelForXP(totalXP)

  const isLeagueTab = activeTab === 'league'

  useEffect(() => {
    window.localStorage.setItem(SOCIAL_ACTIVE_TAB_STORAGE_KEY, activeTab)
  }, [activeTab])

  useEffect(() => {
    let isPageUnloading = false
    const handleBeforeUnload = () => {
      isPageUnloading = true
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (!isPageUnloading) {
        window.localStorage.removeItem(SOCIAL_ACTIVE_TAB_STORAGE_KEY)
      }
    }
  }, [])

  return (
    <div
      className={`relative mx-auto flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-gray-950 text-slate-50 selection:bg-teal-500/30 ${isLeagueTab ? 'max-w-full' : 'max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl'}`}
    >
      <main className="relative flex-grow pb-32 pt-20">
        {/* Top App Bar */}
        <header
          className={`fixed left-0 right-0 top-0 z-30 mx-auto shrink-0 bg-gray-950/80 backdrop-blur-md ${isLeagueTab ? 'max-w-full' : 'max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl'}`}
        >
          <div className="flex items-center justify-between px-4 pb-3 pt-4 sm:px-6 lg:px-8">
            {/* Back + Menu */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/today')}
                aria-label="Go back to Today"
                className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white active:scale-95"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </button>
              <button
                onClick={() => setIsSideNavOpen(true)}
                aria-label="Open navigation menu"
                className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white active:scale-95"
              >
                <span className="material-symbols-outlined text-xl">menu</span>
              </button>
            </div>

            {/* Title */}
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-xl text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                group
              </span>
              <h1 className="text-lg font-bold tracking-tight text-white">Social</h1>
            </div>

            {/* Level chip */}
            <div className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2 py-1">
              <span
                className="material-symbols-outlined text-[13px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {level.icon}
              </span>
              <span className="text-[11px] font-bold text-primary">Lv.{level.level}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div
          className={`mx-auto ${activeTab === 'league' ? 'mt-0 max-w-full px-0' : 'mt-4 max-w-3xl px-4 sm:px-6 lg:px-8'}`}
        >
          <SocialHub activeTab={activeTab} onNavigateToMessages={() => setActiveTab('messages')} />
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
