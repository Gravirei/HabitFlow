// @ts-nocheck
/**
 * Timeline Session Component
 * Individual session block in the timeline
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import type { TimelineSession } from './types'
import { getSessionColor, formatDuration } from './timelineUtils'

interface TimelineSessionProps {
  session: TimelineSession
  left: number
  width: number
  onClick?: (session: TimelineSession) => void
}

export function TimelineSessionBlock({ session, left, width, onClick }: TimelineSessionProps) {
  const [isHovered, setIsHovered] = useState(false)

  const color = getSessionColor(session.mode)
  const isSmall = width < 5 // Very short sessions

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onClick?.(session)}
      className={`
        absolute top-0 h-full cursor-pointer rounded transition-all
        ${color} hover:shadow-lg
        ${isSmall ? 'min-w-[4px]' : ''}
      `}
      style={{
        left: `${left}%`,
        width: `${width}%`,
      }}
    >
      {/* Session content - only show if wide enough */}
      {width > 8 && (
        <div className="flex h-full items-center justify-center truncate px-2 text-[10px] font-medium text-white">
          {session.sessionName || session.mode}
        </div>
      )}

      {/* Tooltip on hover */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2"
        >
          <div className="min-w-[200px] rounded-lg bg-slate-900 px-3 py-2 text-white shadow-xl dark:bg-slate-800">
            <div className="mb-1 text-xs font-bold">
              {session.sessionName || 'Untitled Session'}
            </div>
            <div className="space-y-0.5 text-[10px] text-slate-300">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">schedule</span>
                {session.startTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' - '}
                {session.endTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">timer</span>
                {formatDuration(session.duration)}
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">
                  {session.mode === 'Stopwatch'
                    ? 'timer'
                    : session.mode === 'Countdown'
                      ? 'hourglass_top'
                      : 'timelapse'}
                </span>
                {session.mode}
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute left-1/2 top-full -mt-px -translate-x-1/2">
              <div className="h-2 w-2 rotate-45 bg-slate-900 dark:bg-slate-800"></div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
