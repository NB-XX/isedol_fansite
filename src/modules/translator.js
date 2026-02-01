// src/modules/translator.js - AI 翻译模块
import https from 'https';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export class Translator {
    constructor() {
        this.config = config.translation;
        this.isEnabled = this.config.enabled;
        
        // 速率限制配置（每5分钟最多18次请求）
        this.rateLimit = {
            maxRequests: 18,
            windowMs: 5 * 60 * 1000, // 5分钟
            requests: [],
            minDelay: 20000 // 最小间隔20秒（3次/分钟）
        };
        
        this.lastRequestTime = 0;
        
        if (!this.isEnabled) {
            logger.info('Translator', '翻译功能未启用');
            return;
        }
        
        if (!this.config.apiKey) {
            logger.warn('Translator', '未配置 API Key，翻译功能将无法使用');
            this.isEnabled = false;
            return;
        }
        
        logger.info('Translator', `翻译功能已启用 - 模型: ${this.config.model}`);
        logger.info('Translator', `速率限制: ${this.rateLimit.maxRequests} 次/5分钟, 最小间隔: ${this.rateLimit.minDelay/1000}秒`);
    }

    /**
     * 检查是否超过速率限制
     * @returns {boolean} 是否可以发送请求
     */
    checkRateLimit() {
        const now = Date.now();
        
        // 清理过期的请求记录
        this.rateLimit.requests = this.rateLimit.requests.filter(
            time => now - time < this.rateLimit.windowMs
        );
        
        // 检查是否超过限制
        if (this.rateLimit.requests.length >= this.rateLimit.maxRequests) {
            const oldestRequest = this.rateLimit.requests[0];
            const waitTime = Math.ceil((this.rateLimit.windowMs - (now - oldestRequest)) / 1000);
            logger.warn('Translator', `已达到速率限制 (${this.rateLimit.maxRequests}次/5分钟)，请等待 ${waitTime} 秒`);
            return false;
        }
        
        // 检查最小间隔
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.rateLimit.minDelay) {
            const waitTime = Math.ceil((this.rateLimit.minDelay - timeSinceLastRequest) / 1000);
            logger.warn('Translator', `请求过于频繁，请等待 ${waitTime} 秒（最小间隔 ${this.rateLimit.minDelay/1000}秒）`);
            return false;
        }
        
        return true;
    }

    /**
     * 等待直到可以发送请求
     * @returns {Promise<void>}
     */
    async waitForRateLimit() {
        const now = Date.now();
        
        // 清理过期的请求记录
        this.rateLimit.requests = this.rateLimit.requests.filter(
            time => now - time < this.rateLimit.windowMs
        );
        
        // 如果超过限制，等待
        if (this.rateLimit.requests.length >= this.rateLimit.maxRequests) {
            const oldestRequest = this.rateLimit.requests[0];
            const waitTime = this.rateLimit.windowMs - (now - oldestRequest) + 1000; // 多等1秒
            logger.warn('Translator', `已达到速率限制，等待 ${Math.ceil(waitTime/1000)} 秒...`);
            await this.delay(waitTime);
        }
        
        // 检查最小间隔
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.rateLimit.minDelay) {
            const waitTime = this.rateLimit.minDelay - timeSinceLastRequest;
            logger.info('Translator', `等待 ${Math.ceil(waitTime/1000)} 秒以满足最小间隔要求...`);
            await this.delay(waitTime);
        }
    }

    /**
     * 记录请求
     */
    recordRequest() {
        const now = Date.now();
        this.rateLimit.requests.push(now);
        this.lastRequestTime = now;
    }

    /**
     * 调用 OpenAI 兼容接口进行翻译
     * @param {string} text - 要翻译的文本
     * @returns {Promise<string>} 翻译结果
     */
    async translate(text) {
        if (!this.isEnabled) {
            return null;
        }

        if (!text || text.trim().length === 0) {
            return null;
        }

        try {
            // 等待速率限制
            await this.waitForRateLimit();
            
            // 记录请求
            this.recordRequest();
            
            const response = await this.callAPI(text);
            return response;
        } catch (error) {
            logger.error('Translator', `翻译失败: ${error.message}`);
            return null;
        }
    }

    /**
     * 调用 OpenAI 兼容 API
     * @param {string} text - 要翻译的文本
     * @param {number} customTimeout - 自定义超时时间（毫秒）
     * @returns {Promise<string>} API 响应
     */
    async callAPI(text, customTimeout = null) {
        return new Promise((resolve, reject) => {
            const url = new URL(this.config.apiUrl);
            
            const requestBody = JSON.stringify({
                model: this.config.model,
                messages: [
                    {
                        role: 'system',
                        content: this.config.systemPrompt
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: this.config.temperature,
                max_tokens: this.config.maxTokens
            });

            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Length': Buffer.byteLength(requestBody)
                },
                timeout: customTimeout || this.config.timeout
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode !== 200) {
                            reject(new Error(`API 返回错误: ${res.statusCode} - ${data}`));
                            return;
                        }

                        const jsonData = JSON.parse(data);
                        
                        if (!jsonData.choices || jsonData.choices.length === 0) {
                            reject(new Error('API 返回数据格式错误'));
                            return;
                        }

                        const translatedText = jsonData.choices[0].message.content.trim();
                        resolve(translatedText);
                    } catch (error) {
                        reject(new Error(`解析响应失败: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`请求失败: ${error.message}`));
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('请求超时'));
            });

            req.write(requestBody);
            req.end();
        });
    }

    /**
     * 翻译大型内容（使用更长的超时时间）
     * @param {string} text - 要翻译的文本
     * @param {number} timeout - 超时时间（毫秒），默认 60 秒
     * @returns {Promise<string>} 翻译结果
     */
    async translateLarge(text, timeout = 60000) {
        if (!this.isEnabled) {
            return null;
        }

        if (!text || text.trim().length === 0) {
            return null;
        }

        try {
            // 等待速率限制
            await this.waitForRateLimit();
            
            // 记录请求
            this.recordRequest();
            
            // 使用自定义超时时间
            const response = await this.callAPI(text, timeout);
            return response;
        } catch (error) {
            logger.error('Translator', `大型内容翻译失败: ${error.message}`);
            return null;
        }
    }

    /**
     * 批量翻译文本
     * @param {string[]} texts - 要翻译的文本数组
     * @returns {Promise<string[]>} 翻译结果数组
     */
    async translateBatch(texts) {
        if (!this.isEnabled) {
            return texts.map(() => null);
        }

        const results = [];
        for (const text of texts) {
            try {
                const translated = await this.translate(text);
                results.push(translated);
            } catch (error) {
                logger.error('Translator', `批量翻译失败: ${error.message}`);
                results.push(null);
            }
        }
        
        return results;
    }

    /**
     * 翻译文章内容（标题 + 正文）
     * @param {Object} article - 文章对象
     * @returns {Promise<Object>} 包含翻译结果的对象
     */
    async translateArticle(article) {
        if (!this.isEnabled) {
            return {
                subjectTranslated: null,
                contentTranslated: null
            };
        }

        try {
            logger.info('Translator', `开始翻译文章: ${article.articleId}`);

            // 翻译标题（自动处理速率限制）
            const subjectTranslated = await this.translate(article.subject);
            
            // 翻译正文（处理 HTML 内容）
            let contentTranslated;
            
            // 检查是否有 HTML 内容
            if (article.contentHtml && article.contentHtml.includes('<img')) {
                // 提取图片标签
                const imgRegex = /<img[^>]*>/gi;
                const images = article.contentHtml.match(imgRegex) || [];
                
                // 移除图片标签，只保留文本内容用于翻译
                let textContent = article.contentHtml.replace(imgRegex, '[[IMAGE_PLACEHOLDER]]');
                
                logger.info('Translator', `文章包含 ${images.length} 张图片，将单独处理`);
                
                // 翻译文本内容
                const translatedText = await this.translate(textContent);
                
                // 重新插入图片
                if (translatedText) {
                    contentTranslated = translatedText;
                    images.forEach(img => {
                        contentTranslated = contentTranslated.replace('[[IMAGE_PLACEHOLDER]]', img);
                    });
                } else {
                    contentTranslated = null;
                }
            } else {
                // 没有图片，直接翻译
                contentTranslated = await this.translate(article.content);
            }

            logger.info('Translator', `文章翻译完成: ${article.articleId}`);

            return {
                subjectTranslated,
                contentTranslated
            };
        } catch (error) {
            logger.error('Translator', `文章翻译失败: ${error.message}`);
            return {
                subjectTranslated: null,
                contentTranslated: null
            };
        }
    }

    /**
     * 延迟函数
     * @param {number} ms - 延迟毫秒数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 测试 API 连接
     * @returns {Promise<boolean>} 是否连接成功
     */
    async testConnection() {
        if (!this.isEnabled) {
            logger.warn('Translator', '翻译功能未启用');
            return false;
        }

        try {
            logger.info('Translator', '测试 API 连接...');
            const result = await this.translate('안녕하세요');
            
            if (result) {
                logger.success('Translator', `API 连接成功！测试翻译: "안녕하세요" -> "${result}"`);
                return true;
            } else {
                logger.error('Translator', 'API 连接失败：未返回翻译结果');
                return false;
            }
        } catch (error) {
            logger.error('Translator', `API 连接失败: ${error.message}`);
            return false;
        }
    }
}
