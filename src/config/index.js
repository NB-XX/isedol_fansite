// src/config/index.js - 统一配置管理
import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenvConfig({ path: join(__dirname, '../../.env') });

function parseBoolean(value, fallback = false) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value > 0;
    }

    const normalized = String(value).trim().toLowerCase();

    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
        return true;
    }

    if (['0', 'false', 'no', 'off'].includes(normalized)) {
        return false;
    }

    return fallback;
}

function parseInteger(value, fallback) {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}

function parseDecimal(value, fallback) {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
}

export const config = {
    // Naver Cafe 配置
    cafe: {
        cafeId: 27842958,
        menuId: 345,
        baseUrl: 'https://apis.naver.com',
        interval: 10 * 60 * 1000, // 10分钟
        pageSize: 15
    },

    // 代理配置
    proxy: {
        enabled: false,
        url: 'http://127.0.0.1:7890'
    },

    // Firebase 配置
    firebase: {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        databaseURL: ''
    },

    // 数据库配置
    database: {
        articlesFile: './data/articles.json',
        streamsFile: './data/streams.json'
    },

    // 日志配置
    logging: {
        level: 'info',
        file: './logs/app.log'
    },

    // AI 翻译配置
    translation: {
        enabled: false,
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: '',
        model: 'gpt-3.5-turbo',
        systemPrompt: '你是一个专业的韩中翻译助手。请将用户提供的韩语文本翻译成简体中文。保持原文的语气和风格，确保翻译自然流畅。只返回翻译结果，不要添加任何解释或额外内容。',
        temperature: 0.3,
        maxTokens: 2000,
        timeout: 30000 // 30秒超时
    }
};

export function applyRuntimeConfig(settings = {}) {
    config.cafe.cafeId = parseInteger(settings.CAFE_ID ?? process.env.CAFE_ID, 27842958);
    config.cafe.menuId = parseInteger(settings.MENU_ID ?? process.env.MENU_ID, 345);
    config.cafe.interval = parseInteger(settings.SCRAPER_INTERVAL ?? process.env.SCRAPER_INTERVAL, 10 * 60 * 1000);

    config.proxy.enabled = parseBoolean(settings.USE_PROXY ?? process.env.USE_PROXY, false);
    config.proxy.url = settings.PROXY_URL ?? process.env.PROXY_URL ?? 'http://127.0.0.1:7890';

    config.firebase.apiKey = settings.FIREBASE_API_KEY ?? process.env.FIREBASE_API_KEY ?? '';
    config.firebase.authDomain = settings.FIREBASE_AUTH_DOMAIN ?? process.env.FIREBASE_AUTH_DOMAIN ?? '';
    config.firebase.projectId = settings.FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID ?? '';
    config.firebase.storageBucket = settings.FIREBASE_STORAGE_BUCKET ?? process.env.FIREBASE_STORAGE_BUCKET ?? '';
    config.firebase.messagingSenderId = settings.FIREBASE_MESSAGING_SENDER_ID ?? process.env.FIREBASE_MESSAGING_SENDER_ID ?? '';
    config.firebase.appId = settings.FIREBASE_APP_ID ?? process.env.FIREBASE_APP_ID ?? '';
    config.firebase.databaseURL = settings.FIREBASE_DATABASE_URL ?? process.env.FIREBASE_DATABASE_URL ?? '';

    config.database.articlesFile = settings.DB_ARTICLES_FILE ?? process.env.DB_ARTICLES_FILE ?? './data/articles.json';
    config.database.streamsFile = settings.DB_STREAMS_FILE ?? process.env.DB_STREAMS_FILE ?? './data/streams.json';

    config.logging.level = settings.LOG_LEVEL ?? process.env.LOG_LEVEL ?? 'info';
    config.logging.file = settings.LOG_FILE ?? process.env.LOG_FILE ?? './logs/app.log';

    config.translation.enabled = parseBoolean(settings.TRANSLATION_ENABLED ?? process.env.TRANSLATION_ENABLED, false);
    config.translation.apiUrl = settings.TRANSLATION_API_URL ?? process.env.TRANSLATION_API_URL ?? 'https://api.openai.com/v1/chat/completions';
    config.translation.apiKey = settings.TRANSLATION_API_KEY ?? process.env.TRANSLATION_API_KEY ?? '';
    config.translation.model = settings.TRANSLATION_MODEL ?? process.env.TRANSLATION_MODEL ?? 'gpt-3.5-turbo';
    config.translation.systemPrompt = settings.TRANSLATION_SYSTEM_PROMPT ?? process.env.TRANSLATION_SYSTEM_PROMPT ?? '你是一个专业的韩中翻译助手。请将用户提供的韩语文本翻译成简体中文。保持原文的语气和风格，确保翻译自然流畅。只返回翻译结果，不要添加任何解释或额外内容。';
    config.translation.temperature = parseDecimal(settings.TRANSLATION_TEMPERATURE ?? process.env.TRANSLATION_TEMPERATURE, 0.3);
    config.translation.maxTokens = parseInteger(settings.TRANSLATION_MAX_TOKENS ?? process.env.TRANSLATION_MAX_TOKENS, 2000);
    config.translation.timeout = parseInteger(settings.TRANSLATION_TIMEOUT ?? process.env.TRANSLATION_TIMEOUT, 30000);

    return config;
}

export function isFirebaseConfigured() {
    return /^https?:\/\//i.test(config.firebase.databaseURL || '');
}

applyRuntimeConfig();
