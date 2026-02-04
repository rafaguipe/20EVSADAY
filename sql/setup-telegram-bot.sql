-- Setup para integração com Telegram

CREATE TABLE IF NOT EXISTS telegram_link_codes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 minutes'),
  used_at TIMESTAMPTZ,
  telegram_user_id BIGINT,
  telegram_username TEXT
);

CREATE TABLE IF NOT EXISTS telegram_links (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  telegram_user_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  chat_id BIGINT,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own telegram link codes" ON telegram_link_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own telegram link codes" ON telegram_link_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own telegram link codes" ON telegram_link_codes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own telegram link" ON telegram_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own telegram link" ON telegram_links
  FOR UPDATE USING (auth.uid() = user_id);
