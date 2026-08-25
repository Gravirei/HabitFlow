import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveImage, loadImage, removeImage } from '@/lib/storage/imageStorage'

const AVATAR_STORAGE_KEY = 'profile-avatar'
const BANNER_STORAGE_KEY = 'profile-banner'

interface ProfileState {
  fullName: string
  username: string
  email: string
  bio: string
  avatarUrl: string | null
  bannerUrl: string | null

  // Actions
  setFullName: (name: string) => void
  setUsername: (username: string) => void
  setEmail: (email: string) => void
  setBio: (bio: string) => void
  setAvatarUrl: (url: string | null) => void
  setBannerUrl: (url: string | null) => void
  /** Hydrate avatarUrl and bannerUrl from IndexedDB — call once on app/page mount. */
  loadImages: () => Promise<void>
  updateProfile: (data: Partial<Pick<ProfileState, 'fullName' | 'username' | 'email' | 'bio' | 'avatarUrl' | 'bannerUrl'>>) => void
  reset: () => void
}

const DEFAULT_PROFILE = {
  fullName: 'Alex Doe',
  username: 'alex.doe',
  email: 'alex.doe@example.com',
  bio: '',
  avatarUrl: null as string | null,
  bannerUrl: null as string | null,
}

/**
 * Generate a fallback avatar URL from the user's name using ui-avatars.
 */
export function getAvatarFallbackUrl(name: string): string {
  const encoded = encodeURIComponent(name.trim() || 'User')
  return `https://ui-avatars.com/api/?name=${encoded}&size=256&background=13eca4&color=fff&bold=true`
}

/**
 * Persist an image to IndexedDB (large images exceed localStorage limits).
 * Saves or removes the image under the given key.
 */
async function persistImage(key: string, dataUrl: string | null) {
  try {
    if (dataUrl) {
      await saveImage(key, dataUrl)
    } else {
      await removeImage(key)
    }
  } catch {
    // IndexedDB unavailable — image will still work in-memory for the session
  }
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...DEFAULT_PROFILE,

      setFullName: (fullName) => set({ fullName }),
      setUsername: (username) => set({ username }),
      setEmail: (email) => set({ email }),
      setBio: (bio) => set({ bio }),

      setAvatarUrl: (avatarUrl) => {
        persistImage(AVATAR_STORAGE_KEY, avatarUrl)
        set({ avatarUrl })
      },

      setBannerUrl: (bannerUrl) => {
        persistImage(BANNER_STORAGE_KEY, bannerUrl)
        set({ bannerUrl })
      },

      loadImages: async () => {
        try {
          const [avatar, banner] = await Promise.all([
            loadImage(AVATAR_STORAGE_KEY),
            loadImage(BANNER_STORAGE_KEY),
          ])
          const updates: Partial<ProfileState> = {}
          if (avatar) updates.avatarUrl = avatar
          if (banner) updates.bannerUrl = banner
          if (Object.keys(updates).length > 0) set(updates)
        } catch {
          // IndexedDB unavailable — leave images as null
        }
      },

      updateProfile: (data) => {
        const idbUpdates: Partial<Pick<ProfileState, 'avatarUrl' | 'bannerUrl'>> = {}
        const storeUpdates: typeof data = {}

        for (const [key, value] of Object.entries(data)) {
          if (key === 'avatarUrl') {
            persistImage(AVATAR_STORAGE_KEY, value as string | null)
            idbUpdates.avatarUrl = value as string | null
          } else if (key === 'bannerUrl') {
            persistImage(BANNER_STORAGE_KEY, value as string | null)
            idbUpdates.bannerUrl = value as string | null
          } else {
            (storeUpdates as Record<string, unknown>)[key] = value
          }
        }

        // Apply all updates to in-memory state at once
        set((state) => ({ ...state, ...storeUpdates, ...idbUpdates }))
      },

      reset: () => {
        persistImage(AVATAR_STORAGE_KEY, null)
        persistImage(BANNER_STORAGE_KEY, null)
        set({ ...DEFAULT_PROFILE })
      },
    }),
    {
      name: 'profile-store',
      version: 2,
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
      // Exclude avatarUrl and bannerUrl from localStorage — they're stored in IndexedDB
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { avatarUrl, bannerUrl, ...rest } = state
        return rest as unknown as ProfileState
      },
      // Migrate from older versions that stored avatarUrl in localStorage
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>
        if (version < 2 && state.avatarUrl) {
          // Move avatar from localStorage to IndexedDB
          persistImage(AVATAR_STORAGE_KEY, state.avatarUrl as string)
          delete state.avatarUrl
        }
        return state as unknown as ProfileState
      },
    }
  )
)
