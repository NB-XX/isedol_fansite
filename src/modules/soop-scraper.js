// src/modules/soop-scraper.js - SOOP 公告板爬虫
import axios from 'axios';
import { logger } from '../utils/logger.js';

export class SoopScraper {
    constructor(db) {
        this.db = db;
        this.baseUrl = 'https://chapi.sooplive.co.kr/api';
        this.interval = null;
        
        // 主播配置（从 streamer 表读取）
        this.streamers = [];
    }

    async init() {
        // 从数据库读取主播列表
        const streamers = this.db.getAllStreamers();
        this.streamers = streamers.map(s => ({
            userId: s.bj_id,
            name: s.name,
            avatar: s.avatar
        }));
        
        logger.info('SoopScraper', `已加载 ${this.streamers.length} 个主播配置`);
    }

    async fetchBoardPosts(userId, page = 1) {
        try {
            const url = `${this.baseUrl}/${userId}/board/`;
            const response = await axios.get(url, {
                params: {
                    per_page: 20,
                    start_date: '',
                    end_date: '',
                    field: 'title,contents,user_nick,user_id,hashtags',
                    keyword: '',
                    type: 'post',
                    order_by: 'reg_date',
                    board_number: '',
                    page: page
                }
            });

            return response.data;
        } catch (error) {
            logger.error('SoopScraper', `获取 ${userId} 公告板失败: ${error.message}`);
            return null;
        }
    }

    parseRegDate(regDate) {
        // "2026-01-26 19:44:29" -> timestamp
        const date = new Date(regDate.replace(' ', 'T') + '+09:00'); // KST timezone
        return date.getTime();
    }

    async scrapeStreamerBoard(streamer) {
        try {
            logger.info('SoopScraper', `开始抓取 ${streamer.name} 的公告板`);
            
            const data = await this.fetchBoardPosts(streamer.userId);
            if (!data || !data.data) {
                logger.warn('SoopScraper', `${streamer.name} 没有返回数据`);
                return 0;
            }

            let newCount = 0;
            const posts = [...(data.notice_data || []), ...data.data];

            for (const post of posts) {
                // 检查是否已存在
                if (this.db.hasArticle(post.title_no)) {
                    continue;
                }

                // 转换为统一的文章格式
                const article = {
                    articleId: post.title_no,
                    subject: post.title_name,
                    content: post.content.text_content || '',
                    contentHtml: post.content.content || '',
                    textContent: post.content.text_content || '', // 纯文本内容，用于AI翻译
                    writeDate: this.parseRegDate(post.reg_date),
                    writeDateFormatted: post.reg_date,
                    subjectTranslated: null,
                    contentTranslated: null,
                    translatedAt: null,
                    writer: {
                        nick: post.user_nick,
                        image: post.profile_image,
                        memberKey: post.user_id,
                        memberLevel: 0,
                        memberLevelName: 'SOOP公告栏' // 来源标识
                    },
                    menu: {
                        id: post.bbs_no,
                        name: post.display?.bbs_name || 'SOOP公告栏'
                    },
                    readCount: post.count.read_cnt,
                    commentCount: post.count.comment_cnt,
                    likeCount: post.count.like_cnt,
                    fetchedAt: new Date().toISOString(),
                    source: 'soop' // 添加来源字段
                };

                // 保存到数据库
                const success = this.db.addArticle(article);
                if (success) {
                    newCount++;
                    logger.info('SoopScraper', `新增文章: ${article.subject}`);
                }
            }

            logger.success('SoopScraper', `${streamer.name} 抓取完成，新增 ${newCount} 篇文章`);
            return newCount;
        } catch (error) {
            logger.error('SoopScraper', `抓取 ${streamer.name} 公告板失败: ${error.message}`);
            return 0;
        }
    }

    async scrapeAll() {
        logger.info('SoopScraper', '开始抓取所有主播的公告板');
        
        let totalNew = 0;
        for (const streamer of this.streamers) {
            const count = await this.scrapeStreamerBoard(streamer);
            totalNew += count;
            
            // 避免请求过快
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        logger.success('SoopScraper', `抓取完成，共新增 ${totalNew} 篇文章`);
        return totalNew;
    }

    start(intervalMs = 10 * 60 * 1000) {
        logger.info('SoopScraper', `启动 SOOP 爬虫，间隔: ${intervalMs / 1000 / 60} 分钟`);
        
        // 立即执行一次
        this.scrapeAll();
        
        // 定时执行
        this.interval = setInterval(() => {
            this.scrapeAll();
        }, intervalMs);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            logger.info('SoopScraper', 'SOOP 爬虫已停止');
        }
    }
}
