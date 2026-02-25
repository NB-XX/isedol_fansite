-- 初始化配置到 D1 数据库
-- 所有配置都存储在 settings 表中

-- 管理员密码
INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('ADMIN_PASSWORD', 'roboco520', CURRENT_TIMESTAMP);

-- VPS 配置
INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('VPS_API_URL', 'http://192.3.60.182:3000', CURRENT_TIMESTAMP);
INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('VPS_API_KEY', 'df0631b6daa9cdd1f5347c997c62a24d0632c909a1163809661d7cc99805edc2', CURRENT_TIMESTAMP);

-- 前端配置
INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('BACKGROUND_IMAGE', 'https://p.sda1.dev/30/e284285ee313f85c6c1302423ffdece1/ae690cd0-dedc-4349-8b15-c83b6252b6df.png', CURRENT_TIMESTAMP);
INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('BACKGROUND_BLUR', '5', CURRENT_TIMESTAMP);
INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('MUSIC_PLAYLIST', '[{"name":"Be My Light","artist":"ISEGYE IDOL","url":"https://pub-29fedae1cd4043bd97663bb6d48fb1b6.r2.dev/Be%20My%20Light%20-%20ISEGYE%20IDOL/Be%20My%20Light%20-%20ISEGYE%20IDOL.mp3","cover":"https://pub-29fedae1cd4043bd97663bb6d48fb1b6.r2.dev/Be%20My%20Light%20-%20ISEGYE%20IDOL/cover.jpg"},{"name":"Nameless","artist":"ISEGYE IDOL","url":"https://pub-29fedae1cd4043bd97663bb6d48fb1b6.r2.dev/Be%20My%20Light%20-%20ISEGYE%20IDOL/Nameless%20-%20ISEGYE%20IDOL.mp3","cover":"https://pub-29fedae1cd4043bd97663bb6d48fb1b6.r2.dev/Be%20My%20Light%20-%20ISEGYE%20IDOL/cover.jpg"},{"name":"Stargazers","artist":"ISEGYE IDOL","url":"https://pub-29fedae1cd4043bd97663bb6d48fb1b6.r2.dev/Be%20My%20Light%20-%20ISEGYE%20IDOL/Stargazers%20-%20ISEGYE%20IDOL.mp3","cover":"https://pub-29fedae1cd4043bd97663bb6d48fb1b6.r2.dev/Be%20My%20Light%20-%20ISEGYE%20IDOL/cover.jpg"},{"name":"ELEVATE","artist":"ISEGYE IDOL","url":"https://pub-29fedae1cd4043bd97663bb6d48fb1b6.r2.dev/Be%20My%20Light%20-%20ISEGYE%20IDOL/ELEVATE%20-%20ISEGYE%20IDOL.mp3","cover":"https://pub-29fedae1cd4043bd97663bb6d48fb1b6.r2.dev/Be%20My%20Light%20-%20ISEGYE%20IDOL/cover.jpg"},{"name":"MEMORY","artist":"ISEGYE IDOL","url":"https://pub-29fedae1cd4043bd97663bb6d48fb1b6.r2.dev/Be%20My%20Light%20-%20ISEGYE%20IDOL/MEMORY%20-%20ISEGYE%20IDOL.mp3","cover":"https://pub-29fedae1cd4043bd97663bb6d48fb1b6.r2.dev/Be%20My%20Light%20-%20ISEGYE%20IDOL/cover.jpg"}]', CURRENT_TIMESTAMP);

-- Naver Cafe 配置
INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('CAFE_ID', '27842958', CURRENT_TIMESTAMP);
INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('MENU_ID', '345', CURRENT_TIMESTAMP);
