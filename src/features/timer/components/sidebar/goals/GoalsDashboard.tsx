/**
 * Goals Dashboard Component
 * Dedicated page for goal tracking with analytics-style layout
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GoalCard } from './GoalCard'
import { CreateGoalModal } from './CreateGoalModal'
import { useGoalsStore } from './goalsStore'

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

  const activeCount = goals.filter(g => g.status === 'active').length
  const completedCount = goals.filter(g => g.status === 'completed').length
  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + Math.min((g.current / g.target) * 100, 100), 0) / goals.length)
    : 0

  // Empty state
  if (goals.length === 0) {
    return (
      <>
        <div className="p-8 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl border border-white/10 min-h-[400px] flex items-center justify-center relative overflow-hidden">
          {/* Animated background glow */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] [background-size:32px_32px]" />

          <div className="text-center relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative inline-block mb-6"
            >
              <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500/20 to-violet-600/10 border border-pink-400/30">
                <span className="material-symbols-outlined text-5xl text-pink-300">flag</span>
              </div>
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-black text-white mb-3 tracking-tight"
            >
              No Goals Yet
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/60 max-w-sm font-medium leading-relaxed mb-6"
            >
              Start tracking your progress by creating your first goal.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setShowCreateModal(true)}
              className="group relative px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 transition-all flex items-center gap-2 border border-pink-400/30 mx-auto"
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 overflow-hidden group hover:border-pink-400/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60 text-sm font-medium">Total Goals</span>
                <span className="material-symbols-outlined text-pink-400">flag</span>
              </div>
              <div className="text-3xl font-black text-white">{goals.length}</div>
              <div className="text-xs text-white/50 mt-1 font-medium">All goals created</div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 overflow-hidden group hover:border-violet-400/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60 text-sm font-medium">Active Goals</span>
                <span className="material-symbols-outlined text-violet-400">trending_up</span>
              </div>
              <div className="text-3xl font-black text-white">{activeCount}</div>
              <div className="text-xs text-white/50 mt-1 font-medium">Currently tracking</div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 overflow-hidden group hover:border-green-400/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60 text-sm font-medium">Completed</span>
                <span className="material-symbols-outlined text-green-400">check_circle</span>
              </div>
              <div className="text-3xl font-black text-white">{completedCount}</div>
              <div className="text-xs text-white/50 mt-1 font-medium">Goals achieved</div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 overflow-hidden group hover:border-cyan-400/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60 text-sm font-medium">Avg Progress</span>
                <span className="material-symbols-outlined text-cyan-400">progress</span>
              </div>
              <div className="text-3xl font-black text-white">{totalProgress}%</div>
              <div className="text-xs text-white/50 mt-1 font-medium">Across all goals</div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-2"
        >
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all flex-1
                ${filter === f
                  ? 'bg-gradient-to-r from-pink-500/20 to-violet-600/20 text-pink-300 border border-pink-400/30'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5 border border-transparent hover:border-white/10'
                }
              `}
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
            <div className="flex flex-col items-center justify-center py-16 text-center bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/10 rounded-3xl">
              <span className="material-symbols-outlined text-white/40 text-[64px] mb-4">filter_list_off</span>
              <h3 className="font-black text-white text-xl mb-2 tracking-tight">
                No {filter} goals
              </h3>
              <p className="text-sm text-white/60 mb-6 max-w-sm font-medium">
                Try selecting a different filter or create a new goal.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-white/80 font-bold text-sm uppercase tracking-wider">
                  {filter === 'all' ? 'All Goals' : filter === 'active' ? 'Active Goals' : 'Completed Goals'}
                </h3>
                <span className="text-white/50 text-xs font-medium">
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
          className="group fixed bottom-8 right-8 z-30 size-14 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 transition-all flex items-center justify-center border border-pink-400/30 shadow-2xl hover:shadow-pink-500/20 active:scale-95"
          aria-label="Create new goal"
        >
          <span className="material-symbols-outlined text-white text-[28px]">add</span>
        </motion.button>

        {/* Quick Insights Section */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative overflow-hidden bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/10 hover:border-pink-400/30 rounded-3xl p-6 sm:p-7 transition-all duration-500 hover:shadow-[0_0_50px_rgba(236,72,153,0.15)]"
          >
            {/* Animated background glow */}
            <div className="absolute -top-20 -left-20 w-56 h-56 bg-pink-500/5 rounded-full blur-3xl group-hover:bg-pink-400/10 transition-all duration-700" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-violet-500/5 rounded-full blur-2xl group-hover:blur-xl transition-all duration-700" />

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] [background-size:32px_32px]" />

            <div className="relative z-10">
              <div className="flex items-start gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-pink-500/20 rounded-2xl blur-md group-hover:bg-pink-400/30 transition-all duration-300" />
                  <div className="relative flex items-center justify-center w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-pink-500/30 to-violet-600/20 border border-pink-400/30">
                    <span className="material-symbols-outlined text-pink-300 text-2xl">workspace_premium</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-7 w-1 bg-gradient-to-b from-pink-400 to-violet-600 rounded-full" />
                    <h3 className="text-white font-black text-lg sm:text-xl tracking-tight">
                      Keep Pushing Forward!
                    </h3>
                  </div>
                  <div className="space-y-3 text-sm text-white/70 ml-4">
                    <p className="font-medium">
                      You have <span className="text-white font-black">{goals.length} goal{goals.length !== 1 ? 's' : ''}</span> total, with{' '}
                      <span className="text-pink-400 font-black">{activeCount}</span> active and{' '}
                      <span className="text-green-400 font-black">{completedCount}</span> completed.
                    </p>
                    {activeCount > 0 && (
                      <p className="font-medium">
                        Your average progress is <span className="text-white font-black">{totalProgress}%</span>.
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
