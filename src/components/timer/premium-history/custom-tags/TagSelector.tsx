/**
 * Tag Selector Component
 * Quick tag selection for sessions
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTagStore } from './tagStore'

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
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-800">
      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tags..."
          className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
        />
      </div>

      {/* Tags List */}
      <div className="max-h-60 overflow-y-auto space-y-1">
        {filteredTags.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-500 text-center py-4">
            No tags found
          </p>
        ) : (
          filteredTags.map((tag) => {
            const isSelected = sessionTagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                onClick={() => handleToggleTag(tag.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={`w-6 h-6 rounded-md ${tag.color} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-white text-xs">
                    {tag.icon || 'label'}
                  </span>
                </div>
                <span className="flex-1 text-left text-sm font-medium text-slate-900 dark:text-white">
                  {tag.name}
                </span>
                {isSelected && (
                  <span className="material-symbols-outlined text-pink-500 text-lg">check</span>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Footer */}
      {onClose && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}
