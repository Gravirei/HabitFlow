/**
 * Goals Page
 * Goal tracking and management interface
 */

import { useNavigate } from 'react-router-dom'
import { GoalsDashboard } from '@/features/timer/components/sidebar/goals/GoalsDashboard'

export default function Goals() {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated Background Glow Effects - Different from Analytics */}
      <div className="pointer-events-none fixed right-1/4 top-0 z-0 h-96 w-96 animate-pulse rounded-full bg-pink-500/5 blur-3xl" />
      <div
        className="pointer-events-none fixed left-0 top-1/3 z-0 h-80 w-80 animate-pulse rounded-full bg-violet-500/5 blur-3xl"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className="pointer-events-none fixed bottom-0 right-1/3 z-0 h-96 w-96 animate-pulse rounded-full bg-purple-500/5 blur-3xl"
        style={{ animationDelay: '3s' }}
      />

      {/* Different Pattern Overlay - Smaller dots */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.5)_1px)] opacity-[0.02] [background-size:32px_32px]" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 shadow-lg backdrop-blur-2xl">
        <div className="flex h-16 items-center justify-between px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="group flex size-11 items-center justify-center rounded-xl border border-white/10 bg-slate-800/80 transition-all duration-300 hover:border-white/20 hover:bg-slate-700/80 active:scale-95"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-white transition-colors group-hover:text-pink-300">
              arrow_back
            </span>
          </button>
          <div className="flex flex-1 items-center justify-center pr-11">
            <h2 className="bg-gradient-to-r from-white via-pink-200 to-violet-300 bg-clip-text text-xl font-black leading-tight tracking-tight text-transparent">
              Goal Tracker
            </h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 pb-28 sm:px-6">
        {/* Content */}
        <div className="space-y-6">
          <GoalsDashboard />
        </div>
      </main>
    </div>
  )
}
