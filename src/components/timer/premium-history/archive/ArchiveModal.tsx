/**
 * Archive Modal
 * View and manage archived timer sessions
 * Redesigned to match Custom Tags modal theme
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useArchiveStore } from './archiveStore'
import { convertFromArchivedSession } from './archiveUtils'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface ArchiveModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ArchiveModal({ isOpen, onClose }: ArchiveModalProps) {
  const { archivedSessions, restoreSession, deleteArchivedSession, bulkDelete, clearArchive } = useArchiveStore()
  
  const [rawStopwatchHistory, setStopwatchHistory] = useLocalStorage<any[]>('timer-stopwatch-history', [])
  const [rawCountdownHistory, setCountdownHistory] = useLocalStorage<any[]>('timer-countdown-history', [])
  const [rawIntervalsHistory, setIntervalsHistory] = useLocalStorage<any[]>('timer-intervals-history', [])

  // Ensure history values are always arrays to prevent "not iterable" errors
  const stopwatchHistory = useMemo(() => Array.isArray(rawStopwatchHistory) ? rawStopwatchHistory : [], [rawStopwatchHistory])
  const countdownHistory = useMemo(() => Array.isArray(rawCountdownHistory) ? rawCountdownHistory : [], [rawCountdownHistory])
  const intervalsHistory = useMemo(() => Array.isArray(rawIntervalsHistory) ? rawIntervalsHistory : [], [rawIntervalsHistory])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'Stopwatch' | 'Countdown' | 'Intervals'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let sessions = archivedSessions

    // Filter by mode
    if (filterMode !== 'all') {
      sessions = sessions.filter((s) => s.mode === filterMode)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      sessions = sessions.filter((s) => {
        const sessionName = s.sessionName?.toLowerCase() || ''
        const mode = s.mode.toLowerCase()
        return sessionName.includes(query) || mode.includes(query)
      })
    }

    return sessions
  }, [archivedSessions, filterMode, searchQuery])

  const handleRestore = (sessionId: string) => {
    const session = restoreSession(sessionId)
    if (!session) return

    const record = convertFromArchivedSession(session)

    // Restore to appropriate history
    switch (session.originalStorage) {
      case 'stopwatch':
        setStopwatchHistory([...stopwatchHistory, record])
        break
      case 'countdown':
        setCountdownHistory([...countdownHistory, record])
        break
      case 'intervals':
        setIntervalsHistory([...intervalsHistory, record])
        break
    }
  }

  const handleDelete = (sessionId: string) => {
    if (confirm('Permanently delete this session? This cannot be undone.')) {
      deleteArchivedSession(sessionId)
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    if (confirm(`Permanently delete ${selectedIds.size} session(s)? This cannot be undone.`)) {
      bulkDelete(Array.from(selectedIds))
      setSelectedIds(new Set())
    }
  }

  const handleBulkRestore = () => {
    if (selectedIds.size === 0) return
    selectedIds.forEach((id) => handleRestore(id))
    setSelectedIds(new Set())
  }

  const handleClearAll = () => {
    if (confirm('Clear entire archive? This cannot be undone.')) {
      clearArchive()
    }
  }

  const toggleSelection = (sessionId: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(sessionId)) {
      newSet.delete(sessionId)
    } else {
      newSet.add(sessionId)
    }
    setSelectedIds(newSet)
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'Stopwatch': return 'bg-blue-500'
      case 'Countdown': return 'bg-purple-500'
      case 'Intervals': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'Stopwatch': return 'timer'
      case 'Countdown': return 'hourglass_empty'
      case 'Intervals': return 'repeat'
      default: return 'schedule'
    }
  }

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`
    }
    return `${secs}s`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-2xl max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">archive</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Archive</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {archivedSessions.length} archived session{archivedSessions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search archived sessions..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mb-3">
                {(['all', 'Stopwatch', 'Countdown', 'Intervals'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filterMode === mode
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {mode === 'all' ? 'All' : mode}
                  </button>
                ))}
              </div>

              {/* Bulk Actions */}
              {selectedIds.size > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkRestore}
                    className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                  >
                    Restore ({selectedIds.size})
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all"
                  >
                    Delete ({selectedIds.size})
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-240px)] p-6">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-3xl">archive</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {searchQuery ? 'No sessions found' : 'No Archived Sessions'}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Archived sessions will appear here'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredSessions.map((session) => {
                    const isSelected = selectedIds.has(session.id)
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer ${
                          isSelected ? 'ring-2 ring-amber-500' : ''
                        }`}
                        onClick={() => toggleSelection(session.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3 flex-1">
                            {/* Selection Checkbox */}
                            <div className="pt-1">
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-amber-500 border-amber-500'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}>
                                {isSelected && (
                                  <span className="material-symbols-outlined text-white text-xs">check</span>
                                )}
                              </div>
                            </div>

                            {/* Mode Icon */}
                            <div className={`w-12 h-12 rounded-xl ${getModeColor(session.mode)} flex items-center justify-center shrink-0`}>
                              <span className="material-symbols-outlined text-white text-xl">
                                {getModeIcon(session.mode)}
                              </span>
                            </div>

                            {/* Session Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                {session.sessionName || session.mode}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-500">
                                <span>{session.mode}</span>
                                <span>•</span>
                                <span>{formatDuration(session.duration)}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-500">
                                <span>{formatDate(session.timestamp)}</span>
                                <span>•</span>
                                <span>{formatTime(session.timestamp)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleRestore(session.id)}
                              className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 transition-colors"
                              title="Restore"
                            >
                              <span className="material-symbols-outlined text-lg">unarchive</span>
                            </button>
                            <button
                              onClick={() => handleDelete(session.id)}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                              title="Delete permanently"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {archivedSessions.length > 0 && (
              <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-4">
                <button
                  onClick={handleClearAll}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">delete_sweep</span>
                  Clear All Archive
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
