/**
 * Premium History Header Component
 * Sticky header with back button and title
 */

import { useNavigate } from 'react-router-dom'

interface PremiumHistoryHeaderProps {
  title?: string
  onSettingsOpen?: () => void
}

export function PremiumHistoryHeader({
  title = 'Timer History',
  onSettingsOpen,
}: PremiumHistoryHeaderProps) {
  const navigate = useNavigate()

  return (
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
        <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-tight">
          {title}
        </h2>
        {onSettingsOpen && (
          <button
            onClick={onSettingsOpen}
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 active:scale-95 dark:hover:bg-white/10"
            aria-label="View settings"
            title="View settings"
          >
            <span className="material-symbols-outlined text-slate-900 dark:text-white">
              settings
            </span>
          </button>
        )}
      </div>
    </header>
  )
}
