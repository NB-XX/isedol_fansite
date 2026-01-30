// src/utils/logger.js - 统一日志管理
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { config } from '../config/index.js';

class Logger {
    constructor() {
        this.logFile = config.logging.file;
        this.level = config.logging.level;
        this.ensureLogDir();
    }

    ensureLogDir() {
        const dir = dirname(this.logFile);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    }

    formatMessage(level, module, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`;
    }

    log(level, module, message, data = null) {
        const formattedMessage = this.formatMessage(level, module, message);
        
        // 控制台输出
        console.log(formattedMessage);
        if (data) {
            console.log(data);
        }

        // 文件输出
        try {
            const logEntry = data 
                ? `${formattedMessage}\n${JSON.stringify(data, null, 2)}\n`
                : `${formattedMessage}\n`;
            appendFileSync(this.logFile, logEntry);
        } catch (error) {
            console.error('写入日志失败:', error.message);
        }
    }

    info(module, message, data) {
        this.log('info', module, message, data);
    }

    debug(module, message, data) {
        if (this.level === 'debug') {
            this.log('debug', module, message, data);
        }
    }

    warn(module, message, data) {
        this.log('warn', module, message, data);
    }

    error(module, message, data) {
        this.log('error', module, message, data);
    }

    success(module, message, data) {
        this.log('success', module, message, data);
    }
}

export const logger = new Logger();
