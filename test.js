// test.js - 简单的功能测试
import { api } from './src/api/index.js';
import { logger } from './src/utils/logger.js';

console.log('='.repeat(60));
console.log('🧪 运行系统测试');
console.log('='.repeat(60));

async function runTests() {
    let passed = 0;
    let failed = 0;

    // 测试 1: 系统状态
    try {
        console.log('\n测试 1: 获取系统状态...');
        const status = api.getSystemStatus();
        if (status.success) {
            console.log('✅ 通过');
            console.log('   配置:', status.data.config);
            passed++;
        } else {
            throw new Error('获取状态失败');
        }
    } catch (error) {
        console.log('❌ 失败:', error.message);
        failed++;
    }

    // 测试 2: 文章数据
    try {
        console.log('\n测试 2: 获取文章数据...');
        const articles = api.getArticles({ limit: 5 });
        if (articles.success) {
            console.log('✅ 通过');
            console.log(`   文章总数: ${articles.data.total}`);
            passed++;
        } else {
            throw new Error('获取文章失败');
        }
    } catch (error) {
        console.log('❌ 失败:', error.message);
        failed++;
    }

    // 测试 3: 文章统计
    try {
        console.log('\n测试 3: 获取文章统计...');
        const stats = api.getArticleStats();
        if (stats.success) {
            console.log('✅ 通过');
            console.log(`   总文章数: ${stats.data.total}`);
            console.log(`   作者数: ${Object.keys(stats.data.authors).length}`);
            passed++;
        } else {
            throw new Error('获取统计失败');
        }
    } catch (error) {
        console.log('❌ 失败:', error.message);
        failed++;
    }

    // 测试 4: 直播数据
    try {
        console.log('\n测试 4: 获取直播数据...');
        const streams = api.getStreams();
        if (streams.success) {
            console.log('✅ 通过');
            console.log(`   主播数: ${streams.data.count}`);
            passed++;
        } else {
            throw new Error('获取直播数据失败');
        }
    } catch (error) {
        console.log('❌ 失败:', error.message);
        failed++;
    }

    // 测试 5: 日志系统
    try {
        console.log('\n测试 5: 日志系统...');
        logger.info('Test', '测试日志');
        console.log('✅ 通过');
        passed++;
    } catch (error) {
        console.log('❌ 失败:', error.message);
        failed++;
    }

    // 测试结果
    console.log('\n' + '='.repeat(60));
    console.log('测试结果');
    console.log('='.repeat(60));
    console.log(`✅ 通过: ${passed}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`📊 总计: ${passed + failed}`);
    console.log('='.repeat(60));

    if (failed === 0) {
        console.log('\n🎉 所有测试通过！系统运行正常。');
        console.log('\n下一步:');
        console.log('  npm start       - 启动所有模块');
        console.log('  npm run cafe    - 启动 Cafe 爬虫');
        console.log('  npm run stream  - 启动直播监控');
    } else {
        console.log('\n⚠️  部分测试失败，请检查配置。');
        console.log('\n建议:');
        console.log('  1. 检查 .env 配置文件');
        console.log('  2. 确保网络连接正常');
        console.log('  3. 查看 logs/app.log 了解详情');
    }

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
