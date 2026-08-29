/**
 * ConfirmDialog Component
 * Modern confirmation dialog with consistent styling
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: string
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon = 'help',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: 'text-red-400',
          iconBg: 'bg-red-500/20',
          confirmBtn:
            'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white',
        }
      case 'warning':
        return {
          iconColor: 'text-amber-400',
          iconBg: 'bg-amber-500/20',
          confirmBtn:
            'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black',
        }
      default:
        return {
          iconColor: 'text-blue-400',
          iconBg: 'bg-blue-500/20',
          confirmBtn:
            'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white',
        }
    }
  }

  const styles = getVariantStyles()

  const handleConfirm = () => {
    onConfirm()
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
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 via-black to-gray-900 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative gradient orbs */}
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-red-500/10 to-pink-500/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 blur-3xl" />

              {/* Content */}
              <div className="relative p-6">
                {/* Icon */}
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles.iconBg} backdrop-blur-sm`}
                  >
                    <span className={`material-symbols-outlined text-2xl ${styles.iconColor}`}>
                      {icon}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
                    <p className="text-sm leading-relaxed text-gray-400">{message}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="rounded-xl bg-white/5 px-4 py-2 font-semibold text-gray-300 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={`rounded-xl px-6 py-2 text-sm font-bold shadow-lg transition-all duration-200 active:scale-95 ${styles.confirmBtn}`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

ConfirmDialog.displayName = 'ConfirmDialog'
