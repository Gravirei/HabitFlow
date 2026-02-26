import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useIntegrationStore } from './integrationStore';
import { zapierService } from './zapier';

interface ZapierEvent {
  type: string;
  timestamp: string;
  success: boolean;
}

interface ZapierSettingsData {
  webhookUrl: string;
  notifyOnCompletion: boolean;
  notifyOnCreated: boolean;
  notifyOnMilestone: boolean;
  notifyOnDailySummary: boolean;
  eventLog: ZapierEvent[];
}

export function ZapierSettings() {
  const connection = useIntegrationStore((s) => s.connections['zapier']);
  const { connect, updateSettings, disconnect: disconnectStore } =
    useIntegrationStore();

  const [webhookUrl, setWebhookUrl] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [showUpdateUrl, setShowUpdateUrl] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const settings = (connection.settings || {}) as ZapierSettingsData;
  const isConnected = connection.status === 'connected';

  useEffect(() => {
    if (isConnected && settings.webhookUrl) {
      setWebhookUrl(settings.webhookUrl);
    }
  }, [isConnected, settings.webhookUrl]);

  const handleConnect = async () => {
    setUrlError('');

    if (!webhookUrl.trim()) {
      setUrlError('Please enter a webhook URL');
      return;
    }

    if (!zapierService.validateWebhookUrl(webhookUrl)) {
      setUrlError('Please enter a valid webhook URL (must start with http:// or https://)');
      return;
    }

    try {
      const testSuccess = await zapierService.testWebhook(webhookUrl);
      if (!testSuccess) {
        setUrlError('Failed to connect to webhook. Please verify the URL is correct.');
        return;
      }

      // Connect with the webhook URL as the access token
      connect('zapier', webhookUrl);
      updateSettings('zapier', {
        webhookUrl,
        notifyOnCompletion: true,
        notifyOnCreated: false,
        notifyOnMilestone: true,
        notifyOnDailySummary: false,
        eventLog: [],
      });

      setWebhookUrl('');
      toast.success('Zapier connected successfully!');
    } catch (error) {
      console.error('Connection error:', error);
      setUrlError('An unexpected error occurred. Please try again.');
    }
  };

  const handleDisconnect = () => {
    disconnectStore('zapier');
    setWebhookUrl('');
    toast.success('Zapier disconnected');
  };

  const handleToggleEvent = (key: keyof ZapierSettingsData) => {
    if (typeof settings[key] === 'boolean') {
      updateSettings('zapier', {
        ...settings,
        [key]: !settings[key],
      });
    }
  };

  const handleSendTestEvent = async () => {
    if (!settings.webhookUrl) {
      toast.error('No webhook URL configured');
      return;
    }

    setTestLoading(true);
    try {
      const success = await zapierService.testWebhook(settings.webhookUrl);

      if (success) {
        toast.success('Test event sent successfully!');
        // Add to event log
        const newEvent: ZapierEvent = {
          type: 'test',
          timestamp: new Date().toLocaleTimeString(),
          success: true,
        };
        const eventLog = [...(settings.eventLog || []), newEvent].slice(-5);
        updateSettings('zapier', { ...settings, eventLog });
      } else {
        toast.error('Failed to send test event');
        const newEvent: ZapierEvent = {
          type: 'test',
          timestamp: new Date().toLocaleTimeString(),
          success: false,
        };
        const eventLog = [...(settings.eventLog || []), newEvent].slice(-5);
        updateSettings('zapier', { ...settings, eventLog });
      }
    } catch (error) {
      console.error('Error sending test event:', error);
      toast.error('Failed to send test event');
    } finally {
      setTestLoading(false);
    }
  };

  const handleUpdateWebhookUrl = async () => {
    setUrlError('');

    if (!newWebhookUrl.trim()) {
      setUrlError('Please enter a webhook URL');
      return;
    }

    if (!zapierService.validateWebhookUrl(newWebhookUrl)) {
      setUrlError('Please enter a valid webhook URL (must start with http:// or https://)');
      return;
    }

    try {
      const testSuccess = await zapierService.testWebhook(newWebhookUrl);
      if (!testSuccess) {
        setUrlError('Failed to connect to new webhook. Please verify the URL is correct.');
        return;
      }

      updateSettings('zapier', {
        ...settings,
        webhookUrl: newWebhookUrl,
      });
      connect('zapier', newWebhookUrl);

      setNewWebhookUrl('');
      setShowUpdateUrl(false);
      toast.success('Webhook URL updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      setUrlError('An unexpected error occurred. Please try again.');
    }
  };

  const maskWebhookUrl = (url: string): string => {
    if (!url || url.length <= 8) return url;
    return '•'.repeat(url.length - 8) + url.slice(-8);
  };

  // Disconnected state
  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border border-orange-200 dark:border-orange-800 p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-orange-500 text-white">
            <span className="material-symbols-outlined text-xl">bolt</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Connect Zapier
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Automate workflows with 5000+ apps
            </p>
          </div>
        </div>

        {/* Feature list */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
            Features
          </h4>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-orange-500">✓</span>
              Trigger Zaps on habit completion
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">✓</span>
              Connect with 5000+ apps
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">✓</span>
              Create automated workflows
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">✓</span>
              Custom event triggers
            </li>
          </ul>
        </div>

        {/* How it works */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
            How it works
          </h4>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-semibold">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Create a Zap
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Go to zapier.com and create a new Zap
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-semibold">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Paste webhook URL
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Use your Zap webhook URL below
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-semibold">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Start automating
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Events will automatically trigger your Zap
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook URL input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            Webhook URL
          </label>
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => {
              setWebhookUrl(e.target.value);
              setUrlError('');
            }}
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <AnimatePresence>
            {urlError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-red-500"
              >
                {urlError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Connect button */}
        <button
          onClick={handleConnect}
          className="w-full px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
        >
          Connect Zapier
        </button>
      </motion.div>
    );
  }

  // Connected state
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border border-orange-200 dark:border-orange-800 p-6 space-y-6"
    >
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Connected
            </span>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Webhook URL display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2">
        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          Connected Webhook
        </label>
        <div className="flex items-center justify-between">
          <code className="text-xs text-gray-600 dark:text-gray-300 font-mono break-all">
            {maskWebhookUrl(settings.webhookUrl || '')}
          </code>
          <button
            onClick={() => setShowUpdateUrl(!showUpdateUrl)}
            className="ml-2 px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
          >
            Update
          </button>
        </div>
      </div>

      {/* Update webhook URL section */}
      <AnimatePresence>
        {showUpdateUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              New Webhook URL
            </label>
            <input
              type="text"
              value={newWebhookUrl}
              onChange={(e) => {
                setNewWebhookUrl(e.target.value);
                setUrlError('');
              }}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <AnimatePresence>
              {urlError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-red-500"
                >
                  {urlError}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="flex gap-2">
              <button
                onClick={handleUpdateWebhookUrl}
                className="flex-1 px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
              >
                Save URL
              </button>
              <button
                onClick={() => {
                  setShowUpdateUrl(false);
                  setNewWebhookUrl('');
                  setUrlError('');
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event toggles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
          Events to Send
        </h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifyOnCompletion ?? true}
              onChange={() => handleToggleEvent('notifyOnCompletion')}
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Habit completed
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifyOnCreated ?? false}
              onChange={() => handleToggleEvent('notifyOnCreated')}
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Habit created
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifyOnMilestone ?? true}
              onChange={() => handleToggleEvent('notifyOnMilestone')}
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Streak milestones
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifyOnDailySummary ?? false}
              onChange={() => handleToggleEvent('notifyOnDailySummary')}
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Daily summary
            </span>
          </label>
        </div>
      </div>

      {/* Test button */}
      <button
        onClick={handleSendTestEvent}
        disabled={testLoading}
        className="w-full px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {testLoading ? 'Sending...' : 'Send Test Event'}
      </button>

      {/* Event log */}
      {settings.eventLog && settings.eventLog.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
            Recent Events
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {settings.eventLog.map((event, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 py-1 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      event.success ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="capitalize">{event.type}</span>
                </div>
                <span className="text-gray-500 dark:text-gray-500">
                  {event.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
