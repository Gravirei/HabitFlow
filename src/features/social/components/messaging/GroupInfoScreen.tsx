/**
 * GroupInfoScreen — Group details and management panel
 * Shows group info, member list, and management actions (rename, add/remove members, leave)
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMessagingStore } from '@/features/social/store/messagingStore'
import { useSocialStore } from '../../store/socialStore'
import { MESSAGING_LIMITS } from './constants'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// ─── Props ──────────────────────────────────────────────────────────────────

interface GroupInfoScreenProps {
  conversationId: string
  onClose: () => void
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CURRENT_USER_ID = 'current-user'

// ─── Component ──────────────────────────────────────────────────────────────

export function GroupInfoScreen({ conversationId, onClose }: GroupInfoScreenProps) {
  const prefersReducedMotion = useReducedMotion()

  // Store data
  const conversation = useMessagingStore((state) =>
    state.conversations.find((c) => c.id === conversationId)
  )
  const { updateGroupName, addGroupMembers, removeGroupMember, leaveGroup, muteConversation } =
    useMessagingStore()
  const friends = useSocialStore((state) => state.friends)
  const onlineUsers = useMessagingStore((state) => state.onlineUsers)

  // Derived
  const isCreator = conversation?.createdBy === CURRENT_USER_ID

  const members = useMemo(() => {
    if (!conversation) return []
    return conversation.memberIds
      .map((id) => {
        const friend = friends.find((f) => f.userId === id)
        return {
          userId: id,
          displayName: id === CURRENT_USER_ID ? 'You' : (friend?.displayName ?? 'Unknown'),
          avatarUrl: friend?.avatarUrl ?? '',
          level: friend?.level ?? 0,
          isOnline: onlineUsers[id] ?? friend?.status === 'active',
          isCreator: id === conversation.createdBy,
          isCurrentUser: id === CURRENT_USER_ID,
        }
      })
      .sort((a, b) => {
        if (a.isCreator) return -1
        if (b.isCreator) return 1
        if (a.isCurrentUser) return -1
        if (b.isCurrentUser) return 1
        return a.displayName.localeCompare(b.displayName)
      })
  }, [conversation, friends, onlineUsers])

  // Component state
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(conversation?.name ?? '')
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [addMemberSearch, setAddMemberSearch] = useState('')
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null)

  // Available friends for adding
  const availableFriends = useMemo(() => {
    if (!conversation) return []
    return friends.filter(
      (f) =>
        !conversation.memberIds.includes(f.userId) &&
        f.displayName.toLowerCase().includes(addMemberSearch.toLowerCase())
    )
  }, [friends, conversation, addMemberSearch])

  // Get member name for remove dialog
  const removeMemberName = useMemo(() => {
    if (!showRemoveConfirm) return ''
    return members.find((m) => m.userId === showRemoveConfirm)?.displayName ?? 'this member'
  }, [showRemoveConfirm, members])

  // Handlers
  const handleSaveName = () => {
    if (editedName.trim()) {
      updateGroupName(conversationId, editedName.trim())
    }
    setIsEditingName(false)
  }

  const handleLeave = () => {
    leaveGroup(conversationId)
    onClose()
  }

  const handleRemoveMember = () => {
    if (showRemoveConfirm) {
      removeGroupMember(conversationId, showRemoveConfirm)
      setShowRemoveConfirm(null)
    }
  }

  const handleAddMember = (userId: string) => {
    addGroupMembers(conversationId, [userId])
  }

  if (!conversation) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0F1117]">
        <p className="text-sm text-slate-500">Group not found</p>
      </div>
    )
  }

  // Get first 4 member avatar URLs for group avatar grid
  const avatarMembers = members.slice(0, 4)

  const panelMotion = prefersReducedMotion
    ? {}
    : {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '100%' },
        transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
      }

  const maxMembersReached = (conversation.memberCount ?? 0) >= MESSAGING_LIMITS.MAX_GROUP_MEMBERS

  return (
    <motion.div className="fixed inset-0 z-40 overflow-y-auto bg-[#0F1117]" {...panelMotion}>
      {/* App bar */}
      <div className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-3">
        <button
          onClick={onClose}
          className="cursor-pointer text-slate-400 transition-colors hover:text-white"
          aria-label="Back"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <h2 className="flex-1 text-center text-lg font-semibold text-white">Group Info</h2>
        <div className="w-10" />
      </div>

      {/* Group avatar section */}
      <div className="flex flex-col items-center py-6">
        {/* 2x2 avatar grid */}
        <div className="grid h-20 w-20 grid-cols-2 gap-0.5 overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.04] p-1">
          {[0, 1, 2, 3].map((i) => {
            const member = avatarMembers[i]
            if (member) {
              return (
                <img
                  key={member.userId}
                  src={member.avatarUrl || '/images/avatars/avatar1.jpg'}
                  alt={member.displayName}
                  className="h-9 w-9 rounded-full object-cover"
                />
              )
            }
            return (
              <div
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]"
              >
                <span className="material-symbols-outlined text-[14px] text-slate-600">person</span>
              </div>
            )
          })}
        </div>

        {/* Group name */}
        {isEditingName ? (
          <div className="mt-3 flex flex-col items-center gap-2">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              maxLength={MESSAGING_LIMITS.CONVERSATION_NAME_MAX_LENGTH}
              autoFocus
              className="max-w-[250px] rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2 text-center text-lg text-white transition-all focus:border-teal-500/30 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveName}
                className="cursor-pointer text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false)
                  setEditedName(conversation.name)
                }}
                className="cursor-pointer text-sm font-medium text-slate-500 transition-colors hover:text-slate-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <h3 className="text-center text-xl font-semibold text-white">{conversation.name}</h3>
            {isCreator && (
              <button
                onClick={() => {
                  setEditedName(conversation.name)
                  setIsEditingName(true)
                }}
                className="cursor-pointer text-slate-500 transition-colors hover:text-white"
                aria-label="Edit group name"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            )}
          </div>
        )}

        {/* Member count */}
        <p className="mt-1 text-center text-sm text-slate-400">
          {conversation.memberCount} members
        </p>
      </div>

      {/* Mute toggle */}
      <div className="mx-4 mt-4 flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.025] px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px] text-slate-400">
            notifications_off
          </span>
          <span className="text-sm text-slate-300">Mute notifications</span>
        </div>
        <button
          onClick={() => muteConversation(conversationId)}
          className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ${
            conversation.isMuted ? 'bg-teal-500' : 'bg-white/[0.1]'
          }`}
          role="switch"
          aria-checked={conversation.isMuted}
          aria-label="Mute notifications"
        >
          <div
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
              conversation.isMuted ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Members section */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-4 pb-2">
          <span className="text-sm font-medium uppercase tracking-wider text-slate-400">
            Members
          </span>
          {isCreator && !maxMembersReached && (
            <button
              onClick={() => setShowAddMembers(true)}
              className="flex cursor-pointer items-center gap-1 text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add
            </button>
          )}
        </div>

        <div className="space-y-1 px-4">
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.02]"
            >
              {/* Avatar with status dot */}
              <div className="relative flex-shrink-0">
                <img
                  src={member.avatarUrl || '/images/avatars/avatar1.jpg'}
                  alt={member.displayName}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#0F1117] ${
                    member.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                  }`}
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{member.displayName}</p>
                <p className="text-xs text-slate-500">Lvl {member.level}</p>
              </div>

              {/* Creator badge */}
              {member.isCreator && (
                <span className="flex-shrink-0 rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-400">
                  Creator
                </span>
              )}

              {/* Remove button (creator only, not on self) */}
              {isCreator && !member.isCurrentUser && (
                <button
                  onClick={() => setShowRemoveConfirm(member.userId)}
                  className="flex-shrink-0 cursor-pointer text-red-400/60 transition-colors hover:text-red-400"
                  aria-label={`Remove ${member.displayName}`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    remove_circle_outline
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leave group button */}
      <div className="mx-4 mb-4 mt-6">
        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/20 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Leave Group
        </button>
      </div>

      {/* ─── Leave Confirmation Dialog ──────────────────────────── */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 max-w-sm rounded-2xl border border-white/[0.05] bg-[#0F1117] p-6">
            <div className="flex justify-center">
              <span className="material-symbols-outlined text-3xl text-amber-400">warning</span>
            </div>
            <h4 className="mt-3 text-center text-lg font-semibold text-white">Leave group?</h4>
            <p className="mt-2 text-center text-sm text-slate-400">
              You won&apos;t be able to see new messages in this group.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 cursor-pointer rounded-xl border border-white/[0.05] bg-white/[0.04] py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06]"
              >
                Cancel
              </button>
              <button
                onClick={handleLeave}
                className="flex-1 cursor-pointer rounded-xl border border-red-500/30 bg-red-500/20 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Remove Member Confirmation Dialog ──────────────────── */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 max-w-sm rounded-2xl border border-white/[0.05] bg-[#0F1117] p-6">
            <div className="flex justify-center">
              <span className="material-symbols-outlined text-3xl text-amber-400">warning</span>
            </div>
            <h4 className="mt-3 text-center text-lg font-semibold text-white">Remove member?</h4>
            <p className="mt-2 text-center text-sm text-slate-400">
              Remove {removeMemberName} from the group?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(null)}
                className="flex-1 cursor-pointer rounded-xl border border-white/[0.05] bg-white/[0.04] py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06]"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveMember}
                className="flex-1 cursor-pointer rounded-xl border border-red-500/30 bg-red-500/20 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Members Sub-panel ──────────────────────────────── */}
      <AnimatePresence>
        {showAddMembers && (
          <motion.div
            className="absolute inset-0 z-10 overflow-y-auto bg-[#0F1117]"
            {...(prefersReducedMotion
              ? {}
              : {
                  initial: { x: '100%' },
                  animate: { x: 0 },
                  exit: { x: '100%' },
                  transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
                })}
          >
            {/* App bar */}
            <div className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-3">
              <button
                onClick={() => {
                  setShowAddMembers(false)
                  setAddMemberSearch('')
                }}
                className="cursor-pointer text-slate-400 transition-colors hover:text-white"
                aria-label="Back"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
              <h2 className="flex-1 text-center text-lg font-semibold text-white">Add Members</h2>
              <div className="w-10" />
            </div>

            {/* Max members warning */}
            {maxMembersReached && (
              <div className="px-4 pt-4">
                <p className="text-center text-xs text-amber-400">
                  Max members reached ({MESSAGING_LIMITS.MAX_GROUP_MEMBERS})
                </p>
              </div>
            )}

            {/* Search */}
            <div className="px-4 pt-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-500">
                  search
                </span>
                <input
                  type="text"
                  value={addMemberSearch}
                  onChange={(e) => setAddMemberSearch(e.target.value)}
                  placeholder="Search friends..."
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-teal-500/30 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>
            </div>

            {/* Friends list */}
            <div className="space-y-1 px-4 pt-4">
              {availableFriends.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  {addMemberSearch ? 'No friends match your search' : 'No more friends to add'}
                </p>
              ) : (
                availableFriends.map((friend) => (
                  <div
                    key={friend.userId}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.02]"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={friend.avatarUrl || '/images/avatars/avatar1.jpg'}
                        alt={friend.displayName}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#0F1117] ${
                          friend.status === 'active'
                            ? 'bg-emerald-400'
                            : friend.status === 'inactive'
                              ? 'bg-amber-400'
                              : 'bg-slate-500'
                        }`}
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{friend.displayName}</p>
                      <p className="text-xs text-slate-500">Lvl {friend.level}</p>
                    </div>

                    {/* Add button */}
                    <button
                      onClick={() => handleAddMember(friend.userId)}
                      disabled={maxMembersReached}
                      className={`cursor-pointer rounded-lg bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-400 transition-colors ${
                        maxMembersReached ? 'cursor-not-allowed opacity-40' : 'hover:bg-teal-500/20'
                      }`}
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
