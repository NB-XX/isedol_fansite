// src/modules/cafe-scraper.js - Naver Cafe 爬虫模块
import https from 'https';
import zlib from 'zlib';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { ArticleDatabase } from '../database/index.js';
import { Translator } from './translator.js';

export class CafeScraper {
    constructor() {
        this.config = config.cafe;
        this.proxyConfig = config.proxy;
        this.db = new ArticleDatabase(config.database.articlesFile);
        this.translator = new Translator();
        this.isRunning = false;
        
        // 主播头像映射（使用 Soop Live 头像）
        this.ISEDOL_AVATARS = {
            '고세구': 'https://stimg.sooplive.co.kr/LOGO/go/gosegu2/m/gosegu2.webp',
            '비챤': 'https://stimg.sooplive.co.kr/LOGO/vi/viichan6/m/viichan6.webp',
            '아이네': 'https://stimg.sooplive.co.kr/LOGO/in/inehine/m/inehine.webp',
            '릴파 LILPA': 'https://stimg.sooplive.co.kr/LOGO/li/lilpa0309/m/lilpa0309.webp',
            '릴파': 'https://stimg.sooplive.co.kr/LOGO/li/lilpa0309/m/lilpa0309.webp',
            '주르르': 'https://stimg.sooplive.co.kr/LOGO/co/cotton1217/m/cotton1217.webp',
            '징버거': 'https://stimg.sooplive.co.kr/LOGO/ji/jingburger1/m/jingburger1.webp'
        };
        
        this.DEFAULT_AVATAR = 'https://ssl.pstatic.net/static/cafe/cafe_pc/default/cafe_profile_70.png';
        
        // 初始化代理
        if (this.proxyConfig.enabled) {
            this.proxyAgent = new HttpsProxyAgent(this.proxyConfig.url);
            logger.info('CafeScraper', `已启用代理: ${this.proxyConfig.url}`);
        } else {
            this.proxyAgent = null;
            logger.info('CafeScraper', '未启用代理');
        }
    }

    // 使用原生 https 模块进行请求，支持代理
    async fetchWithProxy(url, options = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const requestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port || 443,
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: options.headers || {},
                agent: this.proxyAgent
            };

            const req = https.request(requestOptions, (res) => {
                let stream = res;
                
                // 处理压缩响应
                const encoding = res.headers['content-encoding'];
                if (encoding === 'gzip') {
                    stream = res.pipe(zlib.createGunzip());
                } else if (encoding === 'deflate') {
                    stream = res.pipe(zlib.createInflate());
                } else if (encoding === 'br') {
                    stream = res.pipe(zlib.createBrotliDecompress());
                }
                
                let data = '';
                stream.setEncoding('utf8');
                
                stream.on('data', (chunk) => {
                    data += chunk;
                });
                
                stream.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve({ 
                            ok: res.statusCode >= 200 && res.statusCode < 300, 
                            status: res.statusCode, 
                            data: jsonData 
                        });
                    } catch (error) {
                        reject(new Error(`JSON parse error: ${error.message}, data: ${data.substring(0, 100)}`));
                    }
                });
                
                stream.on('error', (error) => {
                    reject(error);
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.setTimeout(30000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    async fetchArticleList(page = 1) {
        const url = `${this.config.baseUrl}/cafe-web/cafe-boardlist-api/v1/cafes/${this.config.cafeId}/menus/${this.config.menuId}/articles?page=${page}&pageSize=${this.config.pageSize}&sortBy=TIME&viewType=L`;
        
        try {
            const response = await this.fetchWithProxy(url, {
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
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return response.data.result?.articleList || [];
        } catch (error) {
            logger.error('CafeScraper', `获取文章列表失败: ${error.message}`);
            return [];
        }
    }

    async fetchArticleDetail(articleId) {
        // 使用 article.cafe.naver.com API（不需要认证）
        const url = `https://article.cafe.naver.com/gw/v4/cafes/${this.config.cafeId}/articles/${articleId}`;
        
        try {
            const response = await this.fetchWithProxy(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': '*/*',
                    'Referer': `https://cafe.naver.com/steamindiegame/${articleId}`
                }
            });

            if (!response.ok) {
                logger.warn('CafeScraper', `文章 ${articleId} 详情 API 返回 ${response.status}`);
                return null;
            }

            const data = response.data;
            
            if (data.result && data.result.article && data.result.article.contentHtml) {
                logger.info('CafeScraper', `✓ 成功获取文章 ${articleId} 完整内容 (${data.result.article.contentHtml.length} 字符)`);
            }
            
            return data.result?.article || null;
        } catch (error) {
            logger.warn('CafeScraper', `获取文章 ${articleId} 详情失败: ${error.message}`);
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

        logger.info('CafeScraper', `处理文章 ${articleId}...`);

        // 从列表项中提取基本信息
        const writerInfo = articleItem.writerInfo || {};
        const writerNick = writerInfo.nickName || 'Unknown';
        
        // 优先使用主播头像（Soop Live），否则使用默认头像
        const writerImage = this.ISEDOL_AVATARS[writerNick] || this.DEFAULT_AVATAR;
        
        // 获取文章详情以获取完整的 contentHtml
        const articleDetail = await this.fetchArticleDetail(articleId);
        
        let contentHtml = '';
        let content = '';
        
        if (articleDetail && articleDetail.contentHtml) {
            // 保留完整的 HTML 内容（包含格式、图片、贴纸等）
            contentHtml = articleDetail.contentHtml;
            // 从完整 HTML 中提取纯文本用于搜索和预览
            content = this.extractTextFromHtml(contentHtml);
        } else {
            // 如果无法获取详情，使用 summary 作为降级方案
            content = articleItem.summary || '';
            contentHtml = content ? `<div class="article-content">${content.replace(/\n/g, '<br>')}</div>` : '';
        }
        
        const article = {
            articleId: articleItem.articleId,
            subject: articleItem.subject,
            content: content,
            contentHtml: contentHtml,
            textContent: articleItem.summary || '', // 纯文本内容，用于AI翻译
            writeDate: articleItem.writeDateTimestamp || Date.now(),
            writeDateFormatted: new Date(articleItem.writeDateTimestamp || Date.now()).toLocaleString('zh-CN'),
            writer: {
                nick: writerNick,
                image: writerImage,
                memberKey: writerInfo.memberKey || '',
                memberLevel: writerInfo.memberLevel || 0,
                memberLevelName: writerInfo.memberLevelName || ''
            },
            menu: {
                id: articleItem.menuId,
                name: articleItem.menuName || ''
            },
            readCount: articleItem.readCount || 0,
            commentCount: articleItem.commentCount || 0,
            likeCount: articleItem.likeCount || 0,
            source: 'naver',
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
                // 如果启用翻译，自动翻译新文章
                if (this.translator.isEnabled) {
                    try {
                        logger.info('CafeScraper', `翻译文章: ${article.articleId}`);
                        const translation = await this.translator.translateArticle(article);
                        article.subjectTranslated = translation.subjectTranslated;
                        article.contentTranslated = translation.contentTranslated;
                        article.translatedAt = new Date().toISOString();
                    } catch (error) {
                        logger.error('CafeScraper', `翻译失败: ${error.message}`);
                    }
                }
                
                this.db.addArticle(article);
                newCount++;
                
                logger.success('CafeScraper', `新文章: [${article.writer.nick}] ${article.subject}`);
                
                // 添加延迟避免请求过快
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
