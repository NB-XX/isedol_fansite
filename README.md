# 异世界女团粉丝站

异世界女团（Isedol）粉丝站 - 自动采集 Naver Cafe 文章和 Soop Live 直播状态，提供现代化 Web 界面展示。

## ✨ 功能特性

### 📝 文章采集
- 自动采集 Naver Cafe 文章（完整 HTML 内容、图片、格式）
- 支持代理访问，处理 gzip 压缩响应
- 显示文章标题、作者、内容、阅读数、评论数
- 按作者筛选文章功能
- 点击标题直接跳转原文
- 时间显示（相对时间 + 完整时间悬停）
- **AI 自动翻译**（韩语 → 中文）

### 🤖 AI 翻译
- 兼容 OpenAI API 格式
- 自动翻译新采集的文章
- 支持批量翻译历史文章
- 可配置翻译模型和参数
- 自定义翻译 System Prompt
- 命令行工具管理翻译

### 📺 直播监控
- 实时监控 Soop Live 直播状态
- 开播/下播历史记录
- 直播中显示内嵌播放器
- 主播头像红色脉冲边框指示直播状态
- 点击头像查看详细信息和历史

### 🌐 Web 界面
- 现代化响应式设计
- 主播动态卡片展示
- 文章列表展示（支持筛选）
- 实时更新时间显示
- 移动端适配
- **管理员控制台**（密码保护）

### ⚙️ 管理员控制台
- 密码保护访问（Token 鉴权）
- **仪表板**：文章统计、翻译进度、作者统计
- **文章管理**：搜索、筛选、查看、删除、批量操作
- **批量翻译**：选择多篇文章一键提交翻译任务
- **系统设置**：在线编辑配置，保存后自动重启
- 优雅的通知提示（替代 alert）

### 🔄 自动化
- 定时自动更新数据（可配置间隔）
- Firebase 实时数据库监听直播状态
- 统一启动器管理所有服务
- 配置更新后自动重启（支持 PM2）

## 🛠 技术栈

### 后端
- **Node.js** - 运行环境
- **Express** - API 服务器
- **Firebase** - 实时数据库（直播监控）
- **https-proxy-agent** - 代理支持
- **原生 https + zlib** - HTTP 请求和压缩处理

### 前端
- **Vue 3** - 渐进式框架（Composition API）
- **Vite** - 构建工具
- **TailwindCSS** - 样式框架
- **Dayjs** - 时间处理
- **Axios** - HTTP 客户端

### 数据存储
- **SQLite** - 轻量级关系型数据库
- **better-sqlite3** - 高性能同步 SQLite 驱动
- 支持大量数据存储和高效查询
- 自动索引优化查询性能

## 📁 项目结构

```
isedol_fansite/
├── src/                          # 后端源码
│   ├── api/                      # API 接口模块
│   ├── config/                   # 配置管理
│   │   └── index.js             # 统一配置入口
│   ├── database/                 # 数据库操作
│   │   └── index.js             # JSON 文件数据库
│   ├── modules/                  # 核心功能模块
│   │   ├── cafe-scraper.js      # Naver Cafe 爬虫
│   │   └── stream-monitor.js    # Soop Live 直播监控
│   └── utils/                    # 工具函数
│       └── logger.js            # 日志系统
│
├── web/                          # 前端项目（Vue 3）
│   ├── src/
│   │   ├── views/               # 页面组件
│   │   │   └── Home.vue         # 主页（文章 + 主播）
│   │   ├── components/          # UI 组件
│   │   │   └── StreamerModal.vue  # 主播详情弹窗
│   │   ├── api/                 # API 调用封装
│   │   │   └── index.js         # API 接口
│   │   ├── App.vue              # 根组件
│   │   ├── main.js              # 入口文件
│   │   └── style.css            # 全局样式
│   ├── index.html               # HTML 模板
│   ├── vite.config.js           # Vite 配置
│   ├── tailwind.config.js       # TailwindCSS 配置
│   └── package.json             # 前端依赖
│
├── data/                         # 数据文件
│   ├── database.db              # SQLite 数据库
│   ├── articles.json            # 文章数据（已弃用，仅用于迁移）
│   └── streams.json             # 直播数据（已弃用，仅用于迁移）
│
├── logs/                         # 日志文件
├── cache/                        # 缓存文件（图片等）
│
├── scripts/                      # 脚本工具
│   ├── migrate-to-sqlite.js     # 数据迁移脚本（JSON → SQLite）
│   ├── start-all.bat            # Windows 统一启动
│   ├── start.bat                # Windows 分别启动
│   └── start.sh                 # Linux/Mac 启动
│
├── start-all.js                  # 统一启动器（推荐）
├── index.js                      # 命令行工具
├── service-manager.js            # 服务管理器
├── .env                          # 环境变量配置
├── package.json                  # 后端依赖
└── README.md                     # 项目文档
```

### 核心文件说明

| 文件 | 说明 |
|------|------|
| `start-all.js` | 统一启动器，一键启动所有服务（API + 爬虫 + 监控） |
| `index.js` | 命令行工具，支持单独启动各个模块 |
| `src/modules/cafe-scraper.js` | Cafe 爬虫，处理代理、压缩、HTML 解析 |
| `src/modules/stream-monitor.js` | 直播监控，Firebase 实时监听 |
| `web/src/views/Home.vue` | 主页组件，包含文章列表和主播卡片 |
| `web/src/components/StreamerModal.vue` | 主播详情弹窗，显示播放器和历史 |

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- （可选）代理工具（如果需要访问 Naver）

### 1. 克隆项目

```bash
git clone <repository-url>
cd isedol_fansite
```

### 2. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd web
npm install
cd ..
```

### 3. 配置环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
# Naver Cafe 配置
CAFE_ID=27842958
MENU_ID=345
SCRAPER_INTERVAL=600000

# 代理配置（可选）
USE_PROXY=true
PROXY_URL=http://127.0.0.1:7890

# Firebase 配置（直播监控）
FIREBASE_API_KEY=your_api_key
FIREBASE_DATABASE_URL=your_database_url
```

### 4. 启动服务

#### 方式 1: 统一启动（推荐）✨

```bash
npm start
# 或
node start-all.js
```

这将启动：
- ✅ API 服务器（http://localhost:8080）
- ✅ Cafe 爬虫（每 10 分钟更新）
- ✅ 直播监控（实时监听）

#### 方式 2: 分别启动

```bash
# 终端 1: 启动后端服务
node start-all.js

# 终端 2: 启动前端开发服务器
cd web
npm run dev
```

### 5. 访问网站

- **前端界面**: http://localhost:5173
- **API 接口**: http://localhost:8080/api
- **健康检查**: http://localhost:8080/api/health

## 🔄 数据库迁移

项目已从 JSON 文件存储升级到 SQLite 数据库。如果你有旧的 JSON 数据需要迁移：

### 自动迁移（推荐）

```bash
npm run migrate
```

这将自动：
- ✅ 创建 SQLite 数据库（`data/database.db`）
- ✅ 迁移所有文章数据（从 `data/articles.json`）
- ✅ 迁移所有直播数据（从 `data/streams.json`）
- ✅ 创建索引优化查询性能

### 数据库结构

```sql
-- 文章表
articles (
  article_id, subject, content, content_html,
  write_date, author_nick, author_image,
  read_count, comment_count, like_count, ...
)

-- 主播表
streamers (
  streamer_id, name, avatar, bj_id
)

-- 直播状态表
stream_status (
  streamer_id, online, title, category, updated_at
)

-- 直播历史表
stream_history (
  id, streamer_id, name, action, title, category, timestamp
)
```

### 性能优势

- 📊 支持大量数据存储（JSON 文件在数据量大时性能下降）
- 🚀 索引优化查询速度（按时间、作者筛选更快）
- 🔍 支持复杂查询（SQL 查询比 JSON 过滤更灵活）
- 💾 自动事务管理（数据一致性更好）
- 📈 WAL 模式（Write-Ahead Logging）提升并发性能

## 📋 主要命令

### 服务管理

```bash
npm start                    # 统一启动所有服务（推荐）
node start-all.js           # 同上

# 单独启动模块
node index.js cafe          # 只启动 Cafe 爬虫
node index.js stream        # 只启动直播监控
node index.js all           # 启动所有采集模块
```

### 数据查看

```bash
node index.js status        # 查看系统状态
node index.js articles 10   # 查看最新 10 篇文章
node index.js stats         # 查看统计信息
```

### AI 翻译

```bash
npm run translate:test      # 测试 API 连接
npm run translate           # 翻译未翻译的文章
npm run translate:stats     # 查看翻译统计
npm run translate:retranslate  # 重新翻译所有文章（慎用）

# 或使用完整命令
node translate.js test
node translate.js translate
node translate.js stats
```

### 数据库管理

```bash
npm run migrate             # 迁移 JSON 数据到 SQLite
npm run db:update           # 更新数据库结构
```

### 前端开发

```bash
cd web
npm run dev                 # 启动开发服务器
npm run build               # 构建生产版本
npm run preview             # 预览生产版本
```

## 🔧 配置说明

### 环境变量 (.env)

```env
# ===== Naver Cafe 配置 =====
CAFE_ID=27842958              # 咖啡厅 ID
MENU_ID=345                   # 菜单 ID（公告板）
SCRAPER_INTERVAL=600000       # 爬取间隔（毫秒，默认 10 分钟）

# ===== 代理配置 =====
USE_PROXY=true                # 是否使用代理
PROXY_URL=http://127.0.0.1:7890  # 代理地址

# ===== Firebase 配置（直播监控）=====
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your_app_id

# ===== 数据库配置 =====
DB_ARTICLES_FILE=./data/articles.json
DB_STREAMS_FILE=./data/streams.json

# ===== 日志配置 =====
LOG_LEVEL=info                # 日志级别：debug, info, warn, error
LOG_FILE=./logs/app.log       # 日志文件路径

# ===== AI 翻译配置 =====
TRANSLATION_ENABLED=false     # 是否启用翻译
TRANSLATION_API_URL=https://api.openai.com/v1/chat/completions  # API 地址
TRANSLATION_API_KEY=your_api_key_here  # API Key
TRANSLATION_MODEL=gpt-3.5-turbo        # 模型名称
TRANSLATION_SYSTEM_PROMPT=你是一个专业的韩中翻译助手...  # System Prompt
TRANSLATION_TEMPERATURE=0.3            # 温度参数（0-1）
TRANSLATION_MAX_TOKENS=2000           # 最大 Token 数
TRANSLATION_TIMEOUT=30000             # 超时时间（毫秒）
```

详细的翻译配置说明请参考 [TRANSLATION.md](./TRANSLATION.md)

### 主播配置

编辑 `start-all.js` 中的 `streamerConfig`：

```javascript
const streamerConfig = {
  'gosegu': {
    name: '고세구',
    avatar: 'https://stimg.sooplive.co.kr/LOGO/go/gosegu2/m/gosegu2.webp',
    bjId: 'gosegu2'  // Soop Live 用户名
  },
  // 添加更多主播...
}
```

## 📊 数据结构

### 文章数据 (articles.json)

```json
{
  "articles": {
    "21407302": {
      "articleId": 21407302,
      "subject": "[징버거] 오늘은 카페를 볼게요오",
      "content": "纯文本内容（用于搜索和预览）",
      "contentHtml": "<div class=\"se-viewer\">完整 HTML 内容（包含格式、图片、贴纸）</div>",
      "writeDate": 1769752759910,
      "writeDateFormatted": "2026/1/30 13:59:19",
      "writer": {
        "nick": "징버거",
        "image": "https://stimg.sooplive.co.kr/LOGO/ji/jingburger1/m/jingburger1.webp",
        "memberKey": "u5-1lNHtyGWRbaa1dm5XCg",
        "memberLevel": 888,
        "memberLevelName": "카페 스탭"
      },
      "menu": {
        "id": 345,
        "name": "▶ 이세돌의 공지사항"
      },
      "readCount": 5713,
      "commentCount": 325,
      "likeCount": 1632,
      "fetchedAt": "2026-01-31T15:09:18.239Z"
    }
  },
  "lastUpdate": "2026-01-31T15:41:13.782Z",
  "stats": {
    "total": 15,
    "lastArticleId": 21401671
  }
}
```

### 直播数据 (streams.json)

```json
{
  "streams": {
    "gosegu": {
      "name": "고세구",
      "category": "버추얼",
      "online": true,
      "title": "골골골...고르르",
      "updatedAt": "2026-01-31T15:52:42.164Z"
    }
  },
  "history": [
    {
      "streamerId": "gosegu",
      "name": "고세구",
      "action": "start",
      "title": "골골골...고르르",
      "category": "버추얼",
      "timestamp": "2026-01-31T15:17:34.681Z"
    },
    {
      "streamerId": "gosegu",
      "action": "end",
      "title": "골골골...고르르",
      "category": "버추얼",
      "timestamp": "2026-01-31T16:30:15.292Z"
    }
  ],
  "lastUpdate": "2026-01-31T15:52:42.164Z"
}
```

## 🔌 API 接口

### 文章接口

#### 获取文章列表
```http
GET /api/articles?limit=20
```

**响应**:
```json
{
  "articles": [...],
  "lastUpdate": "2026-01-31T15:41:13.782Z"
}
```

#### 获取单篇文章
```http
GET /api/articles/:id
```

### 直播接口

#### 获取主播列表
```http
GET /api/streamers
```

**响应**:
```json
{
  "streamers": [
    {
      "id": "gosegu",
      "name": "고세구",
      "avatar": "https://...",
      "isLive": true,
      "streamUrl": "https://play.sooplive.co.kr/gosegu2/embed",
      "streamTitle": "골골골...고르르",
      "streamCategory": "버추얼",
      "history": [...]
    }
  ]
}
```

#### 获取主播历史
```http
GET /api/streamers/:id/history?limit=50
```

### 健康检查
```http
GET /api/health
```

## 🎨 功能亮点

### 1. 完整的 HTML 内容采集
- 使用原生 `https` 模块 + `HttpsProxyAgent` 支持代理
- 处理 gzip/deflate/br 压缩响应
- 保留完整的 HTML 格式、图片、贴纸等

### 2. 作者筛选功能
- 点击文章底部按钮筛选该作者的所有文章
- 按钮显示选中状态（绿色背景 + ✓）
- 顶部显示筛选标识，可点击取消

### 3. 智能时间显示
- 相对时间显示（如"3分钟前"）
- 鼠标悬停显示完整时间（YYYY-MM-DD HH:mm:ss）
- 右上角显示最后更新时间

### 4. 直播监控
- Firebase 实时监听直播状态
- 开播/下播自动记录历史
- 直播中显示内嵌播放器
- 红色脉冲边框指示直播状态

### 5. 响应式设计
- 移动端适配
- 流畅的动画效果
- 现代化 UI 设计

## 🔨 开发指南

### 添加新主播

1. 编辑 `start-all.js`，在 `streamerConfig` 中添加：

```javascript
const streamerConfig = {
  'newstreamer': {
    name: '新主播',
    avatar: 'https://stimg.sooplive.co.kr/LOGO/.../avatar.webp',
    bjId: 'newstreamer_id'  // Soop Live 用户名
  }
}
```

2. 编辑 `src/modules/cafe-scraper.js`，在 `ISEDOL_AVATARS` 中添加：

```javascript
this.ISEDOL_AVATARS = {
  '新主播': 'https://stimg.sooplive.co.kr/LOGO/.../avatar.webp'
}
```

### 修改爬取间隔

编辑 `.env` 文件：

```env
SCRAPER_INTERVAL=300000  # 5 分钟（毫秒）
```

### 自定义样式

- 全局样式：`web/src/style.css`
- TailwindCSS 配置：`web/tailwind.config.js`
- 组件样式：直接在 Vue 组件中使用 TailwindCSS 类

### 调试技巧

1. **查看日志**：
```bash
tail -f logs/app.log
```

2. **测试 API**：
```bash
curl http://localhost:8080/api/health
curl http://localhost:8080/api/articles?limit=5
```

3. **前端开发**：
```bash
cd web
npm run dev  # 支持热重载
```

## ⚠️ 注意事项

1. **代理配置**
   - 如果网络访问 Naver 受限，需要配置代理
   - 确保代理服务器正常运行
   - 测试代理：`curl -x http://127.0.0.1:7890 https://cafe.naver.com`

2. **Firebase 配置**
   - 直播监控需要 Firebase 实时数据库
   - 确保 Firebase 配置正确
   - 数据库规则需要允许读取

3. **端口占用**
   - API 服务器：8080
   - 前端开发服务器：5173
   - 确保端口未被占用

4. **数据更新**
   - 首次运行会创建数据文件
   - 数据文件位于 `data/` 目录
   - 可以手动备份数据文件

5. **性能优化**
   - 爬取间隔不要设置太短（建议 >= 5 分钟）
   - 定期清理日志文件
   - 考虑使用数据库替代 JSON 文件（大量数据时）

## 🐛 常见问题

### Q: 爬虫无法获取文章？
A: 检查代理配置，确保可以访问 Naver Cafe。

### Q: 直播监控不工作？
A: 检查 Firebase 配置是否正确，数据库规则是否允许读取。

### Q: 前端无法连接 API？
A: 检查 API 服务器是否启动，端口是否正确。

### Q: 文章内容显示不完整？
A: 确保使用最新版本的代码，已修复 contentHtml 采集问题。

## 📝 更新日志

### v2.0.0 (2026-01-31)
- ✨ 完整的 HTML 内容采集（包含格式、图片、贴纸）
- ✨ 作者筛选功能
- ✨ 智能时间显示（相对时间 + 完整时间）
- ✨ 直播播放器内嵌
- ✨ 开播历史记录
- 🎨 UI 优化（移除 LIVE 标签，改用脉冲边框）
- 🐛 修复代理支持问题
- 🐛 修复 gzip 压缩响应处理

### v1.0.0
- 🎉 初始版本
- 📝 基础文章采集
- 📺 基础直播监控
- 🌐 Web 界面

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 🙏 致谢

- [异世界女团](https://cafe.naver.com/steamindiegame) - 数据来源
- [Soop Live](https://www.sooplive.co.kr/) - 直播平台
- Vue.js、TailwindCSS 等开源项目

---

**Made with ❤️ for Isedol Fans**
