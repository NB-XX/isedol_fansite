// src/database/index.js - 统一数据库管理
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { logger } from '../utils/logger.js';

class Database {
    constructor(filePath, moduleName) {
        this.filePath = filePath;
        this.moduleName = moduleName;
        this.data = this.load();
    }

    ensureDir() {
        const dir = dirname(this.filePath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    }

    load() {
        this.ensureDir();
        
        if (existsSync(this.filePath)) {
            try {
                const content = readFileSync(this.filePath, 'utf-8');
                return JSON.parse(content);
            } catch (error) {
                logger.error(this.moduleName, `读取数据库失败: ${error.message}`);
                return this.getDefaultData();
            }
        }
        return this.getDefaultData();
    }

    save() {
        try {
            this.ensureDir();
            writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
            logger.info(this.moduleName, '数据已保存');
        } catch (error) {
            logger.error(this.moduleName, `保存数据库失败: ${error.message}`);
        }
    }

    getDefaultData() {
        return {};
    }
}

// 文章数据库
export class ArticleDatabase extends Database {
    constructor(filePath) {
        super(filePath, 'ArticleDB');
    }

    getDefaultData() {
        return {
            articles: {},
            lastUpdate: null,
            stats: {
                total: 0,
                lastArticleId: null
            }
        };
    }

    hasArticle(articleId) {
        return !!this.data.articles[articleId];
    }

    addArticle(article) {
        this.data.articles[article.articleId] = article;
        this.data.lastUpdate = new Date().toISOString();
        this.data.stats.total = Object.keys(this.data.articles).length;
        this.data.stats.lastArticleId = article.articleId;
    }

    getArticleCount() {
        return Object.keys(this.data.articles).length;
    }

    getLatestArticles(count = 5) {
        return Object.values(this.data.articles)
            .sort((a, b) => b.writeDate - a.writeDate)
            .slice(0, count);
    }

    getAllArticles() {
        return Object.values(this.data.articles);
    }
}

// 直播状态数据库
export class StreamDatabase extends Database {
    constructor(filePath) {
        super(filePath, 'StreamDB');
    }

    getDefaultData() {
        return {
            streams: {},
            history: [],
            lastUpdate: null
        };
    }

    updateStream(streamerId, streamData) {
        const previous = this.data.streams[streamerId];
        this.data.streams[streamerId] = {
            ...streamData,
            updatedAt: new Date().toISOString()
        };
        this.data.lastUpdate = new Date().toISOString();

        // 记录状态变化
        if (previous && previous.online !== streamData.online) {
            this.addHistory({
                streamerId,
                name: streamData.name,
                action: streamData.online ? 'start' : 'end',
                title: streamData.title,
                category: streamData.category,
                timestamp: new Date().toISOString()
            });
        }
    }

    addHistory(record) {
        this.data.history.push(record);
        // 只保留最近1000条记录
        if (this.data.history.length > 1000) {
            this.data.history = this.data.history.slice(-1000);
        }
    }

    getStream(streamerId) {
        return this.data.streams[streamerId];
    }

    getAllStreams() {
        return this.data.streams;
    }

    getHistory(limit = 50) {
        return this.data.history.slice(-limit).reverse();
    }
}
