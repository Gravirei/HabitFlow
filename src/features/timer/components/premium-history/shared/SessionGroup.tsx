/**
 * Session Group Component
 * Groups sessions by date with header and count
 */

import { ReactNode } from 'react'
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
      <div className="mb-4 flex items-center gap-3 pl-1">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">
          {groupName}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-white/10" />
        <span className="text-xs font-medium text-slate-400 dark:text-gray-500">
          {sessionCount} {sessionCount === 1 ? 'Session' : 'Sessions'}
        </span>
      </div>

      {/* Session Cards */}
      <AnimatePresence mode="popLayout">{children}</AnimatePresence>
    </div>
  )
}
