// src/database/index-simple.js - 简化版数据库（不使用 SQLite）
// VPS 上不需要本地数据库，数据直接同步到 Cloudflare D1

export class SimpleDatabase {
  constructor() {
    this.articles = [];
    this.streamStatus = {};
    this.streamHistory = [];
    this.streamers = [];
  }

  // 文章相关方法（内存存储）
  saveArticle(article) {
    const index = this.articles.findIndex(a => a.articleId === article.articleId);
    if (index >= 0) {
      this.articles[index] = article;
    } else {
      this.articles.push(article);
    }
  }

  hasArticle(articleId) {
    return !!this.articles.find(a => a.articleId === articleId);
  }

  getAllArticles() {
    return this.articles;
  }

  getArticle(articleId) {
    return this.articles.find(a => a.articleId === articleId);
  }

  updateArticleTranslation(articleId, translation) {
    const article = this.getArticle(articleId);
    if (article) {
      Object.assign(article, translation);
    }
  }

  // 主播状态相关方法
  updateStreamStatus(streamerId, status) {
    this.streamStatus[streamerId] = status;
  }

  getAllStreamStatus() {
    return this.streamStatus;
  }

  getStreamStatus(streamerId) {
    return this.streamStatus[streamerId];
  }

  getAllStreamers() {
    return this.streamers;
  }

  // 直播历史
  addStreamHistory(record) {
    this.streamHistory.push({
      ...record,
      timestamp: new Date().toISOString()
    });
    
    // 只保留最近 1000 条
    if (this.streamHistory.length > 1000) {
      this.streamHistory = this.streamHistory.slice(-1000);
    }
  }

  getStreamHistory(streamerId, limit = 50) {
    return this.streamHistory
      .filter(h => h.streamerId === streamerId)
      .slice(-limit)
      .reverse();
  }
}

// 单例模式
let dbInstance = null;

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = new SimpleDatabase();
  }
  return dbInstance;
}

// 兼容旧的导出方式
export class ArticleDatabase {
  constructor() {
    this.db = getDatabase();
  }

  addArticle(article) {
    return this.db.saveArticle(article);
  }

  hasArticle(articleId) {
    return !!this.db.getArticle(articleId);
  }

  saveArticle(article) {
    return this.db.saveArticle(article);
  }

  getAllArticles() {
    return this.db.getAllArticles();
  }

  getArticle(articleId) {
    return this.db.getArticle(articleId);
  }

  getArticleCount() {
    return this.db.getAllArticles().length;
  }

  updateArticleTranslation(articleId, translation) {
    const article = this.db.getArticle(articleId);
    if (article) {
      Object.assign(article, translation);
      this.db.saveArticle(article);
    }
  }

  save() {
    // 不需要保存到文件
  }
}

export class StreamDatabase {
  constructor() {
    this.db = getDatabase();
  }

  updateStream(streamerId, data) {
    this.db.updateStreamStatus(streamerId, data);
  }

  getStream(streamerId) {
    return this.db.getStreamStatus(streamerId);
  }

  getAllStreams() {
    return this.db.getAllStreamStatus();
  }

  addStreamEvent(event) {
    this.db.addStreamHistory(event);
  }

  getHistory(limit) {
    return this.db.streamHistory.slice(-limit).reverse();
  }

  save() {
    // 不需要保存到文件
  }
}
