import dotenv from 'dotenv';
import axios from 'axios';
import Database from '../src/database/sqlite.js';
import logger from '../src/utils/logger.js';

dotenv.config();

const CAFE_ID = process.env.CAFE_ID || '27842958';
const MENU_ID = process.env.MENU_ID || '345';
const REQUEST_DELAY = 2000;

const db = new Database();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchArticleList(page) {
  const url = `https://apis.naver.com/cafe-web/cafe-boardlist-api/v1/cafes/${CAFE_ID}/menus/${MENU_ID}/articles`;
  
  try {
    const response = await axios.get(url, {
      params: {
        page,
        pageSize: 15,
        sortBy: 'TIME',
        viewType: 'L'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': `https://cafe.naver.com/${CAFE_ID}`
      }
    });

    return response.data;
  } catch (error) {
    logger.error(`获取第 ${page} 页文章列表失败:`, error.message);
    return null;
  }
}

async function fetchArticleDetail(articleId) {
  const url = `https://apis.naver.com/cafe-web/cafe-articleapi/v2/cafes/${CAFE_ID}/articles/${articleId}`;
  
  try {
    const response = await axios.get(url, {
      params: {
        useCafeId: true,
        requestFrom: 'A'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': `https://cafe.naver.com/${CAFE_ID}/${articleId}`
      }
    });

    return response.data.result;
  } catch (error) {
    logger.error(`获取文章 ${articleId} 详情失败:`, error.message);
    return null;
  }
}

async function saveArticle(article) {
  try {
    const existingArticle = db.getArticle(article.articleId);
    
    if (existingArticle) {
      logger.info(`文章 ${article.articleId} 已存在，跳过`);
      return false;
    }

    db.saveArticle({
      articleId: article.articleId,
      subject: article.subject,
      content: article.content,
      writer: JSON.stringify({
        id: article.writer.id,
        nick: article.writer.nick,
        image: article.writer.image?.url || article.writer.imageUrl
      }),
      writeDate: article.writeDate,
      readCount: article.readCount,
      commentCount: article.commentCount,
      likeItCount: article.likeItCount
    });

    logger.info(`保存文章 ${article.articleId}: ${article.subject}`);
    return true;
  } catch (error) {
    logger.error(`保存文章 ${article.articleId} 失败:`, error.message);
    return false;
  }
}

async function main() {
  logger.info('开始爬取所有文章...');
  logger.info(`咖啡厅ID: ${CAFE_ID}, 菜单ID: ${MENU_ID}`);
  
  let currentPage = 1;
  let totalArticles = 0;
  let savedArticles = 0;
  let skippedArticles = 0;
  let isLastPage = false;

  while (!isLastPage) {
    logger.info(`正在爬取第 ${currentPage} 页...`);
    
    const listData = await fetchArticleList(currentPage);
    
    if (!listData || !listData.result) {
      logger.error(`第 ${currentPage} 页数据获取失败，停止爬取`);
      break;
    }

    const { articles, pageInfo } = listData.result;
    
    if (!articles || articles.length === 0) {
      logger.info('没有更多文章了');
      break;
    }

    logger.info(`第 ${currentPage} 页共 ${articles.length} 篇文章`);
    
    for (const article of articles) {
      totalArticles++;
      
      logger.info(`[${totalArticles}] 正在获取文章详情: ${article.articleId}`);
      
      const detail = await fetchArticleDetail(article.articleId);
      
      if (detail) {
        const saved = await saveArticle(detail);
        if (saved) {
          savedArticles++;
        } else {
          skippedArticles++;
        }
      }
      
      await delay(REQUEST_DELAY);
    }

    if (pageInfo.lastNavigationPageNumber === currentPage) {
      logger.info(`已到达最后一页 (${currentPage})`);
      isLastPage = true;
    } else {
      currentPage++;
      logger.info(`等待 ${REQUEST_DELAY}ms 后继续下一页...`);
      await delay(REQUEST_DELAY);
    }
  }

  logger.info('='.repeat(60));
  logger.info('爬取完成！');
  logger.info(`总共处理: ${totalArticles} 篇文章`);
  logger.info(`新增保存: ${savedArticles} 篇`);
  logger.info(`已存在跳过: ${skippedArticles} 篇`);
  logger.info('='.repeat(60));
}

main().catch(error => {
  logger.error('脚本执行失败:', error);
  process.exit(1);
});
