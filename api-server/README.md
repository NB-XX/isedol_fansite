# Isedol 粉丝站 - API 服务器

提供前端所需数据的 RESTful API 服务器。

## 🚀 快速开始

### 安装依赖

```bash
cd api-server
npm install
```

### 启动服务器

```bash
npm start
```

服务器运行在 http://localhost:8080

### 开发模式（自动重启）

```bash
npm run dev
```

## 📡 API 端点

### 1. 获取文章列表

```
GET /api/articles?limit=20
```

**参数:**
- `limit` (可选): 返回文章数量，默认 20

**响应:**
```json
{
  "articles": [
    {
      "articleId": 21386707,
      "subject": "标题",
      "content": "纯文本内容",
      "contentHtml": "HTML内容",
      "writeDate": 1769157243373,
      "writer": {
        "nick": "作者",
        "memberLevelName": "等级",
        "image": "头像URL"
      },
      "readCount": 1418,
      "commentCount": 128
    }
  ]
}
```

### 2. 获取单篇文章

```
GET /api/articles/:id
```

**响应:**
```json
{
  "article": { /* 文章详情 */ }
}
```

### 3. 获取主播信息

```
GET /api/streamers
```

**响应:**
```json
{
  "streamers": [
    {
      "id": "ine",
      "name": "아이네",
      "avatar": "头像URL",
      "isLive": true,
      "streamUrl": "https://play.sooplive.co.kr/ine/123456/embed",
      "streamTitle": "直播标题",
      "streamCategory": "分类"
    }
  ]
}
```

### 4. 获取主播历史记录

```
GET /api/streamers/:id/history?limit=50
```

**参数:**
- `limit` (可选): 返回记录数量，默认 50

**响应:**
```json
{
  "history": [
    {
      "streamerId": "ine",
      "name": "아이네",
      "action": "start",
      "title": "直播标题",
      "category": "分类",
      "timestamp": "2026-01-29T10:00:00.000Z"
    }
  ]
}
```

### 5. 健康检查

```
GET /api/health
```

**响应:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

## 📁 数据源

API 服务器从以下文件读取数据：

- `../data/articles.json` - 文章数据（由爬虫生成）
- `../data/streams.json` - 直播数据（由监控生成）

## 🔧 配置

### 修改端口

编辑 `server.js`:

```javascript
const PORT = 8080  // 修改为你想要的端口
```

### 添加主播配置

在 `server.js` 的 `streamerConfig` 中添加：

```javascript
'new_streamer': {
  name: '新主播',
  avatar: 'https://...',
  streamUrlTemplate: 'https://play.sooplive.co.kr/new_streamer/{broadNo}/embed'
}
```

## 🛡️ CORS 配置

默认允许所有来源访问。生产环境建议限制：

```javascript
app.use(cors({
  origin: 'https://your-domain.com'
}))
```

## 📊 性能优化

### 缓存

可以添加缓存层减少文件读取：

```javascript
let articlesCache = null
let cacheTime = 0
const CACHE_TTL = 60000 // 1分钟

app.get('/api/articles', (req, res) => {
  const now = Date.now()
  if (!articlesCache || now - cacheTime > CACHE_TTL) {
    articlesCache = readDataFile(ARTICLES_FILE)
    cacheTime = now
  }
  // 使用缓存数据
})
```

### 分页

实现真正的分页：

```javascript
app.get('/api/articles', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const offset = (page - 1) * limit
  
  const articles = allArticles.slice(offset, offset + limit)
  
  res.json({
    articles,
    pagination: {
      page,
      limit,
      total: allArticles.length,
      hasMore: offset + limit < allArticles.length
    }
  })
})
```

## 🔒 安全建议

1. **生产环境使用 HTTPS**
2. **添加速率限制**
3. **验证输入参数**
4. **添加日志记录**
5. **使用环境变量管理配置**

## 📝 日志

服务器启动时会显示：

```
🚀 API 服务器运行在 http://localhost:8080
📁 数据目录: /path/to/data
📄 文章数据: /path/to/data/articles.json
📺 直播数据: /path/to/data/streams.json
```

## 🐛 故障排除

### 问题：无法读取数据文件

**解决方案:**
1. 确保数据采集系统正在运行
2. 检查 `data/` 目录是否存在
3. 检查文件权限

### 问题：CORS 错误

**解决方案:**
1. 确保已安装 `cors` 包
2. 检查前端请求地址是否正确
3. 查看浏览器控制台错误信息

## 📄 许可证

ISC
