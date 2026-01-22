/**
 * Session Group Component
 * Groups sessions by date with header and count
 */

import React, { ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'

interface SessionGroupProps {
  groupName: string
  sessionCount: number
  children: ReactNode
}

export function SessionGroup({ groupName, sessionCount, children }: SessionGroupProps) {
  if (sessionCount === 0) return null

  return (
    <div>
      {/* Group Header */}
      <div className="flex items-center gap-3 mb-4 pl-1">
        <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-widest">
          {groupName}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent" />
        <span className="text-xs font-medium text-slate-400 dark:text-gray-500">
          {sessionCount} {sessionCount === 1 ? 'Session' : 'Sessions'}
        </span>
      </div>

      {/* Session Cards */}
      <AnimatePresence mode="popLayout">
        {children}
      </AnimatePresence>
    </div>
  )
}
