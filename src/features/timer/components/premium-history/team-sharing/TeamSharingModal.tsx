// @ts-nocheck
/**
 * Team Sharing Modal
 * Collaborate and share timer sessions with team members
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShareStore } from '@/features/timer/store/shareStore'
import type { TimerSession } from '../types/session.types'

interface TeamSharingModalProps {
  isOpen: boolean
  onClose: () => void
  sessions: TimerSession[]
}

export function TeamSharingModal({ isOpen, onClose, sessions }: TeamSharingModalProps) {
  const {
    sharedSessions,
    shareLinks,
    teamMembers,
    shareSession,
    unshareSession,
    createShareLink,
    deleteShareLink,
    addTeamMember,
    removeTeamMember,
  } = useShareStore()

  const [activeTab, setActiveTab] = useState<'share' | 'links' | 'team'>('share')
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [shareEmails, setShareEmails] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [sharePermission, setSharePermission] = useState<'view' | 'comment' | 'edit'>('view')
  const [linkExpiry, setLinkExpiry] = useState('7')
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')

  const handleShareSession = () => {
    if (selectedSessions.length === 0 || !shareEmails.trim()) {
      alert('Please select sessions and enter email addresses')
      return
    }

    const emails = shareEmails
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e)
    selectedSessions.forEach((sessionId) => {
      shareSession(sessionId, emails, sharePermission, shareMessage)
    })

    // Reset form
    setSelectedSessions([])
    setShareEmails('')
    setShareMessage('')
    alert(`Shared ${selectedSessions.length} session(s) with ${emails.length} recipient(s)`)
  }

  const handleCreateLink = () => {
    if (selectedSessions.length === 0) {
      alert('Please select at least one session')
      return
    }

    const expiryMs = linkExpiry === 'never' ? undefined : parseInt(linkExpiry) * 24 * 60 * 60 * 1000
    const link = createShareLink(selectedSessions, expiryMs)

    // Copy to clipboard
    navigator.clipboard.writeText(link.url)
    alert('Share link created and copied to clipboard!')
    setSelectedSessions([])
  }

  const handleAddTeamMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      alert('Please enter name and email')
      return
    }

    addTeamMember({
      name: newMemberName,
      email: newMemberEmail,
      role: 'member',
    })

    setNewMemberName('')
    setNewMemberEmail('')
  }

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId]
    )
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[5%] z-50 mx-auto max-h-[90vh] max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500">
                    <span className="material-symbols-outlined text-xl text-white">share</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Team Sharing
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Collaborate & share
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('share')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === 'share'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  Share Sessions
                </button>
                <button
                  onClick={() => setActiveTab('links')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === 'links'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  Share Links ({shareLinks.length})
                </button>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === 'team'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  Team ({teamMembers.length})
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
              {/* Share Sessions Tab */}
              {activeTab === 'share' && (
                <div className="space-y-6">
                  {/* Session Selection */}
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                      Select Sessions to Share ({selectedSessions.length} selected)
                    </h3>
                    <div className="grid max-h-60 gap-2 overflow-y-auto">
                      {sessions.slice(0, 20).map((session) => (
                        <button
                          key={session.id}
                          onClick={() => toggleSessionSelection(session.id)}
                          className={`flex items-center gap-3 rounded-xl p-3 text-left transition-all ${
                            selectedSessions.includes(session.id)
                              ? 'border-2 border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                              : 'border-2 border-transparent bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${
                              selectedSessions.includes(session.id)
                                ? 'border-teal-500 bg-teal-500'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {selectedSessions.includes(session.id) && (
                              <span className="material-symbols-outlined text-xs text-white">
                                check
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-slate-900 dark:text-white">
                              {session.sessionName || session.mode}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500">
                              {formatDate(session.timestamp)} • {Math.round(session.duration / 60)}m
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Share Form */}
                  <div className="space-y-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Email Addresses (comma separated)
                      </label>
                      <input
                        type="text"
                        value={shareEmails}
                        onChange={(e) => setShareEmails(e.target.value)}
                        placeholder="user@example.com, team@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Permission Level
                      </label>
                      <div className="flex gap-2">
                        {(['view', 'comment', 'edit'] as const).map((perm) => (
                          <button
                            key={perm}
                            onClick={() => setSharePermission(perm)}
                            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all ${
                              sharePermission === perm
                                ? 'bg-teal-500 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                            }`}
                          >
                            {perm}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Message (Optional)
                      </label>
                      <textarea
                        value={shareMessage}
                        onChange={(e) => setShareMessage(e.target.value)}
                        placeholder="Add a note for recipients..."
                        rows={2}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <button
                      onClick={handleShareSession}
                      disabled={selectedSessions.length === 0 || !shareEmails.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3 font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">send</span>
                      Share Sessions
                    </button>
                  </div>

                  {/* Shared Sessions List */}
                  {sharedSessions.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                        Recently Shared
                      </h3>
                      <div className="space-y-2">
                        {sharedSessions.slice(0, 5).map((share) => (
                          <div
                            key={share.id}
                            className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"
                          >
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                Shared with {share.sharedWith.length} recipient(s)
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-500">
                                {formatDate(share.sharedAt)} • {share.permissions} access
                              </div>
                            </div>
                            <button
                              onClick={() => unshareSession(share.id)}
                              className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Share Links Tab */}
              {activeTab === 'links' && (
                <div className="space-y-6">
                  <div className="space-y-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Create Share Link
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Select sessions above, then create a shareable link
                    </p>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Link Expires In
                      </label>
                      <select
                        value={linkExpiry}
                        onChange={(e) => setLinkExpiry(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        <option value="1">1 day</option>
                        <option value="7">7 days</option>
                        <option value="30">30 days</option>
                        <option value="never">Never</option>
                      </select>
                    </div>

                    <button
                      onClick={handleCreateLink}
                      disabled={selectedSessions.length === 0}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3 font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">link</span>
                      Create Share Link
                    </button>
                  </div>

                  {/* Active Links */}
                  {shareLinks.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                        Active Share Links
                      </h3>
                      <div className="space-y-2">
                        {shareLinks.map((link) => (
                          <div
                            key={link.id}
                            className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50"
                          >
                            <div className="mb-2 flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 truncate font-mono text-sm text-slate-900 dark:text-white">
                                  {link.url}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-500">
                                  {link.sessionIds.length} session(s) • Created{' '}
                                  {formatDate(link.createdAt)}
                                  {link.expiresAt && ` • Expires ${formatDate(link.expiresAt)}`}
                                </div>
                              </div>
                              <div className="ml-2 flex gap-1">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(link.url)
                                    alert('Link copied!')
                                  }}
                                  className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    content_copy
                                  </span>
                                </button>
                                <button
                                  onClick={() => deleteShareLink(link.id)}
                                  className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500">
                              Views: {link.viewCount}
                              {link.maxViews && ` / ${link.maxViews}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Team Tab */}
              {activeTab === 'team' && (
                <div className="space-y-6">
                  <div className="space-y-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Add Team Member
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Name"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="Email"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={handleAddTeamMember}
                      disabled={!newMemberName.trim() || !newMemberEmail.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3 font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">person_add</span>
                      Add Member
                    </button>
                  </div>

                  {/* Team Members List */}
                  {teamMembers.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <span className="material-symbols-outlined text-3xl text-slate-400">
                          group
                        </span>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                        No Team Members Yet
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Add team members to collaborate on timer sessions
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 font-semibold text-white">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {member.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-500">
                                {member.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium capitalize text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                              {member.role}
                            </span>
                            <button
                              onClick={() => removeTeamMember(member.id)}
                              className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <span className="material-symbols-outlined text-sm">
                                person_remove
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
