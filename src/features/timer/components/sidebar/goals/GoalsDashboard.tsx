/**
 * Goals Dashboard Component
 * Dedicated page for goal tracking with analytics-style layout
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GoalCard } from './GoalCard'
import { CreateGoalModal } from './CreateGoalModal'
import { useGoalsStore } from '@/features/timer/store/goalsStore'

export function GoalsDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')

  const { goals, addGoal, deleteGoal, pauseGoal, resumeGoal } = useGoalsStore()

  const filteredGoals = goals.filter((goal) => {
    if (filter === 'all') return true
    if (filter === 'active') return goal.status === 'active'
    if (filter === 'completed') return goal.status === 'completed'
    return true
  })

  const activeCount = goals.filter((g) => g.status === 'active').length
  const completedCount = goals.filter((g) => g.status === 'completed').length
  const totalProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce((sum, g) => sum + Math.min((g.current / g.target) * 100, 100), 0) /
            goals.length
        )
      : 0

  // Empty state
  if (goals.length === 0) {
    return (
      <>
        <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-8 backdrop-blur-xl">
          {/* Animated background glow */}
          <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-pink-500/5 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.015] [background-size:32px_32px]" />

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative mb-6 inline-block"
            >
              <div className="absolute inset-0 animate-pulse rounded-full bg-pink-500/20 blur-2xl" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-pink-400/30 bg-gradient-to-br from-pink-500/20 to-violet-600/10">
                <span className="material-symbols-outlined text-5xl text-pink-300">flag</span>
              </div>
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-3 text-2xl font-black tracking-tight text-white"
            >
              No Goals Yet
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 max-w-sm font-medium leading-relaxed text-white/60"
            >
              Start tracking your progress by creating your first goal.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setShowCreateModal(true)}
              className="group relative mx-auto flex items-center gap-2 rounded-xl border border-pink-400/30 bg-gradient-to-r from-pink-500 to-violet-600 px-6 py-3 font-bold text-white transition-all hover:from-pink-400 hover:to-violet-500"
            >
              <span className="material-symbols-outlined">add</span>
              Create Your First Goal
            </motion.button>
          </div>
        </div>

        <CreateGoalModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateGoal={addGoal}
        />
      </>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 backdrop-blur-xl transition-all hover:border-pink-400/30">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-white/60">Total Goals</span>
                <span className="material-symbols-outlined text-pink-400">flag</span>
              </div>
              <div className="text-3xl font-black text-white">{goals.length}</div>
              <div className="mt-1 text-xs font-medium text-white/50">All goals created</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 backdrop-blur-xl transition-all hover:border-violet-400/30">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-white/60">Active Goals</span>
                <span className="material-symbols-outlined text-violet-400">trending_up</span>
              </div>
              <div className="text-3xl font-black text-white">{activeCount}</div>
              <div className="mt-1 text-xs font-medium text-white/50">Currently tracking</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 backdrop-blur-xl transition-all hover:border-green-400/30">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-white/60">Completed</span>
                <span className="material-symbols-outlined text-green-400">check_circle</span>
              </div>
              <div className="text-3xl font-black text-white">{completedCount}</div>
              <div className="mt-1 text-xs font-medium text-white/50">Goals achieved</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 backdrop-blur-xl transition-all hover:border-cyan-400/30">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-white/60">Avg Progress</span>
                <span className="material-symbols-outlined text-cyan-400">progress</span>
              </div>
              <div className="text-3xl font-black text-white">{totalProgress}%</div>
              <div className="mt-1 text-xs font-medium text-white/50">Across all goals</div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-2 backdrop-blur-xl"
        >
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-bold capitalize transition-all ${
                filter === f
                  ? 'border border-pink-400/30 bg-gradient-to-r from-pink-500/20 to-violet-600/20 text-pink-300'
                  : 'border border-transparent text-white/60 hover:border-white/10 hover:bg-white/5 hover:text-white/80'
              } `}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Goals List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {filteredGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 py-16 text-center backdrop-blur-xl">
              <span className="material-symbols-outlined mb-4 text-[64px] text-white/40">
                filter_list_off
              </span>
              <h3 className="mb-2 text-xl font-black tracking-tight text-white">
                No {filter} goals
              </h3>
              <p className="mb-6 max-w-sm text-sm font-medium text-white/60">
                Try selecting a different filter or create a new goal.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">
                  {filter === 'all'
                    ? 'All Goals'
                    : filter === 'active'
                      ? 'Active Goals'
                      : 'Completed Goals'}
                </h3>
                <span className="text-xs font-medium text-white/50">
                  {filteredGoals.length} {filteredGoals.length === 1 ? 'goal' : 'goals'}
                </span>
              </div>
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={() => deleteGoal(goal.id)}
                  onPause={() => pauseGoal(goal.id)}
                  onResume={() => resumeGoal(goal.id)}
                />
              ))}
            </>
          )}
        </motion.div>

        {/* Create Button - Fixed */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setShowCreateModal(true)}
          className="group fixed bottom-8 right-8 z-30 flex size-14 items-center justify-center rounded-full border border-pink-400/30 bg-gradient-to-r from-pink-500 to-violet-600 shadow-2xl transition-all hover:from-pink-400 hover:to-violet-500 hover:shadow-pink-500/20 active:scale-95"
          aria-label="Create new goal"
        >
          <span className="material-symbols-outlined text-[28px] text-white">add</span>
        </motion.button>

        {/* Quick Insights Section */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-6 backdrop-blur-xl transition-all duration-500 hover:border-pink-400/30 hover:shadow-[0_0_50px_rgba(236,72,153,0.15)] sm:p-7"
          >
            {/* Animated background glow */}
            <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-pink-500/5 blur-3xl transition-all duration-700 group-hover:bg-pink-400/10" />
            <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-violet-500/5 blur-2xl transition-all duration-700 group-hover:blur-xl" />

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.02] [background-size:32px_32px]" />

            <div className="relative z-10">
              <div className="flex items-start gap-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-pink-500/20 blur-md transition-all duration-300 group-hover:bg-pink-400/30" />
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-pink-400/30 bg-gradient-to-br from-pink-500/30 to-violet-600/20">
                    <span className="material-symbols-outlined text-2xl text-pink-300">
                      workspace_premium
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-7 w-1 rounded-full bg-gradient-to-b from-pink-400 to-violet-600" />
                    <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">
                      Keep Pushing Forward!
                    </h3>
                  </div>
                  <div className="ml-4 space-y-3 text-sm text-white/70">
                    <p className="font-medium">
                      You have{' '}
                      <span className="font-black text-white">
                        {goals.length} goal{goals.length !== 1 ? 's' : ''}
                      </span>{' '}
                      total, with <span className="font-black text-pink-400">{activeCount}</span>{' '}
                      active and <span className="font-black text-green-400">{completedCount}</span>{' '}
                      completed.
                    </p>
                    {activeCount > 0 && (
                      <p className="font-medium">
                        Your average progress is{' '}
                        <span className="font-black text-white">{totalProgress}%</span>.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateGoal={addGoal}
      />
    </>
  )
}
