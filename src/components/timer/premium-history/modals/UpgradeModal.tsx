/**
 * Upgrade Modal Component
 * Prompts free users to upgrade to premium (placeholder for future)
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade?: () => void
}

export function UpgradeModal({ isOpen, onClose, onUpgrade }: UpgradeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-gradient-to-br from-primary/20 to-blue-500/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl z-50 border border-white/20"
          >
            {/* Premium Badge */}
            <div className="flex justify-center mb-6">
              <div className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold uppercase tracking-wider rounded-full">
                Premium Feature
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-3">
                Unlock Premium History
              </h3>
              <p className="text-white/70">
                Get access to advanced analytics, export options, achievements, and more!
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={onUpgrade}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl transition-colors"
              >
                Upgrade Now
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
