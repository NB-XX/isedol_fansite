-- 文章表
CREATE TABLE IF NOT EXISTS articles (
    article_id INTEGER PRIMARY KEY,
    subject TEXT NOT NULL,
    content TEXT,
    content_html TEXT,
    write_date INTEGER NOT NULL,
    write_date_formatted TEXT,
    
    -- 翻译字段
    subject_translated TEXT,
    content_translated TEXT,
    translated_at TEXT,
    
    -- 作者信息
    author_nick TEXT NOT NULL,
    author_image TEXT,
    author_member_key TEXT,
    author_member_level INTEGER,
    author_member_level_name TEXT,
    
    -- 菜单信息
    menu_id INTEGER,
    menu_name TEXT,
    
    -- 统计信息
    read_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- 元数据
    fetched_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 主播表
CREATE TABLE IF NOT EXISTS streamers (
    streamer_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    bj_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 直播状态表（当前状态）
CREATE TABLE IF NOT EXISTS stream_status (
    streamer_id TEXT PRIMARY KEY,
    online INTEGER DEFAULT 0,
    title TEXT,
    category TEXT,
    updated_at TEXT NOT NULL,
    broad_no TEXT,
    broad_start TEXT,
    FOREIGN KEY (streamer_id) REFERENCES streamers(streamer_id)
);

-- 直播历史记录表
CREATE TABLE IF NOT EXISTS stream_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    streamer_id TEXT NOT NULL,
    name TEXT NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('start', 'end', 'title_change', 'category_change')),
    title TEXT,
    category TEXT,
    timestamp TEXT NOT NULL,
    metadata TEXT,
    broad_no TEXT,
    FOREIGN KEY (streamer_id) REFERENCES streamers(streamer_id)
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_articles_write_date ON articles(write_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_author_nick ON articles(author_nick);
CREATE INDEX IF NOT EXISTS idx_stream_history_streamer_id ON stream_history(streamer_id);
CREATE INDEX IF NOT EXISTS idx_stream_history_timestamp ON stream_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_stream_history_action ON stream_history(action);
CREATE INDEX IF NOT EXISTS idx_stream_history_broad_no ON stream_history(broad_no);
