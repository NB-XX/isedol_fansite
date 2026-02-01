#!/usr/bin/env node
// translate.js - 翻译工具命令行
import { Translator } from './src/modules/translator.js';
import { getDatabase } from './src/database/index.js';
import { logger } from './src/utils/logger.js';

const translator = new Translator();
const db = getDatabase();

async function main() {
    const command = process.argv[2];

    switch (command) {
        case 'test':
            await testConnection();
            break;
        case 'translate':
            await translateUntranslated();
            break;
        case 'retranslate':
            await retranslateAll();
            break;
        case 'stats':
            showStats();
            break;
        default:
            showHelp();
    }

    db.close();
}

async function testConnection() {
    console.log('🔍 测试 API 连接...\n');
    const success = await translator.testConnection();
    
    if (success) {
        console.log('\n✅ API 连接测试成功！');
    } else {
        console.log('\n❌ API 连接测试失败！');
        console.log('请检查配置：');
        console.log('  - TRANSLATION_ENABLED=true');
        console.log('  - TRANSLATION_API_KEY 是否正确');
        console.log('  - TRANSLATION_API_URL 是否可访问');
    }
}

async function translateUntranslated() {
    if (!translator.isEnabled) {
        console.log('❌ 翻译功能未启用');
        console.log('请在 .env 文件中设置 TRANSLATION_ENABLED=true');
        return;
    }

    console.log('🔄 开始翻译未翻译的文章...\n');

    const untranslated = db.getUntranslatedArticles(100);
    
    if (untranslated.length === 0) {
        console.log('✅ 所有文章都已翻译！');
        return;
    }

    console.log(`📝 找到 ${untranslated.length} 篇未翻译的文章\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < untranslated.length; i++) {
        const article = untranslated[i];
        
        console.log(`[${i + 1}/${untranslated.length}] 翻译文章 ${article.articleId}: ${article.subject}`);

        try {
            const translation = await translator.translateArticle(article);
            
            if (translation.subjectTranslated && translation.contentTranslated) {
                db.updateArticleTranslation(
                    article.articleId,
                    translation.subjectTranslated,
                    translation.contentTranslated
                );
                
                console.log(`  ✅ 标题: ${translation.subjectTranslated}`);
                successCount++;
            } else {
                console.log(`  ❌ 翻译失败`);
                failCount++;
            }
        } catch (error) {
            console.log(`  ❌ 错误: ${error.message}`);
            failCount++;
        }

        // 添加延迟避免 API 限流
        if (i < untranslated.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log(`\n📊 翻译完成！`);
    console.log(`  ✅ 成功: ${successCount}`);
    console.log(`  ❌ 失败: ${failCount}`);
}

async function retranslateAll() {
    if (!translator.isEnabled) {
        console.log('❌ 翻译功能未启用');
        return;
    }

    console.log('⚠️  警告：此操作将重新翻译所有文章！');
    console.log('按 Ctrl+C 取消，或等待 5 秒后开始...\n');

    await new Promise(resolve => setTimeout(resolve, 5000));

    const allArticles = db.getAllArticles();
    console.log(`📝 开始重新翻译 ${allArticles.length} 篇文章\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < allArticles.length; i++) {
        const article = allArticles[i];
        
        console.log(`[${i + 1}/${allArticles.length}] 翻译文章 ${article.articleId}: ${article.subject}`);

        try {
            const translation = await translator.translateArticle(article);
            
            if (translation.subjectTranslated && translation.contentTranslated) {
                db.updateArticleTranslation(
                    article.articleId,
                    translation.subjectTranslated,
                    translation.contentTranslated
                );
                
                console.log(`  ✅ ${translation.subjectTranslated}`);
                successCount++;
            } else {
                console.log(`  ❌ 翻译失败`);
                failCount++;
            }
        } catch (error) {
            console.log(`  ❌ 错误: ${error.message}`);
            failCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n📊 重新翻译完成！`);
    console.log(`  ✅ 成功: ${successCount}`);
    console.log(`  ❌ 失败: ${failCount}`);
}

function showStats() {
    const total = db.getArticleCount();
    const translated = db.getTranslatedCount();
    const untranslated = total - translated;
    const percentage = total > 0 ? ((translated / total) * 100).toFixed(1) : 0;

    console.log('📊 翻译统计\n');
    console.log(`  总文章数: ${total}`);
    console.log(`  已翻译: ${translated} (${percentage}%)`);
    console.log(`  未翻译: ${untranslated}`);
    console.log(`  翻译状态: ${translator.isEnabled ? '✅ 已启用' : '❌ 未启用'}`);
}

function showHelp() {
    console.log(`
📖 翻译工具使用说明

用法: node translate.js <命令>

命令:
  test              测试 API 连接
  translate         翻译所有未翻译的文章
  retranslate       重新翻译所有文章（慎用）
  stats             显示翻译统计信息

示例:
  node translate.js test          # 测试 API 连接
  node translate.js translate     # 翻译未翻译的文章
  node translate.js stats         # 查看统计信息

配置:
  在 .env 文件中配置翻译参数：
  - TRANSLATION_ENABLED=true
  - TRANSLATION_API_KEY=your_api_key
  - TRANSLATION_API_URL=https://api.openai.com/v1/chat/completions
  - TRANSLATION_MODEL=gpt-3.5-turbo
    `);
}

main().catch(error => {
    logger.error('Translate', `执行失败: ${error.message}`);
    process.exit(1);
});
