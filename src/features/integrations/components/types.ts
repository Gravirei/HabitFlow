export type IntegrationProvider = 'google-calendar' | 'notion' | 'slack' | 'spotify' | 'apple-health' | 'google-fit' | 'zapier' | 'ifttt'

export type IntegrationStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'syncing'

export interface IntegrationConfig {
  provider: IntegrationProvider
  name: string
  description: string
  icon: string
  color: string
  darkColor: string
  features: string[]
}

export interface IntegrationConnection {
  provider: IntegrationProvider
  status: IntegrationStatus
  accessToken: string | null
  refreshToken: string | null
  expiresAt: string | null
  connectedAt: string | null
  lastSyncedAt: string | null
  syncEnabled: boolean
  settings: Record<string, unknown>
  error: string | null
}

export interface SyncResult {
  provider: IntegrationProvider
  success: boolean
  itemsSynced: number
  errors: string[]
  timestamp: string
}

// Google Calendar specific
export interface GoogleCalendarSettings {
  calendarId: string
  syncDirection: 'to-calendar' | 'from-calendar' | 'both'
  includeCompletedHabits: boolean
  eventColor: string
  reminderMinutes: number
}

// Notion specific
export interface NotionSettings {
  databaseId: string
  workspaceId: string
  exportHabits: boolean
  exportNotes: boolean
  exportStats: boolean
  templateId: string
}

// Slack specific
export interface SlackChannel {
  id: string;
  name: string;
  is_member: boolean;
  is_private: boolean;
}

export interface SlackSettings {
  channelId: string;
  channelName: string;
  notifyOnCompletion: boolean;
  notifyOnStreak: boolean;
  dailySummary: boolean;
  dailySummaryTime: string // HH:mm
  webhookUrl: string;
}

// Spotify specific
export interface SpotifySettings {
  playlistId: string
  playlistName: string
  autoPlayOnTimer: boolean
  pauseOnTimerPause: boolean
  preferredGenres: string[]
  volume: number
}

export const INTEGRATION_CONFIGS: IntegrationConfig[] = [
  {
    provider: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync your habits with Google Calendar events',
    icon: 'calendar_month',
    color: 'bg-blue-500',
    darkColor: 'dark:bg-blue-600',
    features: [
      'Auto-create calendar events for habits',
      'Two-way sync support',
      'Custom event colors and reminders',
      'Sync completed habit status',
    ],
  },
  {
    provider: 'notion',
    name: 'Notion',
    description: 'Export habits and notes to Notion databases',
    icon: 'description',
    color: 'bg-slate-800',
    darkColor: 'dark:bg-slate-600',
    features: [
      'Export habits as Notion database entries',
      'Sync notes and progress',
      'Custom database templates',
      'Auto-update statistics',
    ],
  },
  {
    provider: 'slack',
    name: 'Slack',
    description: 'Get habit reminders and notifications in Slack',
    icon: 'chat',
    color: 'bg-purple-500',
    darkColor: 'dark:bg-purple-600',
    features: [
      'Habit completion notifications',
      'Streak milestone alerts',
      'Daily habit summaries',
      'Channel-specific notifications',
    ],
  },
  {
    provider: 'spotify',
    name: 'Spotify',
    description: 'Play focus playlists during timer sessions',
    icon: 'music_note',
    color: 'bg-green-600',
    darkColor: 'dark:bg-green-700',
    features: [
      'Auto-play focus playlists on timer start',
      'Pause music when timer pauses',
      'Browse curated focus playlists',
      'Volume control integration',
    ],
  },
  {
    provider: 'apple-health',
    name: 'Apple Health',
    description: 'Sync health habits with Apple Health data',
    icon: 'favorite',
    color: 'bg-red-500',
    darkColor: 'dark:bg-red-600',
    features: [
      'Sync health & fitness habits automatically',
      'Track steps, sleep, and mindfulness',
      'Import health data as habit completions',
      'Export habit streaks to Apple Health',
    ],
  },
  {
    provider: 'google-fit',
    name: 'Google Fit',
    description: 'Track fitness habits automatically with Google Fit',
    icon: 'fitness_center',
    color: 'bg-green-500',
    darkColor: 'dark:bg-green-600',
    features: [
      'Auto-track fitness habits from Google Fit',
      'Sync steps, workouts, and activities',
      'Set fitness-based habit goals',
      'View combined health analytics',
    ],
  },
  {
    provider: 'zapier',
    name: 'Zapier',
    description: 'Connect HabitFlow with 5000+ apps via Zapier',
    icon: 'bolt',
    color: 'bg-orange-500',
    darkColor: 'dark:bg-orange-600',
    features: [
      'Trigger Zaps on habit completion',
      'Connect with 5000+ apps',
      'Create automated workflows',
      'Custom webhook triggers',
    ],
  },
  {
    provider: 'ifttt',
    name: 'IFTTT',
    description: 'Create automated habit workflows with IFTTT',
    icon: 'device_hub',
    color: 'bg-cyan-500',
    darkColor: 'dark:bg-cyan-600',
    features: [
      'Create habit automation applets',
      'Trigger actions on habit events',
      'Connect with smart home devices',
      'Custom webhook integration',
    ],
  },
]
