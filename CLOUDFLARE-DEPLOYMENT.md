# Cloudflare 部署指南

## 架构概述

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare 生态系统                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │ Pages (前端)  │ ───> │ Workers (API)│                    │
│  │  Vue.js SPA  │      │  REST API    │                    │
│  └──────────────┘      └──────┬───────┘                    │
│                               │                             │
│                               ▼                             │
│                        ┌──────────────┐                     │
│                        │   D1 数据库   │                     │
│                        │   SQLite      │                     │
│                        └──────────────┘                     │
│                                                             │
│  ┌──────────────────────────────────────┐                  │
│  │  Cron Triggers (定时任务)             │                  │
│  │  - Naver Cafe 爬虫 (每10分钟)         │                  │
│  │  - SOOP 爬虫 (每10分钟)               │                  │
│  │  - 直播状态检查 (每1分钟)             │                  │
│  └──────────────────────────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

外部服务:
- DeepSeek API (翻译)
- Naver Cafe API
- SOOP API
- Firebase (可选，用于实时通知)
```

## 部署步骤

### 第一步：准备 Cloudflare 账号

1. 注册 Cloudflare 账号: https://dash.cloudflare.com/sign-up
2. 安装 Wrangler CLI:
```bash
npm install -g wrangler
wrangler login
```

### 第二步：创建 D1 数据库

```bash
# 创建 D1 数据库
wrangler d1 create isedol-fansite

# 记录输出的 database_id，类似：
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 第三步：初始化数据库表结构

```bash
# 执行 schema.sql
wrangler d1 execute isedol-fansite --file=./src/database/schema.sql

# 如果需要导入现有数据
wrangler d1 execute isedol-fansite --file=./migration/export-data.sql
```

### 第四步：创建 Workers 项目

项目结构需要调整为：
```
isedol-fansite/
├── workers/              # Cloudflare Workers (新建)
│   ├── api/             # API 路由
│   ├── scrapers/        # 爬虫逻辑
│   ├── wrangler.toml    # Workers 配置
│   └── index.js         # 入口文件
├── web/                 # 前端 (现有)
└── ...
```

### 第五步：配置 wrangler.toml

创建 `workers/wrangler.toml`:
```toml
name = "isedol-fansite-api"
main = "index.js"
compatibility_date = "2024-01-01"

# D1 数据库绑定
[[d1_databases]]
binding = "DB"
database_name = "isedol-fansite"
database_id = "你的database_id"

# 环境变量
[vars]
ENVIRONMENT = "production"

# 密钥 (使用 wrangler secret put 设置)
# DEEPSEEK_API_KEY
# ADMIN_PASSWORD
# FIREBASE_CONFIG

# Cron 触发器
[triggers]
crons = [
  "*/10 * * * *",  # 每10分钟执行爬虫
  "* * * * *"      # 每1分钟检查直播状态
]

# KV 命名空间 (用于缓存)
[[kv_namespaces]]
binding = "CACHE"
id = "你的kv_namespace_id"
```

### 第六步：改造代码为 Workers 格式

**关键差异**：
1. Workers 使用 Fetch API，不是 Express
2. 没有文件系统，使用 D1 和 KV
3. 每次请求都是独立的，无状态
4. 使用 Cron Triggers 替代 setInterval

**示例 Workers 代码结构**：

`workers/index.js`:
```javascript
export default {
  async fetch(request, env, ctx) {
    // 处理 API 请求
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/articles')) {
      return handleArticles(request, env);
    }
    
    if (url.pathname.startsWith('/api/streamers')) {
      return handleStreamers(request, env);
    }
    
    return new Response('Not Found', { status: 404 });
  },
  
  async scheduled(event, env, ctx) {
    // 处理定时任务
    const cron = event.cron;
    
    if (cron === '*/10 * * * *') {
      // 每10分钟执行爬虫
      ctx.waitUntil(runScrapers(env));
    }
    
    if (cron === '* * * * *') {
      // 每1分钟检查直播状态
      ctx.waitUntil(checkStreamStatus(env));
    }
  }
};
```

### 第七步：部署前端到 Pages

```bash
cd web

# 构建前端
npm run build

# 部署到 Pages
wrangler pages deploy dist --project-name=isedol-fansite
```

或者通过 Git 自动部署：
1. 推送代码到 GitHub
2. 在 Cloudflare Dashboard 连接 GitHub 仓库
3. 设置构建命令：`cd web && npm run build`
4. 设置输出目录：`web/dist`

### 第八步：配置环境变量

```bash
# 设置 Workers 密钥
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put ADMIN_PASSWORD
wrangler secret put FIREBASE_CONFIG

# 设置 Pages 环境变量（在 Dashboard 中）
# API_BASE_URL = https://your-worker.workers.dev
```

### 第九步：配置自定义域名

1. 在 Cloudflare Dashboard 添加域名
2. Pages 设置自定义域名：`www.yourdomain.com`
3. Workers 设置路由：`api.yourdomain.com/*`

## 数据迁移

### 导出现有 SQLite 数据

创建 `migration/export-data.js`:
```javascript
import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('./data/database.db');

// 导出为 SQL INSERT 语句
const articles = db.prepare('SELECT * FROM articles').all();
const streamers = db.prepare('SELECT * FROM streamers').all();

let sql = '';

// 生成 INSERT 语句
for (const article of articles) {
  const values = Object.values(article)
    .map(v => v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`)
    .join(', ');
  sql += `INSERT INTO articles VALUES (${values});\n`;
}

fs.writeFileSync('./migration/export-data.sql', sql);
console.log('数据导出完成！');
```

运行导出：
```bash
node migration/export-data.js
```

### 导入到 D1

```bash
wrangler d1 execute isedol-fansite --file=./migration/export-data.sql
```

## 成本估算

### Cloudflare 免费额度

**Pages**:
- ✅ 无限请求
- ✅ 无限带宽
- ✅ 500 次构建/月

**Workers**:
- ✅ 100,000 请求/天
- ✅ 10ms CPU 时间/请求

**D1**:
- ✅ 5GB 存储
- ✅ 500万行读取/天
- ✅ 10万行写入/天

**Cron Triggers**:
- ✅ 免费（包含在 Workers 额度内）

**预计成本**: $0/月（在免费额度内）

如果超出免费额度：
- Workers: $5/月（1000万请求）
- D1: $5/月（额外存储和读写）

## 限制和注意事项

### Workers 限制

1. **CPU 时间**: 每个请求最多 50ms（付费版 30s）
2. **内存**: 128MB
3. **请求大小**: 100MB
4. **响应大小**: 无限制

### D1 限制

1. **数据库大小**: 免费版 5GB
2. **查询时间**: 30秒超时
3. **并发连接**: 无限制（自动管理）

### Cron Triggers 限制

1. **最短间隔**: 1分钟
2. **执行时间**: 最多 30 秒（付费版）
3. **并发**: 自动管理

### 不适合的场景

❌ **实时 WebSocket 连接**（Workers 不支持长连接）
❌ **大文件处理**（内存限制）
❌ **复杂的图像处理**（CPU 限制）

## 替代方案

如果 Cloudflare 限制太多，考虑：

### 方案 1: Cloudflare + VPS 混合
- 前端: Cloudflare Pages
- API + 爬虫: VPS (Hetzner €4/月)
- 数据库: VPS 上的 SQLite
- CDN: Cloudflare

### 方案 2: Vercel + Supabase
- 前端 + API: Vercel
- 数据库: Supabase (PostgreSQL)
- 爬虫: Vercel Cron Jobs

### 方案 3: Railway
- 全栈部署: Railway
- 数据库: Railway PostgreSQL
- 成本: ~$5/月

## 推荐方案

根据你的项目特点，我推荐：

### 🎯 最佳方案：Cloudflare Pages + VPS

**前端**（Cloudflare Pages）:
- 免费
- 全球 CDN
- 自动 HTTPS
- Git 集成

**后端**（便宜的 VPS）:
- Hetzner: €4/月（2 vCPU, 4GB RAM）
- 运行 Node.js 服务
- SQLite 数据库
- 爬虫和监控服务

**优势**:
- ✅ 前端全球加速
- ✅ 后端完全控制
- ✅ 无 Serverless 限制
- ✅ 成本低（€4/月）

## 下一步

选择你的部署方案后，我可以帮你：

1. **完全 Cloudflare**: 改造代码为 Workers 格式
2. **混合部署**: 配置 VPS 和 Cloudflare Pages
3. **其他方案**: 根据需求定制

你想选择哪个方案？
