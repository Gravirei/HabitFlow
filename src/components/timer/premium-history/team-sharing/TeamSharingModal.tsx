/**
 * Team Sharing Modal
 * Collaborate and share timer sessions with team members
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShareStore } from './shareStore'
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

    const emails = shareEmails.split(',').map((e) => e.trim()).filter((e) => e)
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
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
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
            className="fixed inset-x-4 top-[5%] z-50 mx-auto max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">share</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Team Sharing</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Collaborate & share</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('share')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'share'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Share Sessions
                </button>
                <button
                  onClick={() => setActiveTab('links')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'links'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Share Links ({shareLinks.length})
                </button>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'team'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Team ({teamMembers.length})
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
              {/* Share Sessions Tab */}
              {activeTab === 'share' && (
                <div className="space-y-6">
                  {/* Session Selection */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      Select Sessions to Share ({selectedSessions.length} selected)
                    </h3>
                    <div className="grid gap-2 max-h-60 overflow-y-auto">
                      {sessions.slice(0, 20).map((session) => (
                        <button
                          key={session.id}
                          onClick={() => toggleSessionSelection(session.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                            selectedSessions.includes(session.id)
                              ? 'bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-500'
                              : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-transparent'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                            selectedSessions.includes(session.id)
                              ? 'bg-teal-500 border-teal-500'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {selectedSessions.includes(session.id) && (
                              <span className="material-symbols-outlined text-white text-xs">check</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
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
                  <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email Addresses (comma separated)
                      </label>
                      <input
                        type="text"
                        value={shareEmails}
                        onChange={(e) => setShareEmails(e.target.value)}
                        placeholder="user@example.com, team@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Permission Level
                      </label>
                      <div className="flex gap-2">
                        {(['view', 'comment', 'edit'] as const).map((perm) => (
                          <button
                            key={perm}
                            onClick={() => setSharePermission(perm)}
                            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium capitalize transition-all ${
                              sharePermission === perm
                                ? 'bg-teal-500 text-white'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {perm}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Message (Optional)
                      </label>
                      <textarea
                        value={shareMessage}
                        onChange={(e) => setShareMessage(e.target.value)}
                        placeholder="Add a note for recipients..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                    </div>

                    <button
                      onClick={handleShareSession}
                      disabled={selectedSessions.length === 0 || !shareEmails.trim()}
                      className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">send</span>
                      Share Sessions
                    </button>
                  </div>

                  {/* Shared Sessions List */}
                  {sharedSessions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Recently Shared
                      </h3>
                      <div className="space-y-2">
                        {sharedSessions.slice(0, 5).map((share) => (
                          <div
                            key={share.id}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
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
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
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
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Create Share Link
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Select sessions above, then create a shareable link
                    </p>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Link Expires In
                      </label>
                      <select
                        value={linkExpiry}
                        onChange={(e) => setLinkExpiry(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                      className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">link</span>
                      Create Share Link
                    </button>
                  </div>

                  {/* Active Links */}
                  {shareLinks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Active Share Links
                      </h3>
                      <div className="space-y-2">
                        {shareLinks.map((link) => (
                          <div
                            key={link.id}
                            className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-mono text-slate-900 dark:text-white truncate mb-1">
                                  {link.url}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-500">
                                  {link.sessionIds.length} session(s) • Created {formatDate(link.createdAt)}
                                  {link.expiresAt && ` • Expires ${formatDate(link.expiresAt)}`}
                                </div>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(link.url)
                                    alert('Link copied!')
                                  }}
                                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-sm">content_copy</span>
                                </button>
                                <button
                                  onClick={() => deleteShareLink(link.id)}
                                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500">
                              Views: {link.viewCount}{link.maxViews && ` / ${link.maxViews}`}
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
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Add Team Member
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Name"
                        className="px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="Email"
                        className="px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <button
                      onClick={handleAddTeamMember}
                      disabled={!newMemberName.trim() || !newMemberEmail.trim()}
                      className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">person_add</span>
                      Add Member
                    </button>
                  </div>

                  {/* Team Members List */}
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-3xl">group</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Team Members Yet</h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Add team members to collaborate on timer sessions
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">{member.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-500">{member.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium capitalize">
                              {member.role}
                            </span>
                            <button
                              onClick={() => removeTeamMember(member.id)}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">person_remove</span>
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
