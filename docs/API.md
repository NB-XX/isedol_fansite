# API 文档

## 概述

本系统提供统一的 API 接口，用于管理 Cafe 爬虫和直播监控功能。

## 导入

```javascript
import { api } from './src/api/index.js';
```

## Cafe Scraper API

### startCafeScraper()

启动 Cafe 爬虫模块。

**返回值:**
```javascript
{
    success: true,
    message: 'Cafe爬虫已启动'
}
```

**示例:**
```javascript
await api.startCafeScraper();
```

---

### stopCafeScraper()

停止 Cafe 爬虫模块。

**返回值:**
```javascript
{
    success: true,
    message: 'Cafe爬虫已停止'
}
```

---

### scrapeCafeOnce()

执行一次爬取操作（不启动定时任务）。

**返回值:**
```javascript
{
    success: true,
    data: {
        newCount: 5,        // 新增文章数
        total: 50,          // 总文章数
        timestamp: '2026-01-29T10:00:00.000Z'
    }
}
```

---

## Stream Monitor API

### startStreamMonitor()

启动直播监控模块。

**返回值:**
```javascript
{
    success: true,
    message: '直播监控已启动'
}
```

---

### stopStreamMonitor()

停止直播监控模块。

**返回值:**
```javascript
{
    success: true,
    message: '直播监控已停止'
}
```

---

### getStreamStatus()

获取当前直播监控状态。

**返回值:**
```javascript
{
    success: true,
    data: {
        isRunning: true,
        streams: { /* 所有主播状态 */ },
        history: [ /* 最近10条历史记录 */ ]
    }
}
```

---

## Article Data API

### getArticles(options)

获取文章列表。

**参数:**
- `options.limit` (number): 返回数量，默认 10
- `options.search` (string): 搜索关键词
- `options.author` (string): 作者筛选

**返回值:**
```javascript
{
    success: true,
    data: {
        articles: [ /* 文章列表 */ ],
        total: 50,      // 总文章数
        filtered: 10    // 过滤后数量
    }
}
```

**示例:**
```javascript
// 获取最新10篇文章
const result = api.getArticles({ limit: 10 });

// 搜索文章
const result = api.getArticles({ 
    search: '关键词',
    limit: 20 
});

// 按作者筛选
const result = api.getArticles({ 
    author: '비챤',
    limit: 50 
});
```

---

### getArticleById(articleId)

获取单篇文章详情。

**参数:**
- `articleId` (string|number): 文章ID

**返回值:**
```javascript
{
    success: true,
    data: {
        articleId: 21386707,
        subject: "标题",
        content: "内容",
        writer: { /* 作者信息 */ },
        // ... 其他字段
    }
}
```

---

### getArticleStats()

获取文章统计信息。

**返回值:**
```javascript
{
    success: true,
    data: {
        total: 50,
        authors: {
            "비챤": 10,
            "고세구": 15,
            // ...
        },
        dateRange: {
            latest: "2026/1/29 10:00:00",
            oldest: "2026/1/15 09:00:00"
        },
        lastUpdate: "2026-01-29T10:00:00.000Z"
    }
}
```

---

## Stream Data API

### getStreams()

获取所有主播的直播状态。

**返回值:**
```javascript
{
    success: true,
    data: {
        streams: {
            "streamer_id": {
                name: "主播名",
                online: true,
                title: "直播标题",
                category: "分类",
                updatedAt: "2026-01-29T10:00:00.000Z"
            },
            // ...
        },
        count: 10
    }
}
```

---

### getStreamHistory(limit)

获取直播历史记录。

**参数:**
- `limit` (number): 返回数量，默认 50

**返回值:**
```javascript
{
    success: true,
    data: {
        history: [
            {
                streamerId: "streamer_id",
                name: "主播名",
                action: "start",  // 'start' 或 'end'
                title: "直播标题",
                category: "分类",
                timestamp: "2026-01-29T10:00:00.000Z"
            },
            // ...
        ],
        count: 50
    }
}
```

---

## System API

### getSystemStatus()

获取系统整体状态。

**返回值:**
```javascript
{
    success: true,
    data: {
        cafeScraper: {
            running: true,
            articlesCount: 50
        },
        streamMonitor: {
            running: true,
            streamsCount: 10
        },
        config: {
            cafeId: 27842958,
            menuId: 345,
            scraperInterval: "10 分钟"
        }
    }
}
```

---

## 完整示例

```javascript
import { api } from './src/api/index.js';

async function example() {
    // 1. 启动所有模块
    await api.startCafeScraper();
    api.startStreamMonitor();

    // 2. 查看系统状态
    const status = api.getSystemStatus();
    console.log('系统状态:', status.data);

    // 3. 获取最新文章
    const articles = api.getArticles({ limit: 5 });
    console.log('最新文章:', articles.data.articles);

    // 4. 搜索文章
    const searchResult = api.getArticles({ 
        search: '휴뱅',
        limit: 10 
    });
    console.log('搜索结果:', searchResult.data);

    // 5. 获取统计信息
    const stats = api.getArticleStats();
    console.log('统计信息:', stats.data);

    // 6. 获取直播状态
    const streams = api.getStreams();
    console.log('直播状态:', streams.data);

    // 7. 获取历史记录
    const history = api.getStreamHistory(20);
    console.log('历史记录:', history.data);
}

example();
```

---

## 错误处理

所有 API 返回值都包含 `success` 字段：

```javascript
// 成功
{
    success: true,
    data: { /* 数据 */ }
}

// 失败
{
    success: false,
    message: '错误信息'
}
```

建议使用方式：

```javascript
const result = api.getArticles({ limit: 10 });

if (result.success) {
    console.log('数据:', result.data);
} else {
    console.error('错误:', result.message);
}
```
