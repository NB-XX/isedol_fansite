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
        apiKey: process.env.FIREBASE_API_KEY || "",
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
        projectId: process.env.FIREBASE_PROJECT_ID || "",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
        appId: process.env.FIREBASE_APP_ID || "",
        databaseURL: process.env.FIREBASE_DATABASE_URL || ""
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
    },

    // AI 翻译配置
    translation: {
        enabled: process.env.TRANSLATION_ENABLED === 'true',
        apiUrl: process.env.TRANSLATION_API_URL || 'https://api.openai.com/v1/chat/completions',
        apiKey: process.env.TRANSLATION_API_KEY || '',
        model: process.env.TRANSLATION_MODEL || 'gpt-3.5-turbo',
        systemPrompt: process.env.TRANSLATION_SYSTEM_PROMPT || '你是一个专业的韩中翻译助手。请将用户提供的韩语文本翻译成简体中文。保持原文的语气和风格，确保翻译自然流畅。只返回翻译结果，不要添加任何解释或额外内容。',
        temperature: parseFloat(process.env.TRANSLATION_TEMPERATURE) || 0.3,
        maxTokens: parseInt(process.env.TRANSLATION_MAX_TOKENS) || 2000,
        timeout: parseInt(process.env.TRANSLATION_TIMEOUT) || 30000 // 30秒超时
    }
};
