'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useIntegrationStore } from './integrationStore';
import { iftttService } from './ifttt';

const IFTTT_EVENTS = [
  {
    name: 'habitflow_completed',
    label: 'When a habit is completed',
  },
  {
    name: 'habitflow_created',
    label: 'When a new habit is created',
  },
  {
    name: 'habitflow_streak',
    label: 'When a streak milestone is hit',
  },
  {
    name: 'habitflow_summary',
    label: 'Daily habit summary',
  },
];

export function IFTTTSettings() {
  const connection = useIntegrationStore((s) => s.connections['ifttt']);
  const { connect, updateSettings, disconnect: disconnectStore } =
    useIntegrationStore();

  const [webhookKey, setWebhookKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [enabledEvents, setEnabledEvents] = useState<Set<string>>(
    new Set(IFTTT_EVENTS.map((e) => e.name))
  );

  const handleConnect = async () => {
    if (!iftttService.validateKey(webhookKey)) {
      toast.error('Please enter a valid webhook key');
      return;
    }

    setLoading(true);
    try {
      const isValid = await iftttService.testConnection(webhookKey);
      if (!isValid) {
        toast.error('Failed to validate webhook key. Please check and try again.');
        setLoading(false);
        return;
      }

      connect('ifttt', webhookKey);
      updateSettings('ifttt', {
        enabledEvents: Array.from(enabledEvents),
      });

      setWebhookKey('');
      toast.success('IFTTT connected successfully!');
    } catch (error) {
      toast.error('Connection failed. Please try again.');
      console.error('IFTTT connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEvent = async () => {
    if (!connection?.accessToken) return;

    setTestLoading(true);
    try {
      const success = await iftttService.testConnection(connection.accessToken);
      if (success) {
        toast.success('Test event sent successfully!');
      } else {
        toast.error('Failed to send test event');
      }
    } catch (error) {
      toast.error('Test failed. Please try again.');
      console.error('Test event error:', error);
    } finally {
      setTestLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectStore('ifttt');
    setEnabledEvents(new Set(IFTTT_EVENTS.map((e) => e.name)));
    toast.success('IFTTT disconnected');
  };

  const toggleEvent = (eventName: string) => {
    const newEnabled = new Set(enabledEvents);
    if (newEnabled.has(eventName)) {
      newEnabled.delete(eventName);
    } else {
      newEnabled.add(eventName);
    }
    setEnabledEvents(newEnabled);

    if (connection?.accessToken) {
      updateSettings('ifttt', {
        enabledEvents: Array.from(newEnabled),
      });
    }
  };

  const copyEventName = (eventName: string) => {
    navigator.clipboard.writeText(eventName);
    toast.success(`Copied: ${eventName}`);
  };

  const maskKey = (key: string) => {
    if (!key || key.length < 4) return key;
    return `****...${key.slice(-4)}`;
  };

  // Disconnected state
  if (!connection?.accessToken) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/20 p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-cyan-500 text-2xl">
            device_hub
          </span>
          <div>
            <h3 className="text-lg font-semibold text-white">IFTTT Webhooks</h3>
            <p className="text-sm text-slate-400">
              Automate your habits with IFTTT
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-300">Key Features:</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-slate-300">
              <span className="material-symbols-outlined text-cyan-500 text-sm">
                check
              </span>
              Send notifications when habits are completed
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-300">
              <span className="material-symbols-outlined text-cyan-500 text-sm">
                check
              </span>
              Log streaks to your favorite apps
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-300">
              <span className="material-symbols-outlined text-cyan-500 text-sm">
                check
              </span>
              Create custom workflows and automations
            </li>
          </ul>
        </div>

        {/* How it works */}
        <div className="space-y-3 bg-slate-800/50 rounded-lg p-4">
          <p className="text-sm font-medium text-slate-300">How it works:</p>
          <ol className="space-y-2 text-sm text-slate-400">
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold flex-shrink-0">
                1
              </span>
              <span>
                Get your IFTTT Webhooks key from{' '}
                <a
                  href="https://ifttt.com/maker_webhooks/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  IFTTT Webhooks settings
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold flex-shrink-0">
                2
              </span>
              <span>Paste your key below to connect</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold flex-shrink-0">
                3
              </span>
              <span>Create applets using the event names below</span>
            </li>
          </ol>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Webhook Key
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={webhookKey}
                onChange={(e) => setWebhookKey(e.target.value)}
                placeholder="Enter your IFTTT webhook key"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                <span className="material-symbols-outlined text-sm">
                  {showKey ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            <button
              onClick={handleConnect}
              disabled={loading || !webhookKey}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Connected state
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/20 p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-sm font-medium text-cyan-400">Connected</span>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-sm text-slate-400 hover:text-red-400 transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Key Display */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
          Webhook Key
        </p>
        <code className="text-sm font-mono text-slate-300">
          {maskKey(connection.accessToken)}
        </code>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-300">
          Available Events
        </p>
        <div className="space-y-2">
          <AnimatePresence>
            {IFTTT_EVENTS.map((event) => {
              const isEnabled = enabledEvents.has(event.name);
              return (
                <motion.div
                  key={event.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleEvent(event.name)}
                      className={`relative w-5 h-5 rounded border transition-colors ${
                        isEnabled
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {isEnabled && (
                        <span className="material-symbols-outlined text-xs text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          check
                        </span>
                      )}
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-300">
                        {event.label}
                      </p>
                      <code className="text-xs text-slate-500">
                        {event.name}
                      </code>
                    </div>
                  </div>
                  <button
                    onClick={() => copyEventName(event.name)}
                    className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                    title="Copy event name"
                  >
                    <span className="material-symbols-outlined text-sm">
                      content_copy
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
        <p className="text-sm text-cyan-300 flex items-start gap-2">
          <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">
            info
          </span>
          <span>
            Use these event names in your IFTTT applets to create custom
            automations for your habits.
          </span>
        </p>
      </div>

      {/* Test Button */}
      <button
        onClick={handleTestEvent}
        disabled={testLoading}
        className="w-full px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 disabled:bg-slate-700 disabled:cursor-not-allowed border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 font-medium rounded-lg transition-colors"
      >
        {testLoading ? 'Sending...' : 'Send Test Event'}
      </button>
    </motion.div>
  );
}
