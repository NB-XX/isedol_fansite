# Isedol 粉丝站完整指南

## 📋 项目概览

本项目包含三个独立的部分：

1. **数据采集系统** (Node.js) - 爬取 Naver Cafe 文章和监控直播状态
2. **API 服务器** (Express) - 提供数据接口
3. **前端网站** (Vue 3) - 用户界面

```
isedol_fansite/
├── src/                  # 数据采集系统
├── data/                 # 数据存储
├── api-server/           # API 服务器
└── web/                  # 前端网站
```

## 🚀 完整启动流程

### 第一步：启动数据采集系统

```bash
# 在项目根目录
npm start
```

这将启动：
- ✅ Naver Cafe 爬虫（每10分钟更新）
- ✅ 直播状态监控（实时更新）

数据保存在：
- `data/articles.json` - 文章数据
- `data/streams.json` - 直播数据

### 第二步：启动 API 服务器

```bash
# 打开新终端
cd api-server
npm install
npm start
```

API 服务器运行在 http://localhost:8080

### 第三步：启动前端网站

```bash
# 打开新终端
cd web
npm install
npm run dev
```

前端网站运行在 http://localhost:3000

## 🎯 访问网站

打开浏览器访问: **http://localhost:3000**

你将看到：
- 顶部：6个主播头像（直播中有彩虹外发光）
- 下方：最新文章卡片流

## ✨ 功能演示

### 1. 主播动态

- **直播中**: 头像有彩虹色外发光 + LIVE 标签
- **点击头像**: 弹出模态框
  - 如果正在直播：显示内嵌播放器
  - 显示开播历史记录

### 2. 文章展示

每个文章卡片包含：
- 作者头像和昵称
- 发布时间（相对时间，如"3小时前"）
- 文章标题
- 完整的 HTML 内容
- 阅读数和评论数
- 查看原文链接

### 3. 响应式设计

- **移动端**: 2列主播，单列文章
- **平板**: 3列主播，单列文章
- **桌面**: 6列主播，单列文章

## 📊 数据流程

```
Naver Cafe API
      ↓
数据采集系统 (爬虫)
      ↓
data/articles.json
      ↓
API 服务器 (Express)
      ↓
前端网站 (Vue 3)
      ↓
用户浏览器
```

## 🔧 配置说明

### 数据采集系统配置

编辑 `.env`:

```env
# Cafe 配置
CAFE_ID=27842958
MENU_ID=345
SCRAPER_INTERVAL=600000

# 代理配置
USE_PROXY=true
PROXY_URL=http://127.0.0.1:7890

# Firebase 配置
FIREBASE_API_KEY=your_key
FIREBASE_DATABASE_URL=your_url
```

### API 服务器配置

编辑 `api-server/server.js`:

```javascript
const PORT = 8080  // API 端口

// 主播配置
const streamerConfig = {
  'ine': {
    name: '아이네',
    avatar: 'https://...',
    streamUrlTemplate: 'https://play.sooplive.co.kr/ine/{broadNo}/embed'
  },
  // 添加更多主播...
}
```

### 前端配置

编辑 `web/vite.config.js`:

```javascript
server: {
  port: 3000,  // 前端端口
  proxy: {
    '/api': {
      target: 'http://localhost:8080',  // API 地址
      changeOrigin: true
    }
  }
}
```

## 🎨 自定义样式

### 修改主题颜色

编辑 `web/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#00C73C',    // 主色调
      secondary: '#FF6B6B',  // 次要色
      dark: '#1a1a1a',       // 深色
    }
  }
}
```

### 修改彩虹动画

编辑 `web/tailwind.config.js` 中的 `keyframes.rainbow`。

## 📱 部署到生产环境

### 1. 构建前端

```bash
cd web
npm run build
```

产物在 `web/dist/` 目录。

### 2. 使用 Nginx 部署

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/web/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动数据采集系统
pm2 start index.js --name "isedol-data"

# 启动 API 服务器
cd api-server
pm2 start server.js --name "isedol-api"

# 查看状态
pm2 status

# 设置开机自启
pm2 startup
pm2 save
```

## 🐛 故障排除

### 问题1：前端无法获取数据

**检查清单:**
- [ ] 数据采集系统是否运行？
- [ ] API 服务器是否运行？
- [ ] `data/` 目录是否有数据文件？
- [ ] 浏览器控制台是否有错误？

**解决方案:**
```bash
# 检查数据文件
ls -la data/

# 检查 API 服务器
curl http://localhost:8080/api/health

# 查看日志
tail -f logs/app.log
```

### 问题2：主播头像不显示

**原因:** 头像 URL 配置错误或图片加载失败

**解决方案:**
1. 检查 `api-server/server.js` 中的 `streamerConfig`
2. 使用真实的头像 URL
3. 确保图片 URL 支持跨域访问

### 问题3：直播播放器无法加载

**原因:** iframe 嵌入限制或 URL 错误

**解决方案:**
1. 检查直播平台是否允许 iframe 嵌入
2. 确认 `streamUrlTemplate` 格式正确
3. 检查 `broadNo` 是否正确获取

### 问题4：文章内容样式混乱

**原因:** Naver Cafe 的 HTML 样式冲突

**解决方案:**
1. 编辑 `web/src/style.css` 中的 `.cafe-content` 样式
2. 添加更具体的 CSS 规则
3. 使用 `!important` 覆盖冲突样式

## 📈 性能优化

### 1. 启用缓存

在 API 服务器添加缓存：

```javascript
import NodeCache from 'node-cache'
const cache = new NodeCache({ stdTTL: 60 })

app.get('/api/articles', (req, res) => {
  const cacheKey = 'articles'
  const cached = cache.get(cacheKey)
  
  if (cached) {
    return res.json(cached)
  }
  
  // 读取数据...
  cache.set(cacheKey, data)
  res.json(data)
})
```

### 2. 图片优化

使用 CDN 或图片压缩服务。

### 3. 代码分割

Vue 3 自动支持，确保使用动态导入：

```javascript
const StreamerModal = defineAsyncComponent(() =>
  import('./components/StreamerModal.vue')
)
```

## 🔐 安全建议

1. **生产环境使用 HTTPS**
2. **API 添加速率限制**
3. **敏感信息使用环境变量**
4. **定期更新依赖包**
5. **添加 CSP 头部**

## 📚 相关文档

- [数据采集系统文档](README.md)
- [API 服务器文档](api-server/README.md)
- [前端文档](web/README.md)
- [代理配置指南](docs/PROXY.md)
- [API 接口文档](docs/API.md)

## 🎉 完成！

现在你有了一个完整的粉丝站系统：

- ✅ 自动爬取最新文章
- ✅ 实时监控直播状态
- ✅ 美观的响应式界面
- ✅ 完整的 API 服务

享受你的粉丝站吧！🚀

---

**版本**: 1.0.0  
**更新**: 2026-01-29
