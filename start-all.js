#!/usr/bin/env node
// start-all.js - 统一启动所有服务
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from './src/config/index.js';
import { CafeScraper } from './src/modules/cafe-scraper.js';
import { StreamMonitor } from './src/modules/stream-monitor.js';
import { getDatabase } from './src/database/index.js';
import { verifyPassword, verifyToken, createSession, readEnvConfig, writeEnvConfig } from './src/api/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================
// 统一日志系统
// ============================================================
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(service, level, message) {
  const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const levelColors = {
    'INFO': colors.blue,
    'SUCCESS': colors.green,
    'WARN': colors.yellow,
    'ERROR': colors.red
  };
  
  const serviceColors = {
    'MAIN': colors.bright,
    'API': colors.cyan,
    'SCRAPER': colors.magenta,
    'MONITOR': colors.yellow
  };
  
  const levelColor = levelColors[level] || colors.reset;
  const serviceColor = serviceColors[service] || colors.reset;
  
  console.log(
    `${colors.gray}[${timestamp}]${colors.reset} ` +
    `${levelColor}[${level.padEnd(7)}]${colors.reset} ` +
    `${serviceColor}[${service.padEnd(8)}]${colors.reset} ` +
    `${message}`
  );
}

// 拦截 logger 输出
import { logger } from './src/utils/logger.js';
const originalLog = logger.log.bind(logger);
logger.log = function(level, moduleName, message) {
  const levelMap = {
    'info': 'INFO',
    'success': 'SUCCESS',
    'warn': 'WARN',
    'error': 'ERROR'
  };
  
  const serviceMap = {
    'CafeScraper': 'SCRAPER',
    'StreamMonitor': 'MONITOR',
    'ArticleDB': 'SCRAPER',
    'StreamDB': 'MONITOR'
  };
  
  const mappedLevel = levelMap[level] || 'INFO';
  const mappedService = serviceMap[moduleName] || 'SYSTEM';
  
  log(mappedService, mappedLevel, message);
};

// ============================================================
// API 服务器
// ============================================================
class APIServer {
  constructor(port = 8080) {
    this.port = port;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    
    // 请求日志
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        log('API', 'INFO', `${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
      });
      next();
    });
  }

  setupRoutes() {
    const db = getDatabase();

    // 主播配置
    const streamerConfig = {
      'gosegu': {
        name: '고세구',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/go/gosegu2/m/gosegu2.webp',
        bjId: 'gosegu2'
      },
      'lilpa': {
        name: '릴파',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/li/lilpa0309/m/lilpa0309.webp',
        bjId: 'lilpa0309'
      },
      'ine': {
        name: '아이네',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/in/inehine/m/inehine.webp',
        bjId: 'inehine'
      },
      'viichan': {
        name: '비챤',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/vi/viichan6/m/viichan6.webp',
        bjId: 'viichan6'
      },
      'jingburger': {
        name: '징버거',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/ji/jingburger1/m/jingburger1.webp',
        bjId: 'jingburger1'
      },
      'jururu': {
        name: '주르르',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/co/cotton1217/m/cotton1217.webp',
        bjId: 'cotton1217'
      }
    };

    // 获取文章列表（基于游标的分页）
    this.app.get('/api/articles', (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 20;
        const cursor = req.query.cursor ? parseInt(req.query.cursor) : null;
        
        // 获取所有文章（按时间降序）
        const allArticles = db.getAllArticles();
        
        let articles;
        if (cursor) {
          // 找到游标位置，返回之后的文章
          const cursorIndex = allArticles.findIndex(a => a.articleId === cursor);
          if (cursorIndex === -1) {
            // 游标无效，返回最新的文章
            articles = allArticles.slice(0, limit);
          } else {
            // 返回游标之后的文章
            articles = allArticles.slice(cursorIndex + 1, cursorIndex + 1 + limit);
          }
        } else {
          // 没有游标，返回最新的文章
          articles = allArticles.slice(0, limit);
        }
        
        const lastUpdate = db.getLastUpdate();
        
        // 判断是否还有更多
        const hasMore = cursor 
          ? allArticles.findIndex(a => a.articleId === cursor) + 1 + limit < allArticles.length
          : limit < allArticles.length;
        
        // 返回下一个游标（最后一篇文章的 ID）
        const nextCursor = articles.length > 0 ? articles[articles.length - 1].articleId : null;

        res.json({ 
          articles,
          lastUpdate,
          hasMore,
          nextCursor
        });
      } catch (error) {
        log('API', 'ERROR', `获取文章失败: ${error.message}`);
        res.status(500).json({ error: '获取文章失败' });
      }
    });

    // 获取单篇文章
    this.app.get('/api/articles/:id', (req, res) => {
      try {
        const articleId = parseInt(req.params.id);
        const articles = db.getAllArticles();
        const article = articles.find(a => a.articleId === articleId);
        
        if (!article) {
          return res.status(404).json({ error: '文章不存在' });
        }

        res.json({ article });
      } catch (error) {
        log('API', 'ERROR', `获取文章失败: ${error.message}`);
        res.status(500).json({ error: '获取文章失败' });
      }
    });

    // 获取主播信息
    this.app.get('/api/streamers', (req, res) => {
      try {
        const streamStatus = db.getAllStreamStatus();
        const streamers = db.getAllStreamers();

        const result = streamers.map(streamer => {
          const status = streamStatus[streamer.streamer_id] || {};
          const history = db.getStreamerHistory(streamer.streamer_id, 20);
          
          return {
            id: streamer.streamer_id,
            name: streamer.name,
            avatar: streamer.avatar,
            bjId: streamer.bj_id,
            isLive: status.online || false,
            streamUrl: status.online 
              ? `https://play.sooplive.co.kr/${streamer.bj_id}/embed`
              : null,
            streamTitle: status.title || '',
            streamCategory: status.category || '',
            broadNo: status.broadNo || null,
            broadStart: status.broadStart || null,
            updatedAt: status.updatedAt,
            history: history
          };
        });

        res.json({ streamers: result });
      } catch (error) {
        log('API', 'ERROR', `获取主播信息失败: ${error.message}`);
        res.status(500).json({ error: '获取主播信息失败' });
      }
    });

    // 获取主播历史记录
    this.app.get('/api/streamers/:id/history', (req, res) => {
      try {
        const streamerId = req.params.id;
        const limit = parseInt(req.query.limit) || 50;
        const history = db.getStreamerHistory(streamerId, limit);

        res.json({ history });
      } catch (error) {
        log('API', 'ERROR', `获取主播历史失败: ${error.message}`);
        res.status(500).json({ error: '获取主播历史失败' });
      }
    });

    // 获取直播 AI 总结
    this.app.get('/api/broad-summary/:broadNo', async (req, res) => {
      try {
        const broadNo = req.params.broadNo;
        
        log('API', 'INFO', `获取直播总结: ${broadNo}`);
        
        const response = await fetch(`https://soop-ai-api.sooplive.co.kr/v1.1/broad-summary/kr/${broadNo}`);
        
        if (!response.ok) {
          log('API', 'WARN', `SOOP AI API 返回错误: ${response.status}`);
          return res.status(response.status).json({ error: '无法获取直播总结' });
        }
        
        const data = await response.json();
        res.json(data);
      } catch (error) {
        log('API', 'ERROR', `获取直播总结失败: ${error.message}`);
        res.status(500).json({ error: '获取直播总结失败' });
      }
    });

    // 翻译 API（批量翻译）
    this.app.post('/api/translate', async (req, res) => {
      try {
        const { texts } = req.body;
        
        if (!texts || !Array.isArray(texts)) {
          return res.status(400).json({ error: '请提供文本数组' });
        }
        
        log('API', 'INFO', `翻译请求: ${texts.length} 条文本`);
        
        // 导入翻译模块
        const { Translator } = await import('./src/modules/translator.js');
        const translator = new Translator();
        
        if (!translator.isEnabled) {
          return res.status(503).json({ error: '翻译功能未启用' });
        }
        
        // 批量翻译（translator 内部会处理速率限制）
        const translations = [];
        for (const text of texts) {
          const translated = await translator.translate(text);
          translations.push(translated || text); // 如果翻译失败，返回原文
        }
        
        res.json(translations);
      } catch (error) {
        log('API', 'ERROR', `翻译失败: ${error.message}`);
        res.status(500).json({ error: '翻译失败' });
      }
    });

    // 翻译 JSON API（一次性翻译整个 JSON 对象）
    this.app.post('/api/translate-json', async (req, res) => {
      try {
        const { data } = req.body;
        
        if (!data) {
          return res.status(400).json({ error: '请提供要翻译的数据' });
        }
        
        log('API', 'INFO', `JSON 翻译请求`);
        
        // 导入翻译模块
        const { Translator } = await import('./src/modules/translator.js');
        const translator = new Translator();
        
        if (!translator.isEnabled) {
          return res.status(503).json({ error: '翻译功能未启用' });
        }
        
        // 将 JSON 转换为字符串，让模型翻译
        const jsonString = JSON.stringify(data, null, 2);
        
        // 构建特殊的 prompt
        const prompt = `请将以下 JSON 数据中的所有韩语文本翻译成简体中文，保持 JSON 结构不变，只翻译文本内容。请直接返回翻译后的 JSON，不要添加任何解释。

原始 JSON:
${jsonString}`;
        
        log('API', 'INFO', `正在翻译 JSON 数据（大小: ${jsonString.length} 字符）...`);
        
        // 使用 translateLarge 方法，超时时间设置为 60 秒
        const translatedText = await translator.translateLarge(prompt, 60000);
        
        if (!translatedText) {
          throw new Error('翻译失败');
        }
        
        // 尝试解析翻译后的 JSON
        let translated;
        try {
          // 提取 JSON 部分（可能包含在代码块中）
          let jsonText = translatedText.trim();
          
          // 移除可能的 markdown 代码块标记
          if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
          } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\s*/, '').replace(/```\s*$/, '');
          }
          
          translated = JSON.parse(jsonText);
          log('API', 'SUCCESS', `JSON 翻译完成`);
        } catch (parseError) {
          log('API', 'ERROR', `JSON 解析失败: ${parseError.message}`);
          log('API', 'ERROR', `翻译结果前 500 字符: ${translatedText.substring(0, 500)}...`);
          throw new Error('翻译结果解析失败');
        }
        
        res.json({ translated });
      } catch (error) {
        log('API', 'ERROR', `JSON 翻译失败: ${error.message}`);
        res.status(500).json({ error: 'JSON 翻译失败: ' + error.message });
      }
    });

    // 翻译单篇文章（AI翻译）
    this.app.post('/api/articles/:id/translate', async (req, res) => {
      try {
        const articleId = parseInt(req.params.id);
        
        log('API', 'INFO', `翻译文章: ${articleId}`);
        
        // 获取文章
        const article = db.getArticle(articleId);
        if (!article) {
          return res.status(404).json({ error: '文章不存在' });
        }
        
        // 如果已有翻译，直接返回
        if (article.subject_translated && article.content_translated) {
          return res.json({
            translation: {
              subject: article.subject_translated,
              content: article.content_html_translated || article.content_translated,
              isAi: article.is_ai_translated === 1
            }
          });
        }
        
        // 导入翻译模块
        const { Translator } = await import('./src/modules/translator.js');
        const translator = new Translator();
        
        if (!translator.isEnabled) {
          return res.status(503).json({ error: '翻译功能未启用' });
        }
        
        // 使用纯文本内容进行翻译
        const textToTranslate = article.text_content || article.content || '';
        
        log('API', 'INFO', `翻译文本长度: ${textToTranslate.length} 字符`);
        
        // 翻译标题和内容
        const subjectTranslated = await translator.translate(article.subject);
        const contentTranslated = await translator.translate(textToTranslate);
        
        if (!subjectTranslated || !contentTranslated) {
          throw new Error('翻译失败');
        }
        
        // 保存翻译结果
        db.updateArticleTranslation(articleId, {
          subjectTranslated,
          contentTranslated,
          contentHtmlTranslated: contentTranslated.replace(/\n/g, '<br>'),
          isAiTranslated: 1,
          translatedAt: new Date().toISOString()
        });
        
        log('API', 'SUCCESS', `文章 ${articleId} 翻译完成`);
        
        res.json({
          translation: {
            subject: subjectTranslated,
            content: contentTranslated.replace(/\n/g, '<br>'),
            isAi: true
          }
        });
      } catch (error) {
        log('API', 'ERROR', `翻译文章失败: ${error.message}`);
        res.status(500).json({ error: '翻译失败: ' + error.message });
      }
    });

    // 人工翻译（管理员）
    this.app.post('/api/articles/:id/manual-translate', async (req, res) => {
      try {
        const articleId = parseInt(req.params.id);
        const { subjectTranslated, contentHtmlTranslated } = req.body;
        
        if (!subjectTranslated || !contentHtmlTranslated) {
          return res.status(400).json({ error: '请提供翻译内容' });
        }
        
        log('API', 'INFO', `人工翻译文章: ${articleId}`);
        
        // 从HTML中提取纯文本
        const contentTranslated = contentHtmlTranslated
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .trim();
        
        // 保存人工翻译
        db.updateArticleTranslation(articleId, {
          subjectTranslated,
          contentTranslated,
          contentHtmlTranslated,
          isAiTranslated: 0, // 标记为人工翻译
          translatedAt: new Date().toISOString()
        });
        
        log('API', 'SUCCESS', `文章 ${articleId} 人工翻译保存成功`);
        
        res.json({ success: true });
      } catch (error) {
        log('API', 'ERROR', `保存人工翻译失败: ${error.message}`);
        res.status(500).json({ error: '保存失败: ' + error.message });
      }
    });

    // 公开配置 API（无需认证）
    this.app.get('/api/settings/public', (req, res) => {
      try {
        const envConfig = readEnvConfig();
        // 只返回公开的配置项
        const publicConfig = {
          BACKGROUND_IMAGE: envConfig.BACKGROUND_IMAGE || '',
          BACKGROUND_BLUR: envConfig.BACKGROUND_BLUR || '0',
          MUSIC_PLAYLIST: envConfig.MUSIC_PLAYLIST || '[]'
        };
        res.json({ config: publicConfig });
      } catch (error) {
        log('API', 'ERROR', `获取公开配置失败: ${error.message}`);
        res.status(500).json({ error: '获取配置失败' });
      }
    });

    // 健康检查
    this.app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          api: 'running',
          scraper: 'running',
          monitor: 'running'
        }
      });
    });
    
    log('API', 'INFO', '注册设置路由...');

    // 设置管理 API - 测试
    this.app.get('/api/settings/test', (req, res) => {
      log('API', 'INFO', '测试路由被调用');
      res.json({ message: 'Settings API is working!' });
    });

    // 设置管理 API - 认证
    this.app.post('/api/settings/auth', (req, res) => {
      try {
        const { password } = req.body;

        if (!password) {
          return res.status(400).json({ error: '请提供密码' });
        }

        if (verifyPassword(password)) {
          const token = createSession();
          log('API', 'INFO', '设置页面登录成功');
          res.json({ success: true, token });
        } else {
          log('API', 'WARN', '设置页面登录失败：密码错误');
          res.status(401).json({ error: '密码错误' });
        }
      } catch (error) {
        log('API', 'ERROR', `认证失败: ${error.message}`);
        res.status(500).json({ error: '认证失败' });
      }
    });

    // 设置管理 API - 获取配置
    this.app.get('/api/settings/config', (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!verifyToken(token)) {
          return res.status(401).json({ error: '未授权' });
        }

        const config = readEnvConfig();
        res.json({ config });
      } catch (error) {
        log('API', 'ERROR', `获取配置失败: ${error.message}`);
        res.status(500).json({ error: '获取配置失败' });
      }
    });

    // 设置管理 API - 保存配置
    this.app.post('/api/settings/config', (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!verifyToken(token)) {
          return res.status(401).json({ error: '未授权' });
        }

        const { config } = req.body;

        if (!config) {
          return res.status(400).json({ error: '请提供配置数据' });
        }

        writeEnvConfig(config);
        log('API', 'SUCCESS', '配置已更新');
        
        res.json({ 
          success: true, 
          message: '配置已保存，请重启服务使配置生效' 
        });
      } catch (error) {
        log('API', 'ERROR', `保存配置失败: ${error.message}`);
        res.status(500).json({ error: '保存配置失败: ' + error.message });
      }
    });

    // 管理员控制台 API - 获取文章列表（带分页和搜索）
    this.app.get('/api/admin/articles', (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!verifyToken(token)) {
          return res.status(401).json({ error: '未授权' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const author = req.query.author || '';
        const source = req.query.source || '';
        const dateFilter = req.query.dateFilter || '';

        const allArticles = db.getAllArticles();
        
        // 过滤
        let filtered = allArticles;
        
        // 搜索过滤
        if (search) {
          filtered = filtered.filter(a => 
            a.subject.includes(search) || a.content.includes(search)
          );
        }
        
        // 作者过滤
        if (author) {
          filtered = filtered.filter(a => a.writer.nick === author);
        }
        
        // 来源过滤
        if (source) {
          filtered = filtered.filter(a => a.source === source);
        }
        
        // 时间过滤
        if (dateFilter) {
          const now = Date.now();
          let startTime = 0;
          
          switch (dateFilter) {
            case 'today':
              startTime = now - 24 * 60 * 60 * 1000;
              break;
            case 'week':
              startTime = now - 7 * 24 * 60 * 60 * 1000;
              break;
            case 'month':
              startTime = now - 30 * 24 * 60 * 60 * 1000;
              break;
            case '3months':
              startTime = now - 90 * 24 * 60 * 60 * 1000;
              break;
          }
          
          if (startTime > 0) {
            filtered = filtered.filter(a => a.writeDate >= startTime);
          }
        }

        // 分页
        const total = filtered.length;
        const start = (page - 1) * limit;
        const articles = filtered.slice(start, start + limit);

        res.json({
          articles,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        log('API', 'ERROR', `获取文章列表失败: ${error.message}`);
        res.status(500).json({ error: '获取文章列表失败' });
      }
    });

    // 管理员控制台 API - 获取单篇文章详情
    this.app.get('/api/admin/articles/:id', (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!verifyToken(token)) {
          return res.status(401).json({ error: '未授权' });
        }

        const articleId = parseInt(req.params.id);
        const articles = db.getAllArticles();
        const article = articles.find(a => a.articleId === articleId);

        if (!article) {
          return res.status(404).json({ error: '文章不存在' });
        }

        res.json({ article });
      } catch (error) {
        log('API', 'ERROR', `获取文章详情失败: ${error.message}`);
        res.status(500).json({ error: '获取文章详情失败' });
      }
    });

    // 管理员控制台 API - 删除文章
    this.app.delete('/api/admin/articles/:id', (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!verifyToken(token)) {
          return res.status(401).json({ error: '未授权' });
        }

        const articleId = parseInt(req.params.id);
        const success = db.deleteArticle(articleId);

        if (success) {
          log('API', 'SUCCESS', `文章已删除: ${articleId}`);
          res.json({ success: true, message: '文章已删除' });
        } else {
          res.status(404).json({ error: '文章不存在' });
        }
      } catch (error) {
        log('API', 'ERROR', `删除文章失败: ${error.message}`);
        res.status(500).json({ error: '删除文章失败' });
      }
    });

    // 管理员控制台 API - 删除文章翻译
    this.app.delete('/api/admin/articles/:id/translation', (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!verifyToken(token)) {
          return res.status(401).json({ error: '未授权' });
        }

        const articleId = parseInt(req.params.id);
        const success = db.deleteArticleTranslation(articleId);

        if (success) {
          log('API', 'SUCCESS', `文章翻译已删除: ${articleId}`);
          res.json({ success: true, message: '翻译已删除' });
        } else {
          res.status(404).json({ error: '文章不存在' });
        }
      } catch (error) {
        log('API', 'ERROR', `删除翻译失败: ${error.message}`);
        res.status(500).json({ error: '删除翻译失败' });
      }
    });

    // 管理员控制台 API - 批量翻译
    log('API', 'INFO', '正在注册批量翻译路由...');
    this.app.post('/api/admin/articles/batch-translate', async (req, res) => {
      log('API', 'INFO', '批量翻译路由被调用');
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!verifyToken(token)) {
          return res.status(401).json({ error: '未授权' });
        }

        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
          return res.status(400).json({ error: '请提供文章 ID 数组' });
        }

        log('API', 'INFO', `批量翻译任务开始: ${ids.length} 篇文章`);
        
        // 导入翻译模块
        const { Translator } = await import('./src/modules/translator.js');
        const translator = new Translator();
        
        if (!translator.isEnabled) {
          return res.status(503).json({ 
            error: '翻译功能未启用',
            message: '请在设置中配置翻译 API'
          });
        }
        
        // 立即返回响应，告诉前端翻译已开始
        res.json({ 
          success: true, 
          message: `开始翻译 ${ids.length} 篇文章`,
          total: ids.length
        });
        
        // 异步执行翻译任务
        (async () => {
          let successCount = 0;
          let failCount = 0;
          
          for (const id of ids) {
            try {
              const articleId = parseInt(id);
              const articles = db.getAllArticles();
              const article = articles.find(a => a.articleId === articleId);
              
              if (!article) {
                log('API', 'WARN', `文章不存在: ${articleId}`);
                failCount++;
                continue;
              }
              
              // 如果已经翻译过，跳过
              if (article.subjectTranslated && article.contentTranslated) {
                log('API', 'INFO', `文章已翻译，跳过: ${articleId}`);
                successCount++;
                continue;
              }
              
              log('API', 'INFO', `正在翻译文章: ${articleId} - ${article.subject}`);
              
              // 翻译标题和内容（translator 内部会处理速率限制）
              const subjectTranslated = await translator.translate(article.subject);
              const contentTranslated = await translator.translate(article.content);
              
              if (subjectTranslated && contentTranslated) {
                // 更新数据库
                db.updateArticleTranslation(articleId, subjectTranslated, contentTranslated);
                log('API', 'SUCCESS', `文章翻译完成: ${articleId}`);
                successCount++;
              } else {
                log('API', 'ERROR', `文章翻译失败: ${articleId}`);
                failCount++;
              }
              
            } catch (error) {
              log('API', 'ERROR', `翻译文章失败 ${id}: ${error.message}`);
              failCount++;
            }
          }
          
          log('API', 'SUCCESS', `批量翻译完成: 成功 ${successCount}/${ids.length}, 失败 ${failCount}`);
        })();
        
      } catch (error) {
        log('API', 'ERROR', `批量翻译失败: ${error.message}`);
        res.status(500).json({ error: '批量翻译失败' });
      }
    });
    log('API', 'SUCCESS', '批量翻译路由注册完成');

    // 管理员控制台 API - 批量删除文章
    this.app.post('/api/admin/articles/batch-delete', (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!verifyToken(token)) {
          return res.status(401).json({ error: '未授权' });
        }

        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
          return res.status(400).json({ error: '请提供文章 ID 数组' });
        }

        let successCount = 0;
        for (const id of ids) {
          if (db.deleteArticle(parseInt(id))) {
            successCount++;
          }
        }

        log('API', 'SUCCESS', `批量删除文章: ${successCount}/${ids.length}`);
        res.json({ 
          success: true, 
          message: `成功删除 ${successCount} 篇文章`,
          count: successCount
        });
      } catch (error) {
        log('API', 'ERROR', `批量删除失败: ${error.message}`);
        res.status(500).json({ error: '批量删除失败' });
      }
    });

    // 管理员控制台 API - 获取统计信息
    this.app.get('/api/admin/stats', (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!verifyToken(token)) {
          return res.status(401).json({ error: '未授权' });
        }

        const totalArticles = db.getArticleCount();
        const translatedArticles = db.getTranslatedCount();
        const allArticles = db.getAllArticles();
        
        // 作者名称映射（合并同一个人的不同账号）
        const authorNameMap = {
          '아이네♪': '아이네',
          '고세구!': '고세구',
          '징버거!': '징버거',
          '징버거☆': '징버거',
          '주르르!': '주르르',
          '주르르_': '주르르',
          '릴파!': '릴파',
          '릴파♬': '릴파',
          '릴파 LILPA': '릴파',
          '비챤!': '비챤',
          '비챤_': '비챤'
        };
        
        // 作者统计（按来源分组）
        const authorStats = {};
        allArticles.forEach(article => {
          const originalAuthor = article.writer.nick;
          const normalizedAuthor = authorNameMap[originalAuthor] || originalAuthor;
          const source = article.source || 'naver';
          
          if (!authorStats[normalizedAuthor]) {
            authorStats[normalizedAuthor] = {
              avatar: article.writer.image,
              naver: 0,
              soop: 0,
              total: 0
            };
          }
          
          if (source === 'soop') {
            authorStats[normalizedAuthor].soop++;
          } else {
            authorStats[normalizedAuthor].naver++;
          }
          authorStats[normalizedAuthor].total++;
        });

        // 最近文章
        const recentArticles = allArticles.slice(0, 5);

        res.json({
          totalArticles,
          translatedArticles,
          untranslatedArticles: totalArticles - translatedArticles,
          translationProgress: totalArticles > 0 ? ((translatedArticles / totalArticles) * 100).toFixed(1) : 0,
          authorStats,
          recentArticles,
          lastUpdate: db.getLastUpdate()
        });
      } catch (error) {
        log('API', 'ERROR', `获取统计信息失败: ${error.message}`);
        res.status(500).json({ error: '获取统计信息失败' });
      }
    });

    // 管理员控制台 API - 触发翻译
    this.app.post('/api/admin/translate/:id', (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!verifyToken(token)) {
          return res.status(401).json({ error: '未授权' });
        }

        const articleId = parseInt(req.params.id);
        
        // 这里需要异步处理翻译，返回任务ID
        res.json({ 
          success: true, 
          message: '翻译任务已提交',
          note: '请使用命令行工具 npm run translate 进行翻译'
        });
      } catch (error) {
        log('API', 'ERROR', `触发翻译失败: ${error.message}`);
        res.status(500).json({ error: '触发翻译失败' });
      }
    });

    // 管理员控制台 API - 重启服务
    this.app.post('/api/admin/restart', (req, res) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!verifyToken(token)) {
          return res.status(401).json({ error: '未授权' });
        }

        log('API', 'INFO', '收到重启请求');
        
        // 检查是否在 PM2 环境中运行
        const isUsingPM2 = process.env.PM2_HOME || process.env.pm_id !== undefined;
        
        if (isUsingPM2) {
          log('API', 'INFO', '检测到 PM2 环境，将在 2 秒后重启服务...');
          res.json({ 
            success: true, 
            message: '服务将在 2 秒后自动重启（PM2 管理）'
          });

          // 延迟重启，让响应先返回
          setTimeout(() => {
            log('API', 'INFO', '正在重启服务...');
            process.exit(0); // PM2 会自动重启
          }, 2000);
        } else {
          log('API', 'WARN', '未检测到 PM2 环境，需要手动重启服务');
          res.json({ 
            success: false, 
            message: '配置已保存，但需要手动重启服务才能生效。建议使用 PM2 管理服务以支持自动重启。',
            needManualRestart: true
          });
        }
      } catch (error) {
        log('API', 'ERROR', `重启失败: ${error.message}`);
        res.status(500).json({ error: '重启失败' });
      }
    });
    
    log('API', 'SUCCESS', '所有管理路由已注册完成');
  }

  start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        log('API', 'SUCCESS', `API 服务器启动成功 http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      log('API', 'INFO', 'API 服务器已停止');
    }
  }
}

// ============================================================
// 主程序
// ============================================================
class Application {
  constructor() {
    this.apiServer = null;
    this.scraper = null;
    this.soopScraper = null;
    this.monitor = null;
  }

  async start() {
    console.clear();
    log('MAIN', 'INFO', '============================================================');
    log('MAIN', 'INFO', '  异世界女团粉丝站 - 统一启动器');
    log('MAIN', 'INFO', '============================================================');
    log('MAIN', 'INFO', '');

    try {
      // 1. 启动 API 服务器
      log('MAIN', 'INFO', '[1/4] 启动 API 服务器...');
      this.apiServer = new APIServer(8080);
      await this.apiServer.start();
      log('MAIN', 'INFO', '');

      // 2. 启动 Cafe 爬虫
      log('MAIN', 'INFO', '[2/4] 启动 Naver Cafe 爬虫...');
      this.scraper = new CafeScraper();
      await this.scraper.start();
      log('MAIN', 'INFO', '');

      // 3. 启动 SOOP 爬虫
      log('MAIN', 'INFO', '[3/4] 启动 SOOP 公告板爬虫...');
      const { SoopScraper } = await import('./src/modules/soop-scraper.js');
      this.soopScraper = new SoopScraper(getDatabase());
      await this.soopScraper.init();
      this.soopScraper.start(config.cafe.interval);
      log('MAIN', 'INFO', '');

      // 4. 启动直播监控
      log('MAIN', 'INFO', '[4/4] 启动直播监控...');
      this.monitor = new StreamMonitor();
      await this.monitor.start();
      log('MAIN', 'INFO', '');

      log('MAIN', 'SUCCESS', '============================================================');
      log('MAIN', 'SUCCESS', '  所有服务已启动！');
      log('MAIN', 'SUCCESS', '============================================================');
      log('MAIN', 'INFO', '');
      log('MAIN', 'INFO', '📊 服务状态:');
      log('MAIN', 'INFO', `  - API 服务器: http://localhost:8080`);
      log('MAIN', 'INFO', `  - Naver Cafe 爬虫: 运行中 (间隔: ${config.cafe.interval / 1000 / 60} 分钟)`);
      log('MAIN', 'INFO', `  - SOOP 公告板爬虫: 运行中 (间隔: ${config.cafe.interval / 1000 / 60} 分钟)`);
      log('MAIN', 'INFO', `  - 直播监控: 运行中`);
      log('MAIN', 'INFO', '');
      log('MAIN', 'INFO', '💡 提示:');
      log('MAIN', 'INFO', '  - 前端网站: cd web && npm run dev');
      log('MAIN', 'INFO', '  - 按 Ctrl+C 停止所有服务');
      log('MAIN', 'INFO', '');

    } catch (error) {
      log('MAIN', 'ERROR', `启动失败: ${error.message}`);
      console.error(error);
      process.exit(1);
    }
  }

  async stop() {
    log('MAIN', 'INFO', '');
    log('MAIN', 'INFO', '正在停止所有服务...');
    
    if (this.scraper) {
      this.scraper.stop();
    }
    
    if (this.monitor) {
      this.monitor.stop();
    }
    
    if (this.apiServer) {
      this.apiServer.stop();
    }
    
    log('MAIN', 'SUCCESS', '所有服务已停止');
    process.exit(0);
  }
}

// ============================================================
// 启动应用
// ============================================================
const app = new Application();

process.on('SIGINT', () => {
  app.stop();
});

process.on('SIGTERM', () => {
  app.stop();
});

app.start().catch((error) => {
  log('MAIN', 'ERROR', `启动失败: ${error.message}`);
  console.error(error);
  process.exit(1);
});
