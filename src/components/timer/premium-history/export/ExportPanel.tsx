/**
 * Export Panel Component
 * Placeholder for future export functionality (CSV, PDF, JSON)
 */

import React from 'react'

export function ExportPanel() {
  return (
    <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <span className="material-symbols-outlined text-6xl text-white/20 mb-4 block">file_download</span>
        <h3 className="text-xl font-bold text-white mb-2">Export Data</h3>
        <p className="text-white/50 max-w-sm mb-6">
          Export your timer history to CSV, PDF, or JSON format.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium">
            CSV
          </button>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium">
            PDF
          </button>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium">
            JSON
          </button>
        </div>
      </div>
    </div>
  )
}
