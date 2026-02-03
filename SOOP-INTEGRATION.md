# SOOP 公告板集成说明

## ✅ 集成状态

**状态**: 已完成并测试通过

**测试结果** (2026-02-03):
- ✅ 数据库迁移成功（添加 source 字段）
- ✅ SOOP 爬虫正常工作（测试抓取了 21 篇文章）
- ✅ 数据正确存储到数据库
- ✅ 前端标签颜色正确显示（SOOP: 蓝色，Naver: 绿色）
- ✅ 文章混合显示正常

**数据库统计**:
- 总文章数: 48
- SOOP 文章: 21
- Naver 文章: 27

## 功能概述

新增了 SOOP 直播平台公告板的抓取功能，将主播的公告板帖子与 Naver Cafe 的文章混合显示在同一个信息流中。

## 实现细节

### 1. 数据库改动

**新增字段：**
- `articles` 表添加 `source` 字段（TEXT，默认值 'naver'）
- 用于区分文章来源：`naver` 或 `soop`

**迁移脚本：**
```bash
npm run db:add-source
```

### 2. 新增模块

**src/modules/soop-scraper.js**
- SOOP 公告板爬虫
- 自动从数据库读取主播列表（使用 `bj_id`）
- 抓取每个主播的公告板帖子
- 转换为统一的文章格式存入数据库

### 3. 数据映射

| SOOP 字段 | 数据库字段 | 说明 |
|-----------|-----------|------|
| `title_no` | `article_id` | 帖子 ID（主键） |
| `title_name` | `subject` | 标题 |
| `content.text_content` | `content` | 纯文本内容 |
| `content.content` | `content_html` | HTML 内容 |
| `reg_date` | `write_date` | 发布时间（转为时间戳） |
| `user_nick` | `author_nick` | 作者昵称 |
| `profile_image` | `author_image` | 作者头像 |
| `count.read_cnt` | `read_count` | 阅读数 |
| `count.comment_cnt` | `comment_count` | 评论数 |
| `count.like_cnt` | `like_count` | 点赞数 |
| - | `source` | 固定为 'soop' |
| - | `author_member_level_name` | 固定为 'SOOP公告栏' |

### 4. 前端显示

**标签颜色区分：**
- Naver Cafe：绿色标签（`bg-primary/10 text-primary`）
  - 显示：`呜哇动物园`（原 memberLevelName）
- SOOP：蓝色标签（`bg-blue-100 text-blue-700`）
  - 显示：`SOOP公告栏`

### 5. API 接口

现有的 `/api/articles` 接口自动包含两个来源的文章，按时间降序混合排列。

## 使用方法

### 1. 运行数据库迁移

```bash
npm run db:add-source
```

### 2. 启动服务

```bash
npm start
```

服务会自动启动：
- Naver Cafe 爬虫
- SOOP 公告板爬虫
- 直播监控
- API 服务器

### 3. 查看效果

打开前端页面，文章列表会显示混合的内容：
- 绿色标签：来自 Naver Cafe
- 蓝色标签：来自 SOOP 公告板

## 配置说明

### 主播配置

SOOP 爬虫自动从 `streamers` 表读取主播信息，使用 `bj_id` 字段作为 SOOP 用户 ID。

确保数据库中的主播配置正确：
```sql
SELECT streamer_id, name, bj_id FROM streamers;
```

### 抓取间隔

SOOP 爬虫使用与 Naver Cafe 相同的间隔时间（`.env` 中的 `SCRAPER_INTERVAL`）。

## API 示例

### SOOP 公告板 API

```bash
curl 'https://chapi.sooplive.co.kr/api/gosegu2/board/?per_page=20&page=1&type=post&order_by=reg_date'
```

**响应结构：**
```json
{
  "data": [
    {
      "title_no": 12345,
      "title_name": "标题",
      "content": {
        "content": "<p>HTML内容</p>",
        "text_content": "纯文本内容"
      },
      "reg_date": "2026-01-26 19:44:29",
      "user_nick": "作者昵称",
      "profile_image": "头像URL",
      "count": {
        "read_cnt": 100,
        "comment_cnt": 10,
        "like_cnt": 5
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "total": 200
  }
}
```

## 注意事项

1. **时区处理**：SOOP API 返回的时间是 KST（韩国标准时间），已自动转换为时间戳
2. **去重**：使用 `title_no` 作为主键，自动去重
3. **请求频率**：每个主播之间间隔 1 秒，避免请求过快
4. **错误处理**：单个主播抓取失败不影响其他主播

## 故障排查

### 问题：SOOP 文章没有显示

**检查步骤：**
1. 确认数据库迁移已执行：`npm run db:add-source`
2. 查看日志是否有 SOOP 爬虫的输出
3. 检查数据库中是否有 source='soop' 的记录：
   ```sql
   SELECT COUNT(*) FROM articles WHERE source='soop';
   ```

### 问题：标签颜色不对

**检查步骤：**
1. 确认前端代码已更新
2. 清除浏览器缓存
3. 检查文章的 `source` 字段是否正确

## 未来扩展

可以继续添加其他平台的内容源：
1. 在 `source` 字段添加新值（如 'youtube', 'twitter'）
2. 创建对应的爬虫模块
3. 在前端添加对应的标签颜色
4. 集成到 `start-all.js`

---

**更新时间：** 2026-02-03
**版本：** 1.0.0
