import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { logout } from '@/lib/auth/logout'
import { LogoutConfirmDialog, type LogoutOptions } from '@/components/auth/LogoutConfirmDialog'
import { TwoFactorSettings } from '@/components/auth/TwoFactorSettings'
import { SessionManagement } from '@/components/auth/SessionManagement'
import { useAuth } from '@/lib/auth/AuthContext'
import { isEmailVerified } from '@/lib/auth/AuthContext'
import { supabase } from '@/lib/supabase'

type Theme = 'system' | 'light' | 'dark'

export function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [theme, setTheme] = useState<Theme>('system')
  const [dailyReminders, setDailyReminders] = useState(true)
  const [reminderTime, _setReminderTime] = useState('9:00 AM')
  const [notificationSound, _setNotificationSound] = useState('Default')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = async (options: LogoutOptions) => {
    try {
      await logout(options)
      toast.success(options.logoutAllDevices ? 'Logged out from all devices' : 'Logged out')
      navigate('/login')
    } catch (error: any) {
      console.error('Logout error:', error)
      toast.error(error?.message || 'Failed to log out')
      throw error // Re-throw to let the dialog handle loading state
    }
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion
      console.log('Deleting account...')
      navigate('/welcome')
    }
  }

  return (
    <div className="relative flex h-screen w-full max-w-md mx-auto flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Simple Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-safe px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex size-10 items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 active:scale-95 transition-all touch-manipulation hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <div className="size-10" />
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-safe">
        {/* Profile Section */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">
            Profile
          </h2>
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4 active:scale-[0.98] transition-all touch-manipulation"
          >
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-focus">
                <span className="text-xl font-bold text-white">AM</span>
              </div>
              {isEmailVerified(user) && (
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 border-2 border-white dark:border-slate-900">
                  <span className="material-symbols-outlined text-white text-xs">check</span>
                </div>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-slate-900 dark:text-white font-semibold">Alex Morgan</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">alex.morgan@example.com</p>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </button>
        </section>
        {/* Appearance Section */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">
            Appearance
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Theme Selector - Enhanced */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <span className="material-symbols-outlined text-white text-xl">palette</span>
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-semibold">Theme</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Choose your appearance</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-1.5">
                {(['system', 'light', 'dark'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all touch-manipulation capitalize ${
                      theme === t
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md scale-105'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* App Icon */}
            <button className="w-full p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors touch-manipulation">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <span className="material-symbols-outlined text-white text-xl">apps</span>
                </div>
                <div className="text-left">
                  <p className="text-slate-900 dark:text-white font-semibold">App Icon</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Customize your icon</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">
            Notifications
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Daily Reminders Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                  <span className="material-symbols-outlined text-white text-xl">notifications</span>
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">Daily Reminders</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Get notified daily</p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={dailyReminders}
                  onChange={(e) => setDailyReminders(e.target.checked)}
                />
                <div className="peer h-7 w-12 rounded-full bg-slate-300 dark:bg-slate-700 after:absolute after:left-[3px] after:top-[3px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-md after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-5"></div>
              </label>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Reminder Time */}
            <button className="w-full p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors touch-manipulation">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <span className="material-symbols-outlined text-white text-xl">schedule</span>
                </div>
                <div className="text-left">
                  <p className="text-slate-900 dark:text-white font-semibold">Reminder Time</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">When to notify you</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{reminderTime}</span>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </div>
            </button>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Notification Sound */}
            <button className="w-full p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors touch-manipulation">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
                  <span className="material-symbols-outlined text-white text-xl">music_note</span>
                </div>
                <div className="text-left">
                  <p className="text-slate-900 dark:text-white font-semibold">Notification Sound</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Choose your sound</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{notificationSound}</span>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </div>
            </button>
          </div>
        </section>

        {/* Security Section */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">
            Security
          </h2>
          <div className="space-y-3">
            {/* Email Verification Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
                  <span className="material-symbols-outlined text-white text-xl">verified_user</span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 dark:text-white font-semibold mb-1">Email Verification</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isEmailVerified(user) 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    }`}>
                      <span className="material-symbols-outlined text-xs">
                        {isEmailVerified(user) ? 'check_circle' : 'warning'}
                      </span>
                      {isEmailVerified(user) ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
              </div>

              {!isEmailVerified(user) && user?.email && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const { error } = await supabase.auth.resend({ type: 'signup', email: user.email! })
                      if (error) throw error
                      toast.success('Verification email resent')
                    } catch (e: any) {
                      console.error(e)
                      toast.error(e?.message || 'Failed to resend verification email')
                    }
                  }}
                  className="w-full mt-3 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-focus active:scale-[0.98] transition-all"
                >
                  Resend Verification Email
                </button>
              )}
            </div>

            <TwoFactorSettings />
            <SessionManagement />
          </div>
        </section>

        {/* Account Section */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">
            Account
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Change Password */}
            <button className="w-full p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors touch-manipulation">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                  <span className="material-symbols-outlined text-white text-xl">lock</span>
                </div>
                <div className="text-left">
                  <p className="text-slate-900 dark:text-white font-semibold">Change Password</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Update your password</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Log Out */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full p-4 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-semibold active:bg-red-50 dark:active:bg-red-900/20 transition-colors touch-manipulation"
            >
              <span className="material-symbols-outlined">logout</span>
              Log Out
            </button>
          </div>
        </section>

        {/* Logout Confirmation Dialog */}
        <LogoutConfirmDialog
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
        />

        {/* Support & Privacy Section */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">
            Support & Privacy
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Help Center */}
            <button className="w-full p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors touch-manipulation">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500">
                  <span className="material-symbols-outlined text-white text-xl">help</span>
                </div>
                <div className="text-left">
                  <p className="text-slate-900 dark:text-white font-semibold">Help Center</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Get support</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Privacy Policy */}
            <button className="w-full p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors touch-manipulation">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
                  <span className="material-symbols-outlined text-white text-xl">shield</span>
                </div>
                <div className="text-left">
                  <p className="text-slate-900 dark:text-white font-semibold">Privacy Policy</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">How we protect you</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            {/* Terms of Service */}
            <button className="w-full p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors touch-manipulation">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500">
                  <span className="material-symbols-outlined text-white text-xl">description</span>
                </div>
                <div className="text-left">
                  <p className="text-slate-900 dark:text-white font-semibold">Terms of Service</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Our agreement</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-red-500 dark:text-red-400 mb-3 px-1">
            Danger Zone
          </h2>
          <button
            onClick={handleDeleteAccount}
            className="w-full bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-4 flex items-center justify-center gap-2 text-white font-bold shadow-lg shadow-red-500/30 active:scale-[0.98] transition-all touch-manipulation"
          >
            <span className="material-symbols-outlined">delete_forever</span>
            Delete Account
          </button>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 px-4">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
        </section>

        {/* Version Footer */}
        <div className="pb-8 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">Version 1.2.3</p>
        </div>
      </main>
    </div>
  )
}
