-- Migration: Add DB-level length constraint on session_name
-- Aligns with UI maxLength (50 chars in SessionSetupModal) and
-- application-layer validation (MAX_SESSION_NAME_LENGTH = 50 in validation.ts)
--
-- Both timer_sessions tables (initial + production) use the same physical table,
-- so one ALTER TABLE statement covers both.

ALTER TABLE timer_sessions
  ADD CONSTRAINT chk_session_name_length
  CHECK (session_name IS NULL OR char_length(session_name) <= 50);
