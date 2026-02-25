-- Cloudflare D1 数据库结构
-- 用于迁移 SQLite 数据到 D1

-- 文章表
CREATE TABLE IF NOT EXISTS articles (
  article_id INTEGER PRIMARY KEY,
  subject TEXT NOT NULL,
  subject_translated TEXT,
  content TEXT,
  content_translated TEXT,
  content_html TEXT,
  content_html_translated TEXT,
  text_content TEXT,
  write_date INTEGER NOT NULL,
  write_date_formatted TEXT,
  writer_json TEXT,
  menu_json TEXT,
  read_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  source TEXT,
  is_ai_translated INTEGER DEFAULT 0,
  translated_at TEXT,
  fetched_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_articles_write_date ON articles(write_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_translated ON articles(is_ai_translated);

-- 主播表
CREATE TABLE IF NOT EXISTS streamers (
  streamer_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  bj_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 直播状态表
CREATE TABLE IF NOT EXISTS stream_status (
  streamer_id TEXT PRIMARY KEY,
  online INTEGER DEFAULT 0,
  title TEXT,
  category TEXT,
  broad_no TEXT,
  broad_start TEXT,
  updated_at TEXT,
  FOREIGN KEY (streamer_id) REFERENCES streamers(streamer_id)
);

-- 直播历史表
CREATE TABLE IF NOT EXISTS stream_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  streamer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  action TEXT NOT NULL,
  title TEXT,
  category TEXT,
  broad_no TEXT,
  old_title TEXT,
  old_category TEXT,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (streamer_id) REFERENCES streamers(streamer_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_stream_history_streamer ON stream_history(streamer_id);
CREATE INDEX IF NOT EXISTS idx_stream_history_timestamp ON stream_history(timestamp DESC);

-- 插入主播数据
INSERT OR IGNORE INTO streamers (streamer_id, name, avatar, bj_id) VALUES
  ('gosegu', '고세구', 'https://stimg.sooplive.co.kr/LOGO/go/gosegu2/m/gosegu2.webp', 'gosegu2'),
  ('lilpa', '릴파', 'https://stimg.sooplive.co.kr/LOGO/li/lilpa0309/m/lilpa0309.webp', 'lilpa0309'),
  ('ine', '아이네', 'https://stimg.sooplive.co.kr/LOGO/in/inehine/m/inehine.webp', 'inehine'),
  ('viichan', '비챤', 'https://stimg.sooplive.co.kr/LOGO/vi/viichan6/m/viichan6.webp', 'viichan6'),
  ('jingburger', '징버거', 'https://stimg.sooplive.co.kr/LOGO/ji/jingburger1/m/jingburger1.webp', 'jingburger1'),
  ('jururu', '주르르', 'https://stimg.sooplive.co.kr/LOGO/co/cotton1217/m/cotton1217.webp', 'cotton1217');
