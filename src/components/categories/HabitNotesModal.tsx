import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useHabitStore } from '@/store/useHabitStore'
import type { Habit, HabitNote } from '@/types/habit'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { ConfirmDialog } from '@/components/timer/settings/ConfirmDialog'

interface HabitNotesModalProps {
  isOpen: boolean
  onClose: () => void
  habitId: string
  habitName: string
}

export function HabitNotesModal({ isOpen, onClose, habitId, habitName }: HabitNotesModalProps) {
  const { habits, addNote, deleteNote } = useHabitStore()
  const [newNoteText, setNewNoteText] = useState('')
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

  const habit = habits.find((h) => h.id === habitId)
  const notes = habit?.notes || []

  const handleAddNote = () => {
    const trimmedText = newNoteText.trim()
    if (!trimmedText) {
      toast.error('Please enter a note')
      return
    }

    if (trimmedText.length > 200) {
      toast.error('Note is too long (max 200 characters)')
      return
    }

    addNote(habitId, trimmedText)
    setNewNoteText('')
    toast.success('Note added!')
  }

  const handleDeleteNote = () => {
    if (noteToDelete) {
      deleteNote(habitId, noteToDelete)
      setNoteToDelete(null)
      toast.success('Note deleted!')
    }
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                  <span className="material-symbols-outlined text-xl text-white">note</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notes</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{habitName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Add Note Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Add New Note
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleAddNote()
                      }
                    }}
                    placeholder="Enter a short note..."
                    maxLength={200}
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {newNoteText.length}/200 characters
                </p>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  All Notes ({notes.length})
                </h3>

                {notes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                      <span className="material-symbols-outlined text-4xl text-slate-400">
                        note_stack
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                      No notes yet. Add your first note above!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onDelete={() => setNoteToDelete(note.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
              isOpen={!!noteToDelete}
              onClose={() => setNoteToDelete(null)}
              onConfirm={handleDeleteNote}
              title="Delete Note?"
              message="Are you sure you want to delete this note? This action cannot be undone."
              confirmText="Delete"
              cancelText="Cancel"
              variant="danger"
              icon="delete"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Note Card Component
interface NoteCardProps {
  note: HabitNote
  onDelete: () => void
}

function NoteCard({ note, onDelete }: NoteCardProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
    >
      {/* Note Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/10">
        <span className="material-symbols-outlined text-base text-amber-600 dark:text-amber-400">
          sticky_note_2
        </span>
      </div>

      {/* Note Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 dark:text-slate-300 break-words">{note.text}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(note.createdAt)}</p>
      </div>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
      >
        <span className="material-symbols-outlined text-lg">delete</span>
      </button>
    </motion.div>
  )
}
