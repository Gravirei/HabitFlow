import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/AuthContext'
import { useNavigate } from 'react-router-dom'

type UserSessionRow = {
  id: string
  user_id: string
  session_token: string
  ip_address: string | null
  user_agent: string | null
  device_info: any
  is_active: boolean
  last_activity: string
  created_at: string
}

export function SessionManagement() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<UserSessionRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionToken, setCurrentSessionToken] = useState<string | null>(null)

  // Fetch the current Supabase session's access_token so we can identify
  // which row in user_sessions belongs to this device/tab.
  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setCurrentSessionToken(data.session?.access_token ?? null)
    }).catch((e) => {
      if (mounted && e?.name !== 'AbortError') console.error(e)
    })
    return () => { mounted = false }
  }, [])

  const load = async (signal?: AbortSignal) => {
    if (!user) return
    setIsLoading(true)
    try {
      let query = supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_activity', { ascending: false })

      if (signal) {
        query = query.abortSignal(signal)
      }

      const { data, error } = await query

      // Bail out silently if the request was aborted during unmount
      if (signal?.aborted) return

      if (error) throw error
      setSessions((data || []) as UserSessionRow[])
    } catch (e: any) {
      // Ignore abort errors from unmount cleanup
      if (e?.name === 'AbortError' || e?.message?.includes('abort') || signal?.aborted) return
      console.error(e)
      toast.error(e?.message || 'Failed to load sessions')
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [user?.id])

  return (
    <div className="py-4">
      <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">SESSIONS</h3>

      <div className="space-y-3">
        <div className="rounded-lg bg-white dark:bg-card-dark p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-slate-900 dark:text-white font-semibold">Active sessions</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Review devices signed into your account.
              </p>
            </div>
            <button
              type="button"
              onClick={load}
              disabled={isLoading}
              className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-50"
            >
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No active sessions recorded yet.</p>
            ) : (
              sessions.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-slate-900 dark:text-white font-semibold text-sm">
                        {s.device_info?.browser || 'Device'} {s.device_info?.os ? `(${s.device_info.os})` : ''}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Last activity: {new Date(s.last_activity).toLocaleString()}
                      </p>
                      {s.ip_address && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">IP: {s.ip_address}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="rounded-full bg-red-50 dark:bg-red-900/20 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400"
                      onClick={async () => {
                        const isCurrentSession = currentSessionToken !== null && s.session_token === currentSessionToken
                        const confirmed = confirm(
                          isCurrentSession
                            ? 'Log out this device/session? You will be signed out.'
                            : 'Log out this device/session?'
                        )
                        if (!confirmed) return
                        try {
                          // Mark the session as inactive in our records first.
                          const { error } = await supabase
                            .from('user_sessions')
                            .update({ is_active: false })
                            .eq('id', s.id)
                          if (error) throw error

                          if (isCurrentSession) {
                            // Terminating the current session: revoke the JWT by
                            // signing out locally. This clears the refresh token so
                            // it can no longer be used to obtain new access tokens.
                            await supabase.auth.signOut({ scope: 'local' })
                            navigate('/login')
                            return
                          }

                          // Terminating a DIFFERENT device's session:
                          // We can only mark it inactive in our DB here.
                          // True server-side JWT revocation for another session
                          // requires the Supabase Admin API (service-role key),
                          // which must be called from a trusted server/edge
                          // function — never from the client. The session record
                          // is now inactive, so app-level guards (middleware,
                          // RLS policies checking user_sessions) will block it.
                          toast.success('Session ended')
                          await load()
                        } catch (e: any) {
                          console.error(e)
                          toast.error(e?.message || 'Failed to end session')
                        }
                      }}
                    >
                      End
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4">
            <button
              type="button"
              disabled={sessions.length === 0}
              className="w-full rounded-full bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 disabled:opacity-50"
              onClick={async () => {
                const confirmed = confirm('Log out of all devices? You will also be signed out here.')
                if (!confirmed) return

                try {
                  // Mark all active sessions inactive in our records.
                  const { error } = await supabase
                    .from('user_sessions')
                    .update({ is_active: false })
                    .eq('user_id', user!.id)
                    .eq('is_active', true)
                  if (error) throw error

                  // Revoke ALL refresh tokens for this user across every device.
                  // scope: 'global' tells Supabase Auth to invalidate every
                  // refresh token issued to this user, not just the local one.
                  // This is the closest a client-side app can get to true
                  // global JWT revocation without the Admin API.
                  await supabase.auth.signOut({ scope: 'global' })
                  navigate('/login')
                } catch (e: any) {
                  console.error(e)
                  toast.error(e?.message || 'Failed to end sessions')
                }
              }}
            >
              Log out of all devices
            </button>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Note: full session management requires recording sessions server-side.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
