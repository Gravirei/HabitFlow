-- ============================================================
-- Security Tables with Row Level Security
-- Migration: 20260223_security_tables_rls
-- Covers: login_attempts, account_lockouts, login_activity,
--         user_sessions, trusted_devices
--
-- Design principles:
--   - login_attempts & account_lockouts: RLS DENY-ALL for anon/
--     authenticated clients. Only the auth-gateway Edge Function
--     (service role, bypasses RLS) reads/writes these tables.
--   - login_activity, user_sessions, trusted_devices: users can
--     only access their OWN rows (auth.uid() = user_id).
-- ============================================================


-- ============================================================
-- 1. LOGIN ATTEMPTS
--    Written exclusively by the auth-gateway (service role).
--    No direct client access permitted.
-- ============================================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  action      TEXT        NOT NULL,                        -- 'login' | 'signup' | 'forgot-password'
  email       TEXT        NOT NULL,
  ip_address  TEXT        NOT NULL DEFAULT 'unknown',
  user_agent  TEXT        NOT NULL DEFAULT 'unknown',
  success     BOOLEAN     NOT NULL DEFAULT false,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rate-limit window queries (match gateway query patterns)
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_action_created
  ON login_attempts(email, action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_action_created
  ON login_attempts(ip_address, action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id
  ON login_attempts(user_id)
  WHERE user_id IS NOT NULL;

-- Enable RLS — no policies added → deny-all for non-service-role
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Auto-cleanup: delete attempts older than 30 days to keep the table lean
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM login_attempts
  WHERE created_at < NOW() - INTERVAL '30 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_cleanup_login_attempts ON login_attempts;
CREATE TRIGGER trigger_cleanup_login_attempts
  AFTER INSERT ON login_attempts
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_old_login_attempts();

COMMENT ON TABLE login_attempts IS
  'Tracks auth attempts for rate limiting. Written only by auth-gateway (service role). RLS deny-all for clients.';


-- ============================================================
-- 2. ACCOUNT LOCKOUTS
--    Written exclusively by the auth-gateway (service role).
--    No direct client access permitted.
-- ============================================================
CREATE TABLE IF NOT EXISTS account_lockouts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT        NOT NULL,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  reason       TEXT,
  locked_until TIMESTAMPTZ,
  is_locked    BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lockout status checks (email + is_locked is the hot path)
CREATE INDEX IF NOT EXISTS idx_account_lockouts_email_locked
  ON account_lockouts(email, is_locked, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_account_lockouts_user_id
  ON account_lockouts(user_id)
  WHERE user_id IS NOT NULL;

-- Enable RLS — no policies added → deny-all for non-service-role
ALTER TABLE account_lockouts ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE account_lockouts IS
  'Tracks account lockout state. Written only by auth-gateway (service role). RLS deny-all for clients.';


-- ============================================================
-- 3. LOGIN ACTIVITY
--    Authenticated users can view and delete their own history.
--    The auth-gateway (service role) inserts records.
-- ============================================================
CREATE TABLE IF NOT EXISTS login_activity (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  ip_address  TEXT        NOT NULL DEFAULT 'unknown',
  user_agent  TEXT        NOT NULL DEFAULT 'unknown',
  device_info JSONB       NOT NULL DEFAULT '{}'::jsonb,
  location    JSONB                 DEFAULT '{}'::jsonb,  -- optional geo enrichment
  login_type  TEXT        NOT NULL DEFAULT 'password'
                CHECK (login_type IN ('password', '2fa', 'magic_link', 'oauth')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for per-user history queries
CREATE INDEX IF NOT EXISTS idx_login_activity_user_created
  ON login_activity(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE login_activity ENABLE ROW LEVEL SECURITY;

-- Users can read their own login history
CREATE POLICY "Users can view own login activity"
  ON login_activity FOR SELECT
  USING (auth.uid() = user_id);

-- Users can delete their own login history (privacy / GDPR)
CREATE POLICY "Users can delete own login activity"
  ON login_activity FOR DELETE
  USING (auth.uid() = user_id);

-- Service role handles INSERT (no authenticated-user insert policy needed)

COMMENT ON TABLE login_activity IS
  'Immutable login history per user. Inserted by auth-gateway (service role). Users may view/delete own rows.';


-- ============================================================
-- 4. USER SESSIONS
--    Authenticated users manage their own sessions.
--    The client-side sessionManager also writes to this table
--    via the authenticated client, so we grant INSERT/UPDATE.
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token  TEXT        NOT NULL,
  ip_address     TEXT        NOT NULL DEFAULT 'unknown',
  user_agent     TEXT        NOT NULL DEFAULT 'unknown',
  device_info    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  is_active      BOOLEAN     NOT NULL DEFAULT true,
  last_activity  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at     TIMESTAMPTZ NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_user_sessions_token UNIQUE (session_token)
);

-- Index for active session lookups (hot path)
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active
  ON user_sessions(user_id, is_active, last_activity DESC);

-- Index for token lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_token
  ON user_sessions(session_token)
  WHERE is_active = true;

-- Partial index for cleanup queries (expired but still marked active)
CREATE INDEX IF NOT EXISTS idx_user_sessions_expired
  ON user_sessions(expires_at)
  WHERE is_active = true;

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view only their own sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update (deactivate) their own sessions
CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update last_activity timestamp on UPDATE
CREATE OR REPLACE FUNCTION update_user_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_activity IS NOT DISTINCT FROM OLD.last_activity THEN
    NEW.last_activity = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER trigger_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_sessions_updated_at();

COMMENT ON TABLE user_sessions IS
  'Tracks active user sessions per device. Full per-user RLS enforced. Session token is unique.';


-- ============================================================
-- 5. TRUSTED DEVICES
--    Authenticated users manage their own trusted devices.
-- ============================================================
CREATE TABLE IF NOT EXISTS trusted_devices (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id   TEXT        NOT NULL,
  device_name TEXT        NOT NULL DEFAULT 'Unknown Device',
  device_info JSONB       NOT NULL DEFAULT '{}'::jsonb,
  ip_address  TEXT        NOT NULL DEFAULT 'unknown',
  is_trusted  BOOLEAN     NOT NULL DEFAULT true,
  last_used   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate device registrations per user
  CONSTRAINT uq_trusted_devices_user_device UNIQUE (user_id, device_id)
);

-- Index for trust-check queries (hot path: user_id + device_id + is_trusted)
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_device
  ON trusted_devices(user_id, device_id, is_trusted);

-- Index for listing devices sorted by last use
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_last_used
  ON trusted_devices(user_id, last_used DESC);

-- Enable RLS
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;

-- Users can view their own trusted devices
CREATE POLICY "Users can view own trusted devices"
  ON trusted_devices FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add their own trusted devices
CREATE POLICY "Users can insert own trusted devices"
  ON trusted_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update (revoke) their own trusted devices
CREATE POLICY "Users can update own trusted devices"
  ON trusted_devices FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own trusted devices
CREATE POLICY "Users can delete own trusted devices"
  ON trusted_devices FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update last_used on UPDATE
CREATE OR REPLACE FUNCTION update_trusted_devices_last_used()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_used IS NOT DISTINCT FROM OLD.last_used THEN
    NEW.last_used = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_trusted_devices_last_used ON trusted_devices;
CREATE TRIGGER trigger_trusted_devices_last_used
  BEFORE UPDATE ON trusted_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_trusted_devices_last_used();

COMMENT ON TABLE trusted_devices IS
  'Tracks trusted devices per user for device verification. Full per-user RLS enforced.';


-- ============================================================
-- 6. VERIFICATION QUERY
--    Confirms RLS is enabled on all 5 tables.
-- ============================================================
DO $$
DECLARE
  tbl TEXT;
  rls_enabled BOOLEAN;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'login_attempts',
    'account_lockouts',
    'login_activity',
    'user_sessions',
    'trusted_devices'
  ]
  LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = tbl AND relnamespace = 'public'::regnamespace;

    IF NOT rls_enabled THEN
      RAISE EXCEPTION 'RLS not enabled on table: %', tbl;
    END IF;

    RAISE NOTICE 'RLS confirmed enabled on: %', tbl;
  END LOOP;
END;
$$;
