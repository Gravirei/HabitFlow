/**
 * Virtualized Session List Component
 * Uses react-window v2 for performance with large session lists
 */

import { useMemo } from 'react'
import { List, type RowComponentProps } from 'react-window'
import { SessionCard } from '../cards/SessionCard'
import type { TimerSession } from '../types/session.types'

interface VirtualizedSessionListProps {
  sessions: TimerSession[]
  formatTime: (seconds: number) => string
  onDetailsClick?: (session: TimerSession) => void
  onRepeatClick?: (session: TimerSession) => void
  onResumeClick?: (session: TimerSession) => void
  itemHeight?: number
  height?: number
}

interface RowProps {
  sessions: TimerSession[]
  formatTime: (seconds: number) => string
  onDetailsClick?: (session: TimerSession) => void
  onRepeatClick?: (session: TimerSession) => void
  onResumeClick?: (session: TimerSession) => void
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
  height = 600, // Default viewport height
}: VirtualizedSessionListProps) {
  const rowProps = useMemo<RowProps>(
    () => ({ sessions, formatTime, onDetailsClick, onRepeatClick, onResumeClick }),
    [sessions, formatTime, onDetailsClick, onRepeatClick, onResumeClick]
  )

  function Row({ index, style, sessions: rs, formatTime: ft, onDetailsClick: odc, onRepeatClick: orc, onResumeClick: orsc }: RowComponentProps<RowProps>) {
    const session = rs[index]
    return (
      <div style={style} className="px-4">
        <SessionCard
          session={session}
          formatTime={ft}
          onDetailsClick={odc ? () => odc(session) : undefined}
          onRepeatClick={orc ? () => orc(session) : undefined}
          onResumeClick={orsc ? () => orsc(session) : undefined}
        />
      </div>
    )
  }

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

  // Use virtualization for large lists (react-window v2 API)
  return (
    <List
      style={{ height }}
      rowCount={sessions.length}
      rowHeight={itemHeight}
      rowComponent={Row}
      rowProps={rowProps}
      className="scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
    />
  )
}
