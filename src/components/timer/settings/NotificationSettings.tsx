/**
 * NotificationSettings Component
 * Notification configuration section with permission handling
 */

import React, { useState, useEffect } from 'react'
import { useTimerSettings } from '../hooks/useTimerSettings'
import { notificationManager } from '../utils/notificationManager'
import { SettingsSection } from './SettingsSection'
import { ToggleSwitch } from './ToggleSwitch'

export const NotificationSettings: React.FC = () => {
  const { settings, updateSettings } = useTimerSettings()
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default')
  const [isRequesting, setIsRequesting] = useState(false)
  const [showTestFeedback, setShowTestFeedback] = useState(false)

  // Check permission status on mount and when notifications are toggled
  useEffect(() => {
    if (notificationManager.isSupported()) {
      setPermissionStatus(notificationManager.getPermission())
    }
  }, [settings.notificationsEnabled])

  const handleToggle = async (key: keyof typeof settings) => {
    const newValue = !settings[key]
    
    // If enabling notifications, request permission first
    if (key === 'notificationsEnabled' && newValue) {
      setIsRequesting(true)
      const granted = await notificationManager.requestPermission()
      setIsRequesting(false)
      setPermissionStatus(notificationManager.getPermission())
      
      // Only enable if permission granted
      if (granted) {
        updateSettings({ [key]: newValue })
      }
    } else {
      updateSettings({ [key]: newValue })
    }
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ notificationMessage: e.target.value })
  }

  const handleTestNotification = async () => {
    try {
      await notificationManager.showTimerComplete(
        settings.notificationMessage,
        'Countdown',
        300 // 5 minutes example
      )
      setShowTestFeedback(true)
      setTimeout(() => setShowTestFeedback(false), 3000)
    } catch (error) {
      console.error('Failed to show test notification:', error)
    }
  }

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    const granted = await notificationManager.requestPermission()
    setIsRequesting(false)
    setPermissionStatus(notificationManager.getPermission())
    
    if (granted) {
      updateSettings({ notificationsEnabled: true })
    }
  }

  // Get permission status styling
  const getPermissionBadge = () => {
    if (!notificationManager.isSupported()) {
      return {
        color: 'bg-gray-500/20 text-gray-400',
        icon: '⚠️',
        text: 'Not Supported'
      }
    }
    
    switch (permissionStatus) {
      case 'granted':
        return {
          color: 'bg-green-500/20 text-green-400',
          icon: '🟢',
          text: 'Granted'
        }
      case 'denied':
        return {
          color: 'bg-red-500/20 text-red-400',
          icon: '🔴',
          text: 'Denied'
        }
      default:
        return {
          color: 'bg-yellow-500/20 text-yellow-400',
          icon: '🟡',
          text: 'Not Requested'
        }
    }
  }

  const permissionBadge = getPermissionBadge()

  return (
    <SettingsSection
      icon="notifications"
      title="Notifications"
      description="Desktop notifications when timer completes"
      gradient="from-amber-500/10 via-orange-500/10 to-red-500/10"
    >
      {/* Browser Support Warning */}
      {!notificationManager.isSupported() && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <span className="text-sm font-semibold text-red-400">Browser Not Supported</span>
          </div>
          <p className="text-xs text-red-300">
            Your browser doesn't support desktop notifications. Try Chrome, Firefox, Safari, or Edge.
          </p>
        </div>
      )}

      {/* Permission Status Indicator */}
      {notificationManager.isSupported() && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{permissionBadge.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white">Permission Status</p>
                <p className="text-xs text-gray-400">
                  {notificationManager.getPermissionStatusMessage()}
                </p>
              </div>
            </div>
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${permissionBadge.color}`}>
              {permissionBadge.text}
            </span>
          </div>
        </div>
      )}

      {/* Request Permission Button (if needed) */}
      {notificationManager.isSupported() && permissionStatus !== 'granted' && (
        <button
          onClick={handleRequestPermission}
          disabled={isRequesting || permissionStatus === 'denied'}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
            permissionStatus === 'denied'
              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {isRequesting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Requesting...
            </span>
          ) : permissionStatus === 'denied' ? (
            '🔴 Permission Denied - Enable in Browser Settings'
          ) : (
            '🔔 Request Notification Permission'
          )}
        </button>
      )}

      <ToggleSwitch
        enabled={settings.notificationsEnabled}
        onChange={() => handleToggle('notificationsEnabled')}
        label="Enable Notifications"
        description="Show desktop alert when timer completes"
        disabled={!notificationManager.isSupported() || isRequesting}
      />

      <ToggleSwitch
        enabled={settings.showNotificationIcon}
        onChange={() => handleToggle('showNotificationIcon')}
        label="Show icon in navbar"
        description="Display notification icon in timer navbar"
        disabled={!settings.notificationsEnabled}
      />

      {settings.notificationsEnabled && permissionStatus === 'granted' && (
        <>
          {/* Notification Message Input */}
          <div className="p-4 rounded-2xl bg-white/5 space-y-3">
            <label className="text-sm font-semibold text-white">Notification Message</label>
            <input
              type="text"
              value={settings.notificationMessage}
              onChange={handleMessageChange}
              placeholder="Timer Complete!"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-400">
              This message will appear in your notification
            </p>
          </div>

          {/* Test Notification Button */}
          <button
            onClick={handleTestNotification}
            className="w-full py-3 px-4 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 hover:border-white/20"
          >
            {showTestFeedback ? (
              <span className="flex items-center justify-center gap-2">
                ✅ Test notification sent!
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                🔔 Send Test Notification
              </span>
            )}
          </button>
        </>
      )}
    </SettingsSection>
  )
}

NotificationSettings.displayName = 'NotificationSettings'
