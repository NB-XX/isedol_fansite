# Isedol 粉丝站数据采集系统

一个模块化的数据采集系统，用于收集和管理 Isedol 相关的 Naver Cafe 文章和直播状态信息。

## 🎉 项目包含

本项目包含三个独立的部分：

1. **数据采集系统** (本目录) - 爬取 Naver Cafe 文章和监控直播状态
2. **API 服务器** (`api-server/`) - 提供数据接口
3. **前端网站** (`web/`) - 用户界面

## 🚀 快速开始

### 方式一：一键启动（Windows）

双击 `start-all.bat` 文件，自动启动所有服务。

### 方式二：分步启动

```bash
# 1. 启动数据采集系统
npm start

# 2. 启动 API 服务器（新终端）
cd api-server
npm install
npm start

# 3. 启动前端网站（新终端）
cd web
npm install
npm run dev
```

然后访问 http://localhost:3000

## 📚 完整文档

- **[FANSITE_GUIDE.md](FANSITE_GUIDE.md)** - 粉丝站完整使用指南 ⭐
- **[FANSITE_SUMMARY.md](FANSITE_SUMMARY.md)** - 项目总结
- **[web/README.md](web/README.md)** - 前端文档
- **[api-server/README.md](api-server/README.md)** - API 文档
- **[docs/PROXY.md](docs/PROXY.md)** - 代理配置指南

## 📋 目录

- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [使用指南](#使用指南)
- [API文档](#api文档)
- [配置说明](#配置说明)

## ✨ 功能特性

### 🤖 Cafe 爬虫模块
- 自动爬取 Naver Cafe 指定栏目的文章
- 增量更新，避免重复爬取
- 提取完整文章信息（标题、正文、作者、时间等）
- 可配置的爬取间隔

### 📺 直播监控模块
- 实时监控主播直播状态
- 自动记录开播/下播事件
- 追踪标题和分类变化
- 保存历史记录

### 💾 数据管理
- 统一的数据库接口
- JSON 格式存储
- 完整的日志系统
- 数据查询和统计

## 📁 项目结构

```
isedol_fansite/
├── src/
│   ├── api/              # 统一API接口
│   │   └── index.js
│   ├── config/           # 配置管理
│   │   └── index.js
│   ├── database/         # 数据库模块
│   │   └── index.js
│   ├── modules/          # 功能模块
│   │   ├── cafe-scraper.js
│   │   └── stream-monitor.js
│   └── utils/            # 工具函数
│       └── logger.js
├── data/                 # 数据存储目录
│   ├── articles.json     # 文章数据
│   └── streams.json      # 直播数据
├── logs/                 # 日志目录
│   └── app.log
├── index.js              # 主入口
├── package.json
├── .env                  # 环境变量配置
└── .env.example          # 环境变量示例
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填写必要的配置信息。

### 3. 启动系统

```bash
# 启动所有模块
npm start

# 或单独启动某个模块
npm run cafe      # 只启动 Cafe 爬虫
npm run stream    # 只启动直播监控
```

## 📖 使用指南

### 命令行接口

```bash
# 启动所有模块
node index.js all

# 启动 Cafe 爬虫
node index.js cafe

# 启动直播监控
node index.js stream

# 查看系统状态
node index.js status

# 查看最新文章（默认10篇）
node index.js articles [数量]

# 查看统计信息
node index.js stats

# 显示帮助
node index.js help
```

### NPM Scripts

```bash
npm start           # 启动所有模块
npm run cafe        # 启动 Cafe 爬虫
npm run stream      # 启动直播监控
npm run status      # 查看系统状态
npm run articles    # 查看最新文章
npm run stats       # 查看统计信息
```

## 🔌 API文档

### Cafe Scraper API

```javascript
import { api } from './src/api/index.js';

// 启动爬虫
await api.startCafeScraper();

// 停止爬虫
api.stopCafeScraper();

// 执行一次爬取
const result = await api.scrapeCafeOnce();
```

### Stream Monitor API

```javascript
// 启动监控
api.startStreamMonitor();

// 停止监控
api.stopStreamMonitor();

// 获取直播状态
const status = api.getStreamStatus();
```

### Article Data API

```javascript
// 获取文章列表
const articles = api.getArticles({
    limit: 10,
    search: '关键词',
    author: '作者名'
});

// 获取单篇文章
const article = api.getArticleById(articleId);

// 获取统计信息
const stats = api.getArticleStats();
```

### Stream Data API

```javascript
// 获取所有直播状态
const streams = api.getStreams();

// 获取历史记录
const history = api.getStreamHistory(50);
```

### System API

```javascript
// 获取系统状态
const status = api.getSystemStatus();
```

## ⚙️ 配置说明

### 环境变量配置 (.env)

```env
# Naver Cafe 配置
CAFE_ID=27842958              # 咖啡厅ID
MENU_ID=345                   # 栏目ID
SCRAPER_INTERVAL=600000       # 爬取间隔（毫秒）

# 代理配置（可选）
USE_PROXY=false               # 是否启用代理
PROXY_URL=http://127.0.0.1:7890  # 代理地址

# Firebase 配置
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_DATABASE_URL=your_database_url

# 数据库配置
DB_ARTICLES_FILE=./data/articles.json
DB_STREAMS_FILE=./data/streams.json

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### 代理配置

如果遇到网络问题（如 HTTP 400、403 错误），可以启用代理：

```env
USE_PROXY=true
PROXY_URL=http://127.0.0.1:7890
```

详细配置请参考 [代理配置指南](docs/PROXY.md)。

### 代码配置

在 `src/config/index.js` 中可以修改默认配置。

## 📊 数据格式

### 文章数据 (articles.json)

```json
{
  "articles": {
    "21386707": {
      "articleId": 21386707,
      "subject": "标题",
      "content": "纯文本内容",
      "contentHtml": "HTML内容",
      "writeDate": 1769157243373,
      "writeDateFormatted": "2026/1/23 12:34:03",
      "writer": {
        "nick": "作者昵称",
        "memberLevel": 888,
        "memberLevelName": "等级名称"
      },
      "readCount": 1418,
      "commentCount": 128
    }
  },
  "lastUpdate": "2026-01-29T10:00:00.000Z",
  "stats": {
    "total": 50,
    "lastArticleId": 21386707
  }
}
```

### 直播数据 (streams.json)

```json
{
  "streams": {
    "streamer_id": {
      "name": "主播名",
      "online": true,
      "title": "直播标题",
      "category": "分类",
      "updatedAt": "2026-01-29T10:00:00.000Z"
    }
  },
  "history": [
    {
      "streamerId": "streamer_id",
      "name": "主播名",
      "action": "start",
      "title": "直播标题",
      "category": "分类",
      "timestamp": "2026-01-29T10:00:00.000Z"
    }
  ],
  "lastUpdate": "2026-01-29T10:00:00.000Z"
}
```

## 📝 日志系统

日志文件位于 `logs/app.log`，格式如下：

```
[2026-01-29T10:00:00.000Z] [INFO] [CafeScraper] 开始爬取文章
[2026-01-29T10:00:01.000Z] [SUCCESS] [CafeScraper] 新文章: [作者] 标题
[2026-01-29T10:00:02.000Z] [INFO] [StreamMonitor] [开播] 主播名
```

## 🔧 开发指南

### 添加新模块

1. 在 `src/modules/` 创建新模块文件
2. 在 `src/api/index.js` 中添加 API 接口
3. 在 `index.js` 中添加命令行支持

### 扩展数据库

继承 `Database` 类创建新的数据库类型：

```javascript
import { Database } from './src/database/index.js';

class MyDatabase extends Database {
    getDefaultData() {
        return { /* 默认数据结构 */ };
    }
    
    // 添加自定义方法
}
```

## ⚠️ 注意事项

1. 首次运行前请配置 `.env` 文件
2. 确保有稳定的网络连接
3. 定期备份 `data/` 目录
4. 日志文件会持续增长，建议定期清理
5. 爬虫请求间隔建议不少于1秒

## 🐛 故障排除

### 问题：Firebase 连接失败
- 检查 `.env` 中的 Firebase 配置是否正确
- 确认网络可以访问 Firebase

### 问题：爬虫无法获取数据 (HTTP 400/403)
- **推荐方案**: 启用代理
  ```env
  USE_PROXY=true
  PROXY_URL=http://127.0.0.1:7890
  ```
- 检查 Cafe ID 和 Menu ID 是否正确
- 确认网络可以访问 Naver Cafe API
- 详细配置请参考 [代理配置指南](docs/PROXY.md)

### 问题：数据未保存
- 检查 `data/` 目录是否有写入权限
- 查看日志文件了解详细错误信息

## 📄 许可证

ISC

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**版本**: 2.0.0  
**更新**: 2026年1月29日
