-- 第二轮清理：合并 KR/EN 同义分类，删除语言横跳产生的伪变更
-- Firebase 推韩文、SOOP 推英文，同一分类在两种语言间反复横跳。
-- 用保守的 KR→EN 映射把分类归一化后，删除“归一化后与该主播上一条非空分类相同”的变更行。
-- 已备份至 stream_history_backup_20260629。

DELETE FROM stream_history
WHERE id IN (
  SELECT s.id
  FROM stream_history s
  WHERE s.action = 'category_change'
    AND COALESCE(s.category, '') != ''
    AND CASE s.category
          WHEN '버추얼' THEN 'Virtual'
          WHEN '마인크래프트' THEN 'Minecraft'
          WHEN '이터널 리턴' THEN 'Eternal Return'
          WHEN '월드 오브 탱크' THEN 'World of Tanks'
          WHEN '구스 구스 덕' THEN 'Goose Goose Duck'
          WHEN 'PUBG: 배틀그라운드' THEN 'PUBG: Battlegrounds'
          WHEN '리그 오브 레전드' THEN 'League of Legends'
          WHEN '오버워치' THEN 'Overwatch'
          WHEN '노래방' THEN 'Karaoke'
          WHEN '명조: 워더링 웨이브' THEN 'Wuthering Waves'
          WHEN '기생수' THEN 'Parasyte'
          WHEN '은혨' THEN 'Gintama'
          WHEN '천원돌파 그렌라간' THEN 'Gurren Lagann'
          WHEN '월드 오브 워크래프트' THEN 'World of Warcraft'
          WHEN '월드 오브 워쉽' THEN 'World of Warships'
          WHEN '스타크래프트' THEN 'StarCraft'
          WHEN '철권 8' THEN 'Tekken 8'
          WHEN '로블록스' THEN 'Roblox'
          WHEN '파피 플레이타임' THEN 'Poppy Playtime'
          WHEN '서든어택' THEN 'Sudden Attack'
          WHEN '프래그마타' THEN 'Pragmata'
          WHEN '붉은사막' THEN 'Crimson Desert'
          WHEN '명탐정 코난' THEN 'Detective Conan'
          WHEN '슬레이 더 스파이어 2' THEN 'Slay the Spire 2'
          WHEN '종합게임' THEN 'Other Games'
          WHEN '알수없음' THEN 'Unknown'
          ELSE s.category
        END = (
          SELECT CASE s2.category
                 WHEN '버추얼' THEN 'Virtual'
                 WHEN '마인크래프트' THEN 'Minecraft'
                 WHEN '이터널 리턴' THEN 'Eternal Return'
                 WHEN '월드 오브 탱크' THEN 'World of Tanks'
                 WHEN '구스 구스 덕' THEN 'Goose Goose Duck'
                 WHEN 'PUBG: 배틀그라운드' THEN 'PUBG: Battlegrounds'
                 WHEN '리그 오브 레전드' THEN 'League of Legends'
                 WHEN '오버워치' THEN 'Overwatch'
                 WHEN '노래방' THEN 'Karaoke'
                 WHEN '명조: 워더링 웨이브' THEN 'Wuthering Waves'
                 WHEN '기생수' THEN 'Parasyte'
                 WHEN '은혼' THEN 'Gintama'
                 WHEN '천원돌파 그렌라간' THEN 'Gurren Lagann'
                 WHEN '월드 오브 워크래프트' THEN 'World of Warcraft'
                 WHEN '월드 오브 워쉽' THEN 'World of Warships'
                 WHEN '스타크래프트' THEN 'StarCraft'
                 WHEN '철권 8' THEN 'Tekken 8'
                 WHEN '로블록스' THEN 'Roblox'
                 WHEN '파피 플레이타임' THEN 'Poppy Playtime'
                 WHEN '서든어택' THEN 'Sudden Attack'
                 WHEN '프래그마타' THEN 'Pragmata'
                 WHEN '붉은사막' THEN 'Crimson Desert'
                 WHEN '명탐정 코난' THEN 'Detective Conan'
                 WHEN '슬레이 더 스파이어 2' THEN 'Slay the Spire 2'
                 WHEN '종합게임' THEN 'Other Games'
                 WHEN '알수없음' THEN 'Unknown'
                 ELSE s2.category
               END
          FROM stream_history s2
          WHERE s2.streamer_id = s.streamer_id
            AND s2.timestamp < s.timestamp
            AND COALESCE(s2.category, '') != ''
          ORDER BY s2.timestamp DESC
          LIMIT 1
        )
);
