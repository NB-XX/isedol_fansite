# 迁移指南

从旧版本（v1.x）迁移到新版本（v2.0）的指南。

## 主要变化

### 1. 项目结构重组

**旧版本:**
```
isedol_fansite/
├── cafe-scraper.js
├── view-articles.js
├── export-data.js
├── monitor.js
└── articles_db.json
```

**新版本:**
```
isedol_fansite/
├── src/
│   ├── api/
│   ├── config/
│   ├── database/
│   ├── modules/
│   └── utils/
├── data/
├── logs/
└── index.js
```

### 2. 命令行变化

**旧版本:**
```bash
npm run scraper    # 启动爬虫
npm run monitor    # 启动监控
npm run view       # 查看数据
npm run export     # 导出数据
```

**新版本:**
```bash
npm start          # 启动所有模块
npm run cafe       # 启动爬虫
npm run stream     # 启动监控
npm run articles   # 查看文章
npm run stats      # 查看统计
```

### 3. 数据文件位置

**旧版本:**
- `articles_db.json` - 文章数据

**新版本:**
- `data/articles.json` - 文章数据
- `data/streams.json` - 直播数据
- `logs/app.log` - 日志文件

### 4. 配置方式

**旧版本:**
配置硬编码在文件中

**新版本:**
使用 `.env` 文件配置

## 迁移步骤

### 步骤 1: 备份数据

```bash
# 备份旧的数据文件
cp articles_db.json articles_db.json.backup
```

### 步骤 2: 安装新依赖

```bash
npm install
```

新增依赖：
- `dotenv` - 环境变量管理

### 步骤 3: 配置环境变量

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env`，填写配置信息。

### 步骤 4: 迁移数据

如果你有旧的 `articles_db.json` 文件，需要迁移数据：

```javascript
// migrate-data.js
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

// 读取旧数据
const oldData = JSON.parse(readFileSync('articles_db.json', 'utf-8'));

// 转换为新格式
const newData = {
    articles: oldData.articles || {},
    lastUpdate: oldData.lastUpdate,
    stats: {
        total: Object.keys(oldData.articles || {}).length,
        lastArticleId: null
    }
};

// 确保目录存在
mkdirSync('data', { recursive: true });

// 保存新数据
writeFileSync('data/articles.json', JSON.stringify(newData, null, 2));

console.log('数据迁移完成！');
```

运行迁移脚本：

```bash
node migrate-data.js
```

### 步骤 5: 测试新系统

```bash
# 查看系统状态
npm run status

# 查看文章
npm run articles

# 启动系统
npm start
```

## API 使用变化

### 旧版本

```javascript
// 直接导入模块
import { CafeScraper } from './cafe-scraper.js';

const scraper = new CafeScraper();
await scraper.start();
```

### 新版本

```javascript
// 使用统一 API
import { api } from './src/api/index.js';

await api.startCafeScraper();
```

## 功能对照表

| 旧功能 | 新功能 | 说明 |
|--------|--------|------|
| `cafe-scraper.js` | `src/modules/cafe-scraper.js` | 爬虫模块 |
| `monitor.js` | `src/modules/stream-monitor.js` | 监控模块 |
| `view-articles.js` | `api.getArticles()` | 查看文章 |
| `export-data.js` | 待实现 | 导出功能 |
| 无 | `src/utils/logger.js` | 日志系统 |
| 无 | `src/config/index.js` | 配置管理 |

## 删除的文件

以下文件已被删除或整合：

- ❌ `cafe-scraper.js` → ✅ `src/modules/cafe-scraper.js`
- ❌ `monitor.js` → ✅ `src/modules/stream-monitor.js`
- ❌ `view-articles.js` → ✅ `api.getArticles()`
- ❌ `export-data.js` → 待重新实现
- ❌ `test-connection.js` → 不再需要
- ❌ `README_SCRAPER.md` → ✅ `README.md`
- ❌ `项目说明.md` → ✅ `README.md`
- ❌ `使用指南.md` → ✅ `README.md`
- ❌ `命令速查.txt` → ✅ `README.md`
- ❌ `快速开始.bat` → 使用 npm scripts

## 常见问题

### Q: 旧的数据文件在哪里？

A: 旧的 `articles_db.json` 需要迁移到 `data/articles.json`。参考步骤4。

### Q: 如何查看文章？

A: 使用 `npm run articles` 或通过 API：

```javascript
const articles = api.getArticles({ limit: 10 });
```

### Q: 导出功能去哪了？

A: 导出功能将在后续版本重新实现。当前可以直接读取 `data/articles.json` 文件。

### Q: 配置文件在哪里？

A: 配置现在使用 `.env` 文件。复制 `.env.example` 并修改。

### Q: 如何同时运行两个模块？

A: 使用 `npm start` 或 `node index.js all`

## 回滚到旧版本

如果需要回滚：

```bash
# 1. 恢复旧的 package.json
git checkout v1.0.0 package.json

# 2. 重新安装依赖
npm install

# 3. 恢复数据文件
cp articles_db.json.backup articles_db.json
```

## 获取帮助

如有问题，请：

1. 查看 [README.md](../README.md)
2. 查看 [API.md](./API.md)
3. 提交 Issue
