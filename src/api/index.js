// src/api/index.js - 统一API接口
import { CafeScraper } from '../modules/cafe-scraper.js';
import { StreamMonitor } from '../modules/stream-monitor.js';
import { ArticleDatabase, StreamDatabase } from '../database/index.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

class API {
    constructor() {
        this.cafeScraper = null;
        this.streamMonitor = null;
        this.articleDb = new ArticleDatabase(config.database.articlesFile);
        this.streamDb = new StreamDatabase(config.database.streamsFile);
    }

    // ========== Cafe Scraper API ==========
    
    async startCafeScraper() {
        if (!this.cafeScraper) {
            this.cafeScraper = new CafeScraper();
        }
        await this.cafeScraper.start();
        return { success: true, message: 'Cafe爬虫已启动' };
    }

    stopCafeScraper() {
        if (this.cafeScraper) {
            this.cafeScraper.stop();
            return { success: true, message: 'Cafe爬虫已停止' };
        }
        return { success: false, message: 'Cafe爬虫未运行' };
    }

    async scrapeCafeOnce() {
        if (!this.cafeScraper) {
            this.cafeScraper = new CafeScraper();
        }
        const result = await this.cafeScraper.scrape();
        return { success: true, data: result };
    }

    // ========== Stream Monitor API ==========
    
    startStreamMonitor() {
        if (!this.streamMonitor) {
            this.streamMonitor = new StreamMonitor();
        }
        this.streamMonitor.start();
        return { success: true, message: '直播监控已启动' };
    }

    stopStreamMonitor() {
        if (this.streamMonitor) {
            this.streamMonitor.stop();
            return { success: true, message: '直播监控已停止' };
        }
        return { success: false, message: '直播监控未运行' };
    }

    getStreamStatus() {
        if (this.streamMonitor) {
            return { success: true, data: this.streamMonitor.getStatus() };
        }
        return { success: false, message: '直播监控未运行' };
    }

    // ========== Article Data API ==========
    
    getArticles(options = {}) {
        const { limit = 10, search = '', author = '' } = options;
        let articles = this.articleDb.getAllArticles();

        // 搜索过滤
        if (search) {
            articles = articles.filter(article => 
                article.subject.includes(search) || 
                article.content.includes(search)
            );
        }

        // 作者过滤
        if (author) {
            articles = articles.filter(article => 
                article.writer.nick === author
            );
        }

        // 排序和限制
        articles = articles
            .sort((a, b) => b.writeDate - a.writeDate)
            .slice(0, limit);

        return {
            success: true,
            data: {
                articles,
                total: this.articleDb.getArticleCount(),
                filtered: articles.length
            }
        };
    }

    getArticleById(articleId) {
        const article = this.articleDb.data.articles[articleId];
        if (article) {
            return { success: true, data: article };
        }
        return { success: false, message: '文章不存在' };
    }

    getArticleStats() {
        const articles = this.articleDb.getAllArticles();
        
        // 作者统计
        const authorStats = {};
        articles.forEach(article => {
            const author = article.writer.nick;
            authorStats[author] = (authorStats[author] || 0) + 1;
        });

        // 时间范围
        const sorted = articles.sort((a, b) => b.writeDate - a.writeDate);
        const latest = sorted[0];
        const oldest = sorted[sorted.length - 1];

        return {
            success: true,
            data: {
                total: articles.length,
                authors: authorStats,
                dateRange: {
                    latest: latest ? latest.writeDateFormatted : null,
                    oldest: oldest ? oldest.writeDateFormatted : null
                },
                lastUpdate: this.articleDb.data.lastUpdate
            }
        };
    }

    // ========== Stream Data API ==========
    
    getStreams() {
        const streams = this.streamDb.getAllStreams();
        return {
            success: true,
            data: {
                streams,
                count: Object.keys(streams).length
            }
        };
    }

    getStreamHistory(limit = 50) {
        const history = this.streamDb.getHistory(limit);
        return {
            success: true,
            data: {
                history,
                count: history.length
            }
        };
    }

    // ========== System API ==========
    
    getSystemStatus() {
        return {
            success: true,
            data: {
                cafeScraper: {
                    running: this.cafeScraper?.isRunning || false,
                    articlesCount: this.articleDb.getArticleCount()
                },
                streamMonitor: {
                    running: this.streamMonitor?.isRunning || false,
                    streamsCount: Object.keys(this.streamDb.getAllStreams()).length
                },
                config: {
                    cafeId: config.cafe.cafeId,
                    menuId: config.cafe.menuId,
                    scraperInterval: config.cafe.interval / 1000 / 60 + ' 分钟'
                }
            }
        };
    }
}

export const api = new API();
