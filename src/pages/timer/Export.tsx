/**
 * Export Data Page
 * Export timer data in various formats
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExportModal } from '../../components/timer/sidebar/export'

export default function Export() {
  const navigate = useNavigate()
  const [isExportModalOpen, setIsExportModalOpen] = useState(true)

  const handleClose = () => {
    setIsExportModalOpen(false)
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <div className="flex items-center px-4 py-3 justify-between h-16">
          <button 
            onClick={() => navigate(-1)}
            className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors active:scale-95"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
            Export Data
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pb-28 w-full max-w-md mx-auto relative">
        {/* Background Glow Effect */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0" />
        
        {/* Export Modal */}
        <ExportModal isOpen={isExportModalOpen} onClose={handleClose} />
      </main>
    </div>
  )
}
