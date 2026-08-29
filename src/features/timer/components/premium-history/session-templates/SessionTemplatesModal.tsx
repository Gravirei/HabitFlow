// @ts-nocheck
/**
 * Session Templates Modal
 * Browse, create, and manage session templates
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTemplateStore } from '@/features/timer/store/templateStore'
import { CreateTemplateModal } from './CreateTemplateModal'
import type { SessionTemplate } from './types'

interface SessionTemplatesModalProps {
  isOpen: boolean
  onClose: () => void
  onUseTemplate?: (template: SessionTemplate) => void
}

export function SessionTemplatesModal({
  isOpen,
  onClose,
  onUseTemplate,
}: SessionTemplatesModalProps) {
  const { templates, deleteTemplate, toggleFavorite, getFavorites, getRecentlyUsed } =
    useTemplateStore()
  const [view, setView] = useState<'all' | 'favorites' | 'recent'>('all')
  const [isCreating, setIsCreating] = useState(false)

  const displayTemplates =
    view === 'favorites' ? getFavorites() : view === 'recent' ? getRecentlyUsed() : templates

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'Stopwatch':
        return 'timer'
      case 'Countdown':
        return 'hourglass_empty'
      case 'Intervals':
        return 'repeat'
      default:
        return 'schedule'
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'Stopwatch':
        return 'bg-blue-500'
      case 'Countdown':
        return 'bg-purple-500'
      case 'Intervals':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleUseTemplate = (template: SessionTemplate) => {
    onUseTemplate?.(template)
    onClose()
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
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-h-[80vh] max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500">
                    <span className="material-symbols-outlined text-xl text-white">
                      workspace_premium
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Session Templates
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Pre-configured timer setups
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* View Tabs */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setView('all')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    view === 'all'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  All ({templates.length})
                </button>
                <button
                  onClick={() => setView('favorites')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    view === 'favorites'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  Favorites ({getFavorites().length})
                </button>
                <button
                  onClick={() => setView('recent')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    view === 'recent'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  Recent
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[calc(80vh-180px)] overflow-y-auto p-6">
              {displayTemplates.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <span className="material-symbols-outlined text-3xl text-slate-400">
                      workspace_premium
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                    No Templates Yet
                  </h3>
                  <p className="mb-6 text-slate-600 dark:text-slate-400">
                    Create your first template to save timer configurations
                  </p>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
                  >
                    Create Template
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {displayTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-1 gap-3">
                          <div
                            className={`h-12 w-12 rounded-xl ${getModeColor(template.mode)} flex shrink-0 items-center justify-center`}
                          >
                            <span className="material-symbols-outlined text-xl text-white">
                              {getModeIcon(template.mode)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate font-semibold text-slate-900 dark:text-white">
                                {template.name}
                              </h3>
                              {template.isFavorite && (
                                <span className="material-symbols-outlined text-sm text-amber-500">
                                  star
                                </span>
                              )}
                            </div>
                            {template.description && (
                              <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                                {template.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-3">
                              <span className="text-xs text-slate-500 dark:text-slate-500">
                                {template.mode}
                              </span>
                              {template.countdownDuration && (
                                <span className="text-xs text-slate-500 dark:text-slate-500">
                                  {formatDuration(template.countdownDuration)}
                                </span>
                              )}
                              {template.workDuration && (
                                <span className="text-xs text-slate-500 dark:text-slate-500">
                                  {formatDuration(template.workDuration)} /{' '}
                                  {formatDuration(template.breakDuration || 0)}
                                </span>
                              )}
                              {template.useCount > 0 && (
                                <span className="text-xs text-slate-500 dark:text-slate-500">
                                  Used {template.useCount}x
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 flex items-center gap-1">
                          <button
                            onClick={() => toggleFavorite(template.id)}
                            className="rounded-lg p-2 transition-colors hover:bg-white dark:hover:bg-slate-700"
                          >
                            <span
                              className={`material-symbols-outlined text-lg ${
                                template.isFavorite ? 'text-amber-500' : 'text-slate-400'
                              }`}
                            >
                              {template.isFavorite ? 'star' : 'star_border'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleUseTemplate(template)}
                            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg"
                          >
                            Use
                          </button>
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {displayTemplates.length > 0 && (
              <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-medium text-white transition-all hover:shadow-lg"
                >
                  <span className="material-symbols-outlined">add</span>
                  Create New Template
                </button>
              </div>
            )}
          </motion.div>

          {/* Create Template Modal */}
          <CreateTemplateModal isOpen={isCreating} onClose={() => setIsCreating(false)} />
        </>
      )}
    </AnimatePresence>
  )
}
