'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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
} from '@/components/integrations';

export function Integrations() {
  const navigate = useNavigate();
  const integrationStore = useIntegrationStore();
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationProvider | null>(null);
  const [requestInput, setRequestInput] = useState('');

  // Calculate stats
  const connectedCount = INTEGRATION_CONFIGS.filter((config) =>
    integrationStore.isConnected(config.provider)
  ).length;
  const availableCount = INTEGRATION_CONFIGS.length;
  const syncingCount = INTEGRATION_CONFIGS.filter(
    (config) => integrationStore.getStatus(config.provider) === 'syncing'
  ).length;

  const handleSettingsClick = (provider: IntegrationProvider) => {
    setSelectedIntegration(provider);
  };

  const handleDisconnect = (provider: IntegrationProvider) => {
    integrationStore.disconnect(provider);
    setSelectedIntegration(null);
    toast.success(`Disconnected from ${INTEGRATION_CONFIGS.find((c) => c.provider === provider)?.name}`, {
      duration: 2000,
      position: 'top-center',
    });
  };


  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestInput.trim()) {
      toast.success('Thanks! We\'ve noted your request 📝', {
        duration: 2000,
        position: 'top-center',
      });
      setRequestInput('');
    }
  };

  const getStatusColor = (provider: IntegrationProvider) => {
    const status = integrationStore.getStatus(provider);
    switch (status) {
      case 'connected':
        return 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-900/50';
      case 'syncing':
        return 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50';
      case 'error':
        return 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/50';
      default:
        return 'bg-slate-100 dark:bg-slate-800/30 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700/50';
    }
  };

  const getStatusText = (provider: IntegrationProvider) => {
    const status = integrationStore.getStatus(provider);
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'syncing':
        return 'Syncing';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Error';
      default:
        return 'Disconnected';
    }
  };

  const formatLastSynced = (date: string | null) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const settingsPanelVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header with Back Button */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center px-4 pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900/50 rounded-full transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-slate-900 dark:text-white">
              arrow_back
            </span>
          </motion.button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white ml-4">Integrations</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">{connectedCount} connected</span>
                {' · '}
                <span className="font-semibold text-slate-900 dark:text-white">{availableCount} available</span>
                {syncingCount > 0 && (
                  <>
                    {' · '}
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{syncingCount} syncing</span>
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Available Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {INTEGRATION_CONFIGS.map((config) => {
                const provider = config.provider;
                const connection = integrationStore.getConnection(provider);
                const isConnected = integrationStore.isConnected(provider);
                const status = integrationStore.getStatus(provider);
                const lastSyncedText = formatLastSynced(connection.lastSyncedAt);

                return (
                  <motion.div
                    key={provider}
                    variants={itemVariants}
                    className="group"
                  >
                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg dark:hover:shadow-lg/20 hover:border-slate-300 dark:hover:border-slate-700/50 h-full flex flex-col">
                      {/* Header with Icon and Status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${config.color} ${config.darkColor}`}
                          >
                            <span className="material-symbols-outlined text-2xl text-white">
                              {config.icon}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{config.name}</h3>
                            <span
                              className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(provider)} ${status === 'syncing' ? 'animate-pulse' : ''}`}
                            >
                              {status === 'syncing' && (
                                <span className="inline-block w-2 h-2 bg-current rounded-full mr-2 animate-pulse" />
                              )}
                              {getStatusText(provider)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{config.description}</p>

                      {/* Features List */}
                      <div className="mb-6 flex-1">
                        <ul className="space-y-2">
                          {config.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <span className="material-symbols-outlined text-base text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5">
                                check_circle
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Last Synced */}
                      {isConnected && lastSyncedText && (
                        <div className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                          Last synced: {lastSyncedText}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                        {isConnected ? (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSettingsClick(provider)}
                              className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors duration-200 text-sm"
                            >
                              Settings
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDisconnect(provider)}
                              className="p-2.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors duration-200"
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
                            className="w-full px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors duration-200 text-sm"
                          >
                            Connect
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Settings Modal — rendered via portal */}
          {selectedIntegration && createPortal(
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setSelectedIntegration(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-t-2xl">
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {INTEGRATION_CONFIGS.find((c) => c.provider === selectedIntegration)?.name} Settings
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedIntegration(null)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Request an Integration</h2>
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Don't see your favorite tool? Let us know what integration you'd like to see next.
              </p>
              <form onSubmit={handleRequestSubmit} className="flex gap-4 flex-col sm:flex-row">
                <input
                  type="text"
                  value={requestInput}
                  onChange={(e) => setRequestInput(e.target.value)}
                  placeholder="Enter integration name (e.g., Microsoft Teams)"
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 sm:w-auto"
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
  );
}
