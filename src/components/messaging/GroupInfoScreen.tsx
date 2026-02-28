/**
 * GroupInfoScreen — Group details and management panel
 * Shows group info, member list, and management actions (rename, add/remove members, leave)
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMessagingStore } from './messagingStore'
import { useSocialStore } from '../social/socialStore'
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
          isOnline: onlineUsers[id] ?? (friend?.status === 'active'),
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
      <div className="fixed inset-0 z-40 bg-[#0F1117] flex items-center justify-center">
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
    <motion.div
      className="fixed inset-0 z-40 bg-[#0F1117] overflow-y-auto"
      {...panelMotion}
    >
      {/* App bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
        <button
          onClick={onClose}
          className="cursor-pointer text-slate-400 hover:text-white transition-colors"
          aria-label="Back"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <h2 className="text-lg font-semibold text-white flex-1 text-center">Group Info</h2>
        <div className="w-10" />
      </div>

      {/* Group avatar section */}
      <div className="flex flex-col items-center py-6">
        {/* 2x2 avatar grid */}
        <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.05] grid grid-cols-2 gap-0.5 p-1 overflow-hidden">
          {[0, 1, 2, 3].map((i) => {
            const member = avatarMembers[i]
            if (member) {
              return (
                <img
                  key={member.userId}
                  src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.displayName}`}
                  alt={member.displayName}
                  className="w-9 h-9 rounded-full object-cover"
                />
              )
            }
            return (
              <div
                key={i}
                className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center"
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
              className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2 text-white text-center text-lg max-w-[250px] focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 transition-all"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveName}
                className="text-teal-400 text-sm font-medium cursor-pointer hover:text-teal-300 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false)
                  setEditedName(conversation.name)
                }}
                className="text-slate-500 text-sm font-medium cursor-pointer hover:text-slate-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-3">
            <h3 className="text-xl font-semibold text-white text-center">{conversation.name}</h3>
            {isCreator && (
              <button
                onClick={() => {
                  setEditedName(conversation.name)
                  setIsEditingName(true)
                }}
                className="cursor-pointer text-slate-500 hover:text-white transition-colors"
                aria-label="Edit group name"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            )}
          </div>
        )}

        {/* Member count */}
        <p className="text-sm text-slate-400 text-center mt-1">
          {conversation.memberCount} members
        </p>
      </div>

      {/* Mute toggle */}
      <div className="flex items-center justify-between px-4 py-3.5 mx-4 mt-4 rounded-xl bg-white/[0.025] border border-white/[0.05]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px] text-slate-400">notifications_off</span>
          <span className="text-sm text-slate-300">Mute notifications</span>
        </div>
        <button
          onClick={() => muteConversation(conversationId)}
          className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${
            conversation.isMuted ? 'bg-teal-500' : 'bg-white/[0.1]'
          }`}
          role="switch"
          aria-checked={conversation.isMuted}
          aria-label="Mute notifications"
        >
          <div
            className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform duration-200 ${
              conversation.isMuted ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Members section */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-4 pb-2">
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Members</span>
          {isCreator && !maxMembersReached && (
            <button
              onClick={() => setShowAddMembers(true)}
              className="flex items-center gap-1 text-teal-400 hover:text-teal-300 text-sm font-medium cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add
            </button>
          )}
        </div>

        <div className="px-4 space-y-1">
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors"
            >
              {/* Avatar with status dot */}
              <div className="relative flex-shrink-0">
                <img
                  src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.displayName}`}
                  alt={member.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#0F1117] ${
                    member.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                  }`}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{member.displayName}</p>
                <p className="text-xs text-slate-500">Lvl {member.level}</p>
              </div>

              {/* Creator badge */}
              {member.isCreator && (
                <span className="bg-teal-500/10 text-teal-400 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0">
                  Creator
                </span>
              )}

              {/* Remove button (creator only, not on self) */}
              {isCreator && !member.isCurrentUser && (
                <button
                  onClick={() => setShowRemoveConfirm(member.userId)}
                  className="cursor-pointer text-red-400/60 hover:text-red-400 transition-colors flex-shrink-0"
                  aria-label={`Remove ${member.displayName}`}
                >
                  <span className="material-symbols-outlined text-[20px]">remove_circle_outline</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leave group button */}
      <div className="mx-4 mt-6 mb-4">
        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Leave Group
        </button>
      </div>

      {/* ─── Leave Confirmation Dialog ──────────────────────────── */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0F1117] border border-white/[0.05] rounded-2xl p-6 max-w-sm mx-4">
            <div className="flex justify-center">
              <span className="material-symbols-outlined text-3xl text-amber-400">warning</span>
            </div>
            <h4 className="text-lg font-semibold text-white text-center mt-3">Leave group?</h4>
            <p className="text-sm text-slate-400 text-center mt-2">
              You won&apos;t be able to see new messages in this group.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.05] text-slate-300 text-sm font-medium cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeave}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium cursor-pointer hover:bg-red-500/30 transition-colors"
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
          <div className="bg-[#0F1117] border border-white/[0.05] rounded-2xl p-6 max-w-sm mx-4">
            <div className="flex justify-center">
              <span className="material-symbols-outlined text-3xl text-amber-400">warning</span>
            </div>
            <h4 className="text-lg font-semibold text-white text-center mt-3">Remove member?</h4>
            <p className="text-sm text-slate-400 text-center mt-2">
              Remove {removeMemberName} from the group?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRemoveConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.05] text-slate-300 text-sm font-medium cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveMember}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium cursor-pointer hover:bg-red-500/30 transition-colors"
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
            className="absolute inset-0 bg-[#0F1117] z-10 overflow-y-auto"
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
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
              <button
                onClick={() => {
                  setShowAddMembers(false)
                  setAddMemberSearch('')
                }}
                className="cursor-pointer text-slate-400 hover:text-white transition-colors"
                aria-label="Back"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
              <h2 className="text-lg font-semibold text-white flex-1 text-center">Add Members</h2>
              <div className="w-10" />
            </div>

            {/* Max members warning */}
            {maxMembersReached && (
              <div className="px-4 pt-4">
                <p className="text-amber-400 text-xs text-center">Max members reached ({MESSAGING_LIMITS.MAX_GROUP_MEMBERS})</p>
              </div>
            )}

            {/* Search */}
            <div className="px-4 pt-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={addMemberSearch}
                  onChange={(e) => setAddMemberSearch(e.target.value)}
                  placeholder="Search friends..."
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 transition-all"
                />
              </div>
            </div>

            {/* Friends list */}
            <div className="px-4 pt-4 space-y-1">
              {availableFriends.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  {addMemberSearch ? 'No friends match your search' : 'No more friends to add'}
                </p>
              ) : (
                availableFriends.map((friend) => (
                  <div
                    key={friend.userId}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={friend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.displayName}`}
                        alt={friend.displayName}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#0F1117] ${
                          friend.status === 'active' ? 'bg-emerald-400' : friend.status === 'inactive' ? 'bg-amber-400' : 'bg-slate-500'
                        }`}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{friend.displayName}</p>
                      <p className="text-xs text-slate-500">Lvl {friend.level}</p>
                    </div>

                    {/* Add button */}
                    <button
                      onClick={() => handleAddMember(friend.userId)}
                      disabled={maxMembersReached}
                      className={`text-teal-400 bg-teal-500/10 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                        maxMembersReached
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:bg-teal-500/20'
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
