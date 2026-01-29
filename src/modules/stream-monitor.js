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

    handleSnapshot(snapshot) {
        const currentData = snapshot.val();
        if (!currentData) return;

        if (this.isFirstRun) {
            this.displayInitialStatus(currentData);
            this.isFirstRun = false;
        } else {
            this.detectChanges(currentData);
        }

        // 更新数据库
        for (const [streamerId, info] of Object.entries(currentData)) {
            this.db.updateStream(streamerId, info);
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

    detectChanges(currentData) {
        const previousData = this.db.getAllStreams();

        for (const [streamerId, info] of Object.entries(currentData)) {
            const previous = previousData[streamerId];
            const name = info.name || streamerId;

            // 开播
            if (info.online && (!previous || !previous.online)) {
                logger.success('StreamMonitor', `[开播] ${name}`);
                console.log(`  标题: ${info.title}`);
                console.log(`  分类: ${info.category}`);
                console.log(`  时间: ${new Date().toLocaleTimeString()}`);
            }
            // 下播
            else if (!info.online && previous && previous.online) {
                logger.info('StreamMonitor', `[下播] ${name}`);
            }
            // 标题更新
            else if (info.online && previous && previous.online) {
                if (info.title !== previous.title) {
                    logger.info('StreamMonitor', `[标题更新] ${name}: ${info.title}`);
                }
                if (info.category !== previous.category) {
                    logger.info('StreamMonitor', `[分类更新] ${name}: ${info.category}`);
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
