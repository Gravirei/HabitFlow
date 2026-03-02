/**
 * FriendRequestInbox — Collapsible section showing pending incoming friend requests.
 * Sits at the top of FriendsScreen.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from './socialStore'
import { getLeagueTierColor } from './constants'
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
    <div className="rounded-2xl bg-white/[0.03] border border-primary/20 overflow-hidden mb-3">
      {/* Header — toggle expand */}
      <button
        onClick={() => setIsExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
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
            <div className="px-3 pb-3 space-y-2">
              {requests.map((req) => {
                const tierColor = getLeagueTierColor('bronze') // Default for incoming

                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, height: 0 }}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5"
                  >
                    {/* Avatar */}
                    <img
                      src={req.fromAvatarUrl || `/images/avatars/avatar${Math.floor(Math.random() * 15) + 1}.jpg`}
                      alt={req.fromDisplayName}
                      className="size-10 rounded-full object-cover ring-1 ring-white/10"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{req.fromDisplayName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-slate-400">Lv.{req.fromLevel}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] text-slate-500">{timeAgo(req.sentAt)}</span>
                      </div>
                    </div>

                    {/* Accept / Decline */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleAccept(req.id, req.fromDisplayName)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 px-2.5 py-1.5 rounded-xl bg-emerald-400/10 hover:bg-emerald-400/20 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(req.id)}
                        className="flex size-8 items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm text-slate-500">close</span>
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
