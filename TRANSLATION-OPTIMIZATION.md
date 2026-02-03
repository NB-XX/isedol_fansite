# 翻译系统优化 - 2026-02-03

## 概述

优化了翻译系统，解决AI翻译HTML内容时Token消耗大和容易出错的问题，并添加了人工翻译功能。

## 主要改进

### 1. 数据库字段优化

**新增字段**：
- `text_content` - 纯文本内容（不含HTML标签），专门用于AI翻译
- `content_html_translated` - HTML格式的翻译内容
- `is_ai_translated` - 布尔值，标识是AI翻译(1)还是人工翻译(0)

**字段用途**：
- `text_content`: 从Naver Cafe的`summary`或SOOP的`content.text_content`获取
- `content_html`: 保留完整HTML（包含图片、格式等），用于前端显示
- `content_html_translated`: 人工翻译的HTML内容，保留原有格式和图片

### 2. 爬虫更新

**Naver Cafe爬虫** (`src/modules/cafe-scraper.js`):
```javascript
textContent: articleItem.summary || '' // 从列表API的summary获取纯文本
```

**SOOP爬虫** (`src/modules/soop-scraper.js`):
```javascript
textContent: post.content.text_content || '' // 从SOOP API的text_content获取
```

### 3. AI翻译优化

**翻译API** (`/api/articles/:id/translate`):
- 使用`text_content`字段进行翻译，大幅减少Token消耗
- 翻译结果保存为纯文本，自动转换换行符为`<br>`标签
- 标记为AI翻译 (`is_ai_translated = 1`)

**优势**：
- Token消耗减少约70-80%
- 翻译准确性提高（无HTML标签干扰）
- 翻译速度更快

### 4. 人工翻译功能

**管理员后台新增功能**：
- 每篇文章添加"人工翻译"按钮
- 打开翻译编辑器，可以编辑HTML格式的翻译内容
- 支持保留原文的图片、格式等
- 保存后标记为人工翻译 (`is_ai_translated = 0`)

**翻译编辑器特性**：
- 显示原文标题和内容
- 支持HTML编辑
- 实时预览翻译效果
- 自动提取纯文本版本

**API接口** (`/api/articles/:id/manual-translate`):
```javascript
POST /api/articles/:id/manual-translate
Body: {
  subjectTranslated: "翻译后的标题",
  contentHtmlTranslated: "<p>翻译后的HTML内容</p>"
}
```

### 5. 前端显示优化

**AI翻译标识**：
- 翻译按钮右上角显示"AI"徽章（紫粉渐变）
- 仅在显示翻译且为AI翻译时显示

**管理员控制台**：
- 翻译状态列显示"AI翻译"（紫色）或"人工翻译"（绿色）
- 未翻译显示黄色标签

## 数据库迁移

运行迁移脚本添加新字段：
```bash
node scripts/add-translation-fields.js
```

**迁移内容**：
1. 添加`text_content`字段
2. 添加`is_ai_translated`字段（默认值1）
3. 添加`content_html_translated`字段
4. 从现有数据提取纯文本填充`text_content`

**迁移结果**：
- ✅ 成功添加3个新字段
- ✅ 成功更新101篇文章的text_content

## 文件修改清单

### 数据库
- `src/database/schema.sql` - 更新表结构定义
- `src/database/sqlite.js` - 更新数据库操作方法
- `scripts/add-translation-fields.js` - 数据库迁移脚本（新增）

### 后端
- `src/modules/cafe-scraper.js` - 添加textContent字段
- `src/modules/soop-scraper.js` - 添加textContent字段
- `start-all.js` - 添加翻译API接口

### 前端
- `web/src/views/Home.vue` - 添加AI翻译标识
- `web/src/views/Admin.vue` - 添加人工翻译功能和模态框

## 使用说明

### AI翻译（前端用户）
1. 浏览文章时点击翻译按钮
2. 系统使用纯文本内容进行AI翻译
3. 翻译按钮显示"AI"徽章

### 人工翻译（管理员）
1. 进入管理员控制台 → 文章管理
2. 点击文章的"人工翻译"按钮
3. 在编辑器中编辑翻译内容（支持HTML）
4. 预览翻译效果
5. 点击"保存翻译"

### 翻译状态识别
- **未翻译**: 黄色标签
- **AI翻译**: 紫色标签 + AI徽章
- **人工翻译**: 绿色标签

## 技术细节

### Token消耗对比

**优化前**（翻译HTML）:
```
标题: 20 tokens
HTML内容: 500-2000 tokens
总计: 520-2020 tokens
```

**优化后**（翻译纯文本）:
```
标题: 20 tokens
纯文本内容: 150-500 tokens
总计: 170-520 tokens
```

**节省**: 约70-80%的Token消耗

### 数据流程

**AI翻译流程**:
1. 前端请求翻译 → `/api/articles/:id/translate`
2. 后端读取`text_content`字段
3. 调用AI翻译纯文本
4. 保存翻译结果，标记`is_ai_translated = 1`
5. 返回翻译内容（自动转换换行符）

**人工翻译流程**:
1. 管理员打开翻译编辑器
2. 编辑HTML格式的翻译内容
3. 提交到 `/api/articles/:id/manual-translate`
4. 后端提取纯文本版本
5. 保存翻译结果，标记`is_ai_translated = 0`

## 优势总结

1. **成本降低**: Token消耗减少70-80%
2. **准确性提高**: 纯文本翻译更准确
3. **速度提升**: 翻译时间缩短
4. **灵活性**: 支持人工修正AI翻译
5. **格式保留**: 人工翻译可保留HTML格式和图片
6. **用户体验**: 清晰标识AI/人工翻译

## 后续优化建议

1. 添加翻译历史记录
2. 支持批量人工翻译
3. 添加翻译质量评分
4. 支持翻译版本对比
5. 添加翻译审核流程

---

**更新时间**: 2026-02-03
**版本**: v1.2.0
**状态**: 已完成 ✅
