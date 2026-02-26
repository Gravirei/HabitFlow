import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useIntegrationStore } from './integrationStore';
import { appleHealthService } from './appleHealth';

interface HealthMetrics {
  steps: number;
  sleepHours: number;
  mindfulMinutes: number;
}

export function AppleHealthSettings() {
  const connection = useIntegrationStore((s) => s.connections['apple-health']);
  const { updateSettings, disconnect: disconnectStore, setStatus } = useIntegrationStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<HealthMetrics>({
    steps: 0,
    sleepHours: 0,
    mindfulMinutes: 0,
  });
  const [syncSettings, setSyncSettings] = useState({
    syncSteps: true,
    syncSleep: true,
    syncMindfulness: true,
    syncFrequency: 'daily' as 'hourly' | '6hourly' | 'daily',
  });

  // Load metrics when connected
  useEffect(() => {
    if (connection?.status === 'connected') {
      loadMetrics();
    }
  }, [connection?.status]);

  const loadMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [steps, sleepHours, mindfulMinutes] = await Promise.all([
        appleHealthService.getSteps(today),
        appleHealthService.getSleepData(today),
        appleHealthService.getMindfulMinutes(today),
      ]);

      setMetrics({
        steps,
        sleepHours,
        mindfulMinutes,
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const success = await appleHealthService.connect();
      if (success) {
        // Load metrics after connection
        setTimeout(loadMetrics, 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await appleHealthService.syncHealthData();
      loadMetrics();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect Apple Health?')) {
      setIsLoading(true);
      try {
        await appleHealthService.disconnect();
        disconnectStore('apple-health');
        setMetrics({ steps: 0, sleepHours: 0, mindfulMinutes: 0 });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSettingsChange = (key: keyof typeof syncSettings, value: any) => {
    const newSettings = { ...syncSettings, [key]: value };
    setSyncSettings(newSettings);
    updateSettings('apple-health', newSettings);
  };

  // Disconnected state
  if (!connection?.status || connection.status !== 'connected') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Connect Card */}
        <div className="rounded-2xl border-2 border-red-500 bg-gradient-to-br from-red-500/10 to-red-600/5 p-6 dark:from-red-500/5 dark:to-red-600/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-red-500">favorite</span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Apple Health
                </h3>
              </div>
              
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Sync your health data automatically and track your wellness habits.
              </p>

              {/* Features List */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="material-symbols-outlined text-lg text-red-500">check_circle</span>
                  <span>Sync steps and daily activity</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="material-symbols-outlined text-lg text-red-500">check_circle</span>
                  <span>Track sleep and rest patterns</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="material-symbols-outlined text-lg text-red-500">check_circle</span>
                  <span>Monitor mindfulness and meditation</span>
                </div>
              </div>

              {/* Platform Notice */}
              <div className="mb-4 flex gap-2 rounded-lg bg-amber-500/15 p-3 dark:bg-amber-500/10">
                <span className="material-symbols-outlined text-lg text-amber-600 dark:text-amber-400">
                  info
                </span>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Apple Health requires an iOS device
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full rounded-lg bg-red-500 px-4 py-2.5 font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isLoading ? 'Connecting...' : 'Connect Apple Health'}
          </button>
        </div>
      </motion.div>
    );
  }

  // Connected state
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Connection Status */}
      <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 dark:bg-red-500/5">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Connected to Apple Health
        </span>
      </div>

      {/* Health Metrics Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Steps Card */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-200 bg-white/50 p-4 dark:border-gray-700 dark:bg-gray-800/30"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Steps Today
            </span>
            <span className="material-symbols-outlined text-lg text-red-500">directions_walk</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.steps.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Goal: 10,000
          </div>
        </motion.div>

        {/* Sleep Card */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-gray-200 bg-white/50 p-4 dark:border-gray-700 dark:bg-gray-800/30"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Sleep Hours
            </span>
            <span className="material-symbols-outlined text-lg text-red-500">dark_mode</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.sleepHours.toFixed(1)}h
          </div>
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Target: 8h
          </div>
        </motion.div>

        {/* Mindfulness Card */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-200 bg-white/50 p-4 dark:border-gray-700 dark:bg-gray-800/30"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Mindful Min
            </span>
            <span className="material-symbols-outlined text-lg text-red-500">spa</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.mindfulMinutes}m
          </div>
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Daily activity
          </div>
        </motion.div>
      </div>

      {/* Settings Section */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-gray-200 bg-white/50 p-4 dark:border-gray-700 dark:bg-gray-800/30"
      >
        <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
          Sync Settings
        </h4>

        {/* Toggle Switches */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sync Steps
            </label>
            <button
              onClick={() => handleSettingsChange('syncSteps', !syncSettings.syncSteps)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                syncSettings.syncSteps
                  ? 'bg-red-500 dark:bg-red-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  syncSettings.syncSteps ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sync Sleep
            </label>
            <button
              onClick={() => handleSettingsChange('syncSleep', !syncSettings.syncSleep)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                syncSettings.syncSleep
                  ? 'bg-red-500 dark:bg-red-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  syncSettings.syncSleep ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sync Mindfulness
            </label>
            <button
              onClick={() => handleSettingsChange('syncMindfulness', !syncSettings.syncMindfulness)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                syncSettings.syncMindfulness
                  ? 'bg-red-500 dark:bg-red-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  syncSettings.syncMindfulness ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sync Frequency */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sync Frequency
          </label>
          <select
            value={syncSettings.syncFrequency}
            onChange={(e) =>
              handleSettingsChange('syncFrequency', e.target.value as any)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors hover:border-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-500 dark:focus:border-red-500"
          >
            <option value="hourly">Every hour</option>
            <option value="6hourly">Every 6 hours</option>
            <option value="daily">Daily</option>
          </select>
        </div>

        {/* Last Synced */}
        {connection?.lastSynced && (
          <div className="mb-4 text-xs text-gray-600 dark:text-gray-400">
            Last synced:{' '}
            {new Date(connection.lastSynced).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSync}
          disabled={isLoading}
          className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">sync</span>
            {isLoading ? 'Syncing...' : 'Sync Now'}
          </span>
        </button>

        <button
          onClick={handleDisconnect}
          disabled={isLoading}
          className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">disconnect</span>
            Disconnect
          </span>
        </button>
      </div>
    </motion.div>
  );
}
