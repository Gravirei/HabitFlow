/**
 * HistoryModal Component
 * Full-screen modal displaying timer history with mode filtering
 * Redesigned with modern glassmorphism and smooth animations
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTimerHistory } from '../hooks/useTimerHistory'
import { validateTimerHistory } from '../utils/validation'
import type { TimerHistoryRecord, TimerMode } from '../types/timer.types'
import { formatTime } from '../constants/timer.constants'
import { tieredStorage } from '../../../lib/storage/tieredStorage'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

type FilterMode = 'All' | TimerMode
type SortOption = 'date' | 'duration'

export const HistoryModal: React.FC<HistoryModalProps> = React.memo(({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [filterMode, setFilterMode] = useState<FilterMode>('All')
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [manualRefreshStopwatch, setManualRefreshStopwatch] = useState<TimerHistoryRecord[]>([])
  const [manualRefreshCountdown, setManualRefreshCountdown] = useState<TimerHistoryRecord[]>([])
  const [manualRefreshIntervals, setManualRefreshIntervals] = useState<TimerHistoryRecord[]>([])
  const [useManualData, setUseManualData] = useState(false)
  
  // Reload history from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadFreshData = async () => {
        try {
          const [stopwatch, countdown, intervals] = await Promise.all([
            tieredStorage.getHistory('Stopwatch'),
            tieredStorage.getHistory('Countdown'),
            tieredStorage.getHistory('Intervals')
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
  
  // Load history from all modes using useTimerHistory (supports tiered storage)
  const { history: rawStopwatchHistory, deleteRecord: deleteStopwatchRecord, clearHistory: clearStopwatchHistory } = useTimerHistory({ 
    mode: 'Stopwatch', 
    storageKey: 'timer-stopwatch-history' 
  })
  const { history: rawCountdownHistory, deleteRecord: deleteCountdownRecord, clearHistory: clearCountdownHistory } = useTimerHistory({ 
    mode: 'Countdown', 
    storageKey: 'timer-countdown-history' 
  })
  const { history: rawIntervalsHistory, deleteRecord: deleteIntervalsRecord, clearHistory: clearIntervalsHistory } = useTimerHistory({ 
    mode: 'Intervals', 
    storageKey: 'timer-intervals-history' 
  })

  // Validate and sanitize history data - use fresh data when modal opens
  const stopwatchHistory = useMemo(() => 
    validateTimerHistory(useManualData ? manualRefreshStopwatch : rawStopwatchHistory), 
    [rawStopwatchHistory, manualRefreshStopwatch, useManualData]
  )
  const countdownHistory = useMemo(() => 
    validateTimerHistory(useManualData ? manualRefreshCountdown : rawCountdownHistory), 
    [rawCountdownHistory, manualRefreshCountdown, useManualData]
  )
  const intervalsHistory = useMemo(() => 
    validateTimerHistory(useManualData ? manualRefreshIntervals : rawIntervalsHistory), 
    [rawIntervalsHistory, manualRefreshIntervals, useManualData]
  )

  // Combine, filter, and sort history
  const allHistory = useMemo(() => {
    let combined = [
      ...stopwatchHistory,
      ...countdownHistory,
      ...intervalsHistory
    ]

    // Apply mode filter
    if (filterMode !== 'All') {
      combined = combined.filter(record => record.mode === filterMode)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      combined = combined.filter(record => 
        record.mode.toLowerCase().includes(query) ||
        (record.sessionName && record.sessionName.toLowerCase().includes(query))
      )
    }

    // Apply sorting
    if (sortBy === 'date') {
      combined.sort((a, b) => b.timestamp - a.timestamp)
    } else {
      combined.sort((a, b) => b.duration - a.duration)
    }

    return combined
  }, [stopwatchHistory, countdownHistory, intervalsHistory, filterMode, searchQuery, sortBy])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSessions = allHistory.length
    const totalDuration = allHistory.reduce((sum, record) => sum + record.duration, 0)
    const longestSession = allHistory.reduce((max, record) => 
      record.duration > max ? record.duration : max, 0
    )
    const avgDuration = totalSessions > 0 ? Math.floor(totalDuration / totalSessions) : 0

    return {
      totalSessions,
      totalDuration,
      longestSession,
      avgDuration
    }
  }, [allHistory])

  // Group records by date
  const groupedHistory = useMemo(() => {
    const groups: Record<string, TimerHistoryRecord[]> = {}
    const now = Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000
    const oneWeekMs = 7 * oneDayMs

    allHistory.forEach(record => {
      const recordDate = new Date(record.timestamp)
      const diff = now - record.timestamp

      let groupKey: string
      if (diff < oneDayMs && recordDate.getDate() === new Date().getDate()) {
        groupKey = 'Today'
      } else if (diff < 2 * oneDayMs && recordDate.getDate() === new Date(now - oneDayMs).getDate()) {
        groupKey = 'Yesterday'
      } else if (diff < oneWeekMs) {
        groupKey = 'This Week'
      } else {
        groupKey = recordDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(record)
    })

    return groups
  }, [allHistory])

  // Toggle card expansion
  const toggleCardExpansion = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Delete record with confirmation
  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = () => {
    if (!deleteConfirmId) return
    
    const record = allHistory.find(r => r.id === deleteConfirmId)
    if (!record) return

    // Delete using the appropriate deleteRecord function based on mode
    if (record.mode === 'Stopwatch') {
      deleteStopwatchRecord(record.id)
    } else if (record.mode === 'Countdown') {
      deleteCountdownRecord(record.id)
    } else if (record.mode === 'Intervals') {
      deleteIntervalsRecord(record.id)
    }
    
    setDeleteConfirmId(null)
  }

  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

  // Clear all for current filter
  const handleClearAll = () => {
    if (filterMode === 'All') {
      clearStopwatchHistory()
      clearCountdownHistory()
      clearIntervalsHistory()
    } else if (filterMode === 'Stopwatch') {
      clearStopwatchHistory()
    } else if (filterMode === 'Countdown') {
      clearCountdownHistory()
    } else if (filterMode === 'Intervals') {
      clearIntervalsHistory()
    }
  }

  // -- Helpers for rendering --

  const getModeGradient = (mode: TimerMode) => {
    switch (mode) {
      case 'Stopwatch': return 'from-blue-500 to-cyan-400'
      case 'Countdown': return 'from-emerald-500 to-green-400'
      case 'Intervals': return 'from-violet-500 to-fuchsia-400'
    }
  }

  const getModeIcon = (mode: TimerMode) => {
    switch (mode) {
      case 'Stopwatch': return 'timer'
      case 'Countdown': return 'hourglass_empty'
      case 'Intervals': return 'repeat'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center overflow-hidden"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative z-10 flex flex-col w-full h-full sm:h-[85vh] sm:max-w-3xl sm:rounded-3xl bg-background-dark/95 border-t sm:border border-white/10 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Section with Glass Effect */}
          <div className="relative z-20 shrink-0 px-6 py-5 border-b border-white/5 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">History</h2>
                <p className="text-sm text-white/50 font-medium">
                  {allHistory.length} {allHistory.length === 1 ? 'session' : 'sessions'} recorded
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {allHistory.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-red-400 transition-colors"
                    title="Clear History"
                  >
                    <span className="material-symbols-outlined text-xl">delete_sweep</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Close history"
                >
                  <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            {allHistory.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="text-xs text-blue-300 font-medium mb-1">Total Time</div>
                  <div className="text-lg font-bold text-white font-mono">{formatTime(stats.totalDuration * 1000)}</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                  <div className="text-xs text-emerald-300 font-medium mb-1">Sessions</div>
                  <div className="text-lg font-bold text-white">{stats.totalSessions}</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
                  <div className="text-xs text-violet-300 font-medium mb-1">Longest</div>
                  <div className="text-lg font-bold text-white font-mono">{formatTime(stats.longestSession * 1000)}</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="text-xs text-amber-300 font-medium mb-1">Average</div>
                  <div className="text-lg font-bold text-white font-mono">{formatTime(stats.avgDuration * 1000)}</div>
                </div>
              </div>
            )}

            {/* Premium Upgrade CTA */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-blue-500/20 to-violet-500/20 border border-primary/30 p-4 sm:p-5">
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-violet-500/10 opacity-50 animate-pulse" />
                
                <div className="relative flex items-center gap-4">
                  {/* Icon */}
                  <div className="shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary to-blue-500 shadow-lg">
                    <span className="material-symbols-outlined text-white text-2xl sm:text-3xl">auto_awesome</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-base sm:text-lg mb-1 flex items-center gap-2">
                      Unlock Premium History
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider">
                        New
                      </span>
                    </h4>
                    <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                      Get advanced analytics, beautiful charts, export to PDF/CSV, achievements, and more!
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      navigate('/timer/premium-history')
                      onClose()
                    }}
                    className="shrink-0 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-black font-bold text-sm rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 active:scale-95 flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">View Premium</span>
                    <span className="sm:hidden">Upgrade</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>

                {/* Feature highlights */}
                <div className="relative mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-white/60">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    <span>Analytics Dashboard</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/60">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    <span>Export Data</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/60">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    <span>Achievements</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/60">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    <span>Insights</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Search and Sort Controls */}
            {allHistory.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none pl-10 pr-10 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                  >
                    <option value="date" className="bg-background-dark">Newest First</option>
                    <option value="duration" className="bg-background-dark">Longest First</option>
                  </select>
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg pointer-events-none">
                    sort
                  </span>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-lg pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            )}

            {/* Modern Segmented Control */}
            <div className="flex p-1 bg-black/20 rounded-xl overflow-x-auto scrollbar-hide" role="tablist" aria-label="Filter history by timer mode">
              {(['All', 'Stopwatch', 'Countdown', 'Intervals'] as FilterMode[]).map((mode) => {
                const isActive = filterMode === mode
                return (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Show ${mode === 'All' ? 'all timer' : mode} history`}
                    className={`relative flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap min-w-[90px] ${
                      isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    {isActive && (
                      <div
                        className="absolute inset-0 bg-white/10 rounded-lg shadow-sm"
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {mode !== 'All' && (
                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${getModeGradient(mode as TimerMode)} ${isActive ? 'opacity-100' : 'opacity-50'}`} />
                      )}
                      {mode}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Map of Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10" role="region" aria-label="Timer history records">
            {allHistory.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-[60vh] text-center px-4"
                role="status"
              >
                <div className="relative mb-8">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-blue-500/20 to-violet-500/20 blur-3xl rounded-full animate-pulse" />
                  
                  {/* Icon container with multiple layers */}
                  <div className="relative flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl" />
                    <span className="material-symbols-outlined text-6xl text-white/30">history</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  {searchQuery ? 'No Results Found' : 'No History Yet'}
                </h3>
                
                <p className="text-white/50 max-w-sm mb-6 leading-relaxed">
                  {searchQuery ? (
                    <>
                      No sessions match "<span className="text-primary font-semibold">{searchQuery}</span>". 
                      Try adjusting your search or filters.
                    </>
                  ) : filterMode === 'All' ? (
                    "Your timer journey starts here. Complete your first session to see your progress tracked beautifully."
                  ) : (
                    `Start a ${filterMode.toLowerCase()} timer to begin tracking your ${filterMode.toLowerCase()} sessions.`
                  )}
                </p>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </motion.div>
            ) : (
              <div
                className="space-y-8 pb-10"
              >
                {Object.entries(groupedHistory).map(([dateGroup, records]) => (
                  <div key={dateGroup} className="relative">
                    {/* Sticky Date Header */}
                    <div className="sticky top-0 z-10 flex items-center gap-4 py-3 mb-2 bg-background-dark/95 backdrop-blur-sm">
                      <h3 className="text-primary font-bold text-sm uppercase tracking-wider pl-2 border-l-2 border-primary">
                        {dateGroup}
                      </h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>

                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {records.map((record) => {
                          const isExpanded = expandedCards.has(record.id)
                          const startTime = new Date(record.timestamp)
                          const endTime = new Date(record.timestamp + record.duration * 1000)
                          
                          return (
                            <motion.div
                              key={record.id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -100 }}
                              className="group relative overflow-hidden rounded-2xl bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10 transition-all duration-300"
                            >
                              {/* Main Card Content */}
                              <div 
                                className="flex items-center gap-4 p-4 cursor-pointer"
                                onClick={() => toggleCardExpansion(record.id)}
                              >
                                {/* Icon Box with gradient glow */}
                                <div className="relative shrink-0">
                                  <div className={`absolute inset-0 bg-gradient-to-br ${getModeGradient(record.mode)} opacity-30 blur-xl rounded-xl`} />
                                  <div className={`relative flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${getModeGradient(record.mode)} shadow-lg`}>
                                    <span className="material-symbols-outlined text-white text-2xl">
                                      {getModeIcon(record.mode)}
                                    </span>
                                  </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-white font-bold text-base">{record.mode}</span>
                                    {record.sessionName && (
                                      <span className="text-white/60 text-sm font-medium truncate">
                                        • {record.sessionName}
                                      </span>
                                    )}
                                    {record.mode === 'Intervals' && record.intervalCount && (
                                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px] uppercase font-bold tracking-wide">
                                        {record.intervalCount} loops
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-mono font-bold text-white tracking-tight">
                                      {formatTime(record.duration * 1000)}
                                    </span>
                                    <span className="text-xs text-white/40">
                                      {startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteClick(record.id)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-10 h-10 rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all focus:opacity-100 active:scale-90"
                                    title="Delete Record"
                                  >
                                    <span className="material-symbols-outlined text-lg">delete_outline</span>
                                  </button>
                                  
                                  <div className="flex items-center justify-center w-10 h-10">
                                    <motion.span
                                      animate={{ rotate: isExpanded ? 180 : 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="material-symbols-outlined text-white/50 text-xl"
                                    >
                                      expand_more
                                    </motion.span>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Details */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden border-t border-white/5"
                                  >
                                    <div className="p-4 pt-3 space-y-3 bg-black/20">
                                      {/* Time Details */}
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                          <div className="text-xs text-white/50 font-medium mb-1">Started</div>
                                          <div className="text-sm text-white font-semibold">
                                            {startTime.toLocaleString([], { 
                                              month: 'short', 
                                              day: 'numeric',
                                              hour: 'numeric', 
                                              minute: '2-digit' 
                                            })}
                                          </div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                          <div className="text-xs text-white/50 font-medium mb-1">Ended</div>
                                          <div className="text-sm text-white font-semibold">
                                            {endTime.toLocaleString([], { 
                                              month: 'short', 
                                              day: 'numeric',
                                              hour: 'numeric', 
                                              minute: '2-digit' 
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Intervals Breakdown */}
                                      {record.mode === 'Intervals' && record.intervalCount && (
                                        <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                          <div className="text-xs text-violet-300 font-medium mb-2">Session Details</div>
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                              <span className="text-white/50">Completed:</span>
                                              <span className="text-white font-semibold ml-2">{record.intervalCount} loops</span>
                                            </div>
                                            {record.sessionName && (
                                              <div>
                                                <span className="text-white/50">Type:</span>
                                                <span className="text-white font-semibold ml-2">{record.sessionName}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Session Name for other modes */}
                                      {record.sessionName && record.mode !== 'Intervals' && (
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                          <div className="text-xs text-white/50 font-medium mb-1">Session Name</div>
                                          <div className="text-sm text-white font-semibold">{record.sessionName}</div>
                                        </div>
                                      )}

                                      {/* Duration Breakdown */}
                                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className="text-xs text-white/50 font-medium mb-2">Duration Breakdown</div>
                                        <div className="flex items-center gap-3 text-sm">
                                          {Math.floor(record.duration / 3600) > 0 && (
                                            <div>
                                              <span className="text-2xl font-bold text-white font-mono">
                                                {Math.floor(record.duration / 3600)}
                                              </span>
                                              <span className="text-white/50 ml-1">hours</span>
                                            </div>
                                          )}
                                          {Math.floor((record.duration % 3600) / 60) > 0 && (
                                            <div>
                                              <span className="text-2xl font-bold text-white font-mono">
                                                {Math.floor((record.duration % 3600) / 60)}
                                              </span>
                                              <span className="text-white/50 ml-1">minutes</span>
                                            </div>
                                          )}
                                          <div>
                                            <span className="text-2xl font-bold text-white font-mono">
                                              {record.duration % 60}
                                            </span>
                                            <span className="text-white/50 ml-1">seconds</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <AnimatePresence>
          {deleteConfirmId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={cancelDelete}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background-dark border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20">
                  <span className="material-symbols-outlined text-3xl text-red-400">delete</span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white text-center mb-2">
                  Delete Session?
                </h3>
                <p className="text-white/60 text-center text-sm mb-6">
                  This action cannot be undone. The session will be permanently removed from your history.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
})
