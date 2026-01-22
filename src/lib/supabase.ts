/**
 * Supabase Client Configuration
 * Initializes and exports the Supabase client for use throughout the application
 */

import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  )
  // Create a dummy client to prevent app crashes
  // This allows the app to run without Supabase configured
}

const isTestEnv = import.meta.env.MODE === 'test'

const hasValidStorage = (() => {
  try {
    const s: any = window?.localStorage
    return !!s && typeof s.getItem === 'function' && typeof s.setItem === 'function'
  } catch {
    return false
  }
})()

// Create and export the Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // In tests, avoid background refresh timers and avoid broken storage mocks.
      autoRefreshToken: !isTestEnv,
      persistSession: !isTestEnv && hasValidStorage,
      detectSessionInUrl: true,
      ...(hasValidStorage ? { storage: window.localStorage } : {}),
    },
  }
)

// Type helper for Supabase tables (add your table types here)
export type Database = {
  // Example structure - customize based on your actual database schema
  public: {
    Tables: {
      // Add your table definitions here
      // Example:
      // timer_sessions: {
      //   Row: {
      //     id: string
      //     user_id: string
      //     mode: string
      //     duration: number
      //     timestamp: string
      //     created_at: string
      //   }
      //   Insert: Omit<timer_sessions.Row, 'id' | 'created_at'>
      //   Update: Partial<timer_sessions.Insert>
      // }
    }
    Views: {
      // Add your view definitions here
    }
    Functions: {
      // Add your function definitions here
    }
    Enums: {
      // Add your enum definitions here
    }
  }
}
