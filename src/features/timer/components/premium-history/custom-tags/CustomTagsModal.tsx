/**
 * Custom Tags Modal
 * Manage custom tags for session organization
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTagStore } from './tagStore'
import { TAG_COLORS } from './types'
import type { Tag } from './types'

interface CustomTagsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CustomTagsModal({ isOpen, onClose }: CustomTagsModalProps) {
  const { tags, addTag, updateTag, deleteTag, getSessionsByTag } = useTagStore()
  const [isCreating, setIsCreating] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value)
  const [newTagIcon, setNewTagIcon] = useState('label')

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    addTag({
      name: newTagName.trim(),
      color: newTagColor,
      icon: newTagIcon,
    })

    // Reset form
    setNewTagName('')
    setNewTagColor(TAG_COLORS[0].value)
    setNewTagIcon('label')
    setIsCreating(false)
  }

  const handleUpdateTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTag || !newTagName.trim()) return

    updateTag(editingTag.id, {
      name: newTagName.trim(),
      color: newTagColor,
      icon: newTagIcon,
    })

    // Reset form
    setEditingTag(null)
    setNewTagName('')
    setNewTagColor(TAG_COLORS[0].value)
    setNewTagIcon('label')
  }

  const startEditing = (tag: Tag) => {
    setEditingTag(tag)
    setNewTagName(tag.name)
    setNewTagColor(tag.color)
    setNewTagIcon(tag.icon || 'label')
    setIsCreating(true)
  }

  const cancelEditing = () => {
    setEditingTag(null)
    setNewTagName('')
    setNewTagColor(TAG_COLORS[0].value)
    setNewTagIcon('label')
    setIsCreating(false)
  }

  const commonIcons = [
    'label', 'bookmark', 'star', 'favorite', 'flag', 'work', 'home',
    'school', 'fitness_center', 'restaurant', 'shopping_cart', 'book',
    'code', 'palette', 'music_note', 'sports_esports', 'travel_explore'
  ]

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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">label</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Custom Tags</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Organize with labels</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-6">
              {/* Create/Edit Form */}
              {isCreating && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={editingTag ? handleUpdateTag : handleCreateTag}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-4"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                    {editingTag ? 'Edit Tag' : 'Create New Tag'}
                  </h3>
                  
                  {/* Tag Name */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Tag Name
                    </label>
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="e.g., Work, Study, Exercise"
                      className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      autoFocus
                    />
                  </div>

                  {/* Color Selection */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Color
                    </label>
                    <div className="grid grid-cols-9 gap-2">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setNewTagColor(color.value)}
                          className={`w-8 h-8 rounded-full ${color.value} transition-transform ${
                            newTagColor === color.value ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : ''
                          }`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Icon Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Icon
                    </label>
                    <div className="grid grid-cols-9 gap-2">
                      {commonIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setNewTagIcon(icon)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            newTagIcon === icon
                              ? 'bg-pink-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">{icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Preview
                    </label>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${newTagColor} text-white text-sm font-medium`}>
                      <span className="material-symbols-outlined text-sm">{newTagIcon}</span>
                      {newTagName || 'Tag Name'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newTagName.trim()}
                      className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingTag ? 'Update' : 'Create'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Tags List */}
              {tags.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-3xl">label</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Tags Yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Create your first tag to organize sessions
                  </p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {tags.map((tag) => {
                    const sessionCount = getSessionsByTag(tag.id).length
                    return (
                      <motion.div
                        key={tag.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${tag.color} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-white text-lg">
                              {tag.icon || 'label'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">{tag.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              Used in {sessionCount} session{sessionCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditing(tag)}
                            className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => deleteTag(tag.id)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {!isCreating && (
              <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-4">
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">add</span>
                  Create New Tag
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
