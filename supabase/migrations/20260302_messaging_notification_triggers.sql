-- ============================================================
-- Push Notification Subscriptions & Triggers
-- Migration: 20260302_messaging_notification_triggers
--
-- Creates push subscription storage, enables pg_net for
-- HTTP calls from triggers, and sets up an AFTER INSERT
-- trigger on messages to invoke the push notification
-- Edge Function.
-- ============================================================


-- ============================================================
-- 1. PUSH SUBSCRIPTIONS
--    Stores Web Push API subscription data per user/device.
-- ============================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT        NOT NULL,
  p256dh_key  TEXT        NOT NULL,
  auth_key    TEXT        NOT NULL,
  device_info JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own push subscriptions
CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own push subscriptions
CREATE POLICY "Users can create own push subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own push subscriptions
CREATE POLICY "Users can update own push subscriptions"
  ON push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own push subscriptions
CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE push_subscriptions IS
  'Web Push API subscriptions per user/device. RLS ensures users can only manage their own subscriptions. UNIQUE(user_id, endpoint) prevents duplicate registrations.';


-- ============================================================
-- 2. ENABLE pg_net EXTENSION
--    Required for HTTP calls from database triggers.
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


-- ============================================================
-- 3. NOTIFICATION TRIGGER
--    Calls Edge Function on new message INSERT.
-- ============================================================
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.settings.edge_function_url') || '/messaging-notifications',
    body := json_build_object(
      'message_id', NEW.id,
      'conversation_id', NEW.conversation_id,
      'sender_id', NEW.sender_id,
      'type', NEW.type,
      'text', substring(NEW.text from 1 for 100)
    )::text,
    headers := json_build_object(
      'Content-Type', 'application/json'
    )::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();


-- ============================================================
-- 4. ADD is_muted TO conversation_members (if not exists)
--    Used by Edge Function to skip muted conversations.
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_members' AND column_name = 'is_muted'
  ) THEN
    ALTER TABLE conversation_members ADD COLUMN is_muted BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;
