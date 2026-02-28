/**
 * GroupCreationFlow — 3-step group creation wizard
 * Step 1: Name → Step 2: Select Members → Step 3: Review & Create
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMessagingStore } from './messagingStore'
import { useSocialStore } from '../social/socialStore'
import { MESSAGING_LIMITS } from './constants'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// ─── Props ──────────────────────────────────────────────────────────────────

interface GroupCreationFlowProps {
  isOpen: boolean
  onClose: () => void
  onGroupCreated?: (conversationId: string) => void
}

// ─── Step Variants ──────────────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({
    x: dir * 60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir * -60,
    opacity: 0,
  }),
}

const reducedMotionVariants = {
  enter: { x: 0, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: 0, opacity: 0 },
}

// ─── Component ──────────────────────────────────────────────────────────────

export function GroupCreationFlow({ isOpen, onClose, onGroupCreated }: GroupCreationFlowProps) {
  const prefersReducedMotion = useReducedMotion()
  const friends = useSocialStore((state) => state.friends)
  const createGroupConversation = useMessagingStore((state) => state.createGroupConversation)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [direction, setDirection] = useState(1)
  const [groupName, setGroupName] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Filtered friends for Step 2
  const filteredFriends = useMemo(
    () =>
      friends.filter((f) =>
        f.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [friends, searchQuery]
  )

  // Selected friend details for chips & review
  const selectedFriends = useMemo(
    () => friends.filter((f) => selectedMemberIds.includes(f.userId)),
    [friends, selectedMemberIds]
  )

  // Navigation
  const goNext = () => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, 3) as 1 | 2 | 3)
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3)
  }

  // Toggle member selection
  const toggleMember = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : prev.length < MESSAGING_LIMITS.MAX_GROUP_MEMBERS
          ? [...prev, userId]
          : prev
    )
  }

  // Remove selected member
  const removeMember = (userId: string) => {
    setSelectedMemberIds((prev) => prev.filter((id) => id !== userId))
  }

  // Create group
  const handleCreate = async () => {
    if (isCreating) return
    setIsCreating(true)
    try {
      const conversationId = await createGroupConversation(groupName.trim(), selectedMemberIds)
      onGroupCreated?.(conversationId)
      onClose()
      // Reset state
      setStep(1)
      setDirection(1)
      setGroupName('')
      setSelectedMemberIds([])
      setSearchQuery('')
    } finally {
      setIsCreating(false)
    }
  }

  // Close & reset
  const handleClose = () => {
    onClose()
    setStep(1)
    setDirection(1)
    setGroupName('')
    setSelectedMemberIds([])
    setSearchQuery('')
  }

  if (!isOpen) return null

  const variants = prefersReducedMotion ? reducedMotionVariants : stepVariants
  const transitionConfig = { duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeInOut' as const }

  const maxReached = selectedMemberIds.length >= MESSAGING_LIMITS.MAX_GROUP_MEMBERS

  // Friend online status color
  const statusColor = (status: string) => {
    if (status === 'active') return 'bg-emerald-400'
    if (status === 'inactive') return 'bg-amber-400'
    return 'bg-slate-500'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal panel */}
      <div className="relative w-full sm:max-w-md bg-[#0F1117] border border-white/[0.05] rounded-t-3xl sm:rounded-2xl p-6 max-h-[85vh] overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 cursor-pointer text-slate-500 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transitionConfig}
          >
            {/* ─── Step 1: Group Name ─────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-white">Name your group</h3>

                <div>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    maxLength={MESSAGING_LIMITS.CONVERSATION_NAME_MAX_LENGTH}
                    placeholder="Enter group name..."
                    autoFocus
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 transition-all"
                  />
                  <p
                    className={`text-xs mt-1.5 ${
                      groupName.length >= 45 ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    {groupName.length}/{MESSAGING_LIMITS.CONVERSATION_NAME_MAX_LENGTH}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={goNext}
                    disabled={groupName.trim().length === 0}
                    className={`bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl px-6 py-2.5 font-medium text-sm cursor-pointer transition-opacity ${
                      groupName.trim().length === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* ─── Step 2: Select Members ─────────────────────────── */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Add members</h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {selectedMemberIds.length}/{MESSAGING_LIMITS.MAX_GROUP_MEMBERS} selected
                  </p>
                </div>

                {/* Selected chips */}
                {selectedMemberIds.length > 0 && (
                  <div
                    className="flex gap-2 pb-3 overflow-x-auto"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {selectedFriends.map((friend) => (
                      <div
                        key={friend.userId}
                        className="bg-white/[0.06] border border-white/[0.05] rounded-full px-3 py-1.5 flex items-center gap-2 flex-shrink-0"
                      >
                        <img
                          src={friend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.displayName}`}
                          alt={friend.displayName}
                          className="size-4 rounded-full object-cover"
                        />
                        <span className="text-xs text-slate-300 whitespace-nowrap">
                          {friend.displayName}
                        </span>
                        <button
                          onClick={() => removeMember(friend.userId)}
                          className="text-slate-500 hover:text-white cursor-pointer text-xs leading-none"
                          aria-label={`Remove ${friend.displayName}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[16px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search friends..."
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 transition-all"
                  />
                </div>

                {/* Friends list */}
                <div className="max-h-[300px] overflow-y-auto space-y-0.5">
                  {filteredFriends.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">
                      {searchQuery ? 'No friends match your search' : 'No friends to add'}
                    </p>
                  ) : (
                    filteredFriends.map((friend) => {
                      const isSelected = selectedMemberIds.includes(friend.userId)
                      const isDisabled = maxReached && !isSelected

                      return (
                        <button
                          key={friend.userId}
                          onClick={() => !isDisabled && toggleMember(friend.userId)}
                          disabled={isDisabled}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-left ${
                            isDisabled
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          {/* Checkbox */}
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-teal-500 border-teal-500'
                                : 'border-white/[0.15]'
                            }`}
                          >
                            {isSelected && (
                              <span className="material-symbols-outlined text-xs text-white">
                                check
                              </span>
                            )}
                          </div>

                          {/* Avatar with status dot */}
                          <div className="relative flex-shrink-0">
                            <img
                              src={friend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.displayName}`}
                              alt={friend.displayName}
                              className="size-9 rounded-full object-cover"
                            />
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#0F1117] ${statusColor(friend.status)}`}
                            />
                          </div>

                          {/* Name + level */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{friend.displayName}</p>
                            <p className="text-xs text-slate-500">Lvl {friend.level}</p>
                          </div>

                          {/* Max reached label */}
                          {isDisabled && (
                            <span className="text-amber-400 text-xs flex-shrink-0">Max reached</span>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="flex justify-between pt-2">
                  <button
                    onClick={goBack}
                    className="text-slate-400 hover:text-white px-4 py-2.5 cursor-pointer transition-colors text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={goNext}
                    disabled={selectedMemberIds.length === 0}
                    className={`bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl px-6 py-2.5 font-medium text-sm cursor-pointer transition-opacity ${
                      selectedMemberIds.length === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* ─── Step 3: Review & Create ────────────────────────── */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-white text-center">Review group</h3>

                {/* Group name */}
                <p className="text-xl font-semibold text-white text-center">{groupName.trim()}</p>

                {/* Member count */}
                <p className="text-sm text-slate-400 text-center">
                  {selectedMemberIds.length + 1} members
                </p>

                {/* Avatar stack */}
                <div className="flex justify-center items-center">
                  <div className="flex items-center">
                    {selectedFriends.slice(0, 5).map((friend, i) => (
                      <img
                        key={friend.userId}
                        src={friend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.displayName}`}
                        alt={friend.displayName}
                        className={`w-10 h-10 rounded-full border-2 border-[#0F1117] object-cover ${i > 0 ? '-ml-3' : ''}`}
                      />
                    ))}
                    {selectedFriends.length > 5 && (
                      <div className="w-10 h-10 rounded-full bg-white/[0.06] border-2 border-[#0F1117] -ml-3 flex items-center justify-center text-xs text-slate-400 font-medium">
                        +{selectedFriends.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between pt-2">
                  <button
                    onClick={goBack}
                    className="text-slate-400 hover:text-white px-4 py-2.5 cursor-pointer transition-colors text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className={`flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl px-6 py-2.5 font-medium text-sm cursor-pointer transition-opacity ${
                      isCreating ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                  >
                    {isCreating ? (
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">group_add</span>
                    )}
                    Create Group
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex gap-2 justify-center py-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                s === step ? 'bg-teal-400' : 'bg-white/[0.1]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
