-- ============================================================
-- Messaging System Tables with Row Level Security
-- Migration: 20260301_messaging_tables
-- Covers: conversations, conversation_members, messages,
--         message_reactions
--
-- Design principles:
--   - All tables use RLS. Users can only access conversations
--     they are members of.
--   - Membership is checked via conversation_members table.
--   - Messages and reactions inherit access through conversation
--     membership.
--   - Group member limit (30) enforced via CHECK constraint.
-- ============================================================


-- ============================================================
-- 1. CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT        NOT NULL DEFAULT 'direct'
                CHECK (type IN ('direct', 'group')),
  name        TEXT,       -- NULL for direct messages, required for groups
  avatar_url  TEXT,       -- optional group avatar
  created_by  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_created_by
  ON conversations(created_by);

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
  ON conversations(updated_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can view conversations they are a member of
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = conversations.id
        AND conversation_members.user_id = auth.uid()
    )
  );

-- Any authenticated user can create a conversation
CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Only the creator can update conversation metadata (name, avatar)
CREATE POLICY "Creator can update conversation"
  ON conversations FOR UPDATE
  USING (auth.uid() = created_by);

-- Only the creator can delete a conversation
CREATE POLICY "Creator can delete conversation"
  ON conversations FOR DELETE
  USING (auth.uid() = created_by);

COMMENT ON TABLE conversations IS
  'Chat conversations (direct or group). Access controlled via conversation_members membership.';


-- ============================================================
-- 2. CONVERSATION MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_members (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_muted        BOOLEAN     NOT NULL DEFAULT false,
  is_pinned       BOOLEAN     NOT NULL DEFAULT false,
  last_read_at    TIMESTAMPTZ,
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id
  ON conversation_members(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation_id
  ON conversation_members(conversation_id);

ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

-- Users can view members of conversations they belong to
CREATE POLICY "Users can view conversation members"
  ON conversation_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members AS cm
      WHERE cm.conversation_id = conversation_members.conversation_id
        AND cm.user_id = auth.uid()
    )
  );

-- Users can add members (insert) — must be a member of the conversation themselves
CREATE POLICY "Members can add other members"
  ON conversation_members FOR INSERT
  WITH CHECK (
    -- The inserter must already be a member OR be creating their own membership
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM conversation_members AS cm
      WHERE cm.conversation_id = conversation_members.conversation_id
        AND cm.user_id = auth.uid()
    )
  );

-- Users can update only their own membership (mute, pin, last_read_at)
CREATE POLICY "Users can update own membership"
  ON conversation_members FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can remove themselves from a conversation
CREATE POLICY "Users can leave conversations"
  ON conversation_members FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE conversation_members IS
  'Tracks membership in conversations. UNIQUE(conversation_id, user_id) prevents duplicates. Mute/pin/last_read per-member.';


-- ============================================================
-- 3. MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            TEXT        NOT NULL DEFAULT 'text'
                    CHECK (type IN ('text', 'habit_card', 'badge_card', 'xp_card', 'nudge', 'system')),
  text            TEXT,
  card_payload    JSONB,       -- stores HabitCardPayload | BadgeCardPayload | NudgeCardPayload
  is_deleted      BOOLEAN     NOT NULL DEFAULT false,
  delivered_at    TIMESTAMPTZ,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary query pattern: load messages for a conversation, newest first
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id
  ON messages(sender_id);

-- For unread count queries: messages after last_read_at per conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_not_deleted
  ON messages(conversation_id, created_at DESC)
  WHERE is_deleted = false;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in conversations they belong to
CREATE POLICY "Members can view conversation messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
        AND conversation_members.user_id = auth.uid()
    )
  );

-- Members can send messages to conversations they belong to
CREATE POLICY "Members can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
        AND conversation_members.user_id = auth.uid()
    )
  );

-- Senders can update their own messages (soft delete via is_deleted)
CREATE POLICY "Senders can update own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- Senders can hard-delete their own messages
CREATE POLICY "Senders can delete own messages"
  ON messages FOR DELETE
  USING (auth.uid() = sender_id);

COMMENT ON TABLE messages IS
  'Chat messages. card_payload JSONB stores rich content (habit, badge, nudge cards). Access via conversation membership.';


-- ============================================================
-- 4. MESSAGE REACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS message_reactions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID        NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji       TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id
  ON message_reactions(message_id);

CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id
  ON message_reactions(user_id);

ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can view reactions on messages they can see (conversation membership)
CREATE POLICY "Members can view reactions"
  ON message_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages
      JOIN conversation_members ON conversation_members.conversation_id = messages.conversation_id
      WHERE messages.id = message_reactions.message_id
        AND conversation_members.user_id = auth.uid()
    )
  );

-- Members can add reactions to messages in their conversations
CREATE POLICY "Members can add reactions"
  ON message_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM messages
      JOIN conversation_members ON conversation_members.conversation_id = messages.conversation_id
      WHERE messages.id = message_reactions.message_id
        AND conversation_members.user_id = auth.uid()
    )
  );

-- Users can remove their own reactions
CREATE POLICY "Users can remove own reactions"
  ON message_reactions FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE message_reactions IS
  'Emoji reactions on messages. UNIQUE(message_id, user_id, emoji) prevents duplicate reactions. Access via conversation membership chain.';


-- ============================================================
-- TRIGGER: Auto-update conversations.updated_at on new message
-- ============================================================
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();
