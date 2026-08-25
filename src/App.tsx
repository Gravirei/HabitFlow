import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RequireAuth } from '@/lib/auth/RequireAuth'
import { RequireVerifiedEmail } from '@/lib/auth/RequireVerifiedEmail'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '@/shared/layout/ErrorBoundary'
import { OnboardingModal } from '@/features/onboarding'
import { SplashScreen } from '@/pages/SplashScreen'
import { AchievementNotifications } from '@/features/timer/components/sidebar/achievements'
import { EmailVerificationBanner } from '@/features/auth/components/EmailVerificationBanner'
import { SyncOnAuthChange } from '@/features/timer/components/premium-history/cloud-sync'
import { useDayChangeDetector } from '@/hooks/useDayChangeDetector'
import { useHabitTaskStore } from '@/store/useHabitTaskStore'
import { GlobalAccessibilityButton } from '@/features/accessibility/components/GlobalAccessibilityButton'
// ARCHIVED: ThemeProvider import removed (theme module archived)

/**
 * Route-level code splitting: every page loads on demand so heavy
 * dependencies (jspdf/html2canvas behind /timer/export, recharts behind
 * /timer/analytics, …) stay out of the initial bundle. SplashScreen stays
 * eager — it IS the first-paint loading screen.
 */
const Onboarding = lazy(() => import('@/pages/Onboarding').then((m) => ({ default: m.Onboarding })))
const Welcome = lazy(() => import('@/pages/Welcome').then((m) => ({ default: m.Welcome })))
const Login = lazy(() => import('@/pages/auth/Login').then((m) => ({ default: m.Login })))
const Signup = lazy(() => import('@/pages/auth/Signup').then((m) => ({ default: m.Signup })))
const ForgotPassword = lazy(() =>
  import('@/pages/auth/ForgotPassword').then((m) => ({ default: m.ForgotPassword }))
)
const ResetPassword = lazy(() =>
  import('@/pages/auth/ResetPassword').then((m) => ({ default: m.ResetPassword }))
)
const TwoFactorVerification = lazy(() =>
  import('@/pages/auth/TwoFactorVerification').then((m) => ({ default: m.TwoFactorVerification }))
)
const TermsOfService = lazy(() =>
  import('@/pages/legal/TermsOfService').then((m) => ({ default: m.TermsOfService }))
)
const PrivacyPolicy = lazy(() =>
  import('@/pages/legal/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy }))
)
const Settings = lazy(() =>
  import('@/pages/sideNav/Settings').then((m) => ({ default: m.Settings }))
)
const EditProfile = lazy(() =>
  import('@/pages/sideNav/EditProfile').then((m) => ({ default: m.EditProfile }))
)
const ProgressOverview = lazy(() =>
  import('@/pages/sideNav/ProgressOverview').then((m) => ({ default: m.ProgressOverview }))
)
const AboutUs = lazy(() => import('@/pages/sideNav/AboutUs').then((m) => ({ default: m.AboutUs })))
const HelpSupport = lazy(() =>
  import('@/pages/sideNav/HelpSupport').then((m) => ({ default: m.HelpSupport }))
)
const Feedback = lazy(() =>
  import('@/pages/sideNav/Feedback').then((m) => ({ default: m.Feedback }))
)
const ShareApp = lazy(() =>
  import('@/pages/sideNav/ShareApp').then((m) => ({ default: m.ShareApp }))
)
const PremiumFeatures = lazy(() =>
  import('@/pages/sideNav/PremiumFeatures').then((m) => ({ default: m.PremiumFeatures }))
)
const Integrations = lazy(() =>
  import('@/pages/sideNav/Integrations').then((m) => ({ default: m.Integrations }))
)
const Calendar = lazy(() => import('@/pages/Calendar').then((m) => ({ default: m.Calendar })))
const NewHabit = lazy(() => import('@/pages/NewHabit').then((m) => ({ default: m.NewHabit })))
const Social = lazy(() => import('@/pages/Social').then((m) => ({ default: m.Social })))
const Today = lazy(() => import('@/pages/bottomNav/Today').then((m) => ({ default: m.Today })))
const Habits = lazy(() => import('@/pages/bottomNav/Habits').then((m) => ({ default: m.Habits })))
const Tasks = lazy(() => import('@/pages/bottomNav/Tasks').then((m) => ({ default: m.Tasks })))
const Categories = lazy(() =>
  import('@/pages/bottomNav/Categories').then((m) => ({ default: m.Categories }))
)
const CategoryDetail = lazy(() =>
  import('@/features/categories/components/CategoryDetail').then((m) => ({
    default: m.CategoryDetail,
  }))
)
const Timer = lazy(() => import('@/pages/bottomNav/Timer').then((m) => ({ default: m.Timer })))
const PremiumHistory = lazy(() =>
  import('@/pages/timer/PremiumHistory').then((m) => ({ default: m.PremiumHistory }))
)
const Achievements = lazy(() =>
  import('@/pages/timer/Achievements').then((m) => ({ default: m.Achievements }))
)
const Timeline = lazy(() => import('@/pages/timer/Timeline').then((m) => ({ default: m.Timeline })))
const Analytics = lazy(() => import('@/pages/timer/Analytics'))
const Goals = lazy(() => import('@/pages/timer/Goals'))
const AIInsights = lazy(() => import('@/pages/timer/AIInsights'))
const Export = lazy(() => import('@/pages/timer/Export'))

/** Detects midnight rollover and resets all habit tasks for the new day */
function DayChangeDetector() {
  const resetAllTasksForNewDay = useHabitTaskStore((s) => s.resetAllTasksForNewDay)
  useDayChangeDetector(resetAllTasksForNewDay)
  return null
}

/** Full-screen fallback while a route chunk loads */
function RouteFallback() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background-dark">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* Day change detection — resets habit tasks at midnight */}
        <DayChangeDetector />

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

        <GlobalAccessibilityButton />

        <Suspense fallback={<RouteFallback />}>
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
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <EditProfile />
                </RequireAuth>
              }
            />
            <Route
              path="/calendar"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <Calendar />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route path="/" element={<SplashScreen />} />
            <Route
              path="/today"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <Today />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/habits"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <Habits />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/tasks"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <Tasks />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/categories"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <Categories />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/category/:categoryId"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <CategoryDetail />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/timer"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <Timer />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/timer/premium-history"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <PremiumHistory />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/timer/analytics"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <Analytics />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/timer/goals"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <Goals />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/timer/achievements"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <Achievements />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/timer/ai-insights"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <AIInsights />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/timer/timeline"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <Timeline />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/timer/export"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <Export />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/new-habit"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <NewHabit />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/progress"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <ProgressOverview />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/all-habits"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <Habits />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
            <Route
              path="/about"
              element={
                <RequireAuth>
                  <AboutUs />
                </RequireAuth>
              }
            />
            <Route
              path="/help"
              element={
                <RequireAuth>
                  <HelpSupport />
                </RequireAuth>
              }
            />
            <Route
              path="/feedback"
              element={
                <RequireAuth>
                  <Feedback />
                </RequireAuth>
              }
            />
            <Route
              path="/share"
              element={
                <RequireAuth>
                  <ShareApp />
                </RequireAuth>
              }
            />
            <Route
              path="/premium"
              element={
                <RequireAuth>
                  <PremiumFeatures />
                </RequireAuth>
              }
            />
            <Route
              path="/integrations"
              element={
                <RequireAuth>
                  <Integrations />
                </RequireAuth>
              }
            />
            <Route
              path="/social"
              element={
                <RequireAuth>
                  <RequireVerifiedEmail>
                    <Social />
                  </RequireVerifiedEmail>
                </RequireAuth>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
