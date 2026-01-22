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
        absolute top-0 h-full rounded cursor-pointer transition-all
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
        <div className="h-full flex items-center justify-center px-2 text-white text-[10px] font-medium truncate">
          {session.sessionName || session.mode}
        </div>
      )}

      {/* Tooltip on hover */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none"
        >
          <div className="bg-slate-900 dark:bg-slate-800 text-white px-3 py-2 rounded-lg shadow-xl min-w-[200px]">
            <div className="text-xs font-bold mb-1">
              {session.sessionName || 'Untitled Session'}
            </div>
            <div className="text-[10px] text-slate-300 space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">schedule</span>
                {session.startTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                {' - '}
                {session.endTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">timer</span>
                {formatDuration(session.duration)}
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">
                  {session.mode === 'Stopwatch' ? 'timer' : 
                   session.mode === 'Countdown' ? 'hourglass_top' : 'timelapse'}
                </span>
                {session.mode}
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45"></div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
