# API 修复说明

## 问题

之前的代码使用了错误的 API 参数，导致 HTTP 400 错误：

```javascript
// ❌ 错误的参数
sortBy=date
viewType=title
```

## 解决方案

根据 Naver Cafe API 文档，正确的参数应该是：

```javascript
// ✅ 正确的参数
sortBy=TIME
viewType=L
```

## 修复内容

### 1. 修正 URL 参数

**修改前:**
```javascript
const url = `...articles?page=${page}&pageSize=${pageSize}&sortBy=date&viewType=title`;
```

**修改后:**
```javascript
const url = `...articles?page=${page}&pageSize=${pageSize}&sortBy=TIME&viewType=L`;
```

### 2. 完善请求头

添加了更多浏览器特征头部，使请求更像真实浏览器：

```javascript
headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://cafe.naver.com/steamindiegame',
    'Origin': 'https://cafe.naver.com',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
}
```

## API 参数说明

根据 Naver Cafe API 文档：

| 参数 | 类型 | 说明 | 可选值 |
|------|------|------|--------|
| page | number | 页码 | 1, 2, 3... |
| pageSize | number | 每页数量 | 15, 30, 50... |
| sortBy | string | 排序方式 | **TIME** (时间), POPULAR (热门) |
| viewType | string | 视图类型 | **L** (列表), T (标题) |

## 测试

修复后，系统应该能正常获取文章列表：

```bash
npm start
```

预期输出：

```
[INFO] [CafeScraper] 已启用代理: http://127.0.0.1:7890
[INFO] [CafeScraper] 开始爬取文章
[INFO] [CafeScraper] 获取到 15 篇文章  ← 成功！
[SUCCESS] [CafeScraper] 新文章: [作者] 标题
```

## 注意事项

1. **代理配置**: 如果仍然遇到问题，确保代理已正确配置
2. **请求频率**: 避免请求过快，建议间隔至少 1 秒
3. **参数验证**: 确保 CAFE_ID 和 MENU_ID 正确

## 相关文件

- `src/modules/cafe-scraper.js` - 爬虫模块
- `.env` - 配置文件
- `docs/PROXY.md` - 代理配置指南

---

**修复时间**: 2026-01-29  
**版本**: 2.0.1
