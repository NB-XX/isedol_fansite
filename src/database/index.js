// src/database/index.js - 统一数据库管理（SQLite 版本）
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import SQLiteDatabase from './sqlite.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库路径
const DB_PATH = join(__dirname, '../../data/database.db');

// 单例模式 - 共享同一个数据库连接
let dbInstance = null;

function getDatabase() {
    if (!dbInstance) {
        dbInstance = new SQLiteDatabase(DB_PATH);
    }
    return dbInstance;
}

// 文章数据库适配器
export class ArticleDatabase {
    constructor() {
        this.db = getDatabase();
        this.moduleName = 'ArticleDB';
    }

    hasArticle(articleId) {
        return this.db.hasArticle(articleId);
    }

    addArticle(article) {
        const success = this.db.addArticle(article);
        if (success) {
            logger.info(this.moduleName, `文章已添加: ${article.articleId}`);
        }
    }

    getArticleCount() {
        return this.db.getArticleCount();
    }

    getLatestArticles(count = 5) {
        return this.db.getLatestArticles(count);
    }

    getAllArticles() {
        return this.db.getAllArticles();
    }

    getLastUpdate() {
        return this.db.getLastUpdate();
    }

    // 兼容旧代码的 save 方法（SQLite 自动保存，无需手动调用）
    save() {
        // SQLite 自动提交事务，无需手动保存
    }
}

// 直播状态数据库适配器
export class StreamDatabase {
    constructor() {
        this.db = getDatabase();
        this.moduleName = 'StreamDB';
        
        // 主播配置
        this.streamerConfig = {
            'gosegu': { name: '고세구', avatar: 'https://stimg.sooplive.co.kr/LOGO/go/gosegu2/m/gosegu2.webp', bjId: 'gosegu2' },
            'ine': { name: '아이네', avatar: 'https://stimg.sooplive.co.kr/LOGO/in/inehine/m/inehine.webp', bjId: 'inehine' },
            'jingburger': { name: '징버거', avatar: 'https://stimg.sooplive.co.kr/LOGO/ji/jingburger1/m/jingburger1.webp', bjId: 'jingburger1' },
            'jururu': { name: '주르르', avatar: 'https://stimg.sooplive.co.kr/LOGO/co/cotton1217/m/cotton1217.webp', bjId: 'cotton1217' },
            'lilpa': { name: '릴파', avatar: 'https://stimg.sooplive.co.kr/LOGO/li/lilpa0309/m/lilpa0309.webp', bjId: 'lilpa0309' },
            'viichan': { name: '비챤', avatar: 'https://stimg.sooplive.co.kr/LOGO/vi/viichan6/m/viichan6.webp', bjId: 'viichan6' }
        };
        
        // 初始化主播信息
        this.initStreamers();
    }

    initStreamers() {
        for (const [streamerId, config] of Object.entries(this.streamerConfig)) {
            this.db.addOrUpdateStreamer(streamerId, config.name, config.avatar, config.bjId);
        }
    }

    updateStream(streamerId, streamData) {
        // 强制使用配置中的中文名字，忽略 Firebase 返回的 name
        const enrichedData = {
            ...streamData,
            name: this.streamerConfig[streamerId]?.name || streamData.name || streamerId
        };
        this.db.updateStreamStatus(streamerId, enrichedData);
    }

    getStream(streamerId) {
        return this.db.getStreamStatus(streamerId);
    }

    getAllStreams() {
        return this.db.getAllStreamStatus();
    }

    getHistory(limit = 50) {
        return this.db.getStreamHistory(limit);
    }

    getStreamerHistory(streamerId, limit = 20) {
        return this.db.getStreamerHistory(streamerId, limit);
    }

    addStreamEvent(event) {
        this.db.addStreamHistory({
            streamerId: event.streamerId,
            name: event.name,
            action: event.action,
            title: event.title,
            category: event.category,
            timestamp: new Date().toISOString(),
            metadata: JSON.stringify({
                oldTitle: event.oldTitle,
                oldCategory: event.oldCategory
            }),
            broadNo: event.broadNo || null
        });
    }

    getLastUpdate() {
        return this.db.getLastStreamUpdate();
    }

    // 兼容旧代码的 save 方法（SQLite 自动保存，无需手动调用）
    save() {
        // SQLite 自动提交事务，无需手动保存
    }
}

// 导出数据库实例获取函数（用于需要直接访问数据库的场景）
export { getDatabase };
