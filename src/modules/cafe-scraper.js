// src/modules/cafe-scraper.js - Naver Cafe 爬虫模块
import { HttpsProxyAgent } from 'https-proxy-agent';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { ArticleDatabase } from '../database/index.js';

export class CafeScraper {
    constructor() {
        this.config = config.cafe;
        this.proxyConfig = config.proxy;
        this.db = new ArticleDatabase(config.database.articlesFile);
        this.isRunning = false;
        
        // 初始化代理
        if (this.proxyConfig.enabled) {
            this.proxyAgent = new HttpsProxyAgent(this.proxyConfig.url);
            logger.info('CafeScraper', `已启用代理: ${this.proxyConfig.url}`);
        } else {
            this.proxyAgent = null;
            logger.info('CafeScraper', '未启用代理');
        }
    }

    async fetchArticleList(page = 1) {
        const url = `${this.config.baseUrl}/cafe-web/cafe-boardlist-api/v1/cafes/${this.config.cafeId}/menus/${this.config.menuId}/articles?page=${page}&pageSize=${this.config.pageSize}&sortBy=TIME&viewType=L`;
        
        try {
            const fetchOptions = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Referer': `https://cafe.naver.com/steamindiegame`,
                    'Origin': 'https://cafe.naver.com',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-site',
                    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"'
                }
            };

            // 如果启用代理，添加代理配置
            if (this.proxyAgent) {
                fetchOptions.agent = this.proxyAgent;
            }

            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data.result?.articleList || [];
        } catch (error) {
            logger.error('CafeScraper', `获取文章列表失败: ${error.message}`);
            return [];
        }
    }

    async fetchArticleDetail(articleId) {
        const url = `${this.config.baseUrl}/gw/v4/cafes/${this.config.cafeId}/articles/${articleId}`;
        
        try {
            const fetchOptions = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Referer': `https://cafe.naver.com/steamindiegame`,
                    'Origin': 'https://cafe.naver.com',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-site',
                    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"'
                }
            };

            // 如果启用代理，添加代理配置
            if (this.proxyAgent) {
                fetchOptions.agent = this.proxyAgent;
            }

            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data.result?.article || null;
        } catch (error) {
            logger.error('CafeScraper', `获取文章 ${articleId} 详情失败: ${error.message}`);
            return null;
        }
    }

    extractTextFromHtml(html) {
        if (!html) return '';
        
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim();
    }

    async processArticle(articleItem) {
        const articleId = articleItem.articleId;

        if (this.db.hasArticle(articleId)) {
            return null;
        }

        logger.info('CafeScraper', `正在获取文章 ${articleId}...`);

        const detail = await this.fetchArticleDetail(articleId);
        if (!detail) {
            return null;
        }

        const article = {
            articleId: detail.id,
            subject: detail.subject,
            content: this.extractTextFromHtml(detail.contentHtml),
            contentHtml: detail.contentHtml,
            writeDate: detail.writeDate,
            writeDateFormatted: new Date(detail.writeDate).toLocaleString('zh-CN'),
            writer: {
                nick: detail.writer.nick,
                memberKey: detail.writer.memberKey,
                memberLevel: detail.writer.memberLevel,
                memberLevelName: detail.writer.memberLevelName
            },
            menu: {
                id: detail.menu.id,
                name: detail.menu.name
            },
            readCount: detail.readCount,
            commentCount: detail.commentCount,
            fetchedAt: new Date().toISOString()
        };

        return article;
    }

    async scrape() {
        logger.info('CafeScraper', '开始爬取文章');

        const articleList = await this.fetchArticleList(1);
        
        if (articleList.length === 0) {
            logger.warn('CafeScraper', '未获取到文章列表');
            return { newCount: 0, total: this.db.getArticleCount() };
        }

        logger.info('CafeScraper', `获取到 ${articleList.length} 篇文章`);

        let newCount = 0;
        
        for (const item of articleList) {
            if (item.type !== 'ARTICLE') continue;

            const article = await this.processArticle(item.item);
            
            if (article) {
                this.db.addArticle(article);
                newCount++;
                
                logger.success('CafeScraper', `新文章: [${article.writer.nick}] ${article.subject}`);
                
                await this.sleep(1000);
            }
        }

        if (newCount > 0) {
            this.db.save();
        }

        const result = {
            newCount,
            total: this.db.getArticleCount(),
            timestamp: new Date().toISOString()
        };

        logger.info('CafeScraper', `爬取完成: 新增 ${newCount} 篇，共 ${result.total} 篇`);
        
        return result;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async start() {
        if (this.isRunning) {
            logger.warn('CafeScraper', '爬虫已在运行中');
            return;
        }

        this.isRunning = true;
        logger.info('CafeScraper', '爬虫启动');
        logger.info('CafeScraper', `更新间隔: ${this.config.interval / 1000 / 60} 分钟`);

        await this.scrape();

        this.intervalId = setInterval(async () => {
            await this.scrape();
        }, this.config.interval);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.isRunning = false;
            logger.info('CafeScraper', '爬虫已停止');
        }
    }
}
