import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RequireAuth } from '@/lib/auth/RequireAuth'
import { RequireVerifiedEmail } from '@/lib/auth/RequireVerifiedEmail'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { OnboardingModal } from '@/components/OnboardingModal'
import { SplashScreen } from '@/pages/SplashScreen'
import { Onboarding } from '@/pages/Onboarding'
import { Welcome } from '@/pages/Welcome'
import { Login } from '@/pages/auth/Login'
import { Signup } from '@/pages/auth/Signup'
import { ForgotPassword } from '@/pages/auth/ForgotPassword'
import { ResetPassword } from '@/pages/auth/ResetPassword'
import { TwoFactorVerification } from '@/pages/auth/TwoFactorVerification'
import { TermsOfService } from '@/pages/legal/TermsOfService'
import { PrivacyPolicy } from '@/pages/legal/PrivacyPolicy'
import { Settings } from '@/pages/sideNav/Settings'
import { EditProfile } from '@/pages/sideNav/EditProfile'
import { Calendar } from '@/pages/Calendar'
import { NewHabit } from '@/pages/NewHabit'
import { ProgressOverview } from '@/pages/sideNav/ProgressOverview'
import { Today } from '@/pages/bottomNav/Today'
import { Habits } from '@/pages/bottomNav/Habits'
import { Tasks } from '@/pages/bottomNav/Tasks'
import { Categories } from '@/pages/bottomNav/Categories'
import { CategoryDetail } from '@/components/categories/CategoryDetail'
import { Timer } from '@/pages/bottomNav/Timer'
import { PremiumHistory } from '@/pages/timer/PremiumHistory'
import { Achievements } from '@/pages/timer/Achievements'
import { Timeline } from '@/pages/timer/Timeline'
import Analytics from '@/pages/timer/Analytics'
import Goals from '@/pages/timer/Goals'
import AIInsights from '@/pages/timer/AIInsights'
import Export from '@/pages/timer/Export'
import { AchievementNotifications } from '@/components/timer/sidebar/achievements'
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner'
import { SyncOnAuthChange } from '@/components/timer/premium-history/cloud-sync'
import { AboutUs } from '@/pages/sideNav/AboutUs'
import { HelpSupport } from '@/pages/sideNav/HelpSupport'
import { Feedback } from '@/pages/sideNav/Feedback'
import { ShareApp } from '@/pages/sideNav/ShareApp'
import { PremiumFeatures } from '@/pages/sideNav/PremiumFeatures'
import { Integrations } from '@/pages/sideNav/Integrations'
import { Social } from '@/pages/Social'
// ARCHIVED: ThemeProvider import removed (theme module archived)

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* Onboarding Modal - Shows on first visit */}
        <OnboardingModal />

        {/* Achievement Notifications */}
        <AchievementNotifications />

        {/* Cloud Sync - Triggers sync on login if enabled */}
        <SyncOnAuthChange />

        {/* Email verification banner (shown when signed in but email not confirmed) */}
        <EmailVerificationBanner />

        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            // Default options
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
            },
            // Success toast style
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#13ec5b',
                secondary: '#fff',
              },
              style: {
                border: '1px solid rgba(19, 236, 91, 0.3)',
              },
            },
            // Error toast style
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                border: '1px solid rgba(239, 68, 68, 0.3)',
              },
            },
            // Loading toast style
            loading: {
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Splash screen is now at root route "/" */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/2fa-verify" element={<TwoFactorVerification />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><EditProfile /></RequireAuth>} />
          <Route path="/calendar" element={<RequireAuth><RequireVerifiedEmail><Calendar /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/" element={<SplashScreen />} />
          <Route path="/today" element={<RequireAuth><RequireVerifiedEmail><Today /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/habits" element={<RequireAuth><RequireVerifiedEmail><Habits /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/tasks" element={<RequireAuth><RequireVerifiedEmail><Tasks /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/categories" element={<RequireAuth><RequireVerifiedEmail><Categories /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/category/:categoryId" element={<RequireAuth><RequireVerifiedEmail><CategoryDetail /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/timer" element={<RequireAuth><RequireVerifiedEmail><Timer /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/timer/premium-history" element={<RequireAuth><RequireVerifiedEmail><PremiumHistory /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/timer/analytics" element={<RequireAuth><RequireVerifiedEmail><Analytics /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/timer/goals" element={<RequireAuth><RequireVerifiedEmail><Goals /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/timer/achievements" element={<RequireAuth><RequireVerifiedEmail><Achievements /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/timer/ai-insights" element={<RequireAuth><RequireVerifiedEmail><AIInsights /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/timer/timeline" element={<RequireAuth><RequireVerifiedEmail><Timeline /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/timer/export" element={<RequireAuth><RequireVerifiedEmail><Export /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/new-habit" element={<RequireAuth><RequireVerifiedEmail><NewHabit /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/progress" element={<RequireAuth><RequireVerifiedEmail><ProgressOverview /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/all-habits" element={<RequireAuth><RequireVerifiedEmail><Habits /></RequireVerifiedEmail></RequireAuth>} />
          <Route path="/about" element={<RequireAuth><AboutUs /></RequireAuth>} />
          <Route path="/help" element={<RequireAuth><HelpSupport /></RequireAuth>} />
          <Route path="/feedback" element={<RequireAuth><Feedback /></RequireAuth>} />
          <Route path="/share" element={<RequireAuth><ShareApp /></RequireAuth>} />
          <Route path="/premium" element={<RequireAuth><PremiumFeatures /></RequireAuth>} />
          <Route path="/integrations" element={<RequireAuth><Integrations /></RequireAuth>} />
          <Route path="/social" element={<RequireAuth><RequireVerifiedEmail><Social /></RequireVerifiedEmail></RequireAuth>} />
        </Routes>
        </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
