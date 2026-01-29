# 快速开始

5分钟快速上手 Isedol 粉丝站点数据采集系统。

## 1. 安装依赖

```bash
npm install
```

## 2. 配置环境变量

```bash
# 复制配置文件
cp .env.example .env
```

编辑 `.env` 文件，至少需要配置 Firebase 相关信息（如果使用直播监控）。

**最小配置示例:**

```env
# Naver Cafe 配置（使用默认值）
CAFE_ID=27842958
MENU_ID=345

# 代理配置（如果遇到网络问题，启用代理）
USE_PROXY=true
PROXY_URL=http://127.0.0.1:7890

# Firebase 配置（如果不使用直播监控可以跳过）
FIREBASE_API_KEY=your_api_key
FIREBASE_DATABASE_URL=your_database_url
```

**代理配置说明:**

如果爬虫遇到 HTTP 400/403 错误，需要启用代理：

```env
USE_PROXY=true
PROXY_URL=http://127.0.0.1:7890  # 根据你的代理软件修改端口
```

常见代理端口：
- Clash: 7890
- V2Ray: 10809
- Shadowsocks: 1080

详细配置请参考 [代理配置指南](docs/PROXY.md)。

## 3. 启动系统

### 方式一：启动所有模块

```bash
npm start
```

这将同时启动 Cafe 爬虫和直播监控。

### 方式二：单独启动模块

```bash
# 只启动 Cafe 爬虫
npm run cafe

# 只启动直播监控
npm run stream
```

## 4. 查看数据

### 查看系统状态

```bash
npm run status
```

输出示例：
```json
{
  "cafeScraper": {
    "running": true,
    "articlesCount": 50
  },
  "streamMonitor": {
    "running": true,
    "streamsCount": 10
  }
}
```

### 查看最新文章

```bash
npm run articles
```

### 查看统计信息

```bash
npm run stats
```

## 5. 数据位置

所有数据保存在 `data/` 目录：

- `data/articles.json` - 文章数据
- `data/streams.json` - 直播数据
- `logs/app.log` - 日志文件

## 常用命令

```bash
npm start           # 启动所有模块
npm run cafe        # 只启动 Cafe 爬虫
npm run stream      # 只启动直播监控
npm run status      # 查看系统状态
npm run articles    # 查看最新文章
npm run stats       # 查看统计信息
```

## 停止系统

按 `Ctrl + C` 停止运行。

## 下一步

- 阅读 [README.md](README.md) 了解详细功能
- 查看 [docs/API.md](docs/API.md) 学习 API 使用
- 参考 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) 进行二次开发

## 故障排除

### 问题：Firebase 连接失败

**解决方案：**
1. 检查 `.env` 中的 Firebase 配置是否正确
2. 确认网络可以访问 Firebase
3. 如果不需要直播监控，只运行 `npm run cafe`

### 问题：无法获取文章

**解决方案：**
1. **启用代理**（推荐）：
   ```env
   USE_PROXY=true
   PROXY_URL=http://127.0.0.1:7890
   ```
2. 检查 `CAFE_ID` 和 `MENU_ID` 是否正确
3. 确认网络可以访问 Naver Cafe API
4. 查看 `logs/app.log` 了解详细错误
5. 参考 [代理配置指南](docs/PROXY.md)

### 问题：数据未保存

**解决方案：**
1. 检查 `data/` 目录是否有写入权限
2. 查看日志文件了解错误信息

## 获取帮助

```bash
node index.js help
```

或查看完整文档：
- [README.md](README.md)
- [docs/API.md](docs/API.md)
- [docs/MIGRATION.md](docs/MIGRATION.md)
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
