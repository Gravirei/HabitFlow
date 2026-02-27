import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProfileState {
  fullName: string
  username: string
  email: string
  bio: string
  avatarUrl: string | null

  // Actions
  setFullName: (name: string) => void
  setUsername: (username: string) => void
  setEmail: (email: string) => void
  setBio: (bio: string) => void
  setAvatarUrl: (url: string | null) => void
  updateProfile: (data: Partial<Pick<ProfileState, 'fullName' | 'username' | 'email' | 'bio' | 'avatarUrl'>>) => void
  reset: () => void
}

const DEFAULT_PROFILE = {
  fullName: 'Alex Doe',
  username: 'alex.doe',
  email: 'alex.doe@example.com',
  bio: '',
  avatarUrl: null as string | null,
}

/**
 * Generate a fallback avatar URL from the user's name using ui-avatars.
 */
export function getAvatarFallbackUrl(name: string): string {
  const encoded = encodeURIComponent(name.trim() || 'User')
  return `https://ui-avatars.com/api/?name=${encoded}&size=256&background=13eca4&color=fff&bold=true`
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...DEFAULT_PROFILE,

      setFullName: (fullName) => set({ fullName }),
      setUsername: (username) => set({ username }),
      setEmail: (email) => set({ email }),
      setBio: (bio) => set({ bio }),
      setAvatarUrl: (avatarUrl) => set({ avatarUrl }),

      updateProfile: (data) => set((state) => ({ ...state, ...data })),

      reset: () => set({ ...DEFAULT_PROFILE }),
    }),
    {
      name: 'profile-store',
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      },
    }
  )
)
