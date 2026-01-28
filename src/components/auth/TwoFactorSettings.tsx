import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import DOMPurify from 'dompurify'
import { challengeFactor, enrollTotp, listFactors, unenrollFactor, verifyFactor } from '@/lib/auth/mfa'

export function TwoFactorSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [factors, setFactors] = useState<any[]>([])

  // Enrollment state
  const [enrollData, setEnrollData] = useState<null | {
    factorId: string
    qr_code: string
    secret: string
  }>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [code, setCode] = useState('')

  const refresh = async () => {
    try {
      const totpFactors = await listFactors()
      setFactors(totpFactors)
    } catch (e: any) {
      console.error(e)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const hasTotp = factors.length > 0

  return (
    <div className="py-4">
      <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">SECURITY</h3>

      <div className="space-y-3">
        <div className="rounded-lg bg-white dark:bg-card-dark p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-slate-900 dark:text-white font-semibold">Two-factor authentication (2FA)</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Add an extra layer of protection using an authenticator app (TOTP).
              </p>
              <p className="mt-2 text-sm">
                Status:{' '}
                <span className={hasTotp ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-600 dark:text-slate-300'}>
                  {hasTotp ? 'Enabled' : 'Not enabled'}
                </span>
              </p>
            </div>

            {hasTotp ? (
              <button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  const confirmed = confirm('Disable 2FA on this account?')
                  if (!confirmed) return

                  setIsLoading(true)
                  try {
                    // Supabase allows multiple factors; remove all TOTP factors
                    for (const f of factors) {
                      await unenrollFactor(f.id)
                    }
                    toast.success('2FA disabled')
                    setEnrollData(null)
                    setChallengeId(null)
                    setCode('')
                    await refresh()
                  } catch (e: any) {
                    console.error(e)
                    toast.error(e?.message || 'Failed to disable 2FA')
                  } finally {
                    setIsLoading(false)
                  }
                }}
                className="rounded-full bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400"
              >
                Disable
              </button>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true)
                  try {
                    const enrolled = await enrollTotp('HabitFlow')
                    const factorId = enrolled.id

                    // Challenge the factor so user can verify code
                    const challenge = await challengeFactor(factorId)

                    setEnrollData({
                      factorId,
                      qr_code: enrolled.totp.qr_code,
                      secret: enrolled.totp.secret,
                    })
                    setChallengeId(challenge.id)
                    toast.success('Scan the QR code with your authenticator app')
                  } catch (e: any) {
                    console.error(e)
                    toast.error(e?.message || 'Failed to start 2FA setup')
                  } finally {
                    setIsLoading(false)
                  }
                }}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-focus"
              >
                Enable
              </button>
            )}
          </div>

          {enrollData && !hasTotp && (
            <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-900 p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold mb-2">Step 1: Scan QR code</p>
              <div className="flex items-center justify-center rounded-lg bg-white p-3">
                {/* Supabase returns SVG string in qr_code - sanitized to prevent XSS */}
                <div
                  className="w-40 h-40"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(enrollData.qr_code, { USE_PROFILES: { svg: true, svgFilters: true } }) }}
                />
              </div>

              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Or manually enter this secret: <span className="font-mono">{enrollData.secret}</span>
              </p>

              <div className="mt-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold mb-2">Step 2: Enter 6-digit code</p>
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    inputMode="numeric"
                    className="flex-1 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={async () => {
                      if (!challengeId) {
                        toast.error('Missing challenge id')
                        return
                      }
                      if (!code.trim()) {
                        toast.error('Enter the 6-digit code')
                        return
                      }

                      setIsLoading(true)
                      try {
                        await verifyFactor({
                          factorId: enrollData.factorId,
                          challengeId,
                          code: code.trim(),
                        })
                        toast.success('2FA enabled')
                        setEnrollData(null)
                        setChallengeId(null)
                        setCode('')
                        await refresh()
                      } catch (e: any) {
                        console.error(e)
                        toast.error(e?.message || 'Invalid code')
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-focus disabled:opacity-50"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
