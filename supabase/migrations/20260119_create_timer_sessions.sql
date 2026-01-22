-- Timer Sessions Table for storing user timer history
-- This table stores all timer sessions for logged-in users
-- Migration: 20260119_create_timer_sessions.sql

-- Create the timer_sessions table
CREATE TABLE IF NOT EXISTS timer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Common fields for all timer modes
  mode TEXT NOT NULL CHECK (mode IN ('Stopwatch', 'Countdown', 'Intervals')),
  duration INTEGER NOT NULL CHECK (duration > 0), -- Duration in seconds
  timestamp BIGINT NOT NULL, -- Unix timestamp (milliseconds) when session was saved
  start_time BIGINT, -- Unix timestamp when timer started
  session_name TEXT,
  
  -- Stopwatch-specific fields
  lap_count INTEGER,
  best_lap INTEGER, -- Best lap time in seconds
  laps JSONB, -- Array of lap objects
  
  -- Countdown-specific fields
  target_duration INTEGER, -- Original goal in seconds
  completed BOOLEAN, -- True if countdown reached zero
  
  -- Intervals-specific fields
  interval_count INTEGER, -- Total intervals completed
  completed_loops INTEGER,
  work_duration INTEGER, -- Work period in seconds
  break_duration INTEGER, -- Break period in seconds
  target_loop_count INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Sync tracking
  local_id TEXT, -- Original ID from localStorage for deduplication
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_timer_sessions_user_id ON timer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_timestamp ON timer_sessions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_mode ON timer_sessions(mode);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_user_mode ON timer_sessions(user_id, mode);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_local_id ON timer_sessions(user_id, local_id);

-- Enable Row Level Security
ALTER TABLE timer_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own sessions" ON timer_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON timer_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON timer_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON timer_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_timer_sessions_updated_at ON timer_sessions;
CREATE TRIGGER update_timer_sessions_updated_at
  BEFORE UPDATE ON timer_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE timer_sessions IS 'Stores timer session history for logged-in users with support for Stopwatch, Countdown, and Intervals modes';
