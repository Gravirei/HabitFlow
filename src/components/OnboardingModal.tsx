/**
 * OnboardingModal Component
 * Welcome modal for first-time users to choose between starting fresh or loading sample habits
 */

import { useHabitStore } from '@/store/useHabitStore'

export function OnboardingModal() {
  const { isFirstVisit, loadSampleHabits, markOnboardingComplete } = useHabitStore()

  if (!isFirstVisit) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />

      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl shadow-2xl border border-white/10 pointer-events-auto animate-in zoom-in-95 fade-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative gradient orbs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-primary/20 to-green-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-5xl text-primary">
                  self_improvement
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white">
                Welcome to HabitFlow! 🎉
              </h2>
              <p className="text-gray-400 text-base">
                Start your journey to building better habits
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {/* Option 1: Start Fresh */}
              <button
                onClick={() => markOnboardingComplete()}
                className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all duration-200 group text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <span className="material-symbols-outlined text-2xl text-blue-400">
                      add_circle
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Start Fresh
                    </h3>
                    <p className="text-sm text-gray-400">
                      Begin with a clean slate and create your own habits from scratch
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 2: Load Sample Habits */}
              <button
                onClick={() => loadSampleHabits()}
                className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all duration-200 group text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-2xl text-primary">
                      lightbulb
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Load Sample Habits
                    </h3>
                    <p className="text-sm text-gray-400">
                      Explore the app with pre-loaded example habits (you can delete them later)
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Info */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 text-center">
                💡 You can always change or delete habits later in Settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
