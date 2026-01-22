/**
 * Goals Page
 * Goal tracking and management interface
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { GoalsDashboard } from '../../components/timer/sidebar/goals/GoalsDashboard'

export default function Goals() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col relative overflow-hidden">
      {/* Animated Background Glow Effects - Different from Analytics */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" />
      <div className="fixed top-1/3 left-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="fixed bottom-0 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" style={{ animationDelay: '3s' }} />

      {/* Different Pattern Overlay - Smaller dots */}
      <div className="fixed inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.5)_1px)] [background-size:32px_32px] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-2xl border-b border-white/10 shadow-lg">
        <div className="flex items-center px-5 py-4 justify-between h-16">
          <button
            onClick={() => navigate(-1)}
            className="group flex size-11 items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 hover:border-white/20 transition-all duration-300 active:scale-95"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-white group-hover:text-pink-300 transition-colors">arrow_back</span>
          </button>
          <div className="flex-1 flex items-center justify-center pr-11">
            <h2 className="text-xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-violet-300">
              Goal Tracker
            </h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pb-28 w-full max-w-4xl mx-auto relative z-10 px-4 sm:px-6 py-6">
        {/* Content */}
        <div className="space-y-6">
          <GoalsDashboard />
        </div>
      </main>
    </div>
  )
}
