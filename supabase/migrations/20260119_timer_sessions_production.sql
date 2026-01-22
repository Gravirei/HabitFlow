-- ============================================================
-- PRODUCTION-READY Timer Sessions Schema
-- Designed for scalability with millions of users
-- ============================================================

-- Drop existing table if recreating (CAREFUL in production!)
-- DROP TABLE IF EXISTS timer_sessions;

-- ============================================================
-- 1. MAIN TABLE with proper types and constraints
-- ============================================================
CREATE TABLE IF NOT EXISTS timer_sessions (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference with index
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Use proper timestamp type for partitioning and queries
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Common fields
  mode TEXT NOT NULL CHECK (mode IN ('Stopwatch', 'Countdown', 'Intervals')),
  duration INTEGER NOT NULL CHECK (duration > 0),
  session_timestamp TIMESTAMPTZ NOT NULL, -- When session ended (renamed from timestamp)
  start_time TIMESTAMPTZ, -- When timer started
  session_name TEXT,
  
  -- Stopwatch-specific
  lap_count INTEGER CHECK (lap_count >= 0),
  best_lap INTEGER CHECK (best_lap >= 0),
  laps JSONB DEFAULT '[]'::jsonb,
  
  -- Countdown-specific
  target_duration INTEGER CHECK (target_duration > 0),
  completed BOOLEAN DEFAULT false,
  
  -- Intervals-specific  
  interval_count INTEGER CHECK (interval_count >= 0),
  completed_loops INTEGER CHECK (completed_loops >= 0),
  work_duration INTEGER CHECK (work_duration > 0),
  break_duration INTEGER CHECK (break_duration >= 0),
  target_loop_count INTEGER CHECK (target_loop_count > 0),
  
  -- Sync tracking
  local_id TEXT NOT NULL, -- Required for deduplication
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate syncs
  CONSTRAINT unique_user_local_id UNIQUE (user_id, local_id)
);

-- ============================================================
-- 2. OPTIMIZED INDEXES
-- ============================================================

-- Primary query pattern: get user's sessions by date
CREATE INDEX idx_timer_sessions_user_date 
  ON timer_sessions(user_id, created_at DESC);

-- Filter by mode
CREATE INDEX idx_timer_sessions_user_mode_date 
  ON timer_sessions(user_id, mode, created_at DESC);

-- For sync operations (find by local_id)
CREATE INDEX idx_timer_sessions_sync 
  ON timer_sessions(user_id, local_id);

-- For analytics: sessions per day
CREATE INDEX idx_timer_sessions_date 
  ON timer_sessions(created_at DESC);

-- Partial index for incomplete sessions (if you track those)
CREATE INDEX idx_timer_sessions_incomplete 
  ON timer_sessions(user_id, created_at DESC) 
  WHERE completed = false;

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE timer_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sessions
CREATE POLICY "Users can view own sessions" 
  ON timer_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" 
  ON timer_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" 
  ON timer_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" 
  ON timer_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. AUTO-UPDATE TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_timer_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_timer_sessions_updated_at ON timer_sessions;
CREATE TRIGGER trigger_timer_sessions_updated_at
  BEFORE UPDATE ON timer_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_timer_sessions_updated_at();

-- ============================================================
-- 5. DATA RETENTION: Archive old sessions (optional)
-- ============================================================

-- Archive table for sessions older than 1 year
CREATE TABLE IF NOT EXISTS timer_sessions_archive (
  LIKE timer_sessions INCLUDING ALL
);

-- Function to archive old sessions (run monthly via cron)
CREATE OR REPLACE FUNCTION archive_old_timer_sessions(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Move old sessions to archive
  WITH moved AS (
    DELETE FROM timer_sessions
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL
    RETURNING *
  )
  INSERT INTO timer_sessions_archive SELECT * FROM moved;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. USER STATISTICS VIEW (for quick dashboard queries)
-- ============================================================
CREATE OR REPLACE VIEW user_timer_stats AS
SELECT 
  user_id,
  mode,
  COUNT(*) as total_sessions,
  SUM(duration) as total_duration_seconds,
  AVG(duration)::INTEGER as avg_duration_seconds,
  MAX(duration) as max_duration_seconds,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as sessions_last_7_days,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as sessions_last_30_days,
  MAX(created_at) as last_session_at
FROM timer_sessions
GROUP BY user_id, mode;

-- RLS for the view (users see only their own stats)
-- Note: Views inherit RLS from underlying tables

-- ============================================================
-- 7. DAILY AGGREGATES TABLE (for analytics at scale)
-- ============================================================
CREATE TABLE IF NOT EXISTS timer_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('Stopwatch', 'Countdown', 'Intervals')),
  
  -- Aggregated stats
  session_count INTEGER NOT NULL DEFAULT 0,
  total_duration INTEGER NOT NULL DEFAULT 0, -- seconds
  avg_duration INTEGER, -- seconds
  max_duration INTEGER, -- seconds
  completed_count INTEGER DEFAULT 0, -- for countdown
  total_intervals INTEGER DEFAULT 0, -- for intervals mode
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_date_mode UNIQUE (user_id, date, mode)
);

-- Index for quick lookups
CREATE INDEX idx_timer_daily_stats_user_date 
  ON timer_daily_stats(user_id, date DESC);

-- RLS
ALTER TABLE timer_daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily stats" 
  ON timer_daily_stats FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily stats" 
  ON timer_daily_stats FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily stats" 
  ON timer_daily_stats FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================================
-- 8. FUNCTION: Upsert daily stats (called after each session)
-- ============================================================
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO timer_daily_stats (user_id, date, mode, session_count, total_duration, max_duration, completed_count, total_intervals)
  VALUES (
    NEW.user_id,
    DATE(NEW.created_at),
    NEW.mode,
    1,
    NEW.duration,
    NEW.duration,
    CASE WHEN NEW.completed THEN 1 ELSE 0 END,
    COALESCE(NEW.interval_count, 0)
  )
  ON CONFLICT (user_id, date, mode) DO UPDATE SET
    session_count = timer_daily_stats.session_count + 1,
    total_duration = timer_daily_stats.total_duration + NEW.duration,
    avg_duration = (timer_daily_stats.total_duration + NEW.duration) / (timer_daily_stats.session_count + 1),
    max_duration = GREATEST(timer_daily_stats.max_duration, NEW.duration),
    completed_count = timer_daily_stats.completed_count + CASE WHEN NEW.completed THEN 1 ELSE 0 END,
    total_intervals = timer_daily_stats.total_intervals + COALESCE(NEW.interval_count, 0),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update daily stats
DROP TRIGGER IF EXISTS trigger_update_daily_stats ON timer_sessions;
CREATE TRIGGER trigger_update_daily_stats
  AFTER INSERT ON timer_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_stats();

-- ============================================================
-- 9. RATE LIMITING: Prevent abuse
-- ============================================================
CREATE OR REPLACE FUNCTION check_session_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check sessions in last minute (max 10 per minute)
  SELECT COUNT(*) INTO recent_count
  FROM timer_sessions
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 minute';
  
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 10 sessions per minute';
  END IF;
  
  -- Check sessions in last hour (max 100 per hour)
  SELECT COUNT(*) INTO recent_count
  FROM timer_sessions
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_count >= 100 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 100 sessions per hour';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_session_rate_limit ON timer_sessions;
CREATE TRIGGER trigger_session_rate_limit
  BEFORE INSERT ON timer_sessions
  FOR EACH ROW
  EXECUTE FUNCTION check_session_rate_limit();

-- ============================================================
-- 10. COMMENTS
-- ============================================================
COMMENT ON TABLE timer_sessions IS 'Stores timer session history. Production-ready with RLS, indexes, and rate limiting.';
COMMENT ON TABLE timer_sessions_archive IS 'Archive for timer sessions older than retention period.';
COMMENT ON TABLE timer_daily_stats IS 'Pre-aggregated daily statistics for fast dashboard queries.';
COMMENT ON VIEW user_timer_stats IS 'Real-time aggregated user statistics by timer mode.';
