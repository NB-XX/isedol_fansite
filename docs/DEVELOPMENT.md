# 开发指南

本文档面向希望扩展或修改系统的开发者。

## 架构概览

```
┌─────────────────────────────────────────┐
│           index.js (入口)                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         src/api/index.js (API层)         │
│  - 统一接口                               │
│  - 业务逻辑协调                           │
└──────────┬──────────────────────────────┘
           │
           ├──────────────┬──────────────┐
           ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │  Modules │   │ Database │   │  Utils   │
    │  模块层   │   │  数据层   │   │  工具层   │
    └──────────┘   └──────────┘   └──────────┘
```

## 目录结构

```
src/
├── api/              # API 接口层
│   └── index.js      # 统一 API 入口
├── config/           # 配置管理
│   └── index.js      # 配置加载和导出
├── database/         # 数据库层
│   └── index.js      # 数据库类定义
├── modules/          # 功能模块
│   ├── cafe-scraper.js    # Cafe 爬虫
│   └── stream-monitor.js  # 直播监控
└── utils/            # 工具函数
    └── logger.js     # 日志系统
```

## 核心概念

### 1. 模块 (Modules)

模块是独立的功能单元，负责特定的业务逻辑。

**特点:**
- 独立运行
- 通过 API 层暴露接口
- 使用统一的日志和数据库

**示例:**

```javascript
// src/modules/my-module.js
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export class MyModule {
    constructor() {
        this.isRunning = false;
    }

    async start() {
        if (this.isRunning) {
            logger.warn('MyModule', '模块已在运行');
            return;
        }

        this.isRunning = true;
        logger.info('MyModule', '模块启动');

        // 业务逻辑
    }

    stop() {
        this.isRunning = false;
        logger.info('MyModule', '模块停止');
    }
}
```

### 2. 数据库 (Database)

数据库类提供统一的数据存储接口。

**基类:**

```javascript
class Database {
    constructor(filePath, moduleName)
    load()                    // 加载数据
    save()                    // 保存数据
    getDefaultData()          // 获取默认数据结构
}
```

**创建新数据库:**

```javascript
import { Database } from './src/database/index.js';

export class MyDatabase extends Database {
    constructor(filePath) {
        super(filePath, 'MyDB');
    }

    getDefaultData() {
        return {
            items: {},
            lastUpdate: null
        };
    }

    addItem(item) {
        this.data.items[item.id] = item;
        this.data.lastUpdate = new Date().toISOString();
    }

    getItem(id) {
        return this.data.items[id];
    }
}
```

### 3. API 层

API 层协调各个模块，提供统一的接口。

**添加新 API:**

```javascript
// src/api/index.js

class API {
    // ... 现有代码 ...

    // 添加新模块的 API
    async startMyModule() {
        if (!this.myModule) {
            this.myModule = new MyModule();
        }
        await this.myModule.start();
        return { success: true, message: '模块已启动' };
    }

    stopMyModule() {
        if (this.myModule) {
            this.myModule.stop();
            return { success: true, message: '模块已停止' };
        }
        return { success: false, message: '模块未运行' };
    }
}
```

### 4. 日志系统

使用统一的日志系统记录所有操作。

**日志级别:**
- `info` - 一般信息
- `warn` - 警告信息
- `error` - 错误信息
- `success` - 成功信息

**使用方法:**

```javascript
import { logger } from './src/utils/logger.js';

logger.info('ModuleName', '操作信息');
logger.warn('ModuleName', '警告信息');
logger.error('ModuleName', '错误信息', errorObject);
logger.success('ModuleName', '成功信息');
```

## 开发流程

### 1. 添加新功能模块

**步骤:**

1. 在 `src/modules/` 创建模块文件
2. 实现模块类
3. 在 `src/api/index.js` 添加 API
4. 在 `index.js` 添加命令行支持
5. 更新文档

**示例:**

```javascript
// 1. 创建模块 src/modules/notification.js
export class NotificationModule {
    constructor() {
        this.isRunning = false;
    }

    async start() {
        logger.info('Notification', '通知模块启动');
        this.isRunning = true;
    }

    stop() {
        logger.info('Notification', '通知模块停止');
        this.isRunning = false;
    }

    async sendNotification(message) {
        logger.info('Notification', `发送通知: ${message}`);
        // 发送逻辑
    }
}

// 2. 在 API 中添加接口
class API {
    startNotification() {
        if (!this.notification) {
            this.notification = new NotificationModule();
        }
        this.notification.start();
        return { success: true };
    }

    async notify(message) {
        if (this.notification) {
            await this.notification.sendNotification(message);
            return { success: true };
        }
        return { success: false, message: '通知模块未启动' };
    }
}

// 3. 在 index.js 添加命令
case 'notify':
    const message = args.slice(1).join(' ');
    await api.notify(message);
    break;
```

### 2. 扩展数据库

**步骤:**

1. 创建新的数据库类
2. 定义数据结构
3. 实现数据操作方法
4. 在模块中使用

**示例:**

```javascript
// src/database/index.js

export class NotificationDatabase extends Database {
    constructor(filePath) {
        super(filePath, 'NotificationDB');
    }

    getDefaultData() {
        return {
            notifications: [],
            settings: {
                enabled: true
            }
        };
    }

    addNotification(notification) {
        this.data.notifications.push({
            ...notification,
            timestamp: new Date().toISOString()
        });
        
        // 只保留最近100条
        if (this.data.notifications.length > 100) {
            this.data.notifications = this.data.notifications.slice(-100);
        }
    }

    getRecentNotifications(limit = 10) {
        return this.data.notifications.slice(-limit).reverse();
    }
}
```

### 3. 添加配置项

**步骤:**

1. 在 `.env.example` 添加配置项
2. 在 `src/config/index.js` 读取配置
3. 在模块中使用配置

**示例:**

```env
# .env.example
NOTIFICATION_ENABLED=true
NOTIFICATION_WEBHOOK_URL=https://example.com/webhook
```

```javascript
// src/config/index.js
export const config = {
    // ... 现有配置 ...
    
    notification: {
        enabled: process.env.NOTIFICATION_ENABLED === 'true',
        webhookUrl: process.env.NOTIFICATION_WEBHOOK_URL
    }
};
```

## 测试

### 单元测试

```javascript
// tests/cafe-scraper.test.js
import { CafeScraper } from '../src/modules/cafe-scraper.js';

async function testCafeScraper() {
    const scraper = new CafeScraper();
    
    // 测试爬取
    const result = await scraper.scrape();
    console.assert(result.newCount >= 0, '新增数量应该 >= 0');
    console.assert(result.total >= 0, '总数应该 >= 0');
    
    console.log('✅ CafeScraper 测试通过');
}

testCafeScraper();
```

### 集成测试

```javascript
// tests/integration.test.js
import { api } from '../src/api/index.js';

async function testIntegration() {
    // 测试启动
    const startResult = await api.startCafeScraper();
    console.assert(startResult.success, '启动应该成功');
    
    // 测试获取数据
    const articles = api.getArticles({ limit: 5 });
    console.assert(articles.success, '获取文章应该成功');
    
    // 测试停止
    const stopResult = api.stopCafeScraper();
    console.assert(stopResult.success, '停止应该成功');
    
    console.log('✅ 集成测试通过');
}

testIntegration();
```

## 调试

### 启用详细日志

```env
# .env
LOG_LEVEL=debug
```

### 查看日志文件

```bash
# 实时查看日志
tail -f logs/app.log

# 搜索错误
grep ERROR logs/app.log
```

### 使用调试器

```bash
# Node.js 调试
node --inspect index.js all

# 然后在 Chrome 中打开 chrome://inspect
```

## 代码规范

### 命名规范

- 类名: PascalCase (`CafeScraper`)
- 函数名: camelCase (`startCafeScraper`)
- 常量: UPPER_SNAKE_CASE (`CAFE_ID`)
- 文件名: kebab-case (`cafe-scraper.js`)

### 注释规范

```javascript
/**
 * 爬取文章
 * @returns {Promise<Object>} 爬取结果
 */
async scrape() {
    // 实现
}
```

### 错误处理

```javascript
try {
    const result = await someOperation();
    return { success: true, data: result };
} catch (error) {
    logger.error('ModuleName', `操作失败: ${error.message}`);
    return { success: false, message: error.message };
}
```

## 性能优化

### 1. 批量操作

```javascript
// ❌ 不好
for (const item of items) {
    await processItem(item);
}

// ✅ 好
await Promise.all(items.map(item => processItem(item)));
```

### 2. 缓存

```javascript
class MyModule {
    constructor() {
        this.cache = new Map();
    }

    async getData(key) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const data = await fetchData(key);
        this.cache.set(key, data);
        return data;
    }
}
```

### 3. 限流

```javascript
async function rateLimit(fn, delay) {
    await fn();
    await new Promise(resolve => setTimeout(resolve, delay));
}
```

## 发布流程

1. 更新版本号 (`package.json`)
2. 更新 CHANGELOG
3. 运行测试
4. 提交代码
5. 创建 Git Tag
6. 发布 Release

```bash
# 更新版本
npm version patch  # 或 minor, major

# 提交
git add .
git commit -m "Release v2.0.1"

# 创建标签
git tag v2.0.1

# 推送
git push origin main --tags
```

## 常见问题

### Q: 如何添加新的数据源？

A: 创建新的模块类，实现数据获取逻辑，然后在 API 层暴露接口。

### Q: 如何修改日志格式？

A: 编辑 `src/utils/logger.js` 中的 `formatMessage` 方法。

### Q: 如何添加数据库索引？

A: 在数据库类中添加索引字段，在保存时更新索引。

## 资源

- [Node.js 文档](https://nodejs.org/docs/)
- [ES Modules](https://nodejs.org/api/esm.html)
- [Firebase 文档](https://firebase.google.com/docs)
