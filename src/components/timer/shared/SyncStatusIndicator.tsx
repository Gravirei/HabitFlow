/**
 * SyncStatusIndicator Component
 * 
 * Shows the current sync status for timer history
 * - Cloud icon when synced
 * - Syncing animation when syncing
 * - Offline indicator with pending count
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SyncStatus } from '@/lib/storage'

interface SyncStatusIndicatorProps {
  syncStatus: SyncStatus
  isLoggedIn: boolean
  compact?: boolean
  className?: string
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  syncStatus,
  isLoggedIn,
  compact = false,
  className = '',
}) => {
  // Don't show anything for non-logged-in users
  if (!isLoggedIn) {
    return compact ? null : (
      <div className={`flex items-center gap-1.5 text-xs text-gray-400 ${className}`}>
        <span className="material-symbols-outlined text-sm">smartphone</span>
        <span>Local only</span>
      </div>
    )
  }

  const { isSyncing, pendingChanges, lastSyncTime } = syncStatus

  // Format last sync time
  const formatLastSync = (timestamp: number | null): string => {
    if (!timestamp) return 'Never'
    const diff = Date.now() - timestamp
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  if (isSyncing) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-blue-400 ${className}`}>
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="material-symbols-outlined text-sm"
        >
          sync
        </motion.span>
        {!compact && <span>Syncing...</span>}
      </div>
    )
  }

  if (pendingChanges > 0) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-amber-400 ${className}`}>
        <span className="material-symbols-outlined text-sm">cloud_off</span>
        {!compact && (
          <span>
            {pendingChanges} pending
          </span>
        )}
        {compact && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
            {pendingChanges > 9 ? '9+' : pendingChanges}
          </span>
        )}
      </div>
    )
  }

  // All synced
  return (
    <div className={`flex items-center gap-1.5 text-xs text-green-400 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key="synced"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="material-symbols-outlined text-sm"
        >
          cloud_done
        </motion.span>
      </AnimatePresence>
      {!compact && <span>Synced {formatLastSync(lastSyncTime)}</span>}
    </div>
  )
}

SyncStatusIndicator.displayName = 'SyncStatusIndicator'
