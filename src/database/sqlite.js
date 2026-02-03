// src/database/sqlite.js - SQLite 数据库管理
import Database from 'better-sqlite3';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SQLiteDatabase {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
        this.init();
    }

    init() {
        try {
            // 创建数据库连接
            this.db = new Database(this.dbPath);
            this.db.pragma('journal_mode = WAL'); // 启用 WAL 模式提升性能
            
            // 执行 schema
            const schemaPath = join(__dirname, 'schema.sql');
            if (existsSync(schemaPath)) {
                const schema = readFileSync(schemaPath, 'utf-8');
                this.db.exec(schema);
                logger.info('SQLite', '数据库初始化成功');
            } else {
                logger.error('SQLite', 'schema.sql 文件不存在');
            }
        } catch (error) {
            logger.error('SQLite', `数据库初始化失败: ${error.message}`);
            throw error;
        }
    }

    close() {
        if (this.db) {
            this.db.close();
            logger.info('SQLite', '数据库连接已关闭');
        }
    }

    // ==================== 文章相关方法 ====================
    
    hasArticle(articleId) {
        const stmt = this.db.prepare('SELECT 1 FROM articles WHERE article_id = ?');
        return !!stmt.get(articleId);
    }

    addArticle(article) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO articles (
                article_id, subject, content, content_html, text_content,
                write_date, write_date_formatted,
                subject_translated, content_translated, content_html_translated, 
                is_ai_translated, translated_at,
                author_nick, author_image, author_member_key,
                author_member_level, author_member_level_name,
                menu_id, menu_name,
                read_count, comment_count, like_count,
                source,
                fetched_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        try {
            stmt.run(
                article.articleId,
                article.subject,
                article.content,
                article.contentHtml,
                article.textContent || article.content || '',
                article.writeDate,
                article.writeDateFormatted,
                article.subjectTranslated || null,
                article.contentTranslated || null,
                article.contentHtmlTranslated || null,
                article.isAiTranslated !== undefined ? article.isAiTranslated : 1,
                article.translatedAt || null,
                article.writer.nick,
                article.writer.image,
                article.writer.memberKey,
                article.writer.memberLevel,
                article.writer.memberLevelName,
                article.menu.id,
                article.menu.name,
                article.readCount,
                article.commentCount,
                article.likeCount,
                article.source || 'naver',
                article.fetchedAt
            );
            return true;
        } catch (error) {
            logger.error('SQLite', `添加文章失败: ${error.message}`);
            return false;
        }
    }

    getArticleCount() {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM articles');
        return stmt.get().count;
    }

    getLatestArticles(count = 5) {
        const stmt = this.db.prepare(`
            SELECT * FROM articles 
            ORDER BY write_date DESC 
            LIMIT ?
        `);
        return stmt.all(count).map(this.rowToArticle);
    }

    getAllArticles() {
        const stmt = this.db.prepare('SELECT * FROM articles ORDER BY write_date DESC');
        return stmt.all().map(this.rowToArticle);
    }

    getLastUpdate() {
        const stmt = this.db.prepare('SELECT MAX(fetched_at) as last_update FROM articles');
        const result = stmt.get();
        return result.last_update;
    }

    // 更新文章翻译
    updateArticleTranslation(articleId, translation) {
        const stmt = this.db.prepare(`
            UPDATE articles 
            SET subject_translated = ?, 
                content_translated = ?, 
                content_html_translated = ?,
                is_ai_translated = ?,
                translated_at = ?
            WHERE article_id = ?
        `);

        try {
            stmt.run(
                translation.subjectTranslated,
                translation.contentTranslated,
                translation.contentHtmlTranslated || null,
                translation.isAiTranslated !== undefined ? translation.isAiTranslated : 1,
                translation.translatedAt || new Date().toISOString(),
                articleId
            );
            return true;
        } catch (error) {
            logger.error('SQLite', `更新文章翻译失败: ${error.message}`);
            return false;
        }
    }

    // 获取单篇文章
    getArticle(articleId) {
        const stmt = this.db.prepare('SELECT * FROM articles WHERE article_id = ?');
        const row = stmt.get(articleId);
        return row ? this.rowToArticle(row) : null;
    }

    // 获取未翻译的文章
    getUntranslatedArticles(limit = 10) {
        const stmt = this.db.prepare(`
            SELECT * FROM articles 
            WHERE subject_translated IS NULL 
            ORDER BY write_date DESC 
            LIMIT ?
        `);
        return stmt.all(limit).map(this.rowToArticle);
    }

    // 获取已翻译的文章数量
    getTranslatedCount() {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM articles WHERE subject_translated IS NOT NULL');
        return stmt.get().count;
    }

    // 删除文章
    deleteArticle(articleId) {
        const stmt = this.db.prepare('DELETE FROM articles WHERE article_id = ?');
        try {
            const result = stmt.run(articleId);
            return result.changes > 0;
        } catch (error) {
            logger.error('SQLite', `删除文章失败: ${error.message}`);
            return false;
        }
    }

    // 删除文章翻译
    deleteArticleTranslation(articleId) {
        const stmt = this.db.prepare(`
            UPDATE articles 
            SET subject_translated = NULL, 
                content_translated = NULL, 
                translated_at = NULL
            WHERE article_id = ?
        `);
        try {
            const result = stmt.run(articleId);
            return result.changes > 0;
        } catch (error) {
            logger.error('SQLite', `删除文章翻译失败: ${error.message}`);
            return false;
        }
    }

    // 将数据库行转换为文章对象
    rowToArticle(row) {
        return {
            articleId: row.article_id,
            subject: row.subject,
            content: row.content,
            contentHtml: row.content_html,
            textContent: row.text_content,
            writeDate: row.write_date,
            writeDateFormatted: row.write_date_formatted,
            subjectTranslated: row.subject_translated,
            contentTranslated: row.content_translated,
            contentHtmlTranslated: row.content_html_translated,
            isAiTranslated: row.is_ai_translated === 1,
            translatedAt: row.translated_at,
            writer: {
                nick: row.author_nick,
                image: row.author_image,
                memberKey: row.author_member_key,
                memberLevel: row.author_member_level,
                memberLevelName: row.author_member_level_name
            },
            menu: {
                id: row.menu_id,
                name: row.menu_name
            },
            readCount: row.read_count,
            commentCount: row.comment_count,
            likeCount: row.like_count,
            source: row.source || 'naver',
            fetchedAt: row.fetched_at
        };
    }

    // ==================== 主播相关方法 ====================
    
    addOrUpdateStreamer(streamerId, name, avatar, bjId) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO streamers (streamer_id, name, avatar, bj_id)
            VALUES (?, ?, ?, ?)
        `);
        
        try {
            stmt.run(streamerId, name, avatar, bjId);
            return true;
        } catch (error) {
            logger.error('SQLite', `添加/更新主播失败: ${error.message}`);
            return false;
        }
    }

    getAllStreamers() {
        const stmt = this.db.prepare('SELECT * FROM streamers');
        return stmt.all();
    }

    // ==================== 直播状态相关方法 ====================
    
    updateStreamStatus(streamerId, streamData) {
        const updateStmt = this.db.prepare(`
            INSERT OR REPLACE INTO stream_status (streamer_id, online, title, category, updated_at, broad_no, broad_start)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const getStmt = this.db.prepare('SELECT online FROM stream_status WHERE streamer_id = ?');
        
        try {
            const previous = getStmt.get(streamerId);
            const updatedAt = new Date().toISOString();
            
            updateStmt.run(
                streamerId,
                streamData.online ? 1 : 0,
                streamData.title,
                streamData.category,
                updatedAt,
                streamData.broadNo || null,
                streamData.broadStart || null
            );

            // 记录历史的条件：
            // 1. 从离线变为在线（开播）
            // 2. 从在线变为离线（下播）
            // 3. 首次检测到在线状态（previous 不存在且当前在线）
            const shouldRecordHistory = 
                (previous && (previous.online === 1) !== streamData.online) || // 状态变化
                (!previous && streamData.online); // 首次检测到在线

            if (shouldRecordHistory) {
                this.addStreamHistory({
                    streamerId,
                    name: streamData.name,
                    action: streamData.online ? 'start' : 'end',
                    title: streamData.title,
                    category: streamData.category,
                    timestamp: updatedAt,
                    broadNo: streamData.broadNo || null
                });
            }

            return true;
        } catch (error) {
            logger.error('SQLite', `更新直播状态失败: ${error.message}`);
            return false;
        }
    }

    getStreamStatus(streamerId) {
        const stmt = this.db.prepare('SELECT * FROM stream_status WHERE streamer_id = ?');
        const row = stmt.get(streamerId);
        if (!row) return null;
        
        return {
            online: row.online === 1,
            title: row.title,
            category: row.category,
            updatedAt: row.updated_at,
            broadNo: row.broad_no,
            broadStart: row.broad_start
        };
    }

    getAllStreamStatus() {
        const stmt = this.db.prepare('SELECT * FROM stream_status');
        const rows = stmt.all();
        
        const result = {};
        for (const row of rows) {
            result[row.streamer_id] = {
                online: row.online === 1,
                title: row.title,
                category: row.category,
                updatedAt: row.updated_at,
                broadNo: row.broad_no,
                broadStart: row.broad_start
            };
        }
        return result;
    }

    getLastStreamUpdate() {
        const stmt = this.db.prepare('SELECT MAX(updated_at) as last_update FROM stream_status');
        const result = stmt.get();
        return result.last_update;
    }

    // ==================== 直播历史相关方法 ====================
    
    addStreamHistory(record) {
        // 验证必需字段
        if (!record.name) {
            logger.error('SQLite', `添加直播历史失败: name 字段为空 (streamerId: ${record.streamerId})`);
            return false;
        }

        const stmt = this.db.prepare(`
            INSERT INTO stream_history (streamer_id, name, action, title, category, timestamp, metadata, broad_no)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        try {
            stmt.run(
                record.streamerId,
                record.name,
                record.action,
                record.title || '',
                record.category || '',
                record.timestamp,
                record.metadata || null,
                record.broadNo || null
            );
            
            // 清理旧记录，只保留最近 1000 条
            this.cleanupOldHistory();
            return true;
        } catch (error) {
            logger.error('SQLite', `添加直播历史失败: ${error.message}`);
            return false;
        }
    }

    getStreamHistory(limit = 50) {
        const stmt = this.db.prepare(`
            SELECT * FROM stream_history 
            ORDER BY timestamp DESC 
            LIMIT ?
        `);
        return stmt.all(limit);
    }

    getStreamerHistory(streamerId, limit = 20) {
        const stmt = this.db.prepare(`
            SELECT * FROM stream_history 
            WHERE streamer_id = ?
            ORDER BY timestamp DESC 
            LIMIT ?
        `);
        return stmt.all(streamerId, limit);
    }

    cleanupOldHistory() {
        const stmt = this.db.prepare(`
            DELETE FROM stream_history 
            WHERE id NOT IN (
                SELECT id FROM stream_history 
                ORDER BY timestamp DESC 
                LIMIT 1000
            )
        `);
        stmt.run();
    }
}

export default SQLiteDatabase;
