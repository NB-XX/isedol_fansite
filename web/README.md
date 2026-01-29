# Isedol 粉丝站 - 前端

基于 Vue 3 + Vite + TailwindCSS 构建的现代化粉丝站前端。

## ✨ 功能特性

### 1. 主播动态展示
- 6个主播头像展示
- 直播中显示彩虹色外发光效果
- 点击头像查看详情和历史记录
- 直播中内嵌播放器

### 2. 文章卡片流
- Twitter 风格的卡片式布局
- 按时间倒序展示最新文章
- 显示作者头像、昵称、等级
- 完整的文章内容（HTML 格式）
- 阅读数和评论数统计
- 响应式设计，适配各种屏幕

### 3. 实时更新
- 30秒自动刷新主播状态
- 支持手动加载更多文章

## 🚀 快速开始

### 安装依赖

```bash
cd web
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 预览构建

```bash
npm run preview
```

## 📁 项目结构

```
web/
├── src/
│   ├── api/              # API 接口
│   │   └── index.js
│   ├── components/       # 组件
│   │   └── StreamerModal.vue
│   ├── views/            # 页面
│   │   └── Home.vue
│   ├── App.vue           # 根组件
│   ├── main.js           # 入口文件
│   └── style.css         # 全局样式
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎨 设计说明

### 颜色方案

- 主色调: `#00C73C` (Naver 绿)
- 次要色: `#FF6B6B` (强调色)
- 背景: 渐变灰色 `from-gray-50 to-gray-100`

### 动画效果

- **彩虹外发光**: 直播中的主播头像
- **悬停缩放**: 卡片和头像的交互效果
- **平滑过渡**: 所有状态变化

### 响应式断点

- 移动端: < 640px (2列主播)
- 平板: 640px - 768px (3列主播)
- 桌面: > 768px (6列主播)

## 🔌 API 接口

### 获取文章列表

```
GET /api/articles?limit=20
```

### 获取主播信息

```
GET /api/streamers
```

### 获取主播历史

```
GET /api/streamers/:id/history
```

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **TailwindCSS** - 实用优先的 CSS 框架
- **Vue Router** - 官方路由管理器
- **Axios** - HTTP 客户端
- **Day.js** - 轻量级日期处理库

## 📝 开发指南

### 添加新主播

在 `src/api/index.js` 的 `getMockStreamers()` 中添加：

```javascript
{
  id: 'new_streamer',
  name: '新主播',
  avatar: 'https://...',
  isLive: false,
  history: []
}
```

### 自定义样式

编辑 `tailwind.config.js` 修改主题配置。

### 修改 API 地址

编辑 `vite.config.js` 中的 proxy 配置。

## 🎯 待实现功能

- [ ] 文章搜索和筛选
- [ ] 主播订阅通知
- [ ] 评论系统
- [ ] 暗黑模式
- [ ] 多语言支持
- [ ] PWA 支持

## 📄 许可证

ISC
