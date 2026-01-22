/**
 * Virtualized Session List Component
 * Uses react-window for performance with large session lists
 */

import React, { useMemo } from 'react'
import * as ReactWindow from 'react-window'
import { SessionCard } from '../cards/SessionCard'
import type { TimerSession } from '../types/session.types'

const { FixedSizeList } = ReactWindow

interface VirtualizedSessionListProps {
  sessions: TimerSession[]
  formatTime: (seconds: number) => string
  onDetailsClick?: (session: TimerSession) => void
  onRepeatClick?: (session: TimerSession) => void
  onResumeClick?: (session: TimerSession) => void
  itemHeight?: number
  height?: number
}

/**
 * Virtualized list for rendering large numbers of sessions efficiently
 * Only renders visible items + buffer for smooth scrolling
 */
export function VirtualizedSessionList({
  sessions,
  formatTime,
  onDetailsClick,
  onRepeatClick,
  onResumeClick,
  itemHeight = 200, // Approximate height of a session card
  height = 600 // Default viewport height
}: VirtualizedSessionListProps) {
  // Memoize the row renderer to prevent unnecessary re-renders
  const Row = useMemo(() => {
    return ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const session = sessions[index]
      
      return (
        <div style={style} className="px-4">
          <SessionCard
            session={session}
            formatTime={formatTime}
            onDetailsClick={onDetailsClick ? () => onDetailsClick(session) : undefined}
            onRepeatClick={onRepeatClick ? () => onRepeatClick(session) : undefined}
            onResumeClick={onResumeClick ? () => onResumeClick(session) : undefined}
          />
        </div>
      )
    }
  }, [sessions, formatTime, onDetailsClick, onRepeatClick, onResumeClick])

  // If list is small (< 20 items), don't use virtualization
  if (sessions.length < 20) {
    return (
      <div className="space-y-4 px-4">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            formatTime={formatTime}
            onDetailsClick={onDetailsClick ? () => onDetailsClick(session) : undefined}
            onRepeatClick={onRepeatClick ? () => onRepeatClick(session) : undefined}
            onResumeClick={onResumeClick ? () => onResumeClick(session) : undefined}
          />
        ))}
      </div>
    )
  }

  // Use virtualization for large lists
  return (
    <FixedSizeList
      height={height}
      itemCount={sessions.length}
      itemSize={itemHeight}
      width="100%"
      className="scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
    >
      {Row}
    </FixedSizeList>
  )
}
