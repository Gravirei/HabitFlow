/**
 * Custom Tags Modal
 * Manage custom tags for session organization
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTagStore } from '@/features/timer/store/tagStore'
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
    'label',
    'bookmark',
    'star',
    'favorite',
    'flag',
    'work',
    'home',
    'school',
    'fitness_center',
    'restaurant',
    'shopping_cart',
    'book',
    'code',
    'palette',
    'music_note',
    'sports_esports',
    'travel_explore',
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
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-h-[80vh] max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500">
                    <span className="material-symbols-outlined text-xl text-white">label</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Custom Tags
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Organize with labels
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
            </div>

            {/* Content */}
            <div className="max-h-[calc(80vh-180px)] overflow-y-auto p-6">
              {/* Create/Edit Form */}
              {isCreating && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={editingTag ? handleUpdateTag : handleCreateTag}
                  className="mb-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50"
                >
                  <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
                    {editingTag ? 'Edit Tag' : 'Create New Tag'}
                  </h3>

                  {/* Tag Name */}
                  <div className="mb-3">
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Tag Name
                    </label>
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="e.g., Work, Study, Exercise"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      autoFocus
                    />
                  </div>

                  {/* Color Selection */}
                  <div className="mb-3">
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Color
                    </label>
                    <div className="grid grid-cols-9 gap-2">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setNewTagColor(color.value)}
                          className={`h-8 w-8 rounded-full ${color.value} transition-transform ${
                            newTagColor === color.value
                              ? 'scale-125 ring-2 ring-slate-400 ring-offset-2'
                              : ''
                          }`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Icon Selection */}
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Icon
                    </label>
                    <div className="grid grid-cols-9 gap-2">
                      {commonIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setNewTagIcon(icon)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                            newTagIcon === icon
                              ? 'bg-pink-500 text-white'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">{icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Preview
                    </label>
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${newTagColor} text-sm font-medium text-white`}
                    >
                      <span className="material-symbols-outlined text-sm">{newTagIcon}</span>
                      {newTagName || 'Tag Name'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="flex-1 rounded-xl bg-slate-200 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newTagName.trim()}
                      className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 py-2 font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {editingTag ? 'Update' : 'Create'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Tags List */}
              {tags.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <span className="material-symbols-outlined text-3xl text-slate-400">label</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                    No Tags Yet
                  </h3>
                  <p className="mb-6 text-slate-600 dark:text-slate-400">
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
                        className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-xl ${tag.color} flex items-center justify-center`}
                          >
                            <span className="material-symbols-outlined text-lg text-white">
                              {tag.icon || 'label'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {tag.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              Used in {sessionCount} session{sessionCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditing(tag)}
                            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-white dark:text-slate-400 dark:hover:bg-slate-700"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => deleteTag(tag.id)}
                            className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
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
              <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 py-3 font-medium text-white transition-all hover:shadow-lg"
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
