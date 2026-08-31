/**
 * Export Data Page
 * Export timer data in various formats
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExportModal } from '@/features/timer/components/sidebar/export'

export default function Export() {
  const navigate = useNavigate()
  const [isExportModalOpen, setIsExportModalOpen] = useState(true)

  const handleClose = () => {
    setIsExportModalOpen(false)
    navigate(-1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background-light text-slate-900 dark:bg-background-dark dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-background-light/90 backdrop-blur-xl dark:border-white/5 dark:bg-background-dark/90">
        <div className="flex h-16 items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 active:scale-95 dark:hover:bg-white/10"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-slate-900 dark:text-white">
              arrow_back
            </span>
          </button>
          <h2 className="flex-1 pr-10 text-center text-lg font-bold leading-tight tracking-tight">
            Export Data
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col pb-28">
        {/* Background Glow Effect */}
        <div className="pointer-events-none fixed left-1/2 top-20 z-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

        {/* Export Modal */}
        <ExportModal isOpen={isExportModalOpen} onClose={handleClose} />
      </main>
    </div>
  )
}
