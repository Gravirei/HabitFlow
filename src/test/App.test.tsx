import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'
import { AuthProvider } from '@/lib/auth/AuthContext'

// Avoid side effects from global UI that initializes storage/persistent timer features
vi.mock('@/components/timer/sidebar/achievements', () => ({
  AchievementNotifications: () => null,
}))
vi.mock('@/components/OnboardingModal', () => ({
  OnboardingModal: () => null,
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    )

    // When not authenticated, the app should redirect to /login
    expect(screen.getByText(/sign in to continue/i)).toBeInTheDocument()
  })

  it('renders login screen when unauthenticated', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    )

    expect(screen.getByText(/sign in to continue/i)).toBeInTheDocument()
  })
})
