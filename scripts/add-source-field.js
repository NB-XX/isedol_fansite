// scripts/add-source-field.js - 添加 source 字段到 articles 表
import Database from '../src/database/sqlite.js';
import { logger } from '../src/utils/logger.js';

const db = new Database('./data/database.db');

try {
    logger.info('Migration', '开始添加 source 字段...');
    
    // 检查字段是否已存在
    const tableInfo = db.db.pragma('table_info(articles)');
    const hasSourceField = tableInfo.some(col => col.name === 'source');
    
    if (hasSourceField) {
        logger.info('Migration', 'source 字段已存在，跳过');
    } else {
        // 添加 source 字段
        db.db.exec(`
            ALTER TABLE articles ADD COLUMN source TEXT DEFAULT 'naver';
        `);
        
        logger.success('Migration', 'source 字段添加成功');
    }
    
    // 更新现有数据
    const updateStmt = db.db.prepare(`
        UPDATE articles 
        SET source = 'naver' 
        WHERE source IS NULL
    `);
    
    const result = updateStmt.run();
    logger.success('Migration', `已更新 ${result.changes} 条记录`);
    
    db.close();
    logger.success('Migration', '迁移完成！');
} catch (error) {
    logger.error('Migration', `迁移失败: ${error.message}`);
    db.close();
    process.exit(1);
}
