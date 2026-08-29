// @ts-nocheck
/**
 * Export Panel Component
 * Placeholder for future export functionality (CSV, PDF, JSON)
 */

import React from 'react'

export function ExportPanel() {
  return (
    <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="text-center">
        <span className="material-symbols-outlined mb-4 block text-6xl text-white/20">
          file_download
        </span>
        <h3 className="mb-2 text-xl font-bold text-white">Export Data</h3>
        <p className="mb-6 max-w-sm text-white/50">
          Export your timer history to CSV, PDF, or JSON format.
        </p>
        <div className="flex justify-center gap-3">
          <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
            CSV
          </button>
          <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
            PDF
          </button>
          <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
            JSON
          </button>
        </div>
      </div>
    </div>
  )
}
