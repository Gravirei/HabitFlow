import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export function TwoFactorVerification() {
  const navigate = useNavigate()
  const [codes, setCodes] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    const sanitizedValue = value.replace(/[^0-9]/g, '')
    
    if (sanitizedValue.length <= 1) {
      const newCodes = [...codes]
      newCodes[index] = sanitizedValue
      setCodes(newCodes)

      // Auto-focus next input
      if (sanitizedValue && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text').replace(/[^0-9]/g, '')
    const pastedCodes = pastedText.split('').slice(0, 6)
    
    const newCodes = [...codes]
    pastedCodes.forEach((code, index) => {
      if (index < 6) {
        newCodes[index] = code
      }
    })
    setCodes(newCodes)

    // Focus the next empty input or the last input
    const nextEmptyIndex = newCodes.findIndex(code => !code)
    const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleVerify = async () => {
    const code = codes.join('')
    if (code.length !== 6) return

    setIsLoading(true)
    try {
      // TODO: Implement 2FA verification
      console.log('Verifying 2FA code:', code)
      
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // On success, navigate to app
      navigate('/')
    } catch (error) {
      console.error('2FA verification failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      // TODO: Implement resend 2FA code
      console.log('Resending 2FA code')
      
      toast.success('Verification code resent to your authenticator app')
      
      // Start 30 second countdown
      setResendCountdown(30)
    } catch (error) {
      console.error('Failed to resend 2FA code:', error)
      toast.error('Failed to resend code. Please try again.')
    }
  }

  // Auto-submit when all fields are filled
  useEffect(() => {
    if (codes.every(code => code !== '') && !isLoading) {
      handleVerify()
    }
  }, [codes, isLoading])

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  return (
    <div className="relative flex min-h-screen w-full bg-background-dark">
      {/* Back Button */}
      <button
        onClick={() => navigate('/login')}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Main Container */}
      <div className="relative flex flex-col w-full max-w-md mx-auto px-6 py-12 justify-center">
        {/* Header */}
        <div className="mb-8 text-center">
          {/* Logo */}
          <div className="inline-block mb-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-1 flex items-center justify-center">
                <svg className="overflow-visible w-full h-full" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="46" stroke="#13ec5b" strokeOpacity="0.2" strokeWidth="4"></circle>
                  <path d="M 50 4 A 46 46 0 1 1 10.7 25.8" stroke="#13ec5b" strokeLinecap="round" strokeWidth="4" fill="none"></path>
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                <span 
                  className="material-symbols-outlined text-[#13ec5b]" 
                  style={{ fontSize: '40px', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
                >
                  trending_up
                </span>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-1">HabitFlow</h2>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            We've sent you a code
          </h1>
          <p className="text-white/80 mb-2">
            To complete your sign in, enter the code
          </p>
          <p className="text-white/80">
            we've sent to your authenticator app
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-6">
          <div className="space-y-6">
            {/* 6-digit Code Input */}
            <div>
              <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                {codes.map((code, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={code}
                    onChange={e => handleCodeChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:outline-none transition-colors"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerify}
              disabled={isLoading || codes.some(code => !code)}
              className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary-focus active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying…' : 'Verify'}
            </button>

            {/* Resend Link */}
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Didn't receive a code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCountdown > 0}
                  className="text-primary hover:underline font-medium transition-colors disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {resendCountdown > 0 ? `Resend code (${resendCountdown}s)` : 'Resend code'}
                </button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}