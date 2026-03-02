/**
 * UserCard — Reusable card for search results, suggestions, and friend requests.
 * Matches existing social card design with avatar, level, league tier, and action button.
 */

import { motion } from 'framer-motion'
import { getLeagueTierColor } from './constants'
import type { DiscoverableUser } from './types'

interface UserCardProps {
  user: DiscoverableUser
  onAdd: (userId: string) => void
  onDismiss?: (userId: string) => void
  showReason?: boolean
  index?: number
}

export function UserCard({ user, onAdd, onDismiss, showReason = false, index = 0 }: UserCardProps) {
  const tierColor = getLeagueTierColor(user.leagueTier)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] px-3.5 py-3"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          className="size-11 rounded-full object-cover ring-1 ring-white/10"
        />
        <div
          className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-[#0f1628]"
          style={{ backgroundColor: tierColor }}
          title={`${user.leagueTier} league`}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] text-slate-400">Lv.{user.level}</span>
          <span className="text-slate-600">·</span>
          <span
            className="text-[11px] font-medium capitalize"
            style={{ color: tierColor }}
          >
            {user.leagueTier}
          </span>
          {showReason && user.suggestionReason && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] text-slate-500">{user.suggestionReason}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {user.requestStatus === 'friend' ? (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium px-2.5 py-1.5 rounded-xl bg-emerald-400/10">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              group
            </span>
            Friends
          </span>
        ) : user.requestStatus === 'pending' ? (
          <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium px-2.5 py-1.5 rounded-xl bg-amber-400/10">
            <span className="material-symbols-outlined text-sm">schedule</span>
            Pending
          </span>
        ) : (
          <button
            onClick={() => onAdd(user.userId)}
            className="flex items-center gap-1 text-[11px] font-semibold text-primary px-2.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Add
          </button>
        )}

        {onDismiss && user.requestStatus === 'none' && (
          <button
            onClick={() => onDismiss(user.userId)}
            className="p-1 text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}
