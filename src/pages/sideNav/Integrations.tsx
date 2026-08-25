'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  useIntegrationStore,
  INTEGRATION_CONFIGS,
  GoogleCalendarSettings,
  NotionSettings,
  SlackSettings,
  SpotifySettings,
  AppleHealthSettings,
  GoogleFitSettings,
  ZapierSettings,
  IFTTTSettings,
  type IntegrationProvider,
} from '@/features/integrations/components'

export function Integrations() {
  const navigate = useNavigate()
  const integrationStore = useIntegrationStore()
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationProvider | null>(null)
  const [requestInput, setRequestInput] = useState('')

  // Calculate stats
  const connectedCount = INTEGRATION_CONFIGS.filter((config) =>
    integrationStore.isConnected(config.provider)
  ).length
  const availableCount = INTEGRATION_CONFIGS.length
  const syncingCount = INTEGRATION_CONFIGS.filter(
    (config) => integrationStore.getStatus(config.provider) === 'syncing'
  ).length

  const handleSettingsClick = (provider: IntegrationProvider) => {
    setSelectedIntegration(provider)
  }

  const handleDisconnect = (provider: IntegrationProvider) => {
    integrationStore.disconnect(provider)
    setSelectedIntegration(null)
    toast.success(
      `Disconnected from ${INTEGRATION_CONFIGS.find((c) => c.provider === provider)?.name}`,
      {
        duration: 2000,
        position: 'top-center',
      }
    )
  }

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (requestInput.trim()) {
      toast.success("Thanks! We've noted your request 📝", {
        duration: 2000,
        position: 'top-center',
      })
      setRequestInput('')
    }
  }

  const getStatusColor = (provider: IntegrationProvider) => {
    const status = integrationStore.getStatus(provider)
    switch (status) {
      case 'connected':
        return 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-900/50'
      case 'syncing':
        return 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50'
      case 'error':
        return 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/50'
      default:
        return 'bg-slate-100 dark:bg-slate-800/30 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700/50'
    }
  }

  const getStatusText = (provider: IntegrationProvider) => {
    const status = integrationStore.getStatus(provider)
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'syncing':
        return 'Syncing'
      case 'connecting':
        return 'Connecting...'
      case 'error':
        return 'Error'
      default:
        return 'Disconnected'
    }
  }

  const formatLastSynced = (date: string | null) => {
    if (!date) return null
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header with Back Button */}
      <div className="fixed left-0 right-0 top-0 z-40 border-b border-slate-200/50 bg-white/80 backdrop-blur-lg dark:border-slate-800/50 dark:bg-slate-950/80">
        <div className="flex items-center px-4 pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="rounded-full p-2 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-900/50"
          >
            <span className="material-symbols-outlined text-slate-900 dark:text-white">
              arrow_back
            </span>
          </motion.button>
          <h1 className="ml-4 text-2xl font-bold text-slate-900 dark:text-white">Integrations</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            <div className="rounded-2xl border border-slate-200/50 bg-white p-4 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/50">
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {connectedCount} connected
                </span>
                {' · '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {availableCount} available
                </span>
                {syncingCount > 0 && (
                  <>
                    {' · '}
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {syncingCount} syncing
                    </span>
                  </>
                )}
              </p>
            </div>
          </motion.div>

          {/* Integration Cards Grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mb-16"
          >
            <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
              Available Integrations
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {INTEGRATION_CONFIGS.map((config) => {
                const provider = config.provider
                const connection = integrationStore.getConnection(provider)
                const isConnected = integrationStore.isConnected(provider)
                const status = integrationStore.getStatus(provider)
                const lastSyncedText = formatLastSynced(connection.lastSyncedAt)

                return (
                  <motion.div key={provider} variants={itemVariants} className="group">
                    <div className="dark:hover:shadow-lg/20 flex h-full flex-col rounded-2xl border border-slate-200/50 bg-white p-6 backdrop-blur-sm transition-all duration-200 hover:border-slate-300 hover:shadow-lg dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:border-slate-700/50">
                      {/* Header with Icon and Status */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110 ${config.color} ${config.darkColor}`}
                          >
                            <span className="material-symbols-outlined text-2xl text-white">
                              {config.icon}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                              {config.name}
                            </h3>
                            <span
                              className={`mt-1 inline-block rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(provider)} ${status === 'syncing' ? 'animate-pulse' : ''}`}
                            >
                              {status === 'syncing' && (
                                <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-current" />
                              )}
                              {getStatusText(provider)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                        {config.description}
                      </p>

                      {/* Features List */}
                      <div className="mb-6 flex-1">
                        <ul className="space-y-2">
                          {config.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                            >
                              <span className="material-symbols-outlined mt-0.5 flex-shrink-0 text-base text-teal-600 dark:text-teal-400">
                                check_circle
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Last Synced */}
                      {isConnected && lastSyncedText && (
                        <div className="mb-4 text-xs text-slate-500 dark:text-slate-500">
                          Last synced: {lastSyncedText}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 border-t border-slate-200/50 pt-4 dark:border-slate-800/50">
                        {isConnected ? (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSettingsClick(provider)}
                              className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-700"
                            >
                              Settings
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDisconnect(provider)}
                              className="rounded-xl p-2.5 text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                              title="Disconnect"
                            >
                              <span className="material-symbols-outlined text-lg">logout</span>
                            </motion.button>
                          </>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSettingsClick(provider)}
                            className="w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-700"
                          >
                            Connect
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Settings Modal — rendered via portal */}
          {selectedIntegration &&
            createPortal(
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                  onClick={() => setSelectedIntegration(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200/50 bg-white shadow-2xl dark:border-slate-800/50 dark:bg-slate-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-200/50 bg-white/90 px-6 py-4 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/90">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {INTEGRATION_CONFIGS.find((c) => c.provider === selectedIntegration)?.name}{' '}
                        Settings
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedIntegration(null)}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </motion.button>
                    </div>
                    <div className="p-6">
                      {selectedIntegration === 'google-calendar' && <GoogleCalendarSettings />}
                      {selectedIntegration === 'notion' && <NotionSettings />}
                      {selectedIntegration === 'slack' && <SlackSettings />}
                      {selectedIntegration === 'spotify' && <SpotifySettings />}
                      {selectedIntegration === 'apple-health' && <AppleHealthSettings />}
                      {selectedIntegration === 'google-fit' && <GoogleFitSettings />}
                      {selectedIntegration === 'zapier' && <ZapierSettings />}
                      {selectedIntegration === 'ifttt' && <IFTTTSettings />}
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>,
              document.body
            )}

          {/* Request Integration */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
              Request an Integration
            </h2>
            <div className="rounded-2xl border border-slate-200/50 bg-white p-8 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/50">
              <p className="mb-6 text-slate-600 dark:text-slate-400">
                Don't see your favorite tool? Let us know what integration you'd like to see next.
              </p>
              <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4 sm:flex-row">
                <input
                  type="text"
                  value={requestInput}
                  onChange={(e) => setRequestInput(e.target.value)}
                  placeholder="Enter integration name (e.g., Microsoft Teams)"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:ring-teal-400"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-teal-700 sm:w-auto"
                >
                  <span>Request</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
