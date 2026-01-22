/**
 * Calendar View Modal
 * Monthly calendar overview of timer sessions
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateCalendarMonth, formatMonthYear, getDayAbbreviation } from './calendarUtils'
import type { CalendarDay } from './types'
import type { TimerSession } from '../types/session.types'

interface CalendarViewModalProps {
  isOpen: boolean
  onClose: () => void
  sessions: TimerSession[]
}

export function CalendarViewModal({ isOpen, onClose, sessions }: CalendarViewModalProps) {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)

  const calendarData = useMemo(() => {
    return generateCalendarMonth(currentYear, currentMonth, sessions)
  }, [currentYear, currentMonth, sessions])

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDay(null)
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDay(null)
  }

  const goToToday = () => {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    setSelectedDay(null)
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'Stopwatch': return 'bg-blue-500'
      case 'Countdown': return 'bg-purple-500'
      case 'Intervals': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getIntensityColor = (duration: number) => {
    if (duration === 0) return 'bg-slate-100 dark:bg-slate-800'
    if (duration < 900) return 'bg-green-200 dark:bg-green-900/30'
    if (duration < 1800) return 'bg-green-300 dark:bg-green-800/40'
    if (duration < 3600) return 'bg-green-400 dark:bg-green-700/50'
    return 'bg-green-500 dark:bg-green-600/60'
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
            className="fixed inset-x-4 top-[5%] z-50 mx-auto max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">calendar_month</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Calendar View</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Monthly overview</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {formatMonthYear(currentYear, currentMonth)}
                  </h3>
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Today
                  </button>
                </div>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <span className="material-symbols-oriented">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
              {/* Calendar Grid */}
              <div className="mb-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                    <div
                      key={dayIndex}
                      className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2"
                    >
                      {getDayAbbreviation(dayIndex)}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="space-y-2">
                  {calendarData.weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-2">
                      {week.map((day, dayIndex) => (
                        <motion.button
                          key={`${weekIndex}-${dayIndex}`}
                          onClick={() => day.sessions.length > 0 && setSelectedDay(day)}
                          whileHover={{ scale: day.sessions.length > 0 ? 1.05 : 1 }}
                          whileTap={{ scale: day.sessions.length > 0 ? 0.95 : 1 }}
                          className={`aspect-square rounded-xl p-2 transition-all ${
                            day.isCurrentMonth
                              ? getIntensityColor(day.totalDuration)
                              : 'bg-slate-50 dark:bg-slate-900/50 opacity-40'
                          } ${
                            day.isToday
                              ? 'ring-2 ring-blue-500'
                              : ''
                          } ${
                            selectedDay?.date.getTime() === day.date.getTime()
                              ? 'ring-2 ring-purple-500'
                              : ''
                          } ${
                            day.sessions.length > 0
                              ? 'cursor-pointer hover:shadow-lg'
                              : 'cursor-default'
                          }`}
                          disabled={day.sessions.length === 0}
                        >
                          <div className={`text-sm font-semibold mb-1 ${
                            day.isCurrentMonth
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-400 dark:text-slate-600'
                          }`}>
                            {day.dayNumber}
                          </div>
                          {day.sessions.length > 0 && (
                            <div className="text-[10px] font-medium text-slate-700 dark:text-slate-300">
                              {day.sessions.length} {day.sessions.length === 1 ? 'session' : 'sessions'}
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Duration Legend</h4>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">No activity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-green-200 dark:bg-green-900/30"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">&lt; 15 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-green-300 dark:bg-green-800/40"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">15-30 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-green-400 dark:bg-green-700/50"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">30-60 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-green-500 dark:bg-green-600/60"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">&gt; 60 min</span>
                  </div>
                </div>
              </div>

              {/* Selected Day Details */}
              {selectedDay && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {selectedDay.date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </h4>
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Total: {formatTime(selectedDay.totalDuration)} • {selectedDay.sessions.length} session{selectedDay.sessions.length !== 1 ? 's' : ''}
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedDay.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-lg"
                      >
                        <div className={`w-8 h-8 rounded-lg ${getModeColor(session.mode)} flex items-center justify-center shrink-0`}>
                          <span className="material-symbols-outlined text-white text-sm">timer</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {session.sessionName || session.mode}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            {formatTime(session.duration)} • {new Date(session.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
