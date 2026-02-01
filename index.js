// index.js - 主入口文件
import { api } from './src/api/index.js';
import { logger } from './src/utils/logger.js';

console.log('='.repeat(60));
console.log('🚀 异世界女团粉丝站数据采集系统');
console.log('='.repeat(60));

// 解析命令行参数
const args = process.argv.slice(2);
const command = args[0];

async function main() {
    try {
        switch (command) {
            case 'cafe':
                // 启动 Cafe 爬虫
                logger.info('Main', '启动 Cafe 爬虫模块');
                await api.startCafeScraper();
                break;

            case 'stream':
                // 启动直播监控
                logger.info('Main', '启动直播监控模块');
                api.startStreamMonitor();
                break;

            case 'all':
                // 启动所有模块
                logger.info('Main', '启动所有模块');
                await api.startCafeScraper();
                api.startStreamMonitor();
                break;

            case 'status':
                // 查看系统状态
                const status = api.getSystemStatus();
                console.log('\n系统状态:');
                console.log(JSON.stringify(status.data, null, 2));
                process.exit(0);
                break;

            case 'articles':
                // 查看文章
                const limit = parseInt(args[1]) || 10;
                const articles = api.getArticles({ limit });
                console.log(`\n最新 ${limit} 篇文章:`);
                articles.data.articles.forEach((article, index) => {
                    console.log(`\n${index + 1}. ${article.subject}`);
                    console.log(`   作者: ${article.writer.nick}`);
                    console.log(`   时间: ${article.writeDateFormatted}`);
                });
                process.exit(0);
                break;

            case 'stats':
                // 查看统计
                const stats = api.getArticleStats();
                console.log('\n文章统计:');
                console.log(JSON.stringify(stats.data, null, 2));
                process.exit(0);
                break;

            case 'help':
            default:
                // 显示帮助
                console.log('\n使用方法:');
                console.log('  node index.js cafe       - 启动 Cafe 爬虫');
                console.log('  node index.js stream     - 启动直播监控');
                console.log('  node index.js all        - 启动所有模块');
                console.log('  node index.js status     - 查看系统状态');
                console.log('  node index.js articles [数量] - 查看最新文章');
                console.log('  node index.js stats      - 查看统计信息');
                console.log('  node index.js help       - 显示帮助');
                console.log('');
                process.exit(0);
        }

        // 保持进程运行
        logger.info('Main', '系统运行中，按 Ctrl+C 停止');
        
    } catch (error) {
        logger.error('Main', `启动失败: ${error.message}`);
        process.exit(1);
    }
}

// 优雅退出
process.on('SIGINT', () => {
    logger.info('Main', '正在关闭系统...');
    api.stopCafeScraper();
    api.stopStreamMonitor();
    process.exit(0);
});

main();
