import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { IntegrationProvider, IntegrationConnection, IntegrationStatus, SyncResult } from './types'

const createDefaultConnection = (provider: IntegrationProvider): IntegrationConnection => ({
  provider,
  status: 'disconnected',
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  connectedAt: null,
  lastSyncedAt: null,
  syncEnabled: false,
  settings: {},
  error: null,
})

interface IntegrationState {
  connections: Record<IntegrationProvider, IntegrationConnection>
  syncHistory: SyncResult[]

  // Getters
  getConnection: (provider: IntegrationProvider) => IntegrationConnection
  isConnected: (provider: IntegrationProvider) => boolean
  getStatus: (provider: IntegrationProvider) => IntegrationStatus

  // Actions
  setStatus: (provider: IntegrationProvider, status: IntegrationStatus) => void
  connect: (provider: IntegrationProvider, accessToken: string, refreshToken?: string, expiresAt?: string) => void
  disconnect: (provider: IntegrationProvider) => void
  updateSettings: (provider: IntegrationProvider, settings: Record<string, unknown>) => void
  setError: (provider: IntegrationProvider, error: string) => void
  clearError: (provider: IntegrationProvider) => void
  setSyncEnabled: (provider: IntegrationProvider, enabled: boolean) => void
  recordSync: (result: SyncResult) => void
  updateLastSynced: (provider: IntegrationProvider) => void
  reset: () => void
}

const initialConnections: Record<IntegrationProvider, IntegrationConnection> = {
  'google-calendar': createDefaultConnection('google-calendar'),
  'notion': createDefaultConnection('notion'),
  'slack': createDefaultConnection('slack'),
  'spotify': createDefaultConnection('spotify'),
  'apple-health': createDefaultConnection('apple-health'),
  'google-fit': createDefaultConnection('google-fit'),
  'zapier': createDefaultConnection('zapier'),
  'ifttt': createDefaultConnection('ifttt'),
}

export const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set, get) => ({
      connections: { ...initialConnections },
      syncHistory: [],

      getConnection: (provider) => get().connections[provider],

      isConnected: (provider) => get().connections[provider].status === 'connected',

      getStatus: (provider) => get().connections[provider].status,

      setStatus: (provider, status) =>
        set((state) => ({
          connections: {
            ...state.connections,
            [provider]: { ...state.connections[provider], status },
          },
        })),

      connect: (provider, accessToken, refreshToken, expiresAt) =>
        set((state) => ({
          connections: {
            ...state.connections,
            [provider]: {
              ...state.connections[provider],
              status: 'connected' as IntegrationStatus,
              accessToken,
              refreshToken: refreshToken || null,
              expiresAt: expiresAt || null,
              connectedAt: new Date().toISOString(),
              error: null,
            },
          },
        })),

      disconnect: (provider) =>
        set((state) => ({
          connections: {
            ...state.connections,
            [provider]: createDefaultConnection(provider),
          },
        })),

      updateSettings: (provider, settings) =>
        set((state) => ({
          connections: {
            ...state.connections,
            [provider]: {
              ...state.connections[provider],
              settings: { ...state.connections[provider].settings, ...settings },
            },
          },
        })),

      setError: (provider, error) =>
        set((state) => ({
          connections: {
            ...state.connections,
            [provider]: {
              ...state.connections[provider],
              status: 'error' as IntegrationStatus,
              error,
            },
          },
        })),

      clearError: (provider) =>
        set((state) => ({
          connections: {
            ...state.connections,
            [provider]: {
              ...state.connections[provider],
              error: null,
              status: state.connections[provider].accessToken ? 'connected' as IntegrationStatus : 'disconnected' as IntegrationStatus,
            },
          },
        })),

      setSyncEnabled: (provider, enabled) =>
        set((state) => ({
          connections: {
            ...state.connections,
            [provider]: {
              ...state.connections[provider],
              syncEnabled: enabled,
            },
          },
        })),

      recordSync: (result) =>
        set((state) => ({
          syncHistory: [result, ...state.syncHistory].slice(0, 50),
        })),

      updateLastSynced: (provider) =>
        set((state) => ({
          connections: {
            ...state.connections,
            [provider]: {
              ...state.connections[provider],
              lastSyncedAt: new Date().toISOString(),
            },
          },
        })),

      reset: () => set({ connections: { ...initialConnections }, syncHistory: [] }),
    }),
    {
      name: 'integration-store',
    }
  )
)
