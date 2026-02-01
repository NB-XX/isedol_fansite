// src/api/settings.js - 设置管理 API
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ENV_FILE = join(__dirname, '../../.env');

// 从环境变量或默认值获取管理员密码
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// 存储会话 token（内存中，重启后失效）
const sessions = new Map();

// 生成随机 token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// 验证密码
export function verifyPassword(password) {
    return password === ADMIN_PASSWORD;
}

// 创建会话
export function createSession() {
    const token = generateToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24小时
    sessions.set(token, { expiresAt });
    return token;
}

// 验证 token
export function verifyToken(token) {
    if (!token) return false;
    
    const session = sessions.get(token);
    if (!session) return false;
    
    if (Date.now() > session.expiresAt) {
        sessions.delete(token);
        return false;
    }
    
    return true;
}

// 读取 .env 配置
export function readEnvConfig() {
    try {
        const envContent = readFileSync(ENV_FILE, 'utf-8');
        const config = {};
        
        envContent.split('\n').forEach(line => {
            line = line.trim();
            
            // 跳过注释和空行
            if (!line || line.startsWith('#')) return;
            
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                
                // 移除引号
                if ((value.startsWith('"') && value.endsWith('"')) || 
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                
                // 转换布尔值
                if (value === 'true') value = true;
                else if (value === 'false') value = false;
                
                config[key] = value;
            }
        });
        
        return config;
    } catch (error) {
        logger.error('Settings', `读取配置失败: ${error.message}`);
        throw error;
    }
}

// 写入 .env 配置
export function writeEnvConfig(config) {
    try {
        // 读取原始文件保留注释
        const envContent = readFileSync(ENV_FILE, 'utf-8');
        const lines = envContent.split('\n');
        const newLines = [];
        const updatedKeys = new Set();
        
        lines.forEach(line => {
            const trimmed = line.trim();
            
            // 保留注释和空行
            if (!trimmed || trimmed.startsWith('#')) {
                newLines.push(line);
                return;
            }
            
            const match = trimmed.match(/^([^=]+)=/);
            if (match) {
                const key = match[1].trim();
                
                if (config.hasOwnProperty(key)) {
                    let value = config[key];
                    
                    // 处理布尔值
                    if (typeof value === 'boolean') {
                        value = value.toString();
                    }
                    
                    // 处理包含空格的值
                    if (typeof value === 'string' && (value.includes(' ') || value.includes('\n'))) {
                        value = `"${value}"`;
                    }
                    
                    newLines.push(`${key}=${value}`);
                    updatedKeys.add(key);
                } else {
                    newLines.push(line);
                }
            } else {
                newLines.push(line);
            }
        });
        
        // 添加新的配置项
        for (const [key, value] of Object.entries(config)) {
            if (!updatedKeys.has(key)) {
                let formattedValue = value;
                
                if (typeof value === 'boolean') {
                    formattedValue = value.toString();
                } else if (typeof value === 'string' && (value.includes(' ') || value.includes('\n'))) {
                    formattedValue = `"${value}"`;
                }
                
                newLines.push(`${key}=${formattedValue}`);
            }
        }
        
        writeFileSync(ENV_FILE, newLines.join('\n'), 'utf-8');
        logger.info('Settings', '配置已保存到 .env 文件');
        
        return true;
    } catch (error) {
        logger.error('Settings', `保存配置失败: ${error.message}`);
        throw error;
    }
}

// 清理过期会话
setInterval(() => {
    const now = Date.now();
    for (const [token, session] of sessions.entries()) {
        if (now > session.expiresAt) {
            sessions.delete(token);
        }
    }
}, 60 * 60 * 1000); // 每小时清理一次
