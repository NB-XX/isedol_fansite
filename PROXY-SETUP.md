# 代理配置说明

## 问题说明

Naver Cafe 的文章详情 API 需要通过代理访问才能获取完整的 HTML 内容（包括格式、图片等）。

### 当前状态

**未开启代理时**:
- ✅ 可以获取文章列表
- ❌ 无法获取文章详情（contentHtml）
- 📝 只能使用 summary 作为降级方案
- 结果：文章只有纯文本，没有格式和图片

**开启代理后**:
- ✅ 可以获取文章列表
- ✅ 可以获取文章详情（contentHtml）
- 🎨 包含完整的 HTML 格式
- 🖼️ 包含图片、贴纸等富媒体内容

## 配置方法

### 1. 检查 .env 配置

打开 `.env` 文件，找到代理配置部分：

```env
# 代理配置（用于访问 Naver Cafe API）
PROXY_ENABLED=false
PROXY_URL=http://127.0.0.1:7890
```

### 2. 启用代理

修改配置：

```env
# 代理配置（用于访问 Naver Cafe API）
PROXY_ENABLED=true
PROXY_URL=http://127.0.0.1:7890  # 修改为你的代理地址
```

### 3. 常见代理软件端口

- **Clash**: `http://127.0.0.1:7890`
- **V2Ray**: `http://127.0.0.1:10809`
- **Shadowsocks**: `http://127.0.0.1:1080`
- **其他**: 查看你的代理软件设置

### 4. 重启服务

修改配置后，重启服务使配置生效：

```bash
# 停止当前服务（Ctrl+C）
# 然后重新启动
npm start
```

## 验证代理是否生效

### 方法 1：查看日志

启动服务后，查看日志输出：

```
[SCRAPER] 已启用代理: http://127.0.0.1:7890
[SCRAPER] ✓ 成功获取文章 21386707 完整内容 (12345 字符)
```

如果看到 "✓ 成功获取文章" 和字符数，说明代理工作正常。

### 方法 2：检查数据库

运行以下命令检查文章内容：

```bash
node -e "import('./src/database/index.js').then(m => { const db = m.getDatabase(); const articles = db.getAllArticles().filter(a => a.source === 'naver'); const withHtml = articles.filter(a => a.contentHtml && a.contentHtml.length > 100); console.log('Naver 文章总数:', articles.length); console.log('有完整 HTML 的文章:', withHtml.length); if (withHtml.length > 0) { const sample = withHtml[0]; console.log('\\n示例:'); console.log('HTML 长度:', sample.contentHtml.length); console.log('包含图片:', sample.contentHtml.includes('<img')); } db.close(); })"
```

### 方法 3：查看前端显示

1. 打开前端页面
2. 查看 Naver Cafe 的文章
3. 检查是否有：
   - 文本格式（粗体、斜体、颜色等）
   - 图片
   - 贴纸
   - 其他富媒体内容

## API 说明

### 文章列表 API（无需代理）

```
GET https://apis.naver.com/cafe-web/cafe-boardlist-api/v1/cafes/{cafeId}/menus/{menuId}/articles
```

返回字段：
- `articleId`: 文章 ID
- `subject`: 标题
- `summary`: 摘要（纯文本）
- ❌ 不包含完整 HTML

### 文章详情 API（需要代理）

```
GET https://article.cafe.naver.com/gw/v4/cafes/{cafeId}/articles/{articleId}
```

返回字段：
- `subject`: 标题
- `content`: 纯文本内容
- `contentHtml`: 完整 HTML 内容 ✅
- 包含图片、格式、贴纸等

## 代码实现

爬虫代码已经实现了自动降级：

```javascript
// 尝试获取文章详情
const articleDetail = await this.fetchArticleDetail(articleId);

if (articleDetail && articleDetail.contentHtml) {
    // 成功：使用完整 HTML
    contentHtml = articleDetail.contentHtml;
    content = this.extractTextFromHtml(contentHtml);
} else {
    // 失败：使用 summary 作为降级方案
    content = articleItem.summary || '';
    contentHtml = content ? `<div class="article-content">${content.replace(/\n/g, '<br>')}</div>` : '';
}
```

## 故障排查

### 问题 1：代理无法连接

**症状**:
```
[SCRAPER] 获取文章 21386707 详情失败: connect ECONNREFUSED
```

**解决**:
1. 检查代理软件是否运行
2. 检查代理端口是否正确
3. 检查防火墙设置

### 问题 2：代理连接超时

**症状**:
```
[SCRAPER] 获取文章 21386707 详情失败: Request timeout
```

**解决**:
1. 检查网络连接
2. 尝试更换代理节点
3. 增加超时时间（代码中已设置 30 秒）

### 问题 3：文章仍然没有格式

**症状**: 开启代理后，文章仍然只有纯文本

**解决**:
1. 确认代理配置正确
2. 重启服务
3. 等待爬虫下次运行（10 分钟间隔）
4. 或手动触发爬取新文章

## 重新爬取已有文章

如果想重新爬取已有文章以获取完整 HTML：

### 方法 1：删除数据库重新爬取

```bash
# 备份数据库
copy data\database.db data\database.db.backup

# 删除数据库
del data\database.db

# 重启服务，会自动重新爬取
npm start
```

### 方法 2：使用专门的脚本

创建 `scripts/refetch-articles.js` 脚本来重新获取文章详情（需要自己实现）。

## 总结

- ✅ 代理配置简单，只需修改 `.env` 文件
- ✅ 代码已实现自动降级，不会因为代理问题而崩溃
- ✅ 开启代理后可以获取完整的文章内容
- 📝 建议：如果需要完整的文章格式和图片，请开启代理

---

**更新时间**: 2026-02-03
**相关文件**: 
- `.env` - 代理配置
- `src/modules/cafe-scraper.js` - 爬虫实现
- `src/config/index.js` - 配置加载
