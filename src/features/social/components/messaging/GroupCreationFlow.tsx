/**
 * GroupCreationFlow — 3-step group creation wizard
 * Step 1: Name → Step 2: Select Members → Step 3: Review & Create
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMessagingStore } from '@/features/social/store/messagingStore'
import { useSocialStore } from '../../store/socialStore'
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
    () => friends.filter((f) => f.displayName.toLowerCase().includes(searchQuery.toLowerCase())),
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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal panel */}
      <div className="relative max-h-[85vh] w-full overflow-hidden rounded-t-3xl border border-white/[0.05] bg-[#0F1117] p-6 sm:max-w-md sm:rounded-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 cursor-pointer text-slate-500 transition-colors hover:text-white"
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
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-teal-500/30 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                  <p
                    className={`mt-1.5 text-xs ${
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
                    className={`cursor-pointer rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-2.5 text-sm font-medium text-white transition-opacity ${
                      groupName.trim().length === 0
                        ? 'cursor-not-allowed opacity-40'
                        : 'hover:opacity-90'
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
                  <p className="mt-0.5 text-sm text-slate-400">
                    {selectedMemberIds.length}/{MESSAGING_LIMITS.MAX_GROUP_MEMBERS} selected
                  </p>
                </div>

                {/* Selected chips */}
                {selectedMemberIds.length > 0 && (
                  <div
                    className="flex gap-2 overflow-x-auto pb-3"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {selectedFriends.map((friend) => (
                      <div
                        key={friend.userId}
                        className="flex flex-shrink-0 items-center gap-2 rounded-full border border-white/[0.05] bg-white/[0.06] px-3 py-1.5"
                      >
                        <img
                          src={friend.avatarUrl || '/images/avatars/avatar1.jpg'}
                          alt={friend.displayName}
                          className="size-4 rounded-full object-cover"
                        />
                        <span className="whitespace-nowrap text-xs text-slate-300">
                          {friend.displayName}
                        </span>
                        <button
                          onClick={() => removeMember(friend.userId)}
                          className="cursor-pointer text-xs leading-none text-slate-500 hover:text-white"
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
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-500">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search friends..."
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-teal-500/30 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>

                {/* Friends list */}
                <div className="max-h-[300px] space-y-0.5 overflow-y-auto">
                  {filteredFriends.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">
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
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                            isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          {/* Checkbox */}
                          <div
                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                              isSelected ? 'border-teal-500 bg-teal-500' : 'border-white/[0.15]'
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
                              src={friend.avatarUrl || '/images/avatars/avatar1.jpg'}
                              alt={friend.displayName}
                              className="size-9 rounded-full object-cover"
                            />
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#0F1117] ${statusColor(friend.status)}`}
                            />
                          </div>

                          {/* Name + level */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-white">{friend.displayName}</p>
                            <p className="text-xs text-slate-500">Lvl {friend.level}</p>
                          </div>

                          {/* Max reached label */}
                          {isDisabled && (
                            <span className="flex-shrink-0 text-xs text-amber-400">
                              Max reached
                            </span>
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
                    className="cursor-pointer px-4 py-2.5 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    onClick={goNext}
                    disabled={selectedMemberIds.length === 0}
                    className={`cursor-pointer rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-2.5 text-sm font-medium text-white transition-opacity ${
                      selectedMemberIds.length === 0
                        ? 'cursor-not-allowed opacity-40'
                        : 'hover:opacity-90'
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
                <h3 className="text-center text-lg font-semibold text-white">Review group</h3>

                {/* Group name */}
                <p className="text-center text-xl font-semibold text-white">{groupName.trim()}</p>

                {/* Member count */}
                <p className="text-center text-sm text-slate-400">
                  {selectedMemberIds.length + 1} members
                </p>

                {/* Avatar stack */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center">
                    {selectedFriends.slice(0, 5).map((friend, i) => (
                      <img
                        key={friend.userId}
                        src={friend.avatarUrl || '/images/avatars/avatar1.jpg'}
                        alt={friend.displayName}
                        className={`h-10 w-10 rounded-full border-2 border-[#0F1117] object-cover ${i > 0 ? '-ml-3' : ''}`}
                      />
                    ))}
                    {selectedFriends.length > 5 && (
                      <div className="-ml-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0F1117] bg-white/[0.06] text-xs font-medium text-slate-400">
                        +{selectedFriends.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between pt-2">
                  <button
                    onClick={goBack}
                    className="cursor-pointer px-4 py-2.5 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-2.5 text-sm font-medium text-white transition-opacity ${
                      isCreating ? 'cursor-not-allowed opacity-60' : 'hover:opacity-90'
                    }`}
                  >
                    {isCreating ? (
                      <span className="material-symbols-outlined animate-spin text-[18px]">
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
        <div className="flex justify-center gap-2 py-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                s === step ? 'bg-teal-400' : 'bg-white/[0.1]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
