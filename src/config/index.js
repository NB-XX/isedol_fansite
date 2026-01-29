// src/config/index.js - 统一配置管理
import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenvConfig({ path: join(__dirname, '../../.env') });

export const config = {
    // Naver Cafe 配置
    cafe: {
        cafeId: parseInt(process.env.CAFE_ID) || 27842958,
        menuId: parseInt(process.env.MENU_ID) || 345,
        baseUrl: 'https://apis.naver.com',
        interval: parseInt(process.env.SCRAPER_INTERVAL) || 10 * 60 * 1000, // 10分钟
        pageSize: 15
    },

    // 代理配置
    proxy: {
        enabled: process.env.USE_PROXY === 'true',
        url: process.env.PROXY_URL || 'http://127.0.0.1:7890'
    },

    // Firebase 配置
    firebase: {
        apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDbKOeYwK8qAynN6oJxPinJP5_-z3Nqkp0",
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || "isekaidol-stream-noti.firebaseapp.com",
        projectId: process.env.FIREBASE_PROJECT_ID || "isekaidol-stream-noti",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "isekaidol-stream-noti.appspot.com",
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "532310069194",
        appId: process.env.FIREBASE_APP_ID || "1:532310069194:web:50a30481a66c0f0ca6c933",
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://isekaidol-stream-noti-default-rtdb.asia-southeast1.firebasedatabase.app/"
    },

    // 数据库配置
    database: {
        articlesFile: process.env.DB_ARTICLES_FILE || './data/articles.json',
        streamsFile: process.env.DB_STREAMS_FILE || './data/streams.json'
    },

    // 日志配置
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || './logs/app.log'
    }
};
