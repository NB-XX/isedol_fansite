# 粉丝站启动检查清单

## 📋 启动前检查

### 1. 环境准备

- [ ] Node.js 已安装 (v16+)
- [ ] npm 已安装
- [ ] 代理软件已启动（如需要）

### 2. 配置文件

- [ ] `.env` 文件已配置
  - [ ] CAFE_ID 和 MENU_ID 正确
  - [ ] 代理配置正确（如需要）
  - [ ] Firebase 配置正确

### 3. 依赖安装

```bash
# 根目录
npm install

# API 服务器
cd api-server
npm install

# 前端网站
cd web
npm install
```

## 🚀 启动步骤

### 步骤 1: 启动数据采集系统

```bash
# 在项目根目录
npm start
```

**检查点:**
- [ ] 看到 "系统运行中" 提示
- [ ] 没有错误信息
- [ ] 日志文件 `logs/app.log` 正在更新

**预期输出:**
```
[INFO] [CafeScraper] 已启用代理: http://127.0.0.1:7890
[INFO] [CafeScraper] 开始爬取文章
[INFO] [CafeScraper] 获取到 15 篇文章
[INFO] [StreamMonitor] 直播监控启动
```

### 步骤 2: 启动 API 服务器

```bash
# 新终端
cd api-server
npm start
```

**检查点:**
- [ ] 看到 "API 服务器运行在 http://localhost:8080"
- [ ] 没有端口占用错误
- [ ] 可以访问 http://localhost:8080/api/health

**预期输出:**
```
🚀 API 服务器运行在 http://localhost:8080
📁 数据目录: /path/to/data
📄 文章数据: /path/to/data/articles.json
📺 直播数据: /path/to/data/streams.json
```

### 步骤 3: 启动前端网站

```bash
# 新终端
cd web
npm run dev
```

**检查点:**
- [ ] 看到 "Local: http://localhost:3000"
- [ ] 没有编译错误
- [ ] 浏览器可以访问

**预期输出:**
```
VITE v5.0.11  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

## ✅ 功能测试

### 1. 数据采集测试

```bash
# 检查数据文件
ls -la data/

# 应该看到:
# articles.json
# streams.json
```

**测试:**
- [ ] `data/articles.json` 文件存在
- [ ] 文件大小 > 0
- [ ] 文件内容是有效的 JSON

### 2. API 测试

```bash
# 测试健康检查
curl http://localhost:8080/api/health

# 测试文章接口
curl http://localhost:8080/api/articles

# 测试主播接口
curl http://localhost:8080/api/streamers
```

**测试:**
- [ ] 健康检查返回 `{"status":"ok"}`
- [ ] 文章接口返回文章列表
- [ ] 主播接口返回主播信息

### 3. 前端测试

访问 http://localhost:3000

**测试:**
- [ ] 页面正常加载
- [ ] 看到 6 个主播头像
- [ ] 看到文章卡片列表
- [ ] 没有控制台错误

### 4. 功能测试

**主播功能:**
- [ ] 直播中的主播有彩虹外发光
- [ ] 点击头像打开模态框
- [ ] 模态框显示主播信息
- [ ] 直播中显示播放器
- [ ] 显示开播历史

**文章功能:**
- [ ] 文章按时间倒序排列
- [ ] 显示作者头像和信息
- [ ] 显示文章标题和内容
- [ ] 显示阅读数和评论数
- [ ] "查看原文" 链接可用

**响应式测试:**
- [ ] 桌面端显示正常 (> 768px)
- [ ] 平板端显示正常 (640px - 768px)
- [ ] 移动端显示正常 (< 640px)

## 🐛 常见问题排查

### 问题 1: 数据采集失败 (HTTP 400)

**检查:**
- [ ] 代理是否启动？
- [ ] `.env` 中 `USE_PROXY=true`？
- [ ] 代理端口是否正确？

**解决:**
```bash
# 测试代理
curl --proxy http://127.0.0.1:7890 https://www.google.com
```

### 问题 2: API 服务器无法启动

**检查:**
- [ ] 端口 8080 是否被占用？
- [ ] `data/` 目录是否存在？
- [ ] 依赖是否安装？

**解决:**
```bash
# 检查端口
netstat -ano | findstr :8080

# 创建数据目录
mkdir data

# 重新安装依赖
cd api-server
rm -rf node_modules
npm install
```

### 问题 3: 前端无法加载数据

**检查:**
- [ ] API 服务器是否运行？
- [ ] 浏览器控制台有错误？
- [ ] 网络请求是否成功？

**解决:**
```bash
# 测试 API
curl http://localhost:8080/api/articles

# 检查代理配置
# 编辑 web/vite.config.js
```

### 问题 4: 主播头像不显示

**检查:**
- [ ] 图片 URL 是否正确？
- [ ] 图片是否支持跨域？
- [ ] 网络是否可以访问图片？

**解决:**
```javascript
// 编辑 api-server/server.js
// 更新 streamerConfig 中的 avatar URL
```

### 问题 5: 直播播放器无法加载

**检查:**
- [ ] iframe URL 是否正确？
- [ ] broadNo 是否存在？
- [ ] 直播平台是否允许嵌入？

**解决:**
```javascript
// 检查 Firebase 数据中是否有 broadNo
// 更新 streamUrlTemplate 格式
```

## 📊 性能检查

### 数据采集性能

- [ ] 爬取 15 篇文章 < 30 秒
- [ ] 内存使用 < 100MB
- [ ] CPU 使用 < 10%

### API 性能

- [ ] 响应时间 < 100ms
- [ ] 并发请求 > 100/s
- [ ] 内存使用 < 50MB

### 前端性能

- [ ] 首屏加载 < 2 秒
- [ ] 页面大小 < 1MB
- [ ] Lighthouse 分数 > 90

## 🎯 生产环境检查

### 安全检查

- [ ] 使用 HTTPS
- [ ] API 添加速率限制
- [ ] 敏感信息使用环境变量
- [ ] 添加 CORS 限制
- [ ] 添加 CSP 头部

### 性能优化

- [ ] 启用 Gzip 压缩
- [ ] 添加缓存策略
- [ ] 使用 CDN
- [ ] 图片优化
- [ ] 代码压缩

### 监控

- [ ] 添加日志系统
- [ ] 添加错误追踪
- [ ] 添加性能监控
- [ ] 添加可用性监控

## ✅ 完成！

如果所有检查项都通过，恭喜你！粉丝站已经成功运行。

访问 http://localhost:3000 开始使用吧！🎉

---

**需要帮助？** 查看 [FANSITE_GUIDE.md](FANSITE_GUIDE.md)
