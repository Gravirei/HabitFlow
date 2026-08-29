// @ts-nocheck
/**
 * FriendRequestInbox — Collapsible section showing pending incoming friend requests.
 * Sits at the top of FriendsScreen.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from '../store/socialStore'
import { getLeagueTierColor } from '../constants'
import toast from 'react-hot-toast'

const toastStyle = {
  background: '#0f1628',
  color: '#fff',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.1)',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d === 1 ? 'Yesterday' : `${d}d ago`
}

export function FriendRequestInbox() {
  const [isExpanded, setIsExpanded] = useState(true)
  const { getIncomingRequests, acceptFriendRequest, declineFriendRequest } = useSocialStore()

  const requests = getIncomingRequests()

  if (requests.length === 0) return null

  const handleAccept = (requestId: string, displayName: string) => {
    acceptFriendRequest(requestId)
    toast(`You and ${displayName} are now friends! 🎉`, { icon: '🤝', style: toastStyle })
  }

  const handleDecline = (requestId: string) => {
    declineFriendRequest(requestId)
    toast('Request declined', { icon: '👋', style: toastStyle })
  }

  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-primary/20 bg-white/[0.03]">
      {/* Header — toggle expand */}
      <button
        onClick={() => setIsExpanded((p) => !p)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
            <span
              className="material-symbols-outlined text-base text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              person_add
            </span>
          </div>
          <span className="text-sm font-semibold text-white">Friend Requests</span>
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-content">
            {requests.length}
          </span>
        </div>
        <span
          className={`material-symbols-outlined text-lg text-slate-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Requests list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 px-3 pb-3">
              {requests.map((req) => {
                const tierColor = getLeagueTierColor('bronze') // Default for incoming

                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, height: 0 }}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
                  >
                    {/* Avatar */}
                    <img
                      src={
                        req.fromAvatarUrl ||
                        `/images/avatars/avatar${Math.floor(Math.random() * 15) + 1}.jpg`
                      }
                      alt={req.fromDisplayName}
                      className="size-10 rounded-full object-cover ring-1 ring-white/10"
                    />

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-white">
                        {req.fromDisplayName}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Lv.{req.fromLevel}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] text-slate-500">{timeAgo(req.sentAt)}</span>
                      </div>
                    </div>

                    {/* Accept / Decline */}
                    <div className="flex flex-shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => handleAccept(req.id, req.fromDisplayName)}
                        className="flex cursor-pointer items-center gap-1 rounded-xl bg-emerald-400/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-400/20"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(req.id)}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-xl bg-white/[0.04] transition-colors hover:bg-white/[0.08]"
                      >
                        <span className="material-symbols-outlined text-sm text-slate-500">
                          close
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
