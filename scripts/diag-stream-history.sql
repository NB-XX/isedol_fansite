-- 诊断：统计 stream_history 冗余数据结构（只读，单条聚合）
SELECT
  COUNT(*) AS total,
  SUM(CASE WHEN action='category_change' THEN 1 ELSE 0 END) AS cat_change,
  SUM(CASE WHEN action='category_change' AND (category IS NULL OR category='') THEN 1 ELSE 0 END) AS cat_to_null,
  SUM(CASE WHEN action='category_change' AND (old_category IS NULL OR old_category='') AND COALESCE(category,'')!='' THEN 1 ELSE 0 END) AS cat_from_null,
  SUM(CASE WHEN action='category_change' AND COALESCE(category,'')!='' AND COALESCE(old_category,'')!='' THEN 1 ELSE 0 END) AS cat_both_real,
  SUM(CASE WHEN action='title_change' THEN 1 ELSE 0 END) AS title_change,
  SUM(CASE WHEN action='title_change' AND (title IS NULL OR title='') THEN 1 ELSE 0 END) AS title_to_null,
  SUM(CASE WHEN action='start' THEN 1 ELSE 0 END) AS start_evt,
  SUM(CASE WHEN action='end' THEN 1 ELSE 0 END) AS end_evt
FROM stream_history;
