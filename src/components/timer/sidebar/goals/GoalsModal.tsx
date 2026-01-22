/**
 * Goals Modal
 * Main modal for viewing and managing goals
 */

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GoalCard } from './GoalCard'
import { CreateGoalModal } from './CreateGoalModal'
import { useGoalsStore } from './goalsStore'
import type { Goal } from './types'

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

  const activeCount = goals.filter(g => g.status === 'active').length
  const completedCount = goals.filter(g => g.status === 'completed').length

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
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
          className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated background glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(circle_at_1px_1px_rgba(255,255,255,0.3)_1px)] [background-size:32px_32px]" />

          {/* Header */}
          <div className="relative px-6 py-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl blur-md" />
                  <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 border border-cyan-400/30">
                    <span className="material-symbols-outlined text-cyan-300 text-3xl">flag</span>
                  </div>
                </div>
                <div>
                  <h2 id="goals-modal-title" className="text-2xl font-black text-white tracking-tight">
                    Goal Tracker
                  </h2>
                  <p className="text-white/60 text-sm mt-1 font-medium">
                    Track your progress and stay motivated
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="relative size-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:border-white/20"
                aria-label="Close goals"
              >
                <span className="material-symbols-outlined text-white/70 text-[20px]">close</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-hidden group hover:border-cyan-400/30 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative text-3xl font-black text-white">{goals.length}</div>
                <div className="text-xs text-white/60 font-bold uppercase tracking-wider mt-1">Total Goals</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-hidden group hover:border-cyan-400/30 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative text-3xl font-black text-white">{activeCount}</div>
                <div className="text-xs text-white/60 font-bold uppercase tracking-wider mt-1">Active</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-hidden group hover:border-cyan-400/30 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative text-3xl font-black text-white">{completedCount}</div>
                <div className="text-xs text-white/60 font-bold uppercase tracking-wider mt-1">Completed</div>
              </motion.div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="relative z-10 flex items-center gap-2 px-6 py-3 border-t border-b border-white/10">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all
                  ${filter === f
                    ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5 border border-transparent hover:border-white/10'
                  }
                `}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Goals List */}
          <div className="relative flex-1 overflow-y-auto p-6 z-10">
            {filteredGoals.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl" />
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                    <span className="material-symbols-outlined text-white/40 text-[40px]">flag</span>
                  </div>
                </div>
                <h3 className="font-black text-white text-xl mb-2 tracking-tight">
                  {filter === 'all' ? 'No goals yet' : `No ${filter} goals`}
                </h3>
                <p className="text-sm text-white/60 mb-6 max-w-sm font-medium">
                  Set your first goal to start tracking progress!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="group relative px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 transition-all flex items-center gap-2 border border-cyan-400/30"
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
                className="group w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 border border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/20"
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
