/**
 * OAuth Token Proxy Client
 *
 * Calls the Supabase Edge Function `oauth-token-proxy`, which performs
 * provider token exchange/refresh using server-side client secrets.
 * Client secrets must NEVER be read from import.meta.env in feature code —
 * they are configured via `supabase secrets set`.
 */

export type OAuthProvider = 'google-calendar' | 'notion' | 'spotify' | 'slack'

export interface OAuthProxyRequest {
  provider: OAuthProvider
  action: 'exchange' | 'refresh'
  code?: string
  refreshToken?: string
  redirectUri?: string
  clientId?: string
}

function getFunctionsBaseUrl() {
  const url = import.meta.env.VITE_SUPABASE_URL
  if (!url) throw new Error('Missing VITE_SUPABASE_URL')
  return `${url}/functions/v1`
}

/**
 * Invoke the oauth-token-proxy edge function and return the provider's
 * raw token response (same shape as calling the provider directly).
 */
export async function callOAuthProxy(payload: OAuthProxyRequest): Promise<any> {
  const baseUrl = getFunctionsBaseUrl()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!anonKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY')

  const resp = await fetch(`${baseUrl}/oauth-token-proxy`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(payload),
  })

  const text = await resp.text()
  let json: any
  try {
    json = text ? JSON.parse(text) : undefined
  } catch {
    json = undefined
  }

  if (!resp.ok) {
    const detail = json?.error ? `${json.error}${json.message ? `: ${json.message}` : ''}` : text
    throw new Error(`oauth-token-proxy failed (HTTP ${resp.status}): ${detail}`)
  }

  return json
}
