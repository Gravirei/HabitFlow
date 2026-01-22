import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/AuthContext'

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
  const [sessions, setSessions] = useState<UserSessionRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const load = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false })

      if (error) throw error
      setSessions((data || []) as UserSessionRow[])
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Failed to load sessions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
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
                        const confirmed = confirm('Log out this device/session?')
                        if (!confirmed) return
                        try {
                          const { error } = await supabase
                            .from('user_sessions')
                            .update({ is_active: false })
                            .eq('id', s.id)

                          if (error) throw error
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
                const confirmed = confirm('Log out all other devices?')
                if (!confirmed) return

                try {
                  // We do not know the current session id; server-side session tracking is recommended.
                  // As a safe client-side action, end all sessions. User may need to sign in again.
                  const { error } = await supabase.from('user_sessions').update({ is_active: false }).eq('is_active', true)
                  if (error) throw error
                  toast.success('All sessions ended')
                  await load()
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
