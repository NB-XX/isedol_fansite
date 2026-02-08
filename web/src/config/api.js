// API 配置
// 开发环境自动使用当前主机的 IP 地址，支持局域网访问
// 生产环境使用相对路径或配置的 API 地址

const isDev = import.meta.env.DEV

// 获取 API 基础 URL
export const getApiBaseUrl = () => {
  if (isDev) {
    // 开发环境：使用当前主机的 IP 和端口 8080
    // 这样在局域网中访问时，API 请求会自动使用正确的 IP
    return `http://${window.location.hostname}:8080`
  } else {
    // 生产环境：使用相对路径或环境变量
    return import.meta.env.VITE_API_BASE_URL || ''
  }
}

// 导出 API 基础 URL
export const API_BASE_URL = getApiBaseUrl()

// API 端点
export const API_ENDPOINTS = {
  // 文章相关
  articles: '/api/articles',
  article: (id) => `/api/articles/${id}`,
  articleTranslate: (id) => `/api/articles/${id}/translate`,
  articleManualTranslate: (id) => `/api/articles/${id}/manual-translate`,
  articlesSearch: '/api/articles/search',
  
  // 主播相关
  streamers: '/api/streamers',
  streamerHistory: (id) => `/api/streamers/${id}/history`,
  broadSummary: (broadNo) => `/api/broad-summary/${broadNo}`,
  
  // 翻译相关
  translate: '/api/translate',
  translateJson: '/api/translate-json',
  
  // 设置相关
  settingsPublic: '/api/settings/public',
  settingsAuth: '/api/settings/auth',
  settingsConfig: '/api/settings/config',
  
  // 管理员相关
  adminStats: '/api/admin/stats',
  adminArticles: '/api/admin/articles',
  adminArticle: (id) => `/api/admin/articles/${id}`,
  adminArticleDelete: (id) => `/api/admin/articles/${id}`,
  adminArticleTranslationDelete: (id) => `/api/admin/articles/${id}/translation`,
  adminBatchDelete: '/api/admin/articles/batch-delete',
  adminBatchTranslate: '/api/admin/articles/batch-translate',
  adminRestart: '/api/admin/restart',
  
  // 健康检查
  health: '/api/health'
}

// 构建完整的 API URL
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`
}

// 导出便捷方法
export default {
  baseUrl: API_BASE_URL,
  endpoints: API_ENDPOINTS,
  buildUrl: buildApiUrl
}
