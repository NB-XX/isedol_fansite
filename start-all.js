#!/usr/bin/env node
// start-all.js - 统一启动所有服务
import express from 'express';
import cors from 'cors';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from './src/config/index.js';
import { CafeScraper } from './src/modules/cafe-scraper.js';
import { StreamMonitor } from './src/modules/stream-monitor.js';

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
    const DATA_DIR = join(__dirname, 'data');
    const ARTICLES_FILE = join(DATA_DIR, 'articles.json');
    const STREAMS_FILE = join(DATA_DIR, 'streams.json');

    const readDataFile = (filePath) => {
      try {
        if (existsSync(filePath)) {
          const content = readFileSync(filePath, 'utf-8');
          return JSON.parse(content);
        }
      } catch (error) {
        log('API', 'ERROR', `读取文件失败 ${filePath}: ${error.message}`);
      }
      return null;
    };

    // 获取文章列表
    this.app.get('/api/articles', (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 20;
        const data = readDataFile(ARTICLES_FILE);
        
        if (!data || !data.articles) {
          return res.json({ articles: [] });
        }

        const articles = Object.values(data.articles)
          .sort((a, b) => b.writeDate - a.writeDate)
          .slice(0, limit);

        res.json({ articles });
      } catch (error) {
        log('API', 'ERROR', `获取文章失败: ${error.message}`);
        res.status(500).json({ error: '获取文章失败' });
      }
    });

    // 获取单篇文章
    this.app.get('/api/articles/:id', (req, res) => {
      try {
        const articleId = req.params.id;
        const data = readDataFile(ARTICLES_FILE);
        
        if (!data || !data.articles) {
          return res.status(404).json({ error: '文章不存在' });
        }

        const article = data.articles[articleId];
        
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
        const data = readDataFile(STREAMS_FILE);
        
        if (!data || !data.streams) {
          return res.json({ streamers: [] });
        }

        const streamerConfig = {
          'gosegu': {
            name: '고세구',
            avatar: 'https://stimg.sooplive.co.kr/LOGO/go/gosegu2/m/gosegu2.webp',
            streamUrlTemplate: 'https://play.sooplive.co.kr/gosegu/{broadNo}/embed'
          },
          'lilpa': {
            name: '릴파',
            avatar: 'https://stimg.sooplive.co.kr/LOGO/li/lilpa0309/m/lilpa0309.webp',
            streamUrlTemplate: 'https://play.sooplive.co.kr/lilpa/{broadNo}/embed'
          },
          'ine': {
            name: '아이네',
            avatar: 'https://stimg.sooplive.co.kr/LOGO/in/inehine/m/inehine.webp',
            streamUrlTemplate: 'https://play.sooplive.co.kr/ine/{broadNo}/embed'
          },
          'viichan': {
            name: '비챤',
            avatar: 'https://stimg.sooplive.co.kr/LOGO/vi/viichan6/m/viichan6.webp',
            streamUrlTemplate: 'https://play.sooplive.co.kr/viichan/{broadNo}/embed'
          },
          'jingburger': {
            name: '징버거',
            avatar: 'https://stimg.sooplive.co.kr/LOGO/ji/jingburger1/m/jingburger1.webp',
            streamUrlTemplate: 'https://play.sooplive.co.kr/jingburger/{broadNo}/embed'
          },
          'jururu': {
            name: '주르르',
            avatar: 'https://stimg.sooplive.co.kr/LOGO/co/cotton1217/m/cotton1217.webp',
            streamUrlTemplate: 'https://play.sooplive.co.kr/jururu/{broadNo}/embed'
          }
        };

        const streamers = Object.entries(data.streams).map(([id, stream]) => {
          const cfg = streamerConfig[id] || { name: id, avatar: '' };
          
          return {
            id,
            name: stream.name || cfg.name,
            avatar: cfg.avatar,
            isLive: stream.online || false,
            streamUrl: stream.online && stream.broadNo 
              ? cfg.streamUrlTemplate.replace('{broadNo}', stream.broadNo)
              : null,
            streamTitle: stream.title || '',
            streamCategory: stream.category || '',
            updatedAt: stream.updatedAt
          };
        });

        res.json({ streamers });
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
        const data = readDataFile(STREAMS_FILE);
        
        if (!data || !data.history) {
          return res.json({ history: [] });
        }

        const history = data.history
          .filter(record => record.streamerId === streamerId)
          .slice(-limit)
          .reverse();

        res.json({ history });
      } catch (error) {
        log('API', 'ERROR', `获取主播历史失败: ${error.message}`);
        res.status(500).json({ error: '获取主播历史失败' });
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
    this.monitor = null;
  }

  async start() {
    console.clear();
    log('MAIN', 'INFO', '============================================================');
    log('MAIN', 'INFO', '  Isedol 粉丝站 - 统一启动器');
    log('MAIN', 'INFO', '============================================================');
    log('MAIN', 'INFO', '');

    try {
      // 1. 启动 API 服务器
      log('MAIN', 'INFO', '[1/3] 启动 API 服务器...');
      this.apiServer = new APIServer(8080);
      await this.apiServer.start();
      log('MAIN', 'INFO', '');

      // 2. 启动 Cafe 爬虫
      log('MAIN', 'INFO', '[2/3] 启动 Cafe 爬虫...');
      this.scraper = new CafeScraper();
      await this.scraper.start();
      log('MAIN', 'INFO', '');

      // 3. 启动直播监控
      log('MAIN', 'INFO', '[3/3] 启动直播监控...');
      this.monitor = new StreamMonitor();
      await this.monitor.start();
      log('MAIN', 'INFO', '');

      log('MAIN', 'SUCCESS', '============================================================');
      log('MAIN', 'SUCCESS', '  所有服务已启动！');
      log('MAIN', 'SUCCESS', '============================================================');
      log('MAIN', 'INFO', '');
      log('MAIN', 'INFO', '📊 服务状态:');
      log('MAIN', 'INFO', `  - API 服务器: http://localhost:8080`);
      log('MAIN', 'INFO', `  - Cafe 爬虫: 运行中 (间隔: ${config.cafe.interval / 1000 / 60} 分钟)`);
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
