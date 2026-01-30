# Isedol 粉丝站

Isedol 粉丝站 - 自动采集 Naver Cafe 文章和直播状态，提供 Web 界面展示。

## 功能

- 📝 自动采集 Naver Cafe 文章（标题、作者、内容、时间）
- 📺 监控 Soop Live 直播状态
- 🌐 Web 界面展示文章和直播信息
- 🔄 定时自动更新数据
- 🎨 响应式设计，支持移动端

## 技术栈

### 后端
- Node.js + Express
- 数据存储：JSON 文件

### 前端
- Vue 3 + Vite
- TailwindCSS
- Dayjs

## 项目结构

```
isedol_fansite/
├── src/                    # 后端源码
│   ├── api/               # API 接口
│   ├── config/            # 配置管理
│   ├── database/          # 数据库操作
│   ├── modules/           # 功能模块
│   │   ├── cafe-scraper.js    # Cafe 爬虫
│   │   └── stream-monitor.js  # 直播监控
│   └── utils/             # 工具函数
├── api-server/            # API 服务器
├── web/                   # 前端项目
│   └── src/
│       ├── views/         # 页面组件
│       ├── components/    # UI 组件
│       └── api/           # API 调用
├── data/                  # 数据文件
│   ├── articles.json      # 文章数据
│   └── streams.json       # 直播数据
├── scripts/               # 启动脚本
└── start-all.js          # 统一启动器

```

## 快速开始

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装 API 服务器依赖
cd api-server
npm install

# 安装前端依赖
cd ../web
npm install
cd ..
```

### 2. 配置环境变量

```bash
# 复制配置文件
copy .env.example .env

# 编辑 .env 文件，配置代理等（可选）
```

### 3. 启动服务

#### 方式 1: 统一启动（推荐）

```bash
npm start
```

这将启动：
- 数据采集服务（Cafe 爬虫 + 直播监控）
- API 服务器（端口 8080）

#### 方式 2: 分别启动

```bash
# 启动数据采集
node index.js all

# 启动 API 服务器（新窗口）
cd api-server
npm start

# 启动前端（新窗口）
cd web
npm run dev
```

### 4. 访问网站

打开浏览器访问：http://localhost:3000

## 主要命令

```bash
# 数据采集
npm start                    # 统一启动所有服务
node index.js cafe          # 只启动 Cafe 爬虫
node index.js stream        # 只启动直播监控
node index.js all           # 启动所有采集模块

# 查看数据
node index.js status        # 查看系统状态
node index.js articles 10   # 查看最新 10 篇文章
node index.js stats         # 查看统计信息

# 开发
cd web && npm run dev       # 启动前端开发服务器
cd web && npm run build     # 构建前端生产版本
```

## 配置说明

### 环境变量 (.env)

```env
# Naver Cafe 配置
CAFE_ID=27842958              # 咖啡厅 ID
MENU_ID=345                   # 菜单 ID
SCRAPER_INTERVAL=600000       # 爬取间隔（毫秒）

# 代理配置（可选）
USE_PROXY=false               # 是否使用代理
PROXY_URL=http://127.0.0.1:7890  # 代理地址

# 数据库配置
DB_ARTICLES_FILE=./data/articles.json
DB_STREAMS_FILE=./data/streams.json

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

## 数据结构

### 文章数据 (articles.json)

```json
{
  "articles": {
    "21407302": {
      "articleId": 21407302,
      "subject": "文章标题",
      "content": "文章内容",
      "contentHtml": "<div>HTML 内容</div>",
      "writeDate": 1769752759910,
      "writer": {
        "nick": "作者昵称",
        "image": "头像 URL",
        "memberLevel": 888
      },
      "readCount": 2561,
      "commentCount": 275,
      "likeCount": 1058
    }
  }
}
```

### 直播数据 (streams.json)

```json
{
  "streams": {
    "gosegu": {
      "name": "고세구",
      "online": true,
      "broadNo": "123456",
      "title": "直播标题",
      "category": "游戏分类"
    }
  }
}
```

## API 接口

### 文章接口

- `GET /api/articles?limit=20` - 获取文章列表
- `GET /api/articles/:id` - 获取单篇文章

### 直播接口

- `GET /api/streamers` - 获取主播列表
- `GET /api/streamers/:id/history` - 获取主播历史

## 开发说明

### 添加新的主播

编辑 `src/modules/cafe-scraper.js`，在 `ISEDOL_AVATARS` 中添加：

```javascript
this.ISEDOL_AVATARS = {
  '主播昵称': 'https://stimg.sooplive.co.kr/LOGO/.../avatar.webp',
  // ...
};
```

### 修改爬取间隔

编辑 `.env` 文件：

```env
SCRAPER_INTERVAL=600000  # 10 分钟（毫秒）
```

### 自定义样式

编辑 `web/src/style.css` 修改前端样式。

## 注意事项

1. **代理配置**：如果网络访问 Naver 受限，需要配置代理
2. **数据更新**：首次运行会创建数据文件，后续自动更新
3. **端口占用**：确保 8080 和 3000 端口未被占用

## 许可证

MIT License

## 作者

Isedol 粉丝站开发团队
