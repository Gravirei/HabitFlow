/**
 * AddFriendsModal — Friend discovery hub with 3 tabs:
 *   1. Search — find users by name
 *   2. Invite Code — share/redeem invite codes
 *   3. Suggestions — AI-style friend suggestions
 */

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from '../store/socialStore'
import { UserCard } from './UserCard'
import toast from 'react-hot-toast'

type Tab = 'search' | 'invite' | 'suggestions'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'invite', label: 'Invite', icon: 'link' },
  { id: 'suggestions', label: 'For You', icon: 'auto_awesome' },
]

const toastStyle = {
  background: '#0f1628',
  color: '#fff',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.1)',
}

interface AddFriendsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddFriendsModal({ isOpen, onClose }: AddFriendsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteInput, setInviteInput] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const {
    searchUsers,
    getSuggestedFriends,
    sendFriendRequest,
    dismissSuggestion,
    getInviteCode,
    redeemInviteCode,
  } = useSocialStore()

  if (!isOpen) return null

  const searchResults = searchUsers(searchQuery)
  const suggestions = getSuggestedFriends()
  const inviteCode = getInviteCode()

  const handleAdd = (userId: string) => {
    const user = [...searchResults, ...suggestions].find((u) => u.userId === userId)
    if (!user) return
    sendFriendRequest(userId, user.displayName, user.avatarUrl)
    toast(`Friend request sent to ${user.displayName}!`, {
      icon: '📨',
      style: toastStyle,
    })
  }

  const handleDismiss = (userId: string) => {
    dismissSuggestion(userId)
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      toast('Invite code copied!', { icon: '📋', style: toastStyle })
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleRedeemCode = () => {
    if (!inviteInput.trim()) return
    const success = redeemInviteCode(inviteInput)
    if (success) {
      toast('Friend added via invite code! 🎉', { icon: '✅', style: toastStyle })
      setInviteInput('')
    } else {
      toast('Invalid invite code. Format: HABIT-XXXX-XXXX', { icon: '❌', style: toastStyle })
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Add me on HabitFlow!',
          text: `Add me as a friend on HabitFlow! My invite code: ${inviteCode}`,
        })
      } else {
        handleCopyCode()
      }
    } catch {
      // User cancelled share
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/[0.08] bg-[#0f1628] sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h2 className="text-lg font-bold text-white">Add Friends</h2>
          <button
            onClick={onClose}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/[0.06] transition-colors hover:bg-white/[0.1]"
          >
            <span className="material-symbols-outlined text-lg text-slate-400">close</span>
          </button>
        </div>

        {/* Tab bar */}
        <div className="mx-5 mb-4 flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.04] p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <AnimatePresence mode="wait">
            {activeTab === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="space-y-3"
              >
                {/* Search input */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-500">
                    search
                  </span>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-primary/30"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-slate-300"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  )}
                </div>

                {/* Results */}
                {searchQuery.trim() ? (
                  searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((user, i) => (
                        <UserCard key={user.userId} user={user} onAdd={handleAdd} index={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-10 text-center">
                      <span className="material-symbols-outlined mb-2 text-3xl text-slate-600">
                        search_off
                      </span>
                      <p className="text-sm text-slate-400">No users found</p>
                      <p className="mt-1 text-xs text-slate-500">Try a different name</p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center py-10 text-center">
                    <span className="material-symbols-outlined mb-2 text-3xl text-slate-600">
                      person_search
                    </span>
                    <p className="text-sm text-slate-400">Search for users</p>
                    <p className="mt-1 text-xs text-slate-500">Type a name to find people</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'invite' && (
              <motion.div
                key="invite"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="space-y-5"
              >
                {/* Your invite code */}
                <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Your Invite Code
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.06] px-4 py-3 text-center">
                      <span className="font-mono text-lg font-bold tracking-widest text-white">
                        {inviteCode}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="flex size-11 cursor-pointer items-center justify-center rounded-xl bg-primary/10 transition-colors hover:bg-primary/20"
                    >
                      <span className="material-symbols-outlined text-lg text-primary">
                        content_copy
                      </span>
                    </button>
                  </div>
                  <p className="text-center text-xs text-slate-500">
                    Share this code with friends so they can add you
                  </p>
                  <button
                    onClick={handleShare}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    <span className="material-symbols-outlined text-lg">share</span>
                    Share with friends
                  </button>
                </div>

                {/* Enter friend's code */}
                <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Enter Friend&apos;s Code
                  </p>
                  <input
                    type="text"
                    placeholder="HABIT-XXXX-XXXX"
                    value={inviteInput}
                    onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
                    maxLength={14}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-center font-mono text-sm tracking-widest text-white outline-none transition-colors placeholder:tracking-widest placeholder:text-slate-600 focus:border-primary/30"
                  />
                  <button
                    onClick={handleRedeemCode}
                    disabled={!inviteInput.trim()}
                    className="w-full cursor-pointer rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-primary-content transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Add Friend
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'suggestions' && (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="space-y-3"
              >
                <p className="mb-2 text-xs text-slate-500">
                  People you might know based on your activity
                </p>
                {suggestions.length > 0 ? (
                  <AnimatePresence>
                    {suggestions.map((user, i) => (
                      <UserCard
                        key={user.userId}
                        user={user}
                        onAdd={handleAdd}
                        onDismiss={handleDismiss}
                        showReason
                        index={i}
                      />
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="flex flex-col items-center py-10 text-center">
                    <span className="material-symbols-outlined mb-2 text-3xl text-slate-600">
                      diversity_3
                    </span>
                    <p className="text-sm text-slate-400">No more suggestions</p>
                    <p className="mt-1 text-xs text-slate-500">Try searching by name instead</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
