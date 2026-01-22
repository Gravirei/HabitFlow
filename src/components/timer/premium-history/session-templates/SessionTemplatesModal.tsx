/**
 * Session Templates Modal
 * Browse, create, and manage session templates
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTemplateStore } from './templateStore'
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
  const { templates, deleteTemplate, toggleFavorite, getFavorites, getRecentlyUsed } = useTemplateStore()
  const [view, setView] = useState<'all' | 'favorites' | 'recent'>('all')
  const [isCreating, setIsCreating] = useState(false)

  const displayTemplates = 
    view === 'favorites' ? getFavorites() :
    view === 'recent' ? getRecentlyUsed() :
    templates

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'Stopwatch': return 'timer'
      case 'Countdown': return 'hourglass_empty'
      case 'Intervals': return 'repeat'
      default: return 'schedule'
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'Stopwatch': return 'bg-blue-500'
      case 'Countdown': return 'bg-purple-500'
      case 'Intervals': return 'bg-orange-500'
      default: return 'bg-gray-500'
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
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-2xl max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">workspace_premium</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Session Templates</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Pre-configured timer setups</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* View Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setView('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    view === 'all'
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  All ({templates.length})
                </button>
                <button
                  onClick={() => setView('favorites')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    view === 'favorites'
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Favorites ({getFavorites().length})
                </button>
                <button
                  onClick={() => setView('recent')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    view === 'recent'
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Recent
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-6">
              {displayTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-3xl">workspace_premium</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Templates Yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Create your first template to save timer configurations
                  </p>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
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
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3 flex-1">
                          <div className={`w-12 h-12 rounded-xl ${getModeColor(template.mode)} flex items-center justify-center shrink-0`}>
                            <span className="material-symbols-outlined text-white text-xl">
                              {getModeIcon(template.mode)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                {template.name}
                              </h3>
                              {template.isFavorite && (
                                <span className="material-symbols-outlined text-amber-500 text-sm">star</span>
                              )}
                            </div>
                            {template.description && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                {template.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
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
                                  {formatDuration(template.workDuration)} / {formatDuration(template.breakDuration || 0)}
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
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => toggleFavorite(template.id)}
                            className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                          >
                            <span className={`material-symbols-outlined text-lg ${
                              template.isFavorite ? 'text-amber-500' : 'text-slate-400'
                            }`}>
                              {template.isFavorite ? 'star' : 'star_border'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleUseTemplate(template)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                          >
                            Use
                          </button>
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
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
              <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-4">
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">add</span>
                  Create New Template
                </button>
              </div>
            )}
          </motion.div>

          {/* Create Template Modal */}
          <CreateTemplateModal
            isOpen={isCreating}
            onClose={() => setIsCreating(false)}
          />
        </>
      )}
    </AnimatePresence>
  )
}
