import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/database.db');
const db = new Database(dbPath);

console.log('开始添加翻译相关字段...');

try {
  // 添加 text_content 字段（纯文本内容，用于AI翻译）
  db.exec(`
    ALTER TABLE articles ADD COLUMN text_content TEXT;
  `);
  console.log('✓ 添加 text_content 字段成功');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('✓ text_content 字段已存在');
  } else {
    console.error('✗ 添加 text_content 字段失败:', error.message);
  }
}

try {
  // 添加 is_ai_translated 字段（标识是否为AI翻译）
  db.exec(`
    ALTER TABLE articles ADD COLUMN is_ai_translated INTEGER DEFAULT 1;
  `);
  console.log('✓ 添加 is_ai_translated 字段成功');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('✓ is_ai_translated 字段已存在');
  } else {
    console.error('✗ 添加 is_ai_translated 字段失败:', error.message);
  }
}

try {
  // 添加 content_html_translated 字段（HTML格式的翻译内容）
  db.exec(`
    ALTER TABLE articles ADD COLUMN content_html_translated TEXT;
  `);
  console.log('✓ 添加 content_html_translated 字段成功');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('✓ content_html_translated 字段已存在');
  } else {
    console.error('✗ 添加 content_html_translated 字段失败:', error.message);
  }
}

// 更新现有数据：从 content 或 content_html 提取纯文本
console.log('\n开始更新现有文章的 text_content...');

const articles = db.prepare('SELECT article_id, content, content_html FROM articles WHERE text_content IS NULL').all();

console.log(`找到 ${articles.length} 篇需要更新的文章`);

const updateStmt = db.prepare('UPDATE articles SET text_content = ? WHERE article_id = ?');

let updated = 0;
for (const article of articles) {
  let textContent = '';
  
  if (article.content_html) {
    // 从 HTML 中提取纯文本（简单处理）
    textContent = article.content_html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
  } else if (article.content) {
    textContent = article.content;
  }
  
  if (textContent) {
    updateStmt.run(textContent, article.article_id);
    updated++;
  }
}

console.log(`✓ 成功更新 ${updated} 篇文章的 text_content`);

db.close();
console.log('\n数据库迁移完成！');
