import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '@/App'
import { AuthProvider } from '@/lib/auth/AuthContext'

// Avoid side effects from global UI that initializes storage/persistent timer features
vi.mock('@/features/timer/components/sidebar/achievements', () => ({
  AchievementNotifications: () => null,
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    )

    // Unauthenticated visitors land on the splash screen before routing
    expect(screen.getByText('HabitFlow')).toBeInTheDocument()
  })

  it('renders the splash screen when unauthenticated', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    )

    expect(screen.getByText(/Build Better Habits/i)).toBeInTheDocument()
  })
})
