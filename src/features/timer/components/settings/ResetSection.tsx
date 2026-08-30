/**
 * ResetSection Component
 * Reset settings to defaults with confirmation
 */

import React, { useState } from 'react'
import { useTimerSettings } from '@/features/timer/hooks/useTimerSettings'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'

export const ResetSection: React.FC = () => {
  const { resetSettings } = useTimerSettings()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleResetClick = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmReset = () => {
    resetSettings()
    setShowConfirmDialog(false)
  }

  const handleCloseDialog = () => {
    setShowConfirmDialog(false)
  }

  return (
    <>
      <div className="mt-6 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-purple-500/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-1 text-sm font-bold text-white">Reset to Defaults</h3>
            <p className="text-xs text-gray-400">Restore all settings to their original values</p>
          </div>
          <button
            onClick={handleResetClick}
            className="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 font-semibold text-red-300 transition-all duration-200 hover:bg-red-500/30 hover:text-white active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Reset
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmReset}
        title="Reset All Settings?"
        message="This will restore all timer settings to their default values. This action cannot be undone. Are you sure you want to continue?"
        confirmText="Reset Settings"
        cancelText="Cancel"
        variant="danger"
        icon="warning"
      />
    </>
  )
}

ResetSection.displayName = 'ResetSection'
