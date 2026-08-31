/**
 * Upgrade Modal Component
 * Prompts free users to upgrade to premium (placeholder for future)
 */

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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-3xl border border-white/20 bg-gradient-to-br from-primary/20 to-blue-500/20 p-6 shadow-2xl backdrop-blur-xl"
          >
            {/* Premium Badge */}
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black">
                Premium Feature
              </div>
            </div>

            {/* Content */}
            <div className="mb-6 text-center">
              <h3 className="mb-3 text-2xl font-bold text-white">Unlock Premium History</h3>
              <p className="text-white/70">
                Get access to advanced analytics, export options, achievements, and more!
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={onUpgrade}
                className="w-full rounded-xl bg-primary py-3 font-bold text-black transition-colors hover:bg-primary/90"
              >
                Upgrade Now
              </button>
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-white/10 py-3 font-bold text-white transition-colors hover:bg-white/20"
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
