// @ts-nocheck
/**
 * Tag Selector Component
 * Quick tag selection for sessions
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTagStore } from '@/features/timer/store/tagStore'

interface TagSelectorProps {
  sessionId: string
  onClose?: () => void
}

export function TagSelector({ sessionId, onClose }: TagSelectorProps) {
  const { tags, getSessionTags, addTagToSession, removeTagFromSession } = useTagStore()
  const sessionTagIds = getSessionTags(sessionId)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleTag = (tagId: string) => {
    if (sessionTagIds.includes(tagId)) {
      removeTagFromSession(sessionId, tagId)
    } else {
      addTagToSession(sessionId, tagId)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tags..."
          className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      {/* Tags List */}
      <div className="max-h-60 space-y-1 overflow-y-auto">
        {filteredTags.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-500">
            No tags found
          </p>
        ) : (
          filteredTags.map((tag) => {
            const isSelected = sessionTagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                onClick={() => handleToggleTag(tag.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-md ${tag.color} flex shrink-0 items-center justify-center`}
                >
                  <span className="material-symbols-outlined text-xs text-white">
                    {tag.icon || 'label'}
                  </span>
                </div>
                <span className="flex-1 text-left text-sm font-medium text-slate-900 dark:text-white">
                  {tag.name}
                </span>
                {isSelected && (
                  <span className="material-symbols-outlined text-lg text-pink-500">check</span>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Footer */}
      {onClose && (
        <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}
