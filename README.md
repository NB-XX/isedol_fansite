# 异世界女团粉丝站

基于 Cloudflare 的全栈应用，展示异世界女团（이세계아이돌）的直播状态和 Naver Cafe 文章。

## 功能

- 实时直播监控（通过 Firebase）
- Naver Cafe 文章自动抓取
- AI 翻译（Google Gemini）
- 响应式 Web 界面
- 管理员后台

## 技术栈

- 前端：Vue 3 + Tailwind CSS + Vite
- 后端：Cloudflare Workers + D1 Database
- 部署：Cloudflare Pages
- VPS：Node.js + Express（爬虫和 Firebase 监控）

## 部署

### 1. 准备环境

- Node.js 18+
- Cloudflare 账号
- VPS 服务器
- Google Gemini API Key
- Firebase 项目

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
# Cloudflare
CF_ACCOUNT_ID=your_account_id
CF_DATABASE_ID=your_database_id
CF_API_TOKEN=your_api_token

# VPS
VPS_API_URL=http://your-vps-ip:3000
VPS_API_KEY=your_secure_api_key

# Firebase
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
FIREBASE_PROJECT_ID=your_project_id

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Admin
ADMIN_PASSWORD=your_admin_password
```

### 3. 部署 Cloudflare

```bash
# 安装依赖
npm install

# 创建 D1 数据库
wrangler d1 create isedol-fansite-db

# 初始化数据库
wrangler d1 execute isedol-fansite-db --remote --file=workers/d1-schema.sql

# 初始化配置（在 D1 中存储所有配置）
wrangler d1 execute isedol-fansite-db --remote --file=scripts/init-config.sql

# 部署 Workers
wrangler deploy

# 构建并部署前端
cd web
npm install
npm run build
npx wrangler pages deploy dist --project-name=isedol-fansite
```

### 4. 部署 VPS 服务

```bash
# 在 VPS 上克隆项目
git clone <your-repo>
cd isedol_fansite

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env.vps
nano .env.vps

# 使用 PM2 启动
pm2 start vps-server.js --name isedol-vps
pm2 save
pm2 startup
```

## 本地开发

### 前端开发

```bash
cd web
npm install
npm run dev
```

访问 http://localhost:5173

### Workers 开发

```bash
wrangler dev
```

### VPS 服务开发

```bash
node vps-server.js
```

## 架构

### 整体架构

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────┐
│     Cloudflare Pages (Frontend)     │
│         Vue 3 + Tailwind CSS        │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│    Cloudflare Workers (API)         │
│         RESTful API                 │
└──────┬──────────────────────────────┘
       │
       ├──────────────┐
       ↓              ↓
┌─────────────┐  ┌──────────────┐
│  D1 Database│  │  VPS Server  │
│   (SQLite)  │  │  (Scraper)   │
└─────────────┘  └──────┬───────┘
                        │
                        ├──────────────┐
                        ↓              ↓
                 ┌─────────────┐  ┌──────────┐
                 │   Firebase  │  │  Gemini  │
                 │  (Realtime) │  │   (AI)   │
                 └─────────────┘  └──────────┘
```

### 模块说明

#### 1. 前端 (web/)

- `views/Home.vue` - 主页，展示文章和直播状态
- `views/Admin.vue` - 管理员后台
- `views/Settings.vue` - 设置页面
- `components/StreamerModal.vue` - 主播详情弹窗
- `components/MusicPlayer.vue` - 音乐播放器
- `api/index.js` - API 调用封装

#### 2. Workers API (workers/)

- `index.js` - 主路由文件
  - 文章 CRUD
  - 主播状态查询
  - 图片代理
  - 翻译接口
  - 管理员接口
- `soop-scraper.js` - SOOP 公告板爬虫（Workers Cron 每 10 分钟）
- `d1-schema.sql` - 数据库表结构

> Naver Cafe 文章抓取由 VPS 负责（需代理绕过地域限制 + 自动翻译），不在 Workers 端运行。

#### 3. VPS 服务 (src/)

- `modules/cafe-scraper.js` - Naver Cafe 文章抓取
  - 使用 Puppeteer 模拟浏览器
  - 解析文章内容和图片
  - 同步到 Cloudflare D1
  
- `modules/stream-monitor.js` - 直播状态监控
  - 监听 Firebase Realtime Database
  - 检测开播/下播事件
  - 记录直播历史
  
- `modules/translator.js` - AI 翻译
  - 使用 Google Gemini API
  - 翻译韩文到中文
  - 保留 HTML 格式
  
- `database/index-simple.js` - 内存数据库
  - 缓存文章和主播数据
  - 减少 D1 查询次数

#### 4. 数据库 (D1)

**articles 表**
- 存储 Naver Cafe 文章
- 包含原文和翻译
- 作者信息、统计数据

**streamers 表**
- 主播基本信息
- SOOP Live BJ ID

**stream_status 表**
- 实时直播状态
- 直播标题、分类
- 开播时间

**stream_history 表**
- 直播历史记录
- 开播/下播事件
- 标题/分类变更

**config 表**
- 系统配置（API Key、密码等）
- 通过管理员界面动态修改

### 数据流

#### 文章抓取流程

```
1. Cloudflare Workers Cron (每10分钟)
   ↓
2. 触发 VPS /trigger-scraper
   ↓
3. Puppeteer 访问 Naver Cafe
   ↓
4. 解析文章列表和内容
   ↓
5. 同步到 D1 数据库
   ↓
6. 前端自动刷新显示
```

#### 直播监控流程

```
1. VPS 启动时连接 Firebase
   ↓
2. 监听 /isedol/{streamer_id} 路径
   ↓
3. 检测状态变化（开播/下播）
   ↓
4. 更新 D1 stream_status 表
   ↓
5. 记录到 stream_history 表
   ↓
6. 前端轮询获取最新状态
```

#### 翻译流程

```
1. 用户点击翻译按钮
   ↓
2. Workers API 调用 VPS /translate
   ↓
3. VPS 调用 Google Gemini API
   ↓
4. 返回翻译结果
   ↓
5. 更新 D1 数据库
   ↓
6. 前端显示翻译内容
```

## API 端点

### Cloudflare Workers

- `GET /api/health` - 健康检查
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取文章详情
- `GET /api/streamers` - 获取主播列表
- `GET /api/streamers/:id/history` - 获取直播历史
- `POST /api/articles/:id/translate` - 翻译文章
- `GET /api/proxy/image?url=<url>` - 图片代理
- `GET /api/settings/public` - 获取公开配置

### VPS API

- `GET /health` - 健康检查
- `POST /trigger-scraper` - 触发爬虫（需要 API Key）
- `POST /translate` - 翻译文章（需要 API Key）

## 定时任务

Workers Cron 配置（`wrangler.toml`）：

```toml
[triggers]
crons = ["*/10 * * * *"]  # 每10分钟执行一次
```

## 维护

### 查看 VPS 日志

```bash
pm2 logs isedol-vps
```

### 重启服务

```bash
pm2 restart isedol-vps
```

### 查看数据库

```bash
wrangler d1 execute isedol-fansite-db --remote --command "SELECT COUNT(*) FROM articles"
```

### 手动触发爬虫

```bash
curl -X POST http://your-vps-ip:3000/trigger-scraper \
  -H "Authorization: Bearer your_api_key"
```

## 许可证

MIT License
