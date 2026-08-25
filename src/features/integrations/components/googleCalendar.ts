import { useIntegrationStore } from '../store/integrationStore'
import { callOAuthProxy } from '@/lib/security/oauthProxyClient'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
].join(' ')

export const googleCalendarService = {
  /**
   * Initiate OAuth flow to Google Calendar
   */
  initiateAuth(): void {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'
    const redirectUri =
      import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/integrations/callback/google`
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      state: 'google-calendar',
    })
    window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`
  },

  /**
   * Exchange authorization code for access and refresh tokens.
   * Secret-handled token exchange goes through the oauth-token-proxy Edge Function.
   */
  async exchangeCode(
    code: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: string }> {
    const data = await callOAuthProxy({
      provider: 'google-calendar',
      action: 'exchange',
      code,
      redirectUri:
        import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
        `${window.location.origin}/integrations/callback/google`,
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    })
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    }
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: string }> {
    const data = await callOAuthProxy({
      provider: 'google-calendar',
      action: 'refresh',
      refreshToken,
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    })
    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    }
  },

  /**
   * Get authenticated headers for Google Calendar API requests
   */
  getHeaders(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  },

  /**
   * List all available calendars for the authenticated user
   */
  async listCalendars(
    accessToken: string
  ): Promise<Array<{ id: string; summary: string; primary: boolean }>> {
    const response = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList`, {
      headers: this.getHeaders(accessToken),
    })
    if (!response.ok) throw new Error('Failed to fetch calendars')
    const data = await response.json()
    return data.items.map((cal: any) => ({
      id: cal.id,
      summary: cal.summary,
      primary: cal.primary || false,
    }))
  },

  /**
   * Create a calendar event for a habit
   */
  async createHabitEvent(
    accessToken: string,
    calendarId: string,
    habit: {
      name: string
      description?: string
      date: string
      completed: boolean
      color?: string
    }
  ): Promise<string> {
    const event = {
      summary: `${habit.completed ? '✅' : '⬜'} ${habit.name}`,
      description: habit.description || `HabitFlow habit: ${habit.name}`,
      start: { date: habit.date },
      end: { date: habit.date },
      colorId: habit.color || '7', // Teal
      transparency: 'transparent',
    }
    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify(event),
      }
    )
    if (!response.ok) throw new Error('Failed to create calendar event')
    const data = await response.json()
    return data.id
  },

  /**
   * Sync multiple habits to calendar (batch operation)
   */
  async syncHabits(
    accessToken: string,
    calendarId: string,
    habits: Array<{
      name: string
      description?: string
      date: string
      completed: boolean
    }>
  ): Promise<{ synced: number; errors: string[] }> {
    const errors: string[] = []
    let synced = 0
    for (const habit of habits) {
      try {
        await this.createHabitEvent(accessToken, calendarId, habit)
        synced++
      } catch {
        errors.push(`Failed to sync: ${habit.name}`)
      }
    }
    return { synced, errors }
  },

  /**
   * Disconnect from Google Calendar and revoke token
   */
  async disconnect(): Promise<void> {
    const store = useIntegrationStore.getState()
    const connection = store.getConnection('google-calendar')
    if (connection.accessToken) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${connection.accessToken}`, {
          method: 'POST',
        })
      } catch {
        /* ignore revocation errors */
      }
    }
    store.disconnect('google-calendar')
  },
}
