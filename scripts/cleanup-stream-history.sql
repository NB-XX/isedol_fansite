-- 清理 stream_history 中空值抖动产生的冗余记录
-- 1) 删除“变更到空值”的 category_change / title_change（绝不可能是真实变更）
-- 2) 折叠连续相同的变更：当某条变更的新值与该主播上一条非空值相同时，视为未变更，删除
--    （保留首次检测与真实 A→B 变更）
-- 注：D1 不支持显式 BEGIN/COMMIT，每条 DELETE 各自隐式事务；已先备份至 stream_history_backup_20260629

-- (1a) category 变更到空值
DELETE FROM stream_history
WHERE action = 'category_change'
  AND (category IS NULL OR category = '');

-- (1b) title 变更到空值
DELETE FROM stream_history
WHERE action = 'title_change'
  AND (title IS NULL OR title = '');

-- (2a) 折叠连续相同的 category_change：新分类与该主播最近一条非空分类相同时删除
DELETE FROM stream_history
WHERE id IN (
  SELECT s.id
  FROM stream_history s
  WHERE s.action = 'category_change'
    AND COALESCE(s.category, '') != ''
    AND s.category = (
      SELECT s2.category
      FROM stream_history s2
      WHERE s2.streamer_id = s.streamer_id
        AND s2.timestamp < s.timestamp
        AND COALESCE(s2.category, '') != ''
      ORDER BY s2.timestamp DESC
      LIMIT 1
    )
);

-- (2b) 折叠连续相同的 title_change：新标题与该主播最近一条非空标题相同时删除
DELETE FROM stream_history
WHERE id IN (
  SELECT s.id
  FROM stream_history s
  WHERE s.action = 'title_change'
    AND COALESCE(s.title, '') != ''
    AND s.title = (
      SELECT s2.title
      FROM stream_history s2
      WHERE s2.streamer_id = s.streamer_id
        AND s2.timestamp < s.timestamp
        AND COALESCE(s2.title, '') != ''
      ORDER BY s2.timestamp DESC
      LIMIT 1
    )
);
