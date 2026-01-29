/**
 * LogoutConfirmDialog Component
 * Enhanced logout confirmation dialog with additional options
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LogoutConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (options: LogoutOptions) => Promise<void>
}

export interface LogoutOptions {
  logoutAllDevices: boolean
  clearLocalData: boolean
}

export const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [logoutAllDevices, setLogoutAllDevices] = useState(false)
  const [clearLocalData, setClearLocalData] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleConfirm = async () => {
    setIsLoggingOut(true)
    try {
      await onConfirm({
        logoutAllDevices,
        clearLocalData,
      })
    } catch (error) {
      // Error handling is done in the parent component
      setIsLoggingOut(false)
    }
  }

  const handleClose = () => {
    if (!isLoggingOut) {
      // Reset state when closing
      setLogoutAllDevices(false)
      setClearLocalData(false)
      onClose()
    }
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
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[120]"
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative gradient orbs */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />

              {/* Content */}
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/20 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-2xl text-red-400">
                      logout
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">Log Out</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Are you sure you want to log out? You'll need to sign in again to access your account.
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {/* Log out from all devices */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={logoutAllDevices}
                        onChange={(e) => setLogoutAllDevices(e.target.checked)}
                        disabled={isLoggingOut}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 rounded-md border-2 border-gray-500 peer-checked:border-red-400 peer-checked:bg-red-500/20 transition-all flex items-center justify-center">
                        {logoutAllDevices && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="material-symbols-outlined text-red-400 text-sm"
                          >
                            check
                          </motion.span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-gray-400 group-hover:text-gray-300">
                          devices
                        </span>
                        <span className="text-sm font-medium text-white">
                          Log out from all devices
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 ml-7">
                        Ends all active sessions on other devices
                      </p>
                    </div>
                  </label>

                  {/* Clear local data */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={clearLocalData}
                        onChange={(e) => setClearLocalData(e.target.checked)}
                        disabled={isLoggingOut}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 rounded-md border-2 border-gray-500 peer-checked:border-amber-400 peer-checked:bg-amber-500/20 transition-all flex items-center justify-center">
                        {clearLocalData && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="material-symbols-outlined text-amber-400 text-sm"
                          >
                            check
                          </motion.span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-gray-400 group-hover:text-gray-300">
                          delete_sweep
                        </span>
                        <span className="text-sm font-medium text-white">
                          Clear local data
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 ml-7">
                        Remove cached data and preferences from this browser
                      </p>
                    </div>
                  </label>
                </div>

                {/* Info message when options are selected */}
                <AnimatePresence>
                  {(logoutAllDevices || clearLocalData) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="material-symbols-outlined text-amber-400 text-lg mt-0.5">
                          info
                        </span>
                        <p className="text-xs text-amber-200/80">
                          {logoutAllDevices && clearLocalData
                            ? 'This will end all sessions and remove local data. You will need to sign in again on all devices.'
                            : logoutAllDevices
                              ? 'This will end all active sessions. You will need to sign in again on all devices.'
                              : 'Your preferences and cached data will be removed from this browser.'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={handleClose}
                    disabled={isLoggingOut}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isLoggingOut}
                    className="px-6 py-2 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 shadow-lg bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
                  >
                    {isLoggingOut ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="material-symbols-outlined text-lg"
                        >
                          progress_activity
                        </motion.span>
                        <span>Logging out...</span>
                      </>
                    ) : (
                      'Log Out'
                    )}
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

LogoutConfirmDialog.displayName = 'LogoutConfirmDialog'
