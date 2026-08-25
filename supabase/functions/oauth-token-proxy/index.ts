/// <reference lib="deno.ns" />

/**
 * OAuth Token Proxy
 *
 * Performs OAuth2 authorization-code exchange and token refresh for the
 * integration providers (Google Calendar, Notion, Spotify, Slack) using
 * server-side client secrets. Secrets NEVER ship in the frontend bundle —
 * set them via Supabase Edge Function secrets:
 *
 *   supabase secrets set GOOGLE_CLIENT_SECRET=... NOTION_CLIENT_SECRET=...
 *                        SPOTIFY_CLIENT_SECRET=... SLACK_CLIENT_SECRET=...
 *
 * Optional server-side client-id overrides (fallback: value sent by client):
 *   GOOGLE_CLIENT_ID, NOTION_CLIENT_ID, SPOTIFY_CLIENT_ID, SLACK_CLIENT_ID
 *
 * Request: POST { provider, action, code?, refreshToken?, redirectUri?, clientId? }
 *   - provider: 'google-calendar' | 'notion' | 'spotify' | 'slack'
 *     (google-calendar shares the Google OAuth client with Google Fit)
 *   - action:   'exchange' | 'refresh' (refresh: google-calendar & spotify only —
 *               notion/slack issue long-lived tokens)
 * Response:   the provider's token response JSON, passed through verbatim.
 */

type Json = Record<string, unknown>

type Provider = 'google-calendar' | 'notion' | 'spotify' | 'slack'

interface ProxyRequest {
  provider: Provider
  action: 'exchange' | 'refresh'
  code?: string
  refreshToken?: string
  redirectUri?: string
  clientId?: string
}

/**
 * Returns the allowed CORS origins based on APP_BASE_URL env var.
 * Mirrors auth-gateway so both functions accept the same origins.
 */
function getAllowedOrigins(): string[] {
  const appBaseUrl = Deno.env.get('APP_BASE_URL') ?? ''
  const origins: string[] = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    // Capacitor Android/iOS WebView uses https://localhost as origin
    'https://localhost',
  ]
  if (appBaseUrl && !appBaseUrl.includes('localhost') && !appBaseUrl.includes('127.0.0.1')) {
    const normalized = appBaseUrl.replace(/\/$/, '')
    if (!origins.includes(normalized)) origins.push(normalized)
  }
  return origins
}

function getCorsOrigin(req: Request): string {
  const origin = req.headers.get('origin') ?? ''
  const allowed = getAllowedOrigins()
  return allowed.includes(origin) ? origin : allowed[0]
}

function json(data: Json, status = 200, req?: Request) {
  const origin = req ? getCorsOrigin(req) : getAllowedOrigins()[0]
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': origin,
      'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
      vary: 'Origin',
    },
  })
}

/**
 * Env-var prefix for a provider's secrets. google-calendar shares the
 * Google OAuth client (same credentials as Google Fit), so it uses the
 * plain GOOGLE_ prefix — matching .env.example and the docs.
 */
function envPrefix(provider: Provider): string {
  return provider === 'google-calendar' ? 'GOOGLE' : provider.toUpperCase()
}

function requireSecret(provider: Provider): string {
  const key = `${envPrefix(provider)}_CLIENT_SECRET`
  const secret = Deno.env.get(key)
  if (!secret) {
    throw new Error(`${key} not configured — run: supabase secrets set ${key}=<value>`)
  }
  return secret
}

function resolveClientId(provider: Provider, fromRequest?: string): string {
  const key = `${envPrefix(provider)}_CLIENT_ID`
  const configured = Deno.env.get(key)
  if (!configured && !fromRequest) {
    throw new Error(`${key} not configured and no clientId provided in request`)
  }
  return configured ?? String(fromRequest)
}

async function exchangeProviderToken(body: ProxyRequest): Promise<Response> {
  const clientId = resolveClientId(body.provider, body.clientId)
  const secret = requireSecret(body.provider)

  switch (body.provider) {
    case 'google-calendar': {
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: secret,
      })
      if (body.action === 'exchange') {
        params.set('code', String(body.code))
        params.set('redirect_uri', String(body.redirectUri))
        params.set('grant_type', 'authorization_code')
      } else {
        params.set('refresh_token', String(body.refreshToken))
        params.set('grant_type', 'refresh_token')
      }
      return fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })
    }

    case 'notion': {
      // Notion issues long-lived tokens; only the initial exchange exists.
      return fetch('https://api.notion.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: String(body.code),
          redirect_uri: String(body.redirectUri),
        }),
      })
    }

    case 'spotify': {
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: secret,
      })
      if (body.action === 'exchange') {
        params.set('code', String(body.code))
        params.set('redirect_uri', String(body.redirectUri))
        params.set('grant_type', 'authorization_code')
      } else {
        params.set('refresh_token', String(body.refreshToken))
        params.set('grant_type', 'refresh_token')
      }
      return fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })
    }

    case 'slack': {
      // Slack bot tokens are non-expiring; only the initial exchange exists.
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: secret,
        code: String(body.code),
        redirect_uri: String(body.redirectUri),
      })
      return fetch('https://slack.com/api/oauth.v2.access', {
        method: 'POST',
        body: params,
      })
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': getCorsOrigin(req),
        'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
        'access-control-allow-methods': 'POST, OPTIONS',
        vary: 'Origin',
      },
    })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace(/^\/+/, '')
    if (!path.startsWith('oauth-token-proxy')) {
      return json({ error: 'not_found' }, 404, req)
    }
    if (req.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405, req)
    }

    const body = (await req.json().catch(() => ({}) as Json)) as ProxyRequest

    if (
      !body.provider ||
      !['google-calendar', 'notion', 'spotify', 'slack'].includes(body.provider)
    ) {
      return json({ error: 'invalid_provider' }, 400, req)
    }
    if (!body.action || !['exchange', 'refresh'].includes(body.action)) {
      return json({ error: 'invalid_action' }, 400, req)
    }
    // Notion integration tokens and Slack bot tokens are long-lived — no refresh flow.
    const REFRESH_PROVIDERS = ['google-calendar', 'spotify']
    if (body.action === 'refresh' && !REFRESH_PROVIDERS.includes(body.provider)) {
      return json(
        { error: 'refresh_not_supported', message: `${body.provider} tokens are long-lived` },
        400,
        req
      )
    }
    if (body.action === 'exchange' && !body.code) {
      return json({ error: 'code_required' }, 400, req)
    }
    if (body.action === 'refresh' && !body.refreshToken) {
      return json({ error: 'refresh_token_required' }, 400, req)
    }
    if (body.action === 'exchange' && !body.redirectUri) {
      return json({ error: 'redirect_uri_required' }, 400, req)
    }

    const upstream = await exchangeProviderToken(body)
    const data = await upstream.json()

    // Pass the provider response through verbatim so client parsing stays
    // identical to the previous direct-call implementation.
    return json(data, upstream.status, req)
  } catch (e) {
    console.error(e)
    return json({ error: 'server_error', message: String((e as Error)?.message ?? e) }, 500, req)
  }
})
