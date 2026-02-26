import { useIntegrationStore } from './integrationStore'

const NOTION_AUTH_URL = 'https://api.notion.com/v1/oauth/authorize'
const NOTION_TOKEN_URL = 'https://api.notion.com/v1/oauth/token'
const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

export const notionService = {
  initiateAuth(): void {
    const clientId =
      import.meta.env.VITE_NOTION_CLIENT_ID || 'YOUR_NOTION_CLIENT_ID'
    const redirectUri =
      import.meta.env.VITE_NOTION_REDIRECT_URI ||
      `${window.location.origin}/integrations/callback/notion`
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      owner: 'user',
      state: 'notion',
    })
    window.location.href = `${NOTION_AUTH_URL}?${params.toString()}`
  },

  async exchangeCode(
    code: string
  ): Promise<{ accessToken: string; workspaceId: string }> {
    const clientId =
      import.meta.env.VITE_NOTION_CLIENT_ID || 'YOUR_NOTION_CLIENT_ID'
    const clientSecret =
      import.meta.env.VITE_NOTION_CLIENT_SECRET || 'YOUR_NOTION_CLIENT_SECRET'
    const response = await fetch(NOTION_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri:
          import.meta.env.VITE_NOTION_REDIRECT_URI ||
          `${window.location.origin}/integrations/callback/notion`,
      }),
    })
    if (!response.ok) throw new Error('Failed to exchange code')
    const data = await response.json()
    return { accessToken: data.access_token, workspaceId: data.workspace_id }
  },

  getHeaders(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION,
    }
  },

  async searchDatabases(
    accessToken: string
  ): Promise<Array<{ id: string; title: string }>> {
    const response = await fetch(`${NOTION_API}/search`, {
      method: 'POST',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify({
        filter: { property: 'object', value: 'database' },
      }),
    })
    if (!response.ok) throw new Error('Failed to search databases')
    const data = await response.json()
    return data.results.map((db: any) => ({
      id: db.id,
      title: db.title?.[0]?.plain_text || 'Untitled',
    }))
  },

  async createHabitDatabase(
    accessToken: string,
    parentPageId: string
  ): Promise<string> {
    const response = await fetch(`${NOTION_API}/databases`, {
      method: 'POST',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify({
        parent: { type: 'page_id', page_id: parentPageId },
        title: [{ type: 'text', text: { content: 'HabitFlow - Habits' } }],
        properties: {
          Name: { title: {} },
          Status: {
            select: {
              options: [
                { name: 'Active', color: 'green' },
                { name: 'Completed', color: 'blue' },
                { name: 'Skipped', color: 'red' },
              ],
            },
          },
          Category: { select: {} },
          Frequency: {
            select: {
              options: [
                { name: 'Daily', color: 'green' },
                { name: 'Weekly', color: 'purple' },
                { name: 'Monthly', color: 'blue' },
              ],
            },
          },
          Streak: { number: {} },
          'Last Completed': { date: {} },
          Notes: { rich_text: {} },
        },
      }),
    })
    if (!response.ok) throw new Error('Failed to create database')
    const data = await response.json()
    return data.id
  },

  async exportHabit(
    accessToken: string,
    databaseId: string,
    habit: {
      name: string
      category?: string
      frequency: string
      streak: number
      lastCompleted?: string
      notes?: string
    }
  ): Promise<string> {
    const properties: any = {
      Name: { title: [{ text: { content: habit.name } }] },
      Frequency: {
        select: {
          name:
            habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1),
        },
      },
      Streak: { number: habit.streak },
    }
    if (habit.category)
      properties.Category = { select: { name: habit.category } }
    if (habit.lastCompleted)
      properties['Last Completed'] = { date: { start: habit.lastCompleted } }
    if (habit.notes)
      properties.Notes = { rich_text: [{ text: { content: habit.notes } }] }

    const response = await fetch(`${NOTION_API}/pages`, {
      method: 'POST',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
    })
    if (!response.ok) throw new Error('Failed to export habit')
    const data = await response.json()
    return data.id
  },

  async exportHabits(
    accessToken: string,
    databaseId: string,
    habits: Array<{
      name: string
      category?: string
      frequency: string
      streak: number
      lastCompleted?: string
      notes?: string
    }>
  ): Promise<{ exported: number; errors: string[] }> {
    const errors: string[] = []
    let exported = 0
    for (const habit of habits) {
      try {
        await this.exportHabit(accessToken, databaseId, habit)
        exported++
      } catch {
        errors.push(`Failed to export: ${habit.name}`)
      }
    }
    return { exported, errors }
  },

  async disconnect(): Promise<void> {
    useIntegrationStore.getState().disconnect('notion')
  },
}
