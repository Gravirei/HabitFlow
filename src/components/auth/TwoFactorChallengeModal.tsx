import { useState } from 'react'
import toast from 'react-hot-toast'
import { challengeFactor, verifyFactor } from '@/lib/auth/mfa'

export function TwoFactorChallengeModal({
  isOpen,
  factorId,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  factorId: string | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen || !factorId) return null

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
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            inputMode="numeric"
            className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white"
          />

          <button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              if (!code.trim()) {
                toast.error('Enter the 6-digit code')
                return
              }

              setIsLoading(true)
              try {
                const challenge = await challengeFactor(factorId)
                await verifyFactor({
                  factorId,
                  challengeId: challenge.id,
                  code: code.trim(),
                })
                toast.success('2FA verified')
                onSuccess()
              } catch (e: any) {
                console.error(e)
                toast.error(e?.message || 'Invalid code')
              } finally {
                setIsLoading(false)
              }
            }}
            className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-focus disabled:opacity-50"
          >
            {isLoading ? 'Verifying…' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  )
}
