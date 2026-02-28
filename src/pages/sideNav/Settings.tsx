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
type FontSize = 'small' | 'medium' | 'large'
type StartOfWeek = 'sunday' | 'monday' | 'saturday'
type DataRetention = '30' | '90' | '180' | 'forever'
type AutoBackup = 'off' | 'daily' | 'weekly' | 'monthly'
type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh'

const themeIcons: Record<Theme, string> = {
  system: 'desktop_windows',
  light: 'light_mode',
  dark: 'dark_mode',
}

const languageLabels: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  zh: '中文',
}

const startOfWeekLabels: Record<StartOfWeek, string> = {
  sunday: 'Sunday',
  monday: 'Monday',
  saturday: 'Saturday',
}

/* ─── Reusable setting row ──────────────────────────────────────────────────── */
function SettingRow({
  icon,
  iconGradient,
  label,
  description,
  onClick,
  trailing,
}: {
  icon: string
  iconGradient: string
  label: string
  description?: string
  onClick?: () => void
  trailing?: React.ReactNode
}) {
  const Component = onClick ? 'button' : 'div'
  return (
    <Component
      {...(onClick ? { onClick } : {})}
      className={`w-full p-4 flex items-center justify-between transition-colors duration-200 ${
        onClick
          ? 'cursor-pointer hover:bg-white/5 active:bg-white/10'
          : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${iconGradient}`}
        >
          <span className="material-symbols-outlined text-white text-lg">{icon}</span>
        </div>
        <div className="min-w-0 text-left">
          <p className="text-sm font-semibold text-white truncate">{label}</p>
          {description && (
            <p className="text-xs text-slate-400 truncate">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0 ml-3 flex items-center">
        {trailing ?? (
          <span className="material-symbols-outlined text-slate-500 text-xl">
            chevron_right
          </span>
        )}
      </div>
    </Component>
  )
}

/* ─── Divider ───────────────────────────────────────────────────────────────── */
function Divider() {
  return <div className="h-px bg-slate-800/80 mx-4" />
}

/* ─── Toggle switch ─────────────────────────────────────────────────────────── */
function Toggle({
  checked,
  onChange,
  id,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  id: string
  label: string
}) {
  return (
    <label htmlFor={id} className="relative inline-flex cursor-pointer items-center">
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
      <div className="peer h-6 w-11 rounded-full bg-slate-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:duration-200 peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-gray-950" />
    </label>
  )
}

/* ─── Section card wrapper ──────────────────────────────────────────────────── */
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
      {children}
    </div>
  )
}

/* ─── Section heading ───────────────────────────────────────────────────────── */
function SectionHeading({
  children,
  danger,
}: {
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <h2
      className={`text-xs font-bold uppercase tracking-wider mb-3 px-1 ${
        danger
          ? 'text-red-400'
          : 'text-slate-400'
      }`}
    >
      {children}
    </h2>
  )
}

/* ─── Inline selector (pill group) ──────────────────────────────────────────── */
function PillSelector<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  labels?: Record<T, string>
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50 ${
            value === opt
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-slate-800 text-slate-400 border border-transparent hover:text-slate-200'
          }`}
          aria-pressed={value === opt}
        >
          {labels?.[opt] ?? opt}
        </button>
      ))}
    </div>
  )
}

/* ─── Badge ─────────────────────────────────────────────────────────────────── */
function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' }) {
  const colors = {
    default: 'bg-slate-800 text-slate-400',
    success: 'bg-green-900/30 text-green-400',
    warning: 'bg-amber-900/30 text-amber-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors[variant]}`}>
      {children}
    </span>
  )
}

/* ─── Main Settings component ───────────────────────────────────────────────── */
export function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Appearance
  const [theme, setTheme] = useState<Theme>('system')
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [accentColor, setAccentColor] = useState('green')

  // General
  const [language, setLanguage] = useState<Language>('en')
  const [startOfWeek, setStartOfWeek] = useState<StartOfWeek>('monday')
  const [showCompleted, setShowCompleted] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  // Notifications
  const [dailyReminders, setDailyReminders] = useState(true)
  const [reminderTime, _setReminderTime] = useState('9:00 AM')
  const [notificationSound, _setNotificationSound] = useState('Default')
  const [quietHours, setQuietHours] = useState(false)
  const [quietStart, _setQuietStart] = useState('10:00 PM')
  const [quietEnd, _setQuietEnd] = useState('8:00 AM')
  const [streakReminders, setStreakReminders] = useState(true)
  const [weeklySummary, setWeeklySummary] = useState(true)
  const [missedHabitReminders, setMissedHabitReminders] = useState(false)

  // Accessibility
  const [reduceMotion, setReduceMotion] = useState(false)
  const [hapticFeedback, setHapticFeedback] = useState(true)
  const [highContrast, setHighContrast] = useState(false)
  const [screenReader, setScreenReader] = useState(false)

  // Data & Storage
  const [autoBackup, setAutoBackup] = useState<AutoBackup>('weekly')
  const [dataRetention, setDataRetention] = useState<DataRetention>('forever')
  const [analyticsSharing, setAnalyticsSharing] = useState(false)
  const [syncWifiOnly, setSyncWifiOnly] = useState(false)

  // Account
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = async (options: LogoutOptions) => {
    try {
      await logout(options)
      toast.success(options.logoutAllDevices ? 'Logged out from all devices' : 'Logged out')
      navigate('/login')
    } catch (error: any) {
      console.error('Logout error:', error)
      toast.error(error?.message || 'Failed to log out')
      throw error
    }
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Deleting account...')
      navigate('/welcome')
    }
  }

  const handleExportData = () => {
    toast.success('Data export started. You will be notified when ready.')
  }

  const handleImportData = () => {
    toast('Import feature coming soon', { icon: '📂' })
  }

  const handleClearCache = () => {
    if (confirm('Clear all cached data? Your account data will not be affected.')) {
      toast.success('Cache cleared successfully')
    }
  }

  const verified = isEmailVerified(user)

  const accentColors = [
    { name: 'green', class: 'bg-emerald-500' },
    { name: 'blue', class: 'bg-blue-500' },
    { name: 'purple', class: 'bg-violet-500' },
    { name: 'pink', class: 'bg-pink-500' },
    { name: 'orange', class: 'bg-orange-500' },
    { name: 'teal', class: 'bg-teal-500' },
  ]

  return (
    <div className="relative mx-auto flex h-auto min-h-screen w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl flex-col overflow-hidden bg-gray-950 text-slate-50 selection:bg-teal-500/30">
      {/* ── Top App Bar (matches Today page) ──────────────────────────────── */}
      <header className="sticky top-0 z-30 backdrop-blur-sm bg-background-light/95 dark:bg-background-dark/95 shrink-0">
        <div className="flex flex-col gap-2 px-4 pt-4 pb-3 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between">
            {/* Back button */}
            <button
              onClick={() => navigate('/today')}
              aria-label="Go back"
              className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>

            {/* Title */}
            <div className="flex-1 overflow-hidden px-4 text-center">
              <h1 className="text-lg font-bold text-white tracking-tight">Settings</h1>
            </div>

            {/* Action button */}
            <button
              onClick={() => {}}
              aria-label="Search settings"
              className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xl font-bold">search</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-6 pb-safe">
        <div className="max-w-5xl mx-auto space-y-8 pb-8">

          {/* ── Profile Card ───────────────────────────────────────────────── */}
          <section>
            <SectionHeading>Profile</SectionHeading>
            <button
              onClick={() => navigate('/profile')}
              className="group w-full cursor-pointer bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 hover:border-primary/20 hover:shadow-md "
            >
              <div className="relative shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-focus shadow-glow/20">
                  <span className="text-xl font-bold text-white">AM</span>
                </div>
                {verified && (
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 border-2 border-gray-950">
                    <span className="material-symbols-outlined text-white text-[10px]">check</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-white font-semibold truncate">Alex Morgan</p>
                <p className="text-slate-400 text-sm truncate">alex.morgan@example.com</p>
              </div>
              <span className="material-symbols-outlined text-slate-500 text-xl transition-transform duration-200 group-hover:translate-x-0.5">chevron_right</span>
            </button>
          </section>

          {/* ── Grid: 2‑col on lg ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

            {/* ── General ────────────────────────────────────────────────── */}
            <section>
              <SectionHeading>General</SectionHeading>
              <SectionCard>
                <SettingRow
                  icon="language"
                  iconGradient="from-sky-500 to-blue-600"
                  label="Language"
                  description="App display language"
                  onClick={() => {}}
                  trailing={
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-400">{languageLabels[language]}</span>
                      <span className="material-symbols-outlined text-slate-500 text-xl">chevron_right</span>
                    </div>
                  }
                />

                <Divider />

                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500">
                      <span className="material-symbols-outlined text-white text-lg">calendar_today</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Start of Week</p>
                      <p className="text-xs text-slate-400">First day of your week</p>
                    </div>
                  </div>
                  <PillSelector
                    options={['sunday', 'monday', 'saturday'] as StartOfWeek[]}
                    value={startOfWeek}
                    onChange={setStartOfWeek}
                    labels={startOfWeekLabels}
                  />
                </div>

                <Divider />

                <SettingRow
                  icon="check_circle"
                  iconGradient="from-emerald-500 to-green-600"
                  label="Show Completed Habits"
                  description="Display finished habits in Today view"
                  trailing={<Toggle id="show-completed" label="Show completed habits" checked={showCompleted} onChange={setShowCompleted} />}
                />

                <Divider />

                <SettingRow
                  icon="view_compact"
                  iconGradient="from-slate-500 to-slate-700"
                  label="Compact Mode"
                  description="Smaller cards for more density"
                  trailing={<Toggle id="compact-mode" label="Toggle compact mode" checked={compactMode} onChange={setCompactMode} />}
                />
              </SectionCard>
            </section>

            {/* ── Appearance ─────────────────────────────────────────────── */}
            <section>
              <SectionHeading>Appearance</SectionHeading>
              <SectionCard>
                {/* Theme selector */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                      <span className="material-symbols-outlined text-white text-lg">palette</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Theme</p>
                      <p className="text-xs text-slate-400">Choose your appearance</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-800 p-1.5">
                    {(['system', 'light', 'dark'] as Theme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`cursor-pointer flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold capitalize transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50 ${
                          theme === t
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        aria-pressed={theme === t}
                      >
                        <span className="material-symbols-outlined text-base">{themeIcons[t]}</span>
                        <span className="hidden sm:inline">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Divider />

                {/* Accent color */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500">
                      <span className="material-symbols-outlined text-white text-lg">colorize</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Accent Color</p>
                      <p className="text-xs text-slate-400">Customize primary color</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    {accentColors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setAccentColor(c.name)}
                        className={`cursor-pointer w-8 h-8 rounded-full ${c.class} transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50 ${
                          accentColor === c.name
                            ? 'ring-2 ring-offset-2 ring-offset-gray-950 ring-white scale-110'
                            : 'hover:scale-105'
                        }`}
                        aria-label={`Select ${c.name} accent color`}
                        aria-pressed={accentColor === c.name}
                      />
                    ))}
                  </div>
                </div>

                <Divider />

                {/* Font size */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500">
                      <span className="material-symbols-outlined text-white text-lg">format_size</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Font Size</p>
                      <p className="text-xs text-slate-400">Adjust text scaling</p>
                    </div>
                  </div>
                  <PillSelector
                    options={['small', 'medium', 'large'] as FontSize[]}
                    value={fontSize}
                    onChange={setFontSize}
                  />
                </div>

                <Divider />

                <SettingRow
                  icon="apps"
                  iconGradient="from-blue-500 to-cyan-500"
                  label="App Icon"
                  description="Customize your icon"
                  onClick={() => {}}
                />
              </SectionCard>
            </section>

            {/* ── Notifications ──────────────────────────────────────────── */}
            <section>
              <SectionHeading>Notifications</SectionHeading>
              <SectionCard>
                <SettingRow
                  icon="notifications"
                  iconGradient="from-orange-500 to-red-500"
                  label="Daily Reminders"
                  description="Get notified daily"
                  trailing={<Toggle id="daily-reminders" label="Toggle daily reminders" checked={dailyReminders} onChange={setDailyReminders} />}
                />
                <Divider />
                <SettingRow
                  icon="schedule"
                  iconGradient="from-green-500 to-emerald-500"
                  label="Reminder Time"
                  description="When to notify you"
                  onClick={() => {}}
                  trailing={
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-400">{reminderTime}</span>
                      <span className="material-symbols-outlined text-slate-500 text-xl">chevron_right</span>
                    </div>
                  }
                />
                <Divider />
                <SettingRow
                  icon="music_note"
                  iconGradient="from-pink-500 to-rose-500"
                  label="Notification Sound"
                  description="Choose your sound"
                  onClick={() => {}}
                  trailing={
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-400">{notificationSound}</span>
                      <span className="material-symbols-outlined text-slate-500 text-xl">chevron_right</span>
                    </div>
                  }
                />
                <Divider />
                <SettingRow
                  icon="do_not_disturb_on"
                  iconGradient="from-slate-600 to-slate-800"
                  label="Quiet Hours"
                  description={quietHours ? `${quietStart} – ${quietEnd}` : 'Mute during sleep'}
                  trailing={<Toggle id="quiet-hours" label="Toggle quiet hours" checked={quietHours} onChange={setQuietHours} />}
                />
                <Divider />
                <SettingRow
                  icon="local_fire_department"
                  iconGradient="from-amber-500 to-red-500"
                  label="Streak Reminders"
                  description="Protect your streaks"
                  trailing={<Toggle id="streak-reminders" label="Toggle streak reminders" checked={streakReminders} onChange={setStreakReminders} />}
                />
                <Divider />
                <SettingRow
                  icon="summarize"
                  iconGradient="from-teal-500 to-emerald-500"
                  label="Weekly Summary"
                  description="Get a weekly progress report"
                  trailing={<Toggle id="weekly-summary" label="Toggle weekly summary" checked={weeklySummary} onChange={setWeeklySummary} />}
                />
                <Divider />
                <SettingRow
                  icon="notification_important"
                  iconGradient="from-red-500 to-rose-600"
                  label="Missed Habit Alerts"
                  description="Follow-up for incomplete habits"
                  trailing={<Toggle id="missed-reminders" label="Toggle missed habit reminders" checked={missedHabitReminders} onChange={setMissedHabitReminders} />}
                />
              </SectionCard>
            </section>

            {/* ── Data & Storage ──────────────────────────────────────────── */}
            <section>
              <SectionHeading>Data & Storage</SectionHeading>
              <SectionCard>
                <SettingRow
                  icon="cloud_upload"
                  iconGradient="from-blue-500 to-indigo-500"
                  label="Export Data"
                  description="Download your habits & history"
                  onClick={handleExportData}
                />
                <Divider />
                <SettingRow
                  icon="cloud_download"
                  iconGradient="from-cyan-500 to-blue-500"
                  label="Import Data"
                  description="Restore from a backup file"
                  onClick={handleImportData}
                />
                <Divider />
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                      <span className="material-symbols-outlined text-white text-lg">backup</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Auto Backup</p>
                      <p className="text-xs text-slate-400">Automatic cloud backups</p>
                    </div>
                  </div>
                  <PillSelector
                    options={['off', 'daily', 'weekly', 'monthly'] as AutoBackup[]}
                    value={autoBackup}
                    onChange={setAutoBackup}
                  />
                </div>
                <Divider />
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                      <span className="material-symbols-outlined text-white text-lg">history</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Data Retention</p>
                      <p className="text-xs text-slate-400">How long to keep history</p>
                    </div>
                  </div>
                  <PillSelector
                    options={['30', '90', '180', 'forever'] as DataRetention[]}
                    value={dataRetention}
                    onChange={setDataRetention}
                    labels={{ '30': '30 days', '90': '90 days', '180': '180 days', forever: 'Forever' }}
                  />
                </div>
                <Divider />
                <SettingRow
                  icon="wifi"
                  iconGradient="from-sky-500 to-blue-500"
                  label="Sync on Wi-Fi Only"
                  description="Reduce mobile data usage"
                  trailing={<Toggle id="sync-wifi" label="Sync on wifi only" checked={syncWifiOnly} onChange={setSyncWifiOnly} />}
                />
                <Divider />
                <SettingRow
                  icon="analytics"
                  iconGradient="from-pink-500 to-fuchsia-500"
                  label="Anonymous Analytics"
                  description="Help improve the app"
                  trailing={<Toggle id="analytics" label="Toggle analytics sharing" checked={analyticsSharing} onChange={setAnalyticsSharing} />}
                />
                <Divider />
                <SettingRow
                  icon="delete_sweep"
                  iconGradient="from-slate-400 to-slate-600"
                  label="Clear Cache"
                  description="Free up storage space"
                  onClick={handleClearCache}
                  trailing={
                    <div className="flex items-center gap-2">
                      <Badge>24 MB</Badge>
                      <span className="material-symbols-outlined text-slate-500 text-xl">chevron_right</span>
                    </div>
                  }
                />
              </SectionCard>
            </section>

            {/* ── Security ───────────────────────────────────────────────── */}
            <section>
              <SectionHeading>Security</SectionHeading>
              <div className="space-y-3">
                <SectionCard>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
                        <span className="material-symbols-outlined text-white text-lg">verified_user</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white mb-1.5">Email Verification</p>
                        <Badge variant={verified ? 'success' : 'warning'}>
                          <span className="material-symbols-outlined text-xs mr-0.5">{verified ? 'check_circle' : 'warning'}</span>
                          {verified ? 'Verified' : 'Not Verified'}
                        </Badge>
                      </div>
                    </div>
                    {!verified && user?.email && (
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
                        className="w-full mt-4 cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-focus active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                      >
                        Resend Verification Email
                      </button>
                    )}
                  </div>
                </SectionCard>
                <TwoFactorSettings />
                <SessionManagement />
              </div>
            </section>

            {/* ── Accessibility ──────────────────────────────────────────── */}
            <section>
              <SectionHeading>Accessibility</SectionHeading>
              <SectionCard>
                <SettingRow
                  icon="animation"
                  iconGradient="from-fuchsia-500 to-pink-600"
                  label="Reduce Motion"
                  description="Minimize animations"
                  trailing={<Toggle id="reduce-motion" label="Toggle reduce motion" checked={reduceMotion} onChange={setReduceMotion} />}
                />
                <Divider />
                <SettingRow
                  icon="vibration"
                  iconGradient="from-lime-500 to-green-600"
                  label="Haptic Feedback"
                  description="Vibrate on interactions"
                  trailing={<Toggle id="haptic" label="Toggle haptic feedback" checked={hapticFeedback} onChange={setHapticFeedback} />}
                />
                <Divider />
                <SettingRow
                  icon="contrast"
                  iconGradient="from-gray-700 to-gray-900"
                  label="High Contrast"
                  description="Increase text and border contrast"
                  trailing={<Toggle id="high-contrast" label="Toggle high contrast" checked={highContrast} onChange={setHighContrast} />}
                />
                <Divider />
                <SettingRow
                  icon="hearing"
                  iconGradient="from-blue-400 to-blue-600"
                  label="Screen Reader Support"
                  description="Enhanced screen reader hints"
                  trailing={<Toggle id="screen-reader" label="Toggle screen reader support" checked={screenReader} onChange={setScreenReader} />}
                />
              </SectionCard>
            </section>

            {/* ── Account ────────────────────────────────────────────────── */}
            <section>
              <SectionHeading>Account</SectionHeading>
              <SectionCard>
                <SettingRow icon="lock" iconGradient="from-amber-500 to-orange-500" label="Change Password" description="Update your password" onClick={() => {}} />
                <Divider />
                <SettingRow icon="mail" iconGradient="from-blue-500 to-sky-500" label="Change Email" description="Update your email address" onClick={() => {}} />
                <Divider />
                <SettingRow icon="link" iconGradient="from-violet-500 to-purple-500" label="Linked Accounts" description="Google, Apple, GitHub" onClick={() => {}} />
                <Divider />
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full cursor-pointer p-4 flex items-center justify-center gap-2 text-red-400 font-semibold transition-colors duration-200 hover:bg-red-900/10 focus-visible:ring-2 focus-visible:ring-red-500/50"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  Log Out
                </button>
              </SectionCard>
            </section>

            {/* ── Support & About ────────────────────────────────────────── */}
            <section className="lg:col-span-2">
              <SectionHeading>Support & About</SectionHeading>
              <SectionCard>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
                  <SettingRow icon="help" iconGradient="from-teal-500 to-cyan-500" label="Help Center" description="Get support" onClick={() => navigate('/help')} />
                  <SettingRow icon="feedback" iconGradient="from-amber-500 to-yellow-500" label="Send Feedback" description="Share your thoughts" onClick={() => navigate('/feedback')} />
                  <SettingRow icon="share" iconGradient="from-green-500 to-emerald-500" label="Share HabitFlow" description="Invite friends" onClick={() => navigate('/share')} />
                  <SettingRow icon="star" iconGradient="from-yellow-400 to-orange-500" label="Rate the App" description="Leave a review" onClick={() => {}} />
                </div>
              </SectionCard>
            </section>

            {/* ── Legal ──────────────────────────────────────────────────── */}
            <section className="lg:col-span-2">
              <SectionHeading>Legal</SectionHeading>
              <SectionCard>
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
                  <SettingRow icon="shield" iconGradient="from-violet-500 to-purple-500" label="Privacy Policy" description="How we protect you" onClick={() => navigate('/privacy')} />
                  <SettingRow icon="description" iconGradient="from-indigo-500 to-blue-500" label="Terms of Service" description="Our agreement" onClick={() => navigate('/terms')} />
                  <SettingRow icon="license" iconGradient="from-slate-500 to-slate-700" label="Open Source" description="Third-party licenses" onClick={() => {}} />
                </div>
              </SectionCard>
            </section>
          </div>

          {/* ── Danger Zone (centered, outside grid) ────────────────────── */}
          <section className="max-w-md mx-auto w-full">
            <SectionHeading danger>Danger Zone</SectionHeading>
            <button
              onClick={handleDeleteAccount}
              className="w-full cursor-pointer bg-red-500 hover:bg-red-600 rounded-2xl p-4 flex items-center justify-center gap-2 text-white font-bold shadow-lg shadow-red-500/20 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2"
            >
              <span className="material-symbols-outlined text-xl">delete_forever</span>
              Delete Account
            </button>
            <p className="text-xs text-center text-slate-400 mt-2.5 px-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </section>

          {/* ── Version ─────────────────────────────────────────────────── */}
          <div className="text-center pb-2">
            <p className="text-xs text-slate-500">HabitFlow v1.2.3</p>
          </div>
        </div>
      </main>

      {/* Logout dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  )
}
