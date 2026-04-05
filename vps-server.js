#!/usr/bin/env node
// VPS 服务器 - 处理 WebSocket 监听和爬虫任务
// 这个文件在你的 VPS 上运行，负责：
// 1. Firebase 实时监听（WebSocket）
// 2. 定时爬虫任务
// 3. 数据同步到 Cloudflare D1

import express from 'express';
import { CafeScraper } from './src/modules/cafe-scraper.js';
import { StreamMonitor } from './src/modules/stream-monitor.js';
import { getDatabase } from './src/database/index-simple.js';
import { applyRuntimeConfig } from './src/config/index.js';

const app = express();
const PORT = parseInt(process.env.VPS_PORT || '3000', 10);

// Cloudflare API 配置
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_DATABASE_ID = process.env.CF_DATABASE_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;

const db = getDatabase();
let scraper = null;
let monitor = null;
let runtimeApiKey = process.env.VPS_API_KEY || 'your-secure-api-key';

app.use(express.json());

function hasD1ApiConfig() {
  return !!(CF_ACCOUNT_ID && CF_DATABASE_ID && CF_API_TOKEN);
}

async function queryD1(payload) {
  if (!hasD1ApiConfig()) {
    throw new Error('Cloudflare D1 API credentials are not configured');
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new Error(`D1 API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(`D1 API returned unsuccessful response: ${JSON.stringify(data.errors || data.messages || [])}`);
  }

  return data;
}

async function loadRuntimeConfig() {
  if (!hasD1ApiConfig()) {
    console.warn('⚠️  Cloudflare 配置未设置，VPS 服务将回退到本地环境变量');
    applyRuntimeConfig();
    return {};
  }

  try {
    console.log('📥 从 D1 加载运行配置...');

    const data = await queryD1({
      sql: 'SELECT key, value FROM settings'
    });

    const rows = data.result?.[0]?.results;
    if (!Array.isArray(rows)) {
      throw new Error('Invalid D1 response payload');
    }

    const settings = {};
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    applyRuntimeConfig(settings);
    runtimeApiKey = settings.VPS_API_KEY || process.env.VPS_API_KEY || 'your-secure-api-key';

    console.log(`✅ 已从 D1 加载 ${Object.keys(settings).length} 项配置`);
    return settings;
  } catch (error) {
    console.error('❌ 从 D1 加载配置失败:', error.message);
    applyRuntimeConfig();
    return null;
  }
}

async function startServices() {
  if (scraper) {
    scraper.stop();
  }

  if (monitor) {
    monitor.stop();
  }

  scraper = new CafeScraper();
  monitor = new StreamMonitor();

  try {
    await monitor.start();
    console.log('✅ 直播监控已启动');
  } catch (error) {
    console.error('❌ 启动直播监控失败:', error.message);
  }

  try {
    await scraper.start();
    console.log('✅ Naver Cafe 定时爬虫已启动');
  } catch (error) {
    console.error('❌ 启动 Naver Cafe 定时爬虫失败:', error.message);
  }
}

// API Key 验证中间件
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);

  if (token !== runtimeApiKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
}

// 同步数据到 Cloudflare D1
async function syncToD1() {
  if (!hasD1ApiConfig()) {
    console.warn('⚠️  Cloudflare 配置未设置，跳过同步');
    return;
  }

  try {
    console.log('🔄 开始同步数据到 D1...');

    const articles = db.getAllArticles().slice(0, 100);
    const streamStatus = db.getAllStreamStatus();
    const streamHistory = db.streamHistory || [];

    console.log(`📊 同步数据统计: 文章 ${articles.length} 篇, 主播状态 ${Object.keys(streamStatus).length} 个, 历史记录 ${streamHistory.length} 条`);

    const statements = [];

    const streamersData = [
      { id: 'gosegu', name: '고세구', avatar: 'https://stimg.sooplive.co.kr/LOGO/go/gosegu2/m/gosegu2.webp', bjId: 'gosegu2' },
      { id: 'ine', name: '아이네', avatar: 'https://stimg.sooplive.co.kr/LOGO/in/inehine/m/inehine.webp', bjId: 'inehine' },
      { id: 'jingburger', name: '징버거', avatar: 'https://stimg.sooplive.co.kr/LOGO/ji/jingburger1/m/jingburger1.webp', bjId: 'jingburger1' },
      { id: 'jururu', name: '주르르', avatar: 'https://stimg.sooplive.co.kr/LOGO/co/cotton1217/m/cotton1217.webp', bjId: 'cotton1217' },
      { id: 'lilpa', name: '릴파', avatar: 'https://stimg.sooplive.co.kr/LOGO/li/lilpa0309/m/lilpa0309.webp', bjId: 'lilpa0309' },
      { id: 'viichan', name: '비챤', avatar: 'https://stimg.sooplive.co.kr/LOGO/vi/viichan6/m/viichan6.webp', bjId: 'viichan6' }
    ];

    for (const streamer of streamersData) {
      statements.push({
        sql: 'INSERT OR REPLACE INTO streamers (streamer_id, name, avatar, bj_id) VALUES (?, ?, ?, ?)',
        params: [streamer.id, streamer.name, streamer.avatar, streamer.bjId]
      });
    }

    for (const article of articles) {
      statements.push({
        sql: `INSERT OR REPLACE INTO articles (
          article_id, subject, subject_translated, content, content_translated,
          content_html, content_html_translated, text_content, write_date,
          write_date_formatted, writer_json, menu_json, read_count,
          comment_count, like_count, source, is_ai_translated,
          translated_at, fetched_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [
          article.articleId,
          article.subject,
          article.subjectTranslated || null,
          article.content,
          article.contentTranslated || null,
          article.contentHtml,
          article.contentHtmlTranslated || null,
          article.textContent || null,
          article.writeDate,
          article.writeDateFormatted,
          JSON.stringify(article.writer),
          JSON.stringify(article.menu),
          article.readCount || 0,
          article.commentCount || 0,
          article.likeCount || 0,
          article.source || 'naver',
          article.isAiTranslated || 0,
          article.translatedAt || null,
          article.fetchedAt
        ]
      });
    }

    for (const [streamerId, status] of Object.entries(streamStatus)) {
      statements.push({
        sql: `INSERT OR REPLACE INTO stream_status (
          streamer_id, online, title, category, broad_no, broad_start, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params: [
          streamerId,
          status.online ? 1 : 0,
          status.title || null,
          status.category || null,
          status.broadNo || null,
          status.broadStart || null,
          new Date().toISOString()
        ]
      });
    }

    const recentHistory = streamHistory.slice(-100);
    for (const record of recentHistory) {
      statements.push({
        sql: `INSERT INTO stream_history (
          streamer_id, name, action, title, category, broad_no, old_title, old_category, timestamp
        )
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM stream_history
          WHERE streamer_id = ?
            AND action = ?
            AND timestamp = ?
            AND COALESCE(broad_no, '') = COALESCE(?, '')
        )`,
        params: [
          record.streamerId,
          record.name,
          record.action,
          record.title || null,
          record.category || null,
          record.broadNo || null,
          record.oldTitle || null,
          record.oldCategory || null,
          record.timestamp,
          record.streamerId,
          record.action,
          record.timestamp,
          record.broadNo || null
        ]
      });
    }

    const batchSize = 100;
    for (let i = 0; i < statements.length; i += batchSize) {
      const batch = statements.slice(i, i + batchSize);
      await queryD1(batch.length === 1 ? batch[0] : { batch });
      console.log(`✅ 同步批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(statements.length / batchSize)}`);
    }

    console.log('✅ 数据同步完成');
  } catch (error) {
    console.error('❌ 同步失败:', error.message);
  }
}

// API 路由

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      scraper: scraper?.isRunning ? 'running' : 'stopped',
      monitor: monitor?.isRunning ? 'running' : 'stopped'
    }
  });
});

app.post('/trigger-scraper', authenticate, async (req, res) => {
  try {
    console.log('🕷️  收到爬虫触发请求');

    const result = await scraper.scrape();
    console.log(`✅ 爬虫完成: 新增 ${result.newCount} 篇文章`);

    await syncToD1();

    res.json({
      success: true,
      message: 'Scraper executed and data synced',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('爬虫执行失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/translate', authenticate, async (req, res) => {
  try {
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({ error: 'Missing articleId' });
    }

    console.log(`🌐 翻译文章: ${articleId}`);

    const { Translator } = await import('./src/modules/translator.js');
    const translator = new Translator();

    if (!translator.isEnabled) {
      return res.status(503).json({ error: '翻译功能未启用' });
    }

    const article = db.getArticle(articleId);
    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    const subjectTranslated = await translator.translate(article.subject);
    const contentTranslated = await translator.translate(article.content);

    if (!subjectTranslated || !contentTranslated) {
      throw new Error('翻译失败');
    }

    db.updateArticleTranslation(articleId, {
      subjectTranslated,
      contentTranslated,
      contentHtmlTranslated: contentTranslated.replace(/\n/g, '<br>'),
      isAiTranslated: 1,
      translatedAt: new Date().toISOString()
    });

    await syncToD1();

    res.json({
      translation: {
        subject: subjectTranslated,
        content: contentTranslated
      }
    });
  } catch (error) {
    console.error('翻译失败:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/sync', authenticate, async (req, res) => {
  try {
    await syncToD1();
    res.json({ success: true, message: 'Data synced to D1' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/reload-config', authenticate, async (req, res) => {
  try {
    console.log('🔄 收到配置重载请求');

    const settings = await loadRuntimeConfig();
    if (settings === null) {
      return res.status(500).json({
        success: false,
        error: 'Failed to load configuration from D1'
      });
    }

    await startServices();
    await syncToD1();

    console.log('✅ 配置已重新加载');
    res.json({
      success: true,
      message: 'Configuration reloaded successfully',
      settingsLoaded: Object.keys(settings).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 配置重载失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/broad-summary/:broadNo', authenticate, async (req, res) => {
  try {
    const { broadNo } = req.params;

    console.log(`📊 获取直播总结: ${broadNo}`);

    const response = await fetch(`https://soop-ai-api.sooplive.co.kr/v1.1/broad-summary/kr/${broadNo}`);

    if (!response.ok) {
      console.warn(`⚠️  SOOP AI API 返回错误: ${response.status}`);
      return res.status(response.status).json({ error: '无法获取直播总结' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ 获取直播总结失败:', error.message);
    res.status(500).json({ error: '获取直播总结失败' });
  }
});

async function bootstrap() {
  await loadRuntimeConfig();
  await startServices();
  await syncToD1();

  app.listen(PORT, () => {
    console.log(`🚀 VPS 服务器运行在端口 ${PORT}`);
    console.log(`📡 直播监控: ${monitor?.isRunning ? '运行中' : '已停止'}`);
    console.log(`🕷️  定时爬虫: ${scraper?.isRunning ? '运行中' : '已停止'}`);
    console.log(`🔑 API Key: ${runtimeApiKey.substring(0, 8)}...`);
  });
}

await bootstrap();

const syncIntervalId = setInterval(syncToD1, 5 * 60 * 1000);

process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  clearInterval(syncIntervalId);
  scraper?.stop();
  monitor?.stop();
  process.exit(0);
});
