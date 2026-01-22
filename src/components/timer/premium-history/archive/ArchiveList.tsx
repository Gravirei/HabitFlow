/**
 * Archive List Component
 * Display list of archived sessions
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import type { ArchivedSession } from './archiveStore'
import { SessionCard } from '../cards/SessionCard'

interface ArchiveListProps {
  sessions: ArchivedSession[]
  onRestore: (sessionId: string) => void
  onDelete: (sessionId: string) => void
  onSelect?: (sessionId: string, selected: boolean) => void
  selectedIds?: Set<string>
}

export function ArchiveList({
  sessions,
  onRestore,
  onDelete,
  onSelect,
  selectedIds = new Set(),
}: ArchiveListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sortedSessions = [...sessions].sort((a, b) => b.archivedAt - a.archivedAt)

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[64px] mb-4">
          inventory_2
        </span>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          No Archived Sessions
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Sessions you archive will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedSessions.map((session, index) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative"
        >
          {/* Selection Checkbox (if onSelect provided) */}
          {onSelect && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <input
                type="checkbox"
                checked={selectedIds.has(session.id)}
                onChange={(e) => onSelect(session.id, e.target.checked)}
                className="size-5 rounded border-2 border-slate-300 dark:border-slate-600"
              />
            </div>
          )}

          <div className={onSelect ? 'pl-8' : ''}>
            {/* Session Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100 transition-opacity">
              <div className="flex items-start justify-between gap-4">
                {/* Session Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">
                      {session.mode === 'Stopwatch' ? 'timer' : 
                       session.mode === 'Countdown' ? 'hourglass_top' : 'timelapse'}
                    </span>
                    <h3 className="font-semibold text-slate-800 dark:text-white truncate">
                      {session.sessionName || 'Untitled Session'}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span>{session.mode}</span>
                    <span>•</span>
                    <span>{new Date(session.timestamp).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{Math.floor(session.duration / (1000 * 60))} min</span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                    Archived {new Date(session.archivedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRestore(session.id)}
                    className="size-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center"
                    title="Restore session"
                  >
                    <span className="material-symbols-outlined text-[18px]">unarchive</span>
                  </button>
                  <button
                    onClick={() => onDelete(session.id)}
                    className="size-9 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center"
                    title="Delete permanently"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
