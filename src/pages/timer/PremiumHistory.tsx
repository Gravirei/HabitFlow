/**
 * Premium History Page
 * Mobile-first timer history with beautiful session cards and analytics
 * Refactored to use modular components
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimerHistory } from '@/features/timer/hooks/useTimerHistory'
import {
  PremiumHistoryLayout,
  FilterBar,
  type FilterMode,
  SessionCard,
  SessionGroup,
  EmptyState,
  SessionDetailsModal,
  ClearHistoryModal,
  PremiumHistoryErrorBoundary,
  LiveRegionAnnouncer,
  useLiveRegion,
} from '@/features/timer/components/premium-history'
import {
  ClearFiltersButton,
  FilterSettingsModal,
} from '@/features/timer/components/premium-history/filters'
import {
  ExportModal,
  exportToCSV,
  exportToJSON,
  exportToPDF,
} from '@/features/timer/components/premium-history/export'
import type {
  ExportFormat,
  ExportOptions,
  TimerSession,
} from '@/features/timer/components/premium-history/export'
import { PremiumHistorySettingsSidebar } from '@/features/timer/components/premium-history/layout/PremiumHistorySettingsSidebar'
import { useFilterPersistence } from '@/features/timer/components/premium-history/hooks/useFilterPersistence'
import { useFilterVisibility } from '@/features/timer/components/premium-history/hooks/useFilterVisibility'
import { AchievementProgressWidget } from '@/features/timer/components/sidebar/achievements'
import { ArchiveModal } from '@/features/timer/components/premium-history/archive'
import { NotificationSettingsModal } from '@/features/timer/components/premium-history/notifications'
import {
  SessionTemplatesModal,
  CreateTemplateModal,
} from '@/features/timer/components/premium-history/session-templates'
import { CustomTagsModal } from '@/features/timer/components/premium-history/custom-tags'
import { CalendarViewModal } from '@/features/timer/components/premium-history/calendar-view'
import { CompareSessionsModal } from '@/features/timer/components/premium-history/compare-sessions'
import { SmartReportsModal } from '@/features/timer/components/premium-history/smart-reports'
import { TeamSharingModal } from '@/features/timer/components/premium-history/team-sharing'
import { CloudSyncModal } from '@/features/timer/components/premium-history/cloud-sync'
import { useNavigate } from 'react-router-dom'
import { timerPersistence, type RepeatSessionConfig } from '@/features/timer/utils/timerPersistence'
import type {
  CountdownSession,
  IntervalsSession,
} from '@/features/timer/components/premium-history/types/session.types'

interface GroupedSessions {
  [key: string]: TimerSession[]
}

function PremiumHistoryContent() {
  const navigate = useNavigate()
  const { message: liveMessage, announce } = useLiveRegion()
  const [filterMode, setFilterMode] = useState<FilterMode>('All')
  const [selectedSession, setSelectedSession] = useState<any | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false)
  const [isFilterSettingsModalOpen, setIsFilterSettingsModalOpen] = useState(false)
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false)
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false)
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false)
  const [isCustomTagsModalOpen, setIsCustomTagsModalOpen] = useState(false)
  const [isCalendarViewModalOpen, setIsCalendarViewModalOpen] = useState(false)
  const [isCompareSessionsModalOpen, setIsCompareSessionsModalOpen] = useState(false)
  const [isSmartReportsModalOpen, setIsSmartReportsModalOpen] = useState(false)
  const [isTeamSharingModalOpen, setIsTeamSharingModalOpen] = useState(false)
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false)

  // Filter state
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>()
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>()
  const [minDuration, setMinDuration] = useState<number>(0)
  const [maxDuration, setMaxDuration] = useState<number>(7200) // 2 hours
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'stopped'>('all')

  // Filter visibility hook
  const { filterVisibility, setFilterVisibility } = useFilterVisibility()

  // Get history for each timer mode with clear functions
  const { history: stopwatchHistory, clearHistory: clearStopwatchHistory } = useTimerHistory({
    mode: 'Stopwatch',
    storageKey: 'timer-stopwatch-history',
  })
  const { history: countdownHistory, clearHistory: clearCountdownHistory } = useTimerHistory({
    mode: 'Countdown',
    storageKey: 'timer-countdown-history',
  })
  const { history: intervalsHistory, clearHistory: clearIntervalsHistory } = useTimerHistory({
    mode: 'Intervals',
    storageKey: 'timer-intervals-history',
  })

  // Combine all history and apply filters with memoization for performance
  const allHistory = useMemo(() => {
    let combined = [...stopwatchHistory, ...countdownHistory, ...intervalsHistory].sort(
      (a, b) => b.timestamp - a.timestamp
    )

    // Apply mode filter
    if (filterMode !== 'All') {
      combined = combined.filter((record) => record.mode === filterMode)
    }

    // Apply date range filter
    if (dateRangeStart && dateRangeEnd) {
      const startTime = dateRangeStart.getTime()
      const endTime = dateRangeEnd.getTime() + 86400000 - 1 // Include entire end day
      combined = combined.filter((record) => {
        return record.timestamp >= startTime && record.timestamp <= endTime
      })
    }

    // Apply duration filter
    if (minDuration > 0 || maxDuration < 7200) {
      combined = combined.filter((record) => {
        return record.duration >= minDuration && record.duration <= maxDuration
      })
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      combined = combined.filter((record) => {
        const sessionName = record.sessionName?.toLowerCase() || ''
        const mode = record.mode.toLowerCase()
        return sessionName.includes(query) || mode.includes(query)
      })
    }

    // Apply completion status filter
    if (completionFilter !== 'all') {
      combined = combined.filter((record) => {
        let isCompleted: boolean

        // Determine if session was completed based on mode and saved data
        switch (record.mode) {
          case 'Countdown':
            // Use the completed field we save (true if completed, false if stopped early)
            isCompleted = record.completed !== false // Default to true if field missing (old data)
            break

          case 'Intervals':
            // Check if all target loops were completed
            if (record.targetLoopCount) {
              const completed = record.completedLoops || record.intervalCount || 0
              isCompleted = completed >= record.targetLoopCount
            } else {
              isCompleted = true // No target set, assume completed
            }
            break

          case 'Stopwatch':
            // Stopwatch sessions are always considered completed when saved
            isCompleted = true
            break

          default:
            isCompleted = true
        }

        // Apply filter
        if (completionFilter === 'completed') {
          return isCompleted
        } else {
          return !isCompleted
        }
      })
    }

    return combined
  }, [
    stopwatchHistory,
    countdownHistory,
    intervalsHistory,
    filterMode,
    dateRangeStart,
    dateRangeEnd,
    minDuration,
    maxDuration,
    searchQuery,
    completionFilter,
  ])

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const groups: GroupedSessions = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Older: [],
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    allHistory.forEach((session) => {
      const sessionDate = new Date(session.timestamp)
      const sessionDay = new Date(
        sessionDate.getFullYear(),
        sessionDate.getMonth(),
        sessionDate.getDate()
      )

      if (sessionDay.getTime() === today.getTime()) {
        groups.Today.push(session)
      } else if (sessionDay.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(session)
      } else if (sessionDate >= weekAgo) {
        groups['This Week'].push(session)
      } else {
        groups.Older.push(session)
      }
    })

    return groups
  }, [allHistory])

  // Format time helper
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Session action handlers
  const handleDetailsClick = (session: TimerSession) => {
    setSelectedSession(session)
    setIsDetailsModalOpen(true)
  }

  const handleRepeatClick = (session: TimerSession) => {
    // Save repeat configuration based on session type
    let repeatConfig: RepeatSessionConfig

    switch (session.mode) {
      case 'Countdown': {
        // Cast to access countdown-specific properties
        const countdownSession = session as CountdownSession
        // Extract hours, minutes, seconds from targetDuration (in seconds)
        const targetSeconds = countdownSession.targetDuration || countdownSession.duration
        const hours = Math.floor(targetSeconds / 3600)
        const minutes = Math.floor((targetSeconds % 3600) / 60)
        const seconds = targetSeconds % 60

        repeatConfig = {
          mode: 'Countdown',
          hours,
          minutes,
          seconds,
          createdAt: Date.now(),
        }
        break
      }
      case 'Intervals': {
        // Cast to access intervals-specific properties
        const intervalsSession = session as IntervalsSession
        repeatConfig = {
          mode: 'Intervals',
          workMinutes: intervalsSession.workDuration
            ? Math.floor(intervalsSession.workDuration / 60)
            : 25,
          breakMinutes: intervalsSession.breakDuration
            ? Math.floor(intervalsSession.breakDuration / 60)
            : 5,
          targetLoops: intervalsSession.targetLoopCount || intervalsSession.intervalCount || 4,
          sessionName: intervalsSession.sessionName,
          createdAt: Date.now(),
        }
        break
      }
      default:
        // Stopwatch doesn't need configuration - just navigate
        navigate('/timer')
        announce('Opening Stopwatch timer')
        return
    }

    // Save the configuration and navigate
    timerPersistence.saveRepeatSession(repeatConfig)
    announce(`Repeating ${session.mode} session`)
    navigate('/timer')
  }

  const handleResumeClick = (session: TimerSession) => {
    // Resume is only meaningful for incomplete countdown sessions
    if (session.mode !== 'Countdown') {
      // For other modes, just repeat
      handleRepeatClick(session)
      return
    }

    // Cast to access countdown-specific properties
    const countdownSession = session as CountdownSession

    // Check if this was an incomplete session
    if (countdownSession.completed !== false) {
      // Session was completed, just repeat it
      handleRepeatClick(session)
      return
    }

    // Calculate remaining time for incomplete countdown
    const targetSeconds = countdownSession.targetDuration || 0
    const completedSeconds = countdownSession.duration || 0
    const remainingSeconds = targetSeconds - completedSeconds

    if (remainingSeconds <= 0) {
      // No time remaining, just repeat
      handleRepeatClick(session)
      return
    }

    // Extract hours, minutes, seconds from remaining time
    const hours = Math.floor(remainingSeconds / 3600)
    const minutes = Math.floor((remainingSeconds % 3600) / 60)
    const seconds = remainingSeconds % 60

    const repeatConfig: RepeatSessionConfig = {
      mode: 'Countdown',
      hours,
      minutes,
      seconds,
      createdAt: Date.now(),
    }

    // Save and navigate
    timerPersistence.saveRepeatSession(repeatConfig)
    announce(`Resuming countdown with ${formatTime(remainingSeconds)} remaining`)
    navigate('/timer')
  }

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRangeStart(start)
    setDateRangeEnd(end)
    announce(
      `Date range filter applied from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`
    )
  }

  const handleDurationChange = (min: number, max: number) => {
    setMinDuration(min)
    setMaxDuration(max)
  }

  // Persist filters to localStorage
  useFilterPersistence(
    filterMode,
    dateRangeStart,
    dateRangeEnd,
    minDuration,
    maxDuration,
    setFilterMode,
    setDateRangeStart,
    setDateRangeEnd,
    setMinDuration,
    setMaxDuration
  )

  // Check if any advanced filters are active
  const hasActiveFilters = minDuration > 0 || maxDuration < 7200

  // Count active filters
  const activeFilterCount = [
    filterMode !== 'All' ? 1 : 0,
    dateRangeStart && dateRangeEnd ? 1 : 0,
    minDuration > 0 || maxDuration < 7200 ? 1 : 0,
    searchQuery.trim() ? 1 : 0,
    completionFilter !== 'all' ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0)

  // Clear all filters
  const handleClearAllFilters = () => {
    setFilterMode('All')
    setDateRangeStart(undefined)
    setDateRangeEnd(undefined)
    setMinDuration(0)
    setMaxDuration(7200)
    setSearchQuery('')
    setCompletionFilter('all')
  }

  // Handle clear all history
  const handleClearHistory = () => {
    clearStopwatchHistory()
    clearCountdownHistory()
    clearIntervalsHistory()
    announce('All history cleared successfully')
  }

  // Handle export
  const handleExport = async (format: ExportFormat, options: ExportOptions) => {
    // Convert history to TimerSession format
    const sessions: TimerSession[] = allHistory.map((record) => ({
      id: record.id,
      mode: record.mode,
      duration: record.duration,
      timestamp: record.timestamp,
      sessionName: record.sessionName,
      targetDuration: record.targetDuration,
      completed: record.completed,
    }))

    // Export based on format
    switch (format) {
      case 'csv':
        exportToCSV(sessions, options)
        break
      case 'json':
        exportToJSON(sessions, options)
        break
      case 'pdf':
        await exportToPDF(sessions, options)
        break
    }
  }

  return (
    <>
      {/* Live Region for Screen Reader Announcements */}
      <LiveRegionAnnouncer message={liveMessage} />

      <PremiumHistoryLayout title="Timer History" onSettingsOpen={() => setIsSidebarOpen(true)}>
        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key="sessions-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
          >
            {/* Achievement Progress Widget */}
            <div className="mb-4 px-4">
              <AchievementProgressWidget />
            </div>

            {/* Filter Bar */}
            <FilterBar
              activeMode={filterMode}
              onModeChange={setFilterMode}
              startDate={dateRangeStart}
              endDate={dateRangeEnd}
              onDateRangeChange={handleDateRangeChange}
              minDuration={minDuration}
              maxDuration={maxDuration}
              onDurationChange={handleDurationChange}
              hasActiveFilters={hasActiveFilters}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              completionFilter={completionFilter}
              onCompletionFilterChange={setCompletionFilter}
              filterVisibility={filterVisibility}
            />

            {/* Clear All Filters Button */}
            {activeFilterCount > 0 && (
              <div className="mt-3 px-4">
                <ClearFiltersButton
                  activeFilterCount={activeFilterCount}
                  onClearAll={handleClearAllFilters}
                />
              </div>
            )}

            {/* Sessions List */}
            <AnimatePresence mode="wait">
              <motion.div
                key={filterMode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                  duration: 0.3,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
                className="z-10 mt-6 space-y-8 px-4"
              >
                {allHistory.length === 0 ? (
                  <EmptyState filterMode={filterMode} />
                ) : (
                  Object.entries(groupedSessions).map(([groupName, sessions]) => (
                    <SessionGroup
                      key={groupName}
                      groupName={groupName}
                      sessionCount={sessions.length}
                    >
                      {sessions.map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          formatTime={formatTime}
                          onDetailsClick={() => handleDetailsClick(session)}
                          onRepeatClick={() => handleRepeatClick(session)}
                          onResumeClick={() => handleResumeClick(session)}
                        />
                      ))}
                    </SessionGroup>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Settings Sidebar */}
        <PremiumHistorySettingsSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onExportClick={() => setIsExportModalOpen(true)}
          onArchiveClick={() => setIsArchiveModalOpen(true)}
          onNotificationsClick={() => setIsNotificationsModalOpen(true)}
          onFilterSettingsClick={() => setIsFilterSettingsModalOpen(true)}
          onClearHistoryClick={() => setIsClearHistoryModalOpen(true)}
          onTemplatesClick={() => setIsTemplatesModalOpen(true)}
          onCustomTagsClick={() => setIsCustomTagsModalOpen(true)}
          onCalendarViewClick={() => setIsCalendarViewModalOpen(true)}
          onCompareSessionsClick={() => setIsCompareSessionsModalOpen(true)}
          onSmartReportsClick={() => setIsSmartReportsModalOpen(true)}
          onTeamSharingClick={() => setIsTeamSharingModalOpen(true)}
          onCloudSyncClick={() => setIsCloudSyncModalOpen(true)}
        />

        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExport}
        />

        {/* Archive Modal */}
        <ArchiveModal isOpen={isArchiveModalOpen} onClose={() => setIsArchiveModalOpen(false)} />

        {/* Notifications Settings Modal */}
        <NotificationSettingsModal
          isOpen={isNotificationsModalOpen}
          onClose={() => setIsNotificationsModalOpen(false)}
        />

        {/* Filter Settings Modal */}
        <FilterSettingsModal
          isOpen={isFilterSettingsModalOpen}
          onClose={() => setIsFilterSettingsModalOpen(false)}
          filterVisibility={filterVisibility}
          onVisibilityChange={setFilterVisibility}
        />

        {/* Session Details Modal */}
        <SessionDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          session={selectedSession}
          formatTime={formatTime}
        />

        {/* Clear History Confirmation Modal */}
        <ClearHistoryModal
          isOpen={isClearHistoryModalOpen}
          onClose={() => setIsClearHistoryModalOpen(false)}
          onConfirm={handleClearHistory}
          sessionCount={allHistory.length}
        />

        {/* Session Templates Modal */}
        <SessionTemplatesModal
          isOpen={isTemplatesModalOpen}
          onClose={() => setIsTemplatesModalOpen(false)}
          onUseTemplate={(template) => {
            console.log('Using template:', template)
            // Navigate to timer with template settings
            navigate('/timer')
          }}
        />

        {/* Create Template Modal */}
        <CreateTemplateModal
          isOpen={isCreateTemplateModalOpen}
          onClose={() => setIsCreateTemplateModalOpen(false)}
        />

        {/* Custom Tags Modal */}
        <CustomTagsModal
          isOpen={isCustomTagsModalOpen}
          onClose={() => setIsCustomTagsModalOpen(false)}
        />

        {/* Calendar View Modal */}
        <CalendarViewModal
          isOpen={isCalendarViewModalOpen}
          onClose={() => setIsCalendarViewModalOpen(false)}
          sessions={allHistory}
        />

        {/* Compare Sessions Modal */}
        <CompareSessionsModal
          isOpen={isCompareSessionsModalOpen}
          onClose={() => setIsCompareSessionsModalOpen(false)}
          sessions={allHistory}
        />

        {/* Smart Reports Modal */}
        <SmartReportsModal
          isOpen={isSmartReportsModalOpen}
          onClose={() => setIsSmartReportsModalOpen(false)}
          sessions={allHistory}
        />

        {/* Team Sharing Modal */}
        <TeamSharingModal
          isOpen={isTeamSharingModalOpen}
          onClose={() => setIsTeamSharingModalOpen(false)}
          sessions={allHistory}
        />

        {/* Cloud Sync Modal */}
        <CloudSyncModal
          isOpen={isCloudSyncModalOpen}
          onClose={() => setIsCloudSyncModalOpen(false)}
          sessions={allHistory}
        />
      </PremiumHistoryLayout>
    </>
  )
}

/**
 * Premium History Page with Error Boundary
 * Wrapped to prevent crashes from propagating
 */
export function PremiumHistory() {
  return (
    <PremiumHistoryErrorBoundary featureName="Premium History">
      <PremiumHistoryContent />
    </PremiumHistoryErrorBoundary>
  )
}
