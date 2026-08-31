/**
 * Goals Modal
 * Main modal for viewing and managing goals
 */

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GoalCard } from './GoalCard'
import { CreateGoalModal } from './CreateGoalModal'
import { useGoalsStore } from '@/features/timer/store/goalsStore'

interface GoalsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GoalsModal({ isOpen, onClose }: GoalsModalProps) {
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

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="goals-modal-title"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 shadow-2xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated background glow */}
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] opacity-[0.015] [background-size:32px_32px]" />

          {/* Header */}
          <div className="relative z-10 px-6 py-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-md" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/30 to-cyan-600/20">
                    <span className="material-symbols-outlined text-3xl text-cyan-300">flag</span>
                  </div>
                </div>
                <div>
                  <h2
                    id="goals-modal-title"
                    className="text-2xl font-black tracking-tight text-white"
                  >
                    Goal Tracker
                  </h2>
                  <p className="mt-1 text-sm font-medium text-white/60">
                    Track your progress and stay motivated
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="relative flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:border-white/20 hover:bg-white/10"
                aria-label="Close goals"
              >
                <span className="material-symbols-outlined text-[20px] text-white/70">close</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 backdrop-blur-xl transition-all hover:border-cyan-400/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative text-3xl font-black text-white">{goals.length}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-white/60">
                  Total Goals
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 backdrop-blur-xl transition-all hover:border-cyan-400/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative text-3xl font-black text-white">{activeCount}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-white/60">
                  Active
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 backdrop-blur-xl transition-all hover:border-cyan-400/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative text-3xl font-black text-white">{completedCount}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-white/60">
                  Completed
                </div>
              </motion.div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="relative z-10 flex items-center gap-2 border-b border-t border-white/10 px-6 py-3">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition-all ${
                  filter === f
                    ? 'border border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-300'
                    : 'border border-transparent text-white/60 hover:border-white/10 hover:bg-white/5 hover:text-white/80'
                } `}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Goals List */}
          <div className="relative z-10 flex-1 overflow-y-auto p-6">
            {filteredGoals.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-white/5 blur-2xl" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5">
                    <span className="material-symbols-outlined text-[40px] text-white/40">
                      flag
                    </span>
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-black tracking-tight text-white">
                  {filter === 'all' ? 'No goals yet' : `No ${filter} goals`}
                </h3>
                <p className="mb-6 max-w-sm text-sm font-medium text-white/60">
                  Set your first goal to start tracking progress!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="group relative flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-3 font-bold text-white transition-all hover:from-cyan-400 hover:to-cyan-500"
                >
                  <span className="material-symbols-outlined">add</span>
                  Create Your First Goal
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onDelete={() => deleteGoal(goal.id)}
                      onPause={() => pauseGoal(goal.id)}
                      onResume={() => resumeGoal(goal.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer - Create Button */}
          {filteredGoals.length > 0 && (
            <div className="relative z-10 border-t border-white/10 px-6 py-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500 to-cyan-600 py-3.5 font-bold text-white transition-all hover:from-cyan-400 hover:to-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Create New Goal
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateGoal={addGoal}
      />
    </AnimatePresence>,
    document.body
  )
}
