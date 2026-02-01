// src/modules/stream-monitor.js - 直播监控模块
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { StreamDatabase } from '../database/index.js';

export class StreamMonitor {
    constructor() {
        this.config = config.firebase;
        this.db = new StreamDatabase(config.database.streamsFile);
        this.isFirstRun = true;
        this.isRunning = false;
        
        // 主播 userId 映射（用于调用 SOOP API）
        this.streamerUserIds = {
            'gosegu': 'gosegu2',
            'ine': 'inehine',
            'jingburger': 'jingburger1',
            'jururu': 'cotton1217',
            'lilpa': 'lilpa0309',
            'viichan': 'viichan6'
        };
    }

    // 调用 SOOP API 获取详细直播信息
    async fetchBroadDetails(streamerId) {
        const userId = this.streamerUserIds[streamerId];
        if (!userId) {
            logger.warn('StreamMonitor', `未找到 ${streamerId} 的 userId 映射`);
            return null;
        }

        try {
            const url = `https://api-channel.sooplive.co.kr/v1.1/channel/${userId}/home/section/broad`;
            const response = await fetch(url);
            
            if (!response.ok) {
                logger.warn('StreamMonitor', `SOOP API 请求失败: ${response.status}`);
                return null;
            }

            const data = await response.json();
            return {
                broadNo: data.broadNo?.toString(),
                broadStart: data.broadStart
            };
        } catch (error) {
            logger.error('StreamMonitor', `获取直播详情失败: ${error.message}`);
            return null;
        }
    }

    initialize() {
        try {
            const app = initializeApp(this.config);
            this.firebaseDb = getDatabase(app);
            logger.info('StreamMonitor', 'Firebase 初始化成功');
        } catch (error) {
            logger.error('StreamMonitor', `Firebase 初始化失败: ${error.message}`);
            throw error;
        }
    }

    async handleSnapshot(snapshot) {
        const currentData = snapshot.val();
        if (!currentData) return;

        if (this.isFirstRun) {
            this.displayInitialStatus(currentData);
            this.isFirstRun = false;
        } else {
            await this.detectChanges(currentData);
        }

        // 更新数据库 - 确保传递完整的数据
        for (const [streamerId, info] of Object.entries(currentData)) {
            // 如果是在线状态，尝试获取详细信息
            let broadNo = null;
            let broadStart = null;
            
            if (info.online) {
                const previous = this.db.getStream(streamerId);
                // 如果之前没有 broadNo，或者是新开播，则获取详细信息
                if (!previous || !previous.broadNo || !previous.online) {
                    const details = await this.fetchBroadDetails(streamerId);
                    if (details) {
                        broadNo = details.broadNo;
                        broadStart = details.broadStart;
                    }
                } else {
                    // 使用之前保存的信息
                    broadNo = previous.broadNo;
                    broadStart = previous.broadStart;
                }
            }
            
            const streamData = {
                ...info,
                name: info.name || streamerId,
                broadNo,
                broadStart
            };
            this.db.updateStream(streamerId, streamData);
        }
        this.db.save();
    }

    displayInitialStatus(data) {
        logger.info('StreamMonitor', '当前所有主播状态:');
        
        console.log(`\n| ${"状态".padEnd(4)} | ${"主播".padEnd(8)} | ${"分类".padEnd(10)} | 标题`);
        console.log("=".repeat(60));

        for (const [streamerId, info] of Object.entries(data)) {
            const statusIcon = info.online ? "🟢 ON " : "⚫ OFF";
            const name = info.name || streamerId;
            const category = info.category || "-";
            const title = info.title || "无标题";

            console.log(`| ${statusIcon} | ${name.padEnd(8)} | ${category.padEnd(10)} | ${title}`);
        }
        console.log("=".repeat(60) + "\n");
    }

    async detectChanges(currentData) {
        const previousData = this.db.getAllStreams();

        for (const [streamerId, info] of Object.entries(currentData)) {
            const previous = previousData[streamerId];
            const name = info.name || streamerId;
            let broadNo = info.broad_no || info.broadNo || null;
            let broadStart = null;

            // 开播
            if (info.online && (!previous || !previous.online)) {
                logger.success('StreamMonitor', `[开播] ${name}`);
                console.log(`  标题: ${info.title}`);
                console.log(`  分类: ${info.category}`);
                
                // 调用 SOOP API 获取详细信息
                const details = await this.fetchBroadDetails(streamerId);
                if (details) {
                    broadNo = details.broadNo;
                    broadStart = details.broadStart;
                    console.log(`  直播ID: ${broadNo}`);
                    console.log(`  开播时间: ${broadStart}`);
                }
                
                console.log(`  时间: ${new Date().toLocaleTimeString()}`);
            }
            // 下播
            else if (!info.online && previous && previous.online) {
                logger.info('StreamMonitor', `[下播] ${name}`);
            }
            // 在线时的更新
            else if (info.online && previous && previous.online) {
                // 标题更新
                if (info.title !== previous.title) {
                    logger.info('StreamMonitor', `[标题更新] ${name}: ${info.title}`);
                    // 记录标题更新到数据库
                    this.db.addStreamEvent({
                        streamerId,
                        name,
                        action: 'title_change',
                        title: info.title,
                        category: info.category,
                        oldTitle: previous.title,
                        broadNo: previous.broadNo
                    });
                }
                // 分类更新
                if (info.category !== previous.category) {
                    logger.info('StreamMonitor', `[分类更新] ${name}: ${info.category}`);
                    // 记录分类更新到数据库
                    this.db.addStreamEvent({
                        streamerId,
                        name,
                        action: 'category_change',
                        title: info.title,
                        category: info.category,
                        oldCategory: previous.category,
                        broadNo: previous.broadNo
                    });
                }
            }
        }
    }

    start() {
        if (this.isRunning) {
            logger.warn('StreamMonitor', '监控已在运行中');
            return;
        }

        this.initialize();
        this.isRunning = true;

        const starRef = ref(this.firebaseDb, 'afreeca');
        
        onValue(starRef, 
            (snapshot) => this.handleSnapshot(snapshot),
            (error) => logger.error('StreamMonitor', `监听错误: ${error.message}`)
        );

        logger.info('StreamMonitor', '直播监控启动');
    }

    stop() {
        this.isRunning = false;
        logger.info('StreamMonitor', '直播监控已停止');
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            streams: this.db.getAllStreams(),
            history: this.db.getHistory(10)
        };
    }
}
