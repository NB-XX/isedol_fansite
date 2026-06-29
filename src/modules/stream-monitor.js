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
            const url = `https://api-channel.sooplive.com/v1.1/channel/${userId}/home/section/broad`;
            const response = await fetch(url);
            
            if (response.status === 404 || response.status === 204) {
                return null;
            }

            if (!response.ok) {
                logger.warn('StreamMonitor', `SOOP API 请求失败: ${response.status}`);
                return null;
            }

            const body = await response.text();
            if (!body || !body.trim()) {
                return null;
            }

            const data = JSON.parse(body);
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

    async applyState(currentData, source = 'soop') {
        if (!currentData) return;

        const normalizedData = {};

        for (const [streamerId, info] of Object.entries(currentData)) {
            normalizedData[streamerId] = this.normalizeBroadData(streamerId, info);
        }

        // 先补全在线主播缺失的关键字段，再做变更检测。
        // - 源数据偶发缺字段会让 category/title 在“有值/空值”间反复抖动 → 用上次有效值兜底
        // - Firebase 推送的分类为韩文，SOOP 接口推送为英文，两源语言不一致会让同一分类
        //   在 KR/EN 间横跳。统一以 SOOP 为分类权威来源：对 Firebase 数据不采用其 category，
        //   改由 SOOP 详情或上次 SOOP 值提供，杜绝语言抖动（Firebase 仍负责实时开播/下播检测）。
        for (const [streamerId, info] of Object.entries(normalizedData)) {
            if (!info.online) continue;

            const previous = this.db.getStream(streamerId);
            const isNewStream = !previous
                || !previous.online
                || (info.broadNo && previous.broadNo && info.broadNo !== previous.broadNo);

            // Firebase 的分类语言与 SOOP 不一致，统一丢弃，由 SOOP 提供
            if (source === 'firebase') {
                info.category = '';
            }

            // 缺少 broadNo，或新开播时缺分类/标题 → 向 SOOP 拉取详情补全（提供规范分类）
            if (!info.broadNo || (isNewStream && (!info.title || !info.category))) {
                const details = await this.fetchBroadDetails(streamerId);
                if (details && details.online) {
                    info.broadNo = info.broadNo || details.broadNo;
                    info.broadStart = info.broadStart || details.broadStart;
                    info.title = info.title || details.title;
                    info.category = info.category || details.category;
                }
            }

            // 同一场直播（broadNo 缺失或与上次相同）时，保留上次的有效值，
            // 避免源数据偶发缺字段导致字段被空值覆盖。
            const sameStream = previous
                && previous.online
                && (!info.broadNo || info.broadNo === previous.broadNo);

            if (sameStream) {
                info.broadNo = info.broadNo || previous.broadNo;
                info.broadStart = info.broadStart || previous.broadStart;
                info.title = info.title || previous.title;
                info.category = info.category || previous.category;
            }
        }

        if (this.isFirstRun) {
            this.displayInitialStatus(normalizedData);
            this.isFirstRun = false;
        } else {
            await this.detectChanges(normalizedData);
        }

        // 此时字段已稳定，写回数据库
        for (const [streamerId, info] of Object.entries(normalizedData)) {
            const streamData = {
                ...info,
                name: info.name || this.streamers[streamerId]?.name || streamerId
            };
            this.db.updateStream(streamerId, streamData);
        }
        this.db.save();
    }

    async handleSnapshot(snapshot) {
        await this.applyState(snapshot.val(), 'firebase');
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

            // 开播（info 已在 applyState 中补全字段）
            if (info.online && (!previous || !previous.online)) {
                logger.success('StreamMonitor', `[开播] ${name}`);
                console.log(`  标题: ${info.title}`);
                console.log(`  分类: ${info.category}`);
                console.log(`  直播ID: ${info.broadNo || '-'}`);
                console.log(`  开播时间: ${info.broadStart || '-'}`);
                console.log(`  时间: ${new Date().toLocaleTimeString()}`);

                this.db.addStreamEvent({
                    streamerId,
                    name,
                    action: 'start',
                    title: info.title,
                    category: info.category,
                    broadNo: info.broadNo
                });
            }
            // 下播
            else if (!info.online && previous && previous.online) {
                logger.info('StreamMonitor', `[下播] ${name}`);

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
                // 仅当“新值与旧值都真实存在且不同”时才记录变更。
                // 源数据偶发缺字段（空值）会被 applyState 用上次的有效值补回，
                // 因此这里不会出现 null↔value 的抖动；任何空值都不视为变更。
                if (info.title && previous.title && info.title !== previous.title) {
                    logger.info('StreamMonitor', `[标题更新] ${name}: ${info.title}`);
                    this.db.addStreamEvent({
                        streamerId,
                        name,
                        action: 'title_change',
                        title: info.title,
                        category: info.category,
                        oldTitle: previous.title,
                        broadNo: info.broadNo
                    });
                }
                if (info.category && previous.category && info.category !== previous.category) {
                    logger.info('StreamMonitor', `[分类更新] ${name}: ${info.category}`);
                    this.db.addStreamEvent({
                        streamerId,
                        name,
                        action: 'category_change',
                        title: info.title,
                        category: info.category,
                        oldCategory: previous.category,
                        broadNo: info.broadNo
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
            await this.applyState(polledState, 'soop');
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
