-- ── 1. last_seen für Online-Status ─────────────────────────
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;

-- ── 2. friendships Tabelle ───────────────────────────────────
CREATE TABLE IF NOT EXISTS friendships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  friend_id   UUID NOT NULL,
  status      TEXT DEFAULT 'pending',  -- 'pending' | 'accepted'
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, friend_id)
);
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_friendships"   ON friendships;
DROP POLICY IF EXISTS "insert_friendships"      ON friendships;
DROP POLICY IF EXISTS "update_friendships"      ON friendships;
DROP POLICY IF EXISTS "delete_friendships"      ON friendships;
CREATE POLICY "read_own_friendships"  ON friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "insert_friendships"    ON friendships FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_friendships"    ON friendships FOR UPDATE  USING (auth.uid() = friend_id OR auth.uid() = user_id);
CREATE POLICY "delete_friendships"    ON friendships FOR DELETE  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ── 3. notifications Tabelle ─────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL,           -- Empfänger
  type           TEXT NOT NULL,           -- 'friend_request' | 'friend_accepted'
  from_user_id   UUID NOT NULL,
  from_username  TEXT NOT NULL,
  read           BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_notifs"   ON notifications;
DROP POLICY IF EXISTS "insert_notifs"     ON notifications;
DROP POLICY IF EXISTS "update_own_notifs" ON notifications;
CREATE POLICY "read_own_notifs"   ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_notifs"     ON notifications FOR INSERT  WITH CHECK (true);
CREATE POLICY "update_own_notifs" ON notifications FOR UPDATE  USING (auth.uid() = user_id);

-- ── 4. Realtime aktivieren ───────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE friendships;
