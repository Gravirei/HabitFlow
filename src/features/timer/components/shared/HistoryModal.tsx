// @ts-nocheck
/**
 * HistoryModal Component
 * Full-screen modal displaying timer history with modern glassmorphism and animations
 * Redesigned with 'ui-ux-pro-max' standards
 */

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTimerHistory } from '@/features/timer/hooks/useTimerHistory'
import { validateTimerHistory } from '@/features/timer/utils/validation'
import type { TimerHistoryRecord, TimerMode } from '@/features/timer/types/timer.types'
import { formatTime } from '@/features/timer/constants/timer.constants'
import { tieredStorage } from '@/lib/storage/tieredStorage'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

type FilterMode = 'All' | TimerMode
type SortOption = 'date' | 'duration'

// Animation Variants
const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export const HistoryModal: React.FC<HistoryModalProps> = React.memo(({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [filterMode, setFilterMode] = useState<FilterMode>('All')
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Manual refresh state
  const [manualRefreshStopwatch, setManualRefreshStopwatch] = useState<TimerHistoryRecord[]>([])
  const [manualRefreshCountdown, setManualRefreshCountdown] = useState<TimerHistoryRecord[]>([])
  const [manualRefreshIntervals, setManualRefreshIntervals] = useState<TimerHistoryRecord[]>([])
  const [useManualData, setUseManualData] = useState(false)

  // Load history from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadFreshData = async () => {
        try {
          const [stopwatch, countdown, intervals] = await Promise.all([
            tieredStorage.getHistory('Stopwatch'),
            tieredStorage.getHistory('Countdown'),
            tieredStorage.getHistory('Intervals'),
          ])
          setManualRefreshStopwatch(stopwatch)
          setManualRefreshCountdown(countdown)
          setManualRefreshIntervals(intervals)
          setUseManualData(true)
        } catch (error) {
          console.error('[HistoryModal] Error loading fresh data:', error)
          setUseManualData(false)
        }
      }
      loadFreshData()
    }
  }, [isOpen])

  // Hooks
  const {
    history: rawStopwatchHistory,
    deleteRecord: deleteStopwatchRecord,
    clearHistory: clearStopwatchHistory,
  } = useTimerHistory({
    mode: 'Stopwatch',
    storageKey: 'timer-stopwatch-history',
  })
  const {
    history: rawCountdownHistory,
    deleteRecord: deleteCountdownRecord,
    clearHistory: clearCountdownHistory,
  } = useTimerHistory({
    mode: 'Countdown',
    storageKey: 'timer-countdown-history',
  })
  const {
    history: rawIntervalsHistory,
    deleteRecord: deleteIntervalsRecord,
    clearHistory: clearIntervalsHistory,
  } = useTimerHistory({
    mode: 'Intervals',
    storageKey: 'timer-intervals-history',
  })

  // Data Processing
  const stopwatchHistory = useMemo(
    () => validateTimerHistory(useManualData ? manualRefreshStopwatch : rawStopwatchHistory),
    [rawStopwatchHistory, manualRefreshStopwatch, useManualData]
  )
  const countdownHistory = useMemo(
    () => validateTimerHistory(useManualData ? manualRefreshCountdown : rawCountdownHistory),
    [rawCountdownHistory, manualRefreshCountdown, useManualData]
  )
  const intervalsHistory = useMemo(
    () => validateTimerHistory(useManualData ? manualRefreshIntervals : rawIntervalsHistory),
    [rawIntervalsHistory, manualRefreshIntervals, useManualData]
  )

  const allHistory = useMemo(() => {
    let combined = [...stopwatchHistory, ...countdownHistory, ...intervalsHistory]

    if (filterMode !== 'All') {
      combined = combined.filter((record) => record.mode === filterMode)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      combined = combined.filter(
        (record) =>
          record.mode.toLowerCase().includes(query) ||
          (record.sessionName && record.sessionName.toLowerCase().includes(query))
      )
    }

    if (sortBy === 'date') {
      combined.sort((a, b) => b.timestamp - a.timestamp)
    } else {
      combined.sort((a, b) => b.duration - a.duration)
    }

    return combined
  }, [stopwatchHistory, countdownHistory, intervalsHistory, filterMode, searchQuery, sortBy])

  // Statistics
  const stats = useMemo(() => {
    const totalSessions = allHistory.length
    const totalDuration = allHistory.reduce((sum, record) => sum + record.duration, 0)
    const longestSession = allHistory.reduce((max, record) => Math.max(max, record.duration), 0)
    const avgDuration = totalSessions > 0 ? Math.floor(totalDuration / totalSessions) : 0

    return { totalSessions, totalDuration, longestSession, avgDuration }
  }, [allHistory])

  // Grouping
  const groupedHistory = useMemo(() => {
    const groups: Record<string, TimerHistoryRecord[]> = {}
    const now = Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000
    const oneWeekMs = 7 * oneDayMs

    allHistory.forEach((record) => {
      const recordDate = new Date(record.timestamp)
      const diff = now - record.timestamp

      let groupKey: string
      if (diff < oneDayMs && recordDate.getDate() === new Date().getDate()) {
        groupKey = 'Today'
      } else if (
        diff < 2 * oneDayMs &&
        recordDate.getDate() === new Date(now - oneDayMs).getDate()
      ) {
        groupKey = 'Yesterday'
      } else if (diff < oneWeekMs) {
        groupKey = 'This Week'
      } else {
        groupKey = recordDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }

      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(record)
    })
    return groups
  }, [allHistory])

  // Handlers
  const toggleCardExpansion = (id: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const handleDeleteClick = (id: string) => setDeleteConfirmId(id)

  const confirmDelete = () => {
    if (!deleteConfirmId) return
    const record = allHistory.find((r) => r.id === deleteConfirmId)
    if (!record) return

    if (record.mode === 'Stopwatch') {
      deleteStopwatchRecord(record.id)
      setManualRefreshStopwatch((prev) => prev.filter((r) => r.id !== record.id))
    } else if (record.mode === 'Countdown') {
      deleteCountdownRecord(record.id)
      setManualRefreshCountdown((prev) => prev.filter((r) => r.id !== record.id))
    } else if (record.mode === 'Intervals') {
      deleteIntervalsRecord(record.id)
      setManualRefreshIntervals((prev) => prev.filter((r) => r.id !== record.id))
    }
    setDeleteConfirmId(null)
  }

  const handleClearAll = () => {
    if (filterMode === 'All') {
      clearStopwatchHistory()
      clearCountdownHistory()
      clearIntervalsHistory()
      setManualRefreshStopwatch([])
      setManualRefreshCountdown([])
      setManualRefreshIntervals([])
    } else if (filterMode === 'Stopwatch') {
      clearStopwatchHistory()
      setManualRefreshStopwatch([])
    } else if (filterMode === 'Countdown') {
      clearCountdownHistory()
      setManualRefreshCountdown([])
    } else if (filterMode === 'Intervals') {
      clearIntervalsHistory()
      setManualRefreshIntervals([])
    }
  }

  const getModeGradient = (mode: TimerMode) => {
    switch (mode) {
      case 'Stopwatch':
        return 'from-blue-500 to-cyan-400'
      case 'Countdown':
        return 'from-emerald-500 to-green-400'
      case 'Intervals':
        return 'from-violet-500 to-fuchsia-400'
    }
  }

  const getModeIcon = (mode: TimerMode) => {
    switch (mode) {
      case 'Stopwatch':
        return 'timer'
      case 'Countdown':
        return 'hourglass_empty'
      case 'Intervals':
        return 'repeat'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden sm:p-4"
      >
        {/* Backdrop with heavy blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          variants={containerVariants}
          className="relative z-10 flex h-full w-full flex-col overflow-hidden border border-white/5 bg-[#0a0a0a]/80 shadow-2xl backdrop-blur-2xl sm:h-[85vh] sm:max-w-4xl sm:rounded-[2.5rem]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="shrink-0 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent px-6 py-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-bold tracking-tight text-white"
                >
                  History
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mt-1 text-sm font-medium text-white/40"
                >
                  Track your progress over time
                </motion.p>
              </div>

              <div className="flex items-center gap-3">
                {allHistory.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="rounded-full p-2.5 text-white/40 transition-all hover:bg-white/5 hover:text-red-400 active:scale-95"
                    title="Clear All History"
                  >
                    <span className="material-symbols-outlined text-xl">delete_sweep</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  aria-label="Close History"
                  className="rounded-full border border-white/5 bg-white/5 p-2.5 text-white transition-all hover:bg-white/10 active:scale-95"
                >
                  <span className="material-symbols-outlined text-xl" aria-hidden="true">
                    close
                  </span>
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            {allHistory.length > 0 && (
              <div className="mb-2 grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard
                  label="Total Time"
                  value={formatTime(stats.totalDuration * 1000)}
                  color="blue"
                  icon="schedule"
                />
                <StatCard
                  label="Sessions"
                  value={stats.totalSessions}
                  color="emerald"
                  icon="history"
                />
                <StatCard
                  label="Longest"
                  value={formatTime(stats.longestSession * 1000)}
                  color="violet"
                  icon="emoji_events"
                />
                <StatCard
                  label="Average"
                  value={formatTime(stats.avgDuration * 1000)}
                  color="amber"
                  icon="functions"
                />
              </div>
            )}
          </div>

          {/* Controls & List Container */}
          <div className="relative flex flex-1 flex-col overflow-hidden">
            {/* Filter Bar */}
            <div className="flex shrink-0 flex-col items-center justify-between gap-4 bg-black/20 px-6 py-4 sm:flex-row">
              {/* Search */}
              <div className="group relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-white/70">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search history..."
                  className="w-full rounded-xl border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
                />
              </div>

              {/* Filter Tabs */}
              <div
                className="scrollbar-hide flex w-full overflow-x-auto rounded-xl bg-white/5 p-1 sm:w-auto"
                role="tablist"
                aria-label="Filter history by mode"
              >
                {(['All', 'Stopwatch', 'Countdown', 'Intervals'] as FilterMode[]).map((mode) => (
                  <button
                    key={mode}
                    role="tab"
                    aria-selected={filterMode === mode}
                    aria-label={`Filter by ${mode}`}
                    onClick={() => setFilterMode(mode)}
                    className={`relative flex-1 whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium transition-all sm:flex-none ${
                      filterMode === mode ? 'text-white' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {filterMode === mode && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 rounded-lg bg-white/10 shadow-sm"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div
              className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 flex-1 overflow-y-auto px-6 py-4"
              role="region"
              aria-label="Timer history"
            >
              {allHistory.length === 0 ? (
                <EmptyState searchQuery={searchQuery} filterMode={filterMode} />
              ) : (
                <div className="space-y-8 pb-20">
                  {Object.entries(groupedHistory).map(([dateGroup, records], groupIndex) => (
                    <motion.div
                      key={dateGroup}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.1 }}
                    >
                      <div className="sticky top-0 z-10 mb-3 flex items-center gap-4 border-b border-white/5 bg-[#0a0a0a]/90 py-3 backdrop-blur-md">
                        <h3 className="border-l-2 border-primary pl-2 text-xs font-bold uppercase tracking-widest text-white/50">
                          {dateGroup}
                        </h3>
                        {/* Decorative line */}
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                      </div>

                      <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                          {records.map((record) => (
                            <HistoryCard
                              key={record.id}
                              record={record}
                              isExpanded={expandedCards.has(record.id)}
                              onToggle={() => toggleCardExpansion(record.id)}
                              onDelete={() => handleDeleteClick(record.id)}
                              getModeGradient={getModeGradient}
                              getModeIcon={getModeIcon}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Fading Overlay at Bottom */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmation
          isOpen={!!deleteConfirmId}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmId(null)}
        />
      </motion.div>
    </AnimatePresence>
  )
})

// Sub-components

const StatCard = ({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: string | number
  color: string
  icon: string
}) => {
  // Map color names to Tailwind colors for gradients/borders
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    violet: 'from-violet-500/10 to-violet-600/5 border-violet-500/20 text-violet-400',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400',
  }

  const styleClass = colorMap[color] || colorMap.blue

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-4 shadow-lg backdrop-blur-sm ${styleClass}`}
    >
      <div className="mb-2 flex items-center gap-2 opacity-80">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <div className="font-mono text-xl font-bold tracking-tight text-white sm:text-2xl">
        {value}
      </div>
    </div>
  )
}

const HistoryCard = React.forwardRef<
  HTMLDivElement,
  {
    record: TimerHistoryRecord
    isExpanded: boolean
    onToggle: () => void
    onDelete: () => void
    getModeGradient: (mode: TimerMode) => string
    getModeIcon: (mode: TimerMode) => string
  }
>(({ record, isExpanded, onToggle, onDelete, getModeGradient, getModeIcon }, ref) => {
  const startTime = new Date(record.timestamp)
  const endTime = new Date(record.timestamp + record.duration * 1000)

  return (
    <motion.div
      ref={ref}
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isExpanded
          ? 'border-white/20 bg-white/10 shadow-2xl'
          : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="flex cursor-pointer items-center gap-4 p-4" onClick={onToggle}>
        {/* Icon */}
        <div className="relative shrink-0">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getModeGradient(record.mode)} rounded-full opacity-20 blur-xl`}
          />
          <div
            className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getModeGradient(record.mode)} shadow-inner`}
          >
            <span className="material-symbols-outlined text-xl text-white">
              {getModeIcon(record.mode)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white">{record.mode}</span>
            {record.sessionName && (
              <>
                <span className="text-white/30">•</span>
                <span className="truncate text-sm text-white/70">{record.sessionName}</span>
              </>
            )}
            {record.mode === 'Intervals' && record.intervalCount && (
              <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/60 sm:ml-2">
                {record.intervalCount} loops
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-bold tracking-tighter text-white">
              {formatTime(record.duration * 1000)}
            </span>
            <span className="rounded-md border border-white/5 bg-white/5 px-2 py-0.5 text-xs font-medium text-white/30">
              {startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/20 transition-colors hover:bg-white/10 hover:text-red-400"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/20"
          >
            <span className="material-symbols-outlined text-xl">expand_more</span>
          </motion.div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5 bg-black/20"
          >
            <div className="grid grid-cols-2 gap-3 p-4 text-sm">
              <div className="space-y-1 rounded-xl border border-white/5 bg-white/5 p-3">
                <div className="text-xs font-bold uppercase tracking-wider text-white/40">
                  Started
                </div>
                <div className="font-medium text-white">
                  {startTime.toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div className="space-y-1 rounded-xl border border-white/5 bg-white/5 p-3">
                <div className="text-xs font-bold uppercase tracking-wider text-white/40">
                  Ended
                </div>
                <div className="font-medium text-white">
                  {endTime.toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              {/* Detailed Breakdown */}
              <div className="col-span-2 flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
                <div className="text-xs font-bold uppercase tracking-wider text-white/40">
                  Duration Breakdown
                </div>
                <div className="flex gap-4 font-mono text-white/80">
                  <span>{Math.floor(record.duration / 3600)}h</span>
                  <span>{Math.floor((record.duration % 3600) / 60)}m</span>
                  <span>{record.duration % 60}s</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

HistoryCard.displayName = 'HistoryCard'

const EmptyState = ({ searchQuery, filterMode }: { searchQuery: string; filterMode: string }) => (
  <motion.div
    role="status"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex h-[50vh] flex-col items-center justify-center px-4 text-center"
  >
    <div className="relative mb-8">
      <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        <span className="material-symbols-outlined text-5xl text-white/20">history_edu</span>
      </div>
    </div>

    <h3 className="mb-2 text-xl font-bold text-white">
      {searchQuery ? 'No matches found' : 'No history yet'}
    </h3>
    <p className="max-w-sm text-sm leading-relaxed text-white/40">
      {searchQuery
        ? `We couldn't find any sessions matching "${searchQuery}"`
        : filterMode === 'All'
          ? 'Your completed timer sessions will appear here beautifully.'
          : `You haven't completed any ${filterMode} sessions yet.`}
    </p>
  </motion.div>
)

const DeleteConfirmation = ({
  isOpen,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}) => (
  <AnimatePresence>
    {isOpen && (
      <div
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#121212] p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Glow */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />

          <div className="relative z-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Delete Session?</h3>
            <p className="mb-6 text-sm text-white/50">
              This action cannot be undone. This session data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 rounded-xl bg-white/5 px-4 py-3 font-medium text-white transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-bold text-white shadow-lg shadow-red-500/20 transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
)
