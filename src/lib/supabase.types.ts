/**
 * Supabase Database type augmentation.
 *
 * Hand-rolled from the SQL migrations under `supabase/migrations/`. To
 * regenerate against a live project, run:
 *
 *   supabase gen types typescript --project-id <id> \
 *     > src/lib/supabase.types.ts
 *
 * and diff — the structure should match this file. This type is wired into
 * `createClient<Database>()` in `src/lib/supabase.ts` so every `.from(...)`
 * call is type-checked against the actual columns.
 *
 * Conventions:
 *   - `Row` = shape returned by SELECT
 *   - `Insert` = shape accepted by INSERT (required + optional)
 *   - `Update` = shape accepted by UPDATE (everything optional)
 *   - `Relationships` = foreign-key graph
 *   - Timestamps: `string` (ISO 8601 from Postgres TIMESTAMPTZ)
 *   - JSONB: kept loose as `Json` unless the column has a known shape
 */

/**
 * Permissive JSON type. `unknown` so domain types like `Lap[]` and
 * `DeviceInfo` are assignable without explicit casts. Use `as Json` only
 * when you need a structural guarantee.
 */
export type Json = unknown

// ── timer_sessions ──────────────────────────────────────────────────────
type TimerSessionRow = {
  id: string
  user_id: string
  created_at: string
  mode: 'Stopwatch' | 'Countdown' | 'Intervals'
  duration: number
  session_timestamp: string
  start_time: string | null
  session_name: string | null
  lap_count: number | null
  best_lap: number | null
  laps: Json
  target_duration: number | null
  completed: boolean | null
  interval_count: number | null
  completed_loops: number | null
  work_duration: number | null
  break_duration: number | null
  target_loop_count: number | null
  local_id: string
  synced_at: string | null
  updated_at: string | null
}
type TimerSessionInsert = {
  id?: string
  user_id: string
  created_at?: string
  mode: TimerSessionRow['mode']
  duration: number
  session_timestamp: string
  start_time?: string | null
  session_name?: string | null
  lap_count?: number | null
  best_lap?: number | null
  laps?: Json
  target_duration?: number | null
  completed?: boolean | null
  interval_count?: number | null
  completed_loops?: number | null
  work_duration?: number | null
  break_duration?: number | null
  target_loop_count?: number | null
  local_id: string
  synced_at?: string | null
  updated_at?: string | null
}
type TimerSessionUpdate = Partial<TimerSessionInsert>

// ── timer_sessions_archive ─────────────────────────────────────────────
type TimerSessionArchiveRow = TimerSessionRow
type TimerSessionArchiveInsert = TimerSessionInsert
type TimerSessionArchiveUpdate = TimerSessionUpdate

// ── timer_daily_stats ───────────────────────────────────────────────────
type TimerDailyStatsRow = {
  id: string
  user_id: string
  date: string
  mode: 'Stopwatch' | 'Countdown' | 'Intervals'
  session_count: number
  total_duration: number
  avg_duration: number | null
  max_duration: number | null
  completed_count: number | null
  total_intervals: number | null
  created_at: string | null
  updated_at: string | null
}
type TimerDailyStatsInsert = Omit<TimerDailyStatsRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string | null
  updated_at?: string | null
}
type TimerDailyStatsUpdate = Partial<TimerDailyStatsInsert>

// ── login_attempts ──────────────────────────────────────────────────────
type LoginAttemptsRow = {
  id: string
  action: string
  email: string
  ip_address: string
  user_agent: string
  success: boolean
  user_id: string | null
  created_at: string
}
type LoginAttemptsInsert = {
  id?: string
  action: string
  email: string
  ip_address?: string
  user_agent?: string
  success?: boolean
  user_id?: string | null
  created_at?: string
}
type LoginAttemptsUpdate = Partial<LoginAttemptsInsert>

// ── account_lockouts ────────────────────────────────────────────────────
type AccountLockoutsRow = {
  id: string
  email: string
  user_id: string | null
  reason: string | null
  locked_until: string | null
  is_locked: boolean
  created_at: string
}
type AccountLockoutsInsert = {
  id?: string
  email: string
  user_id?: string | null
  reason?: string | null
  locked_until?: string | null
  is_locked?: boolean
  created_at?: string
}
type AccountLockoutsUpdate = Partial<AccountLockoutsInsert>

// ── login_activity ──────────────────────────────────────────────────────
type LoginActivityRow = {
  id: string
  user_id: string
  email: string
  ip_address: string
  user_agent: string
  device_info: Json
  location: Json | null
  login_type: 'password' | '2fa' | 'magic_link' | 'oauth'
  created_at: string
}
type LoginActivityInsert = {
  id?: string
  user_id: string
  email: string
  ip_address?: string
  user_agent?: string
  device_info?: Json
  location?: Json | null
  login_type?: LoginActivityRow['login_type']
  created_at?: string
}
type LoginActivityUpdate = Partial<LoginActivityInsert>

// ── user_sessions ───────────────────────────────────────────────────────
type UserSessionsRow = {
  id: string
  user_id: string
  session_token: string
  ip_address: string
  user_agent: string
  device_info: Json
  is_active: boolean
  last_activity: string
  expires_at: string
  created_at: string
}
type UserSessionsInsert = {
  id?: string
  user_id: string
  session_token: string
  ip_address?: string
  user_agent?: string
  device_info?: Json
  is_active?: boolean
  last_activity?: string
  expires_at: string
  created_at?: string
}
type UserSessionsUpdate = Partial<UserSessionsInsert>

// ── trusted_devices ─────────────────────────────────────────────────────
type TrustedDevicesRow = {
  id: string
  user_id: string
  device_id: string
  device_name: string
  device_info: Json
  ip_address: string
  is_trusted: boolean
  last_used: string
  created_at: string
}
type TrustedDevicesInsert = {
  id?: string
  user_id: string
  device_id: string
  device_name?: string
  device_info?: Json
  ip_address?: string
  is_trusted?: boolean
  last_used?: string
  created_at?: string
}
type TrustedDevicesUpdate = Partial<TrustedDevicesInsert>

// ── conversations ───────────────────────────────────────────────────────
type ConversationsRow = {
  id: string
  type: 'direct' | 'group'
  name: string | null
  avatar_url: string | null
  created_by: string
  created_at: string
  updated_at: string
}
type ConversationsInsert = {
  id?: string
  type?: ConversationsRow['type']
  name?: string | null
  avatar_url?: string | null
  created_by: string
  created_at?: string
  updated_at?: string
}
type ConversationsUpdate = Partial<ConversationsInsert>

// ── conversation_members ────────────────────────────────────────────────
type ConversationMembersRow = {
  id: string
  conversation_id: string
  user_id: string
  joined_at: string
  is_muted: boolean
  is_pinned: boolean
  last_read_at: string | null
}
type ConversationMembersInsert = {
  id?: string
  conversation_id: string
  user_id: string
  joined_at?: string
  is_muted?: boolean
  is_pinned?: boolean
  last_read_at?: string | null
}
type ConversationMembersUpdate = Partial<ConversationMembersInsert>

// ── messages ────────────────────────────────────────────────────────────
type MessagesRow = {
  id: string
  conversation_id: string
  sender_id: string
  type: 'text' | 'habit_card' | 'badge_card' | 'xp_card' | 'nudge' | 'system'
  text: string | null
  card_payload: Json | null
  is_deleted: boolean
  delivered_at: string | null
  read_at: string | null
  created_at: string
}
type MessagesInsert = {
  id?: string
  conversation_id: string
  sender_id: string
  type?: MessagesRow['type']
  text?: string | null
  card_payload?: Json | null
  is_deleted?: boolean
  delivered_at?: string | null
  read_at?: string | null
  created_at?: string
}
type MessagesUpdate = Partial<MessagesInsert>

// ── message_reactions ───────────────────────────────────────────────────
type MessageReactionsRow = {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}
type MessageReactionsInsert = {
  id?: string
  message_id: string
  user_id: string
  emoji: string
  created_at?: string
}
type MessageReactionsUpdate = Partial<MessageReactionsInsert>

// ── push_subscriptions ──────────────────────────────────────────────────
type PushSubscriptionsRow = {
  id: string
  user_id: string
  endpoint: string
  p256dh_key: string
  auth_key: string
  device_info: Json | null
  created_at: string
  updated_at: string
}
type PushSubscriptionsInsert = {
  id?: string
  user_id: string
  endpoint: string
  p256dh_key: string
  auth_key: string
  device_info?: Json | null
  created_at?: string
  updated_at?: string
}
type PushSubscriptionsUpdate = Partial<PushSubscriptionsInsert>

// ── user_timer_stats (view) ─────────────────────────────────────────────
type UserTimerStatsRow = {
  user_id: string
  mode: 'Stopwatch' | 'Countdown' | 'Intervals'
  total_sessions: number
  total_duration_seconds: number
  avg_duration_seconds: number
  max_duration_seconds: number
  sessions_last_7_days: number
  sessions_last_30_days: number
  last_session_at: string | null
}

// ── Public Database shape ───────────────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      timer_sessions: {
        Row: TimerSessionRow
        Insert: TimerSessionInsert
        Update: TimerSessionUpdate
        Relationships: []
      }
      timer_sessions_archive: {
        Row: TimerSessionArchiveRow
        Insert: TimerSessionArchiveInsert
        Update: TimerSessionArchiveUpdate
        Relationships: []
      }
      timer_daily_stats: {
        Row: TimerDailyStatsRow
        Insert: TimerDailyStatsInsert
        Update: TimerDailyStatsUpdate
        Relationships: []
      }
      login_attempts: {
        Row: LoginAttemptsRow
        Insert: LoginAttemptsInsert
        Update: LoginAttemptsUpdate
        Relationships: []
      }
      account_lockouts: {
        Row: AccountLockoutsRow
        Insert: AccountLockoutsInsert
        Update: AccountLockoutsUpdate
        Relationships: []
      }
      login_activity: {
        Row: LoginActivityRow
        Insert: LoginActivityInsert
        Update: LoginActivityUpdate
        Relationships: []
      }
      user_sessions: {
        Row: UserSessionsRow
        Insert: UserSessionsInsert
        Update: UserSessionsUpdate
        Relationships: []
      }
      trusted_devices: {
        Row: TrustedDevicesRow
        Insert: TrustedDevicesInsert
        Update: TrustedDevicesUpdate
        Relationships: []
      }
      conversations: {
        Row: ConversationsRow
        Insert: ConversationsInsert
        Update: ConversationsUpdate
        Relationships: []
      }
      conversation_members: {
        Row: ConversationMembersRow
        Insert: ConversationMembersInsert
        Update: ConversationMembersUpdate
        Relationships: []
      }
      messages: {
        Row: MessagesRow
        Insert: MessagesInsert
        Update: MessagesUpdate
        Relationships: []
      }
      message_reactions: {
        Row: MessageReactionsRow
        Insert: MessageReactionsInsert
        Update: MessageReactionsUpdate
        Relationships: []
      }
      push_subscriptions: {
        Row: PushSubscriptionsRow
        Insert: PushSubscriptionsInsert
        Update: PushSubscriptionsUpdate
        Relationships: []
      }
    }
    Views: {
      user_timer_stats: {
        Row: UserTimerStatsRow
        Relationships: []
      }
    }
    Functions: {
      // RPCs exposed by the migrations (e.g. archive_old_timer_sessions).
      // Add typed RPC surfaces here as you wire `.rpc('name', args)` calls.
      archive_old_timer_sessions: {
        Args: { retention_days?: number }
        Returns: number
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
