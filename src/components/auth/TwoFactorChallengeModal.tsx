import { useState } from 'react'
import toast from 'react-hot-toast'
import { verifyMfaWithGateway } from '@/lib/security/authGatewayClient'

export function TwoFactorChallengeModal({
  isOpen,
  factorId,
  aal1AccessToken,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  factorId: string | null
  /** Partial aal1 token returned by gateway when mfa_required is true. */
  aal1AccessToken: string | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen || !factorId || !aal1AccessToken) return null

  const handleVerify = async () => {
    const trimmedCode = code.trim()
    if (!trimmedCode) {
      toast.error('Enter the 6-digit code')
      return
    }
    if (!/^\d{6}$/.test(trimmedCode)) {
      toast.error('Code must be exactly 6 digits')
      return
    }

    setIsLoading(true)
    try {
      // Server-side MFA verification — gateway creates challenge + verifies TOTP,
      // then returns the full aal2 session tokens and applies them to Supabase client.
      await verifyMfaWithGateway({
        aal1AccessToken,
        factorId,
        code: trimmedCode,
      })
      onSuccess()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Invalid code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Two-factor authentication</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Enter the 6-digit code from your authenticator app.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            placeholder="123456"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white tracking-widest text-center text-xl"
          />

          <button
            type="button"
            disabled={isLoading || code.length !== 6}
            onClick={handleVerify}
            className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-focus disabled:opacity-50"
          >
            {isLoading ? 'Verifying…' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  )
}
