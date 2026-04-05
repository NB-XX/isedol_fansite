// src/modules/stream-monitor.js - 直播监控模块
import { deleteApp, initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { config, isFirebaseConfigured } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { StreamDatabase } from '../database/index-simple.js';

export class StreamMonitor {
    constructor() {
        this.config = config.firebase;
        this.db = new StreamDatabase();
        this.isFirstRun = true;
        this.isRunning = false;
        this.firebaseDb = null;
        this.firebaseApp = null;
        this.unsubscribe = null;
        this.reconcileIntervalId = null;
        this.reconcileIntervalMs = 60 * 1000;
        
        // 主播 userId 映射（用于调用 SOOP API）
        this.streamers = {
            gosegu: { userId: 'gosegu2', name: '고세구' },
            ine: { userId: 'inehine', name: '아이네' },
            jingburger: { userId: 'jingburger1', name: '징버거' },
            jururu: { userId: 'cotton1217', name: '주르르' },
            lilpa: { userId: 'lilpa0309', name: '릴파' },
            viichan: { userId: 'viichan6', name: '비챤' }
        };
    }

    normalizeBroadData(streamerId, rawData = {}) {
        const fallbackName = this.streamers[streamerId]?.name || streamerId;
        const broadNo = rawData.broadNo || rawData.broad_no || rawData.bjno || null;
        const broadStart = rawData.broadStart || rawData.broad_start || rawData.start_time || null;
        const title = rawData.title || rawData.broadTitle || rawData.broad_title || rawData.station_title || '';
        const category = rawData.category || rawData.categoryName || rawData.broadCategory || rawData.broad_category || rawData.broad_cate_name || '';
        const online = rawData.online === true ||
            rawData.online === 1 ||
            rawData.online === '1' ||
            rawData.online === 'true' ||
            rawData.isLive === true ||
            rawData.is_live === true ||
            !!broadNo;

        return {
            name: rawData.name || fallbackName,
            online,
            title,
            category,
            broadNo: broadNo ? String(broadNo) : null,
            broadStart
        };
    }

    // 调用 SOOP API 获取详细直播信息
    async fetchBroadDetails(streamerId) {
        const userId = this.streamers[streamerId]?.userId;
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
            return this.normalizeBroadData(streamerId, data || {});
        } catch (error) {
            logger.error('StreamMonitor', `获取直播详情失败: ${error.message}`);
            return null;
        }
    }

    initialize() {
        if (!isFirebaseConfigured()) {
            logger.warn('StreamMonitor', '未配置有效的 Firebase Database URL，跳过 Firebase 监听');
            return false;
        }

        try {
            this.firebaseApp = initializeApp(this.config, `stream-monitor-${Date.now()}`);
            this.firebaseDb = getDatabase(this.firebaseApp);
            logger.info('StreamMonitor', 'Firebase 初始化成功');
            return true;
        } catch (error) {
            logger.error('StreamMonitor', `Firebase 初始化失败: ${error.message}`);
            return false;
        }
    }

    async applyState(currentData) {
        if (!currentData) return;

        const normalizedData = {};

        for (const [streamerId, info] of Object.entries(currentData)) {
            normalizedData[streamerId] = this.normalizeBroadData(streamerId, info);
        }

        if (this.isFirstRun) {
            this.displayInitialStatus(normalizedData);
            this.isFirstRun = false;
        } else {
            await this.detectChanges(normalizedData);
        }

        // 更新数据库 - 确保传递完整的数据
        for (const [streamerId, info] of Object.entries(normalizedData)) {
            // 如果是在线状态，尝试获取详细信息
            let broadNo = info.broadNo;
            let broadStart = info.broadStart;
            let title = info.title;
            let category = info.category;
            
            if (info.online) {
                const previous = this.db.getStream(streamerId);
                // 如果之前没有 broadNo，或者是新开播，则获取详细信息
                if (!broadNo || !broadStart || !title || !category || !previous || !previous.broadNo || !previous.online) {
                    const details = await this.fetchBroadDetails(streamerId);
                    if (details && details.online) {
                        broadNo = details.broadNo;
                        broadStart = details.broadStart;
                        title = details.title || title;
                        category = details.category || category;
                    }
                } else {
                    // 使用之前保存的信息
                    broadNo = broadNo || previous.broadNo;
                    broadStart = broadStart || previous.broadStart;
                }
            }
            
            const streamData = {
                ...info,
                name: info.name || this.streamers[streamerId]?.name || streamerId,
                title,
                category,
                broadNo,
                broadStart
            };
            this.db.updateStream(streamerId, streamData);
        }
        this.db.save();
    }

    async handleSnapshot(snapshot) {
        await this.applyState(snapshot.val());
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
            const name = info.name || this.streamers[streamerId]?.name || streamerId;
            let broadNo = info.broadNo || null;
            let broadStart = info.broadStart || null;

            // 开播
            if (info.online && (!previous || !previous.online)) {
                logger.success('StreamMonitor', `[开播] ${name}`);
                console.log(`  标题: ${info.title}`);
                console.log(`  分类: ${info.category}`);
                
                // 调用 SOOP API 获取详细信息
                const details = broadNo ? info : await this.fetchBroadDetails(streamerId);
                if (details && details.online) {
                    broadNo = details.broadNo;
                    broadStart = details.broadStart;
                    console.log(`  直播ID: ${broadNo}`);
                    console.log(`  开播时间: ${broadStart}`);
                }
                
                console.log(`  时间: ${new Date().toLocaleTimeString()}`);
                
                // 记录开播事件到数据库
                this.db.addStreamEvent({
                    streamerId,
                    name,
                    action: 'start',
                    title: info.title,
                    category: info.category,
                    broadNo
                });
            }
            // 下播
            else if (!info.online && previous && previous.online) {
                logger.info('StreamMonitor', `[下播] ${name}`);
                
                // 记录下播事件到数据库
                this.db.addStreamEvent({
                    streamerId,
                    name,
                    action: 'end',
                    title: previous.title,
                    category: previous.category,
                    broadNo: previous.broadNo
                });
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

    async fetchSoopState() {
        const state = {};

        for (const streamerId of Object.keys(this.streamers)) {
            const details = await this.fetchBroadDetails(streamerId);
            state[streamerId] = details && details.online
                ? details
                : {
                    name: this.streamers[streamerId].name,
                    online: false,
                    title: '',
                    category: '',
                    broadNo: null,
                    broadStart: null
                };
        }

        return state;
    }

    async reconcileWithSoop() {
        try {
            const polledState = await this.fetchSoopState();
            await this.applyState(polledState);
        } catch (error) {
            logger.error('StreamMonitor', `SOOP 校准失败: ${error.message}`);
        }
    }

    async start() {
        if (this.isRunning) {
            logger.warn('StreamMonitor', '监控已在运行中');
            return;
        }

        this.isRunning = true;
        const firebaseReady = this.initialize();

        if (firebaseReady) {
            const starRef = ref(this.firebaseDb, 'afreeca');
            
            this.unsubscribe = onValue(starRef, 
                (snapshot) => this.handleSnapshot(snapshot),
                (error) => logger.error('StreamMonitor', `监听错误: ${error.message}`)
            );
        }

        await this.reconcileWithSoop();

        this.reconcileIntervalId = setInterval(() => {
            this.reconcileWithSoop();
        }, this.reconcileIntervalMs);

        logger.info('StreamMonitor', '直播监控启动');
    }

    stop() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }

        if (this.reconcileIntervalId) {
            clearInterval(this.reconcileIntervalId);
            this.reconcileIntervalId = null;
        }

        if (this.firebaseApp) {
            deleteApp(this.firebaseApp).catch(() => {});
            this.firebaseApp = null;
        }

        this.firebaseDb = null;
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
