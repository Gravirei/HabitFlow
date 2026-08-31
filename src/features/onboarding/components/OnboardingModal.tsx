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
      <div className="animate-in fade-in fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm duration-300" />

      {/* Modal */}
      <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="animate-in zoom-in-95 fade-in pointer-events-auto relative w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 via-black to-gray-900 shadow-2xl duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative gradient orbs */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-green-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl" />

          {/* Content */}
          <div className="relative space-y-6 p-8">
            {/* Header */}
            <div className="space-y-3 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <span className="material-symbols-outlined text-5xl text-primary">
                  self_improvement
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white">Welcome to HabitFlow! 🎉</h2>
              <p className="text-base text-gray-400">
                Start your journey to building better habits
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {/* Option 1: Start Fresh */}
              <button
                onClick={() => markOnboardingComplete()}
                className="group w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition-all duration-200 hover:border-primary/50 hover:bg-white/10"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                    <span className="material-symbols-outlined text-2xl text-blue-400">
                      add_circle
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-white">Start Fresh</h3>
                    <p className="text-sm text-gray-400">
                      Begin with a clean slate and create your own habits from scratch
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 2: Load Sample Habits */}
              <button
                onClick={() => loadSampleHabits()}
                className="group w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition-all duration-200 hover:border-primary/50 hover:bg-white/10"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <span className="material-symbols-outlined text-2xl text-primary">
                      lightbulb
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-white">Load Sample Habits</h3>
                    <p className="text-sm text-gray-400">
                      Explore the app with pre-loaded example habits (you can delete them later)
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Info */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-center text-xs text-gray-500">
                💡 You can always change or delete habits later in Settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
