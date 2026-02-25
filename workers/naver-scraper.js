// Naver Cafe Scraper for Cloudflare Workers
export class NaverCafeScraper {
  constructor(env) {
    this.env = env;
    
    // Streamer avatars mapping
    this.ISEDOL_AVATARS = {
      '고세구': 'https://stimg.sooplive.co.kr/LOGO/go/gosegu2/m/gosegu2.webp',
      '비챤': 'https://stimg.sooplive.co.kr/LOGO/vi/viichan6/m/viichan6.webp',
      '아이네': 'https://stimg.sooplive.co.kr/LOGO/in/inehine/m/inehine.webp',
      '릴파 LILPA': 'https://stimg.sooplive.co.kr/LOGO/li/lilpa0309/m/lilpa0309.webp',
      '릴파': 'https://stimg.sooplive.co.kr/LOGO/li/lilpa0309/m/lilpa0309.webp',
      '주르르': 'https://stimg.sooplive.co.kr/LOGO/co/cotton1217/m/cotton1217.webp',
      '징버거': 'https://stimg.sooplive.co.kr/LOGO/ji/jingburger1/m/jingburger1.webp'
    };
    
    this.DEFAULT_AVATAR = 'https://ssl.pstatic.net/static/cafe/cafe_pc/default/cafe_profile_70.png';
  }
  
  // 从数据库读取配置
  async getConfig() {
    try {
      const { results } = await this.env.DB.prepare(`
        SELECT key, value FROM settings WHERE key IN ('CAFE_ID', 'MENU_ID')
      `).all();
      
      const config = {};
      results.forEach(row => {
        config[row.key] = row.value;
      });
      
      return {
        cafeId: config.CAFE_ID || '27842958',
        menuId: config.MENU_ID || '345'
      };
    } catch (error) {
      console.error('Failed to load config:', error);
      return {
        cafeId: '27842958',
        menuId: '345'
      };
    }
  }

  async fetchArticleList(cafeId, menuId, page = 1) {
    const url = `https://apis.naver.com/cafe-web/cafe-boardlist-api/v1/cafes/${cafeId}/menus/${menuId}/articles?page=${page}&pageSize=15&sortBy=TIME&viewType=L`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'ko-KR,ko;q=0.9',
          'Referer': 'https://cafe.naver.com/steamindiegame',
          'Origin': 'https://cafe.naver.com'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.result?.articleList || [];
    } catch (error) {
      console.error('Failed to fetch article list:', error);
      return [];
    }
  }

  async fetchArticleDetail(cafeId, articleId) {
    const url = `https://article.cafe.naver.com/gw/v4/cafes/${cafeId}/articles/${articleId}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Referer': `https://cafe.naver.com/steamindiegame/${articleId}`
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.result?.article || null;
    } catch (error) {
      console.warn(`Failed to fetch article ${articleId} detail:`, error);
      return null;
    }
  }

  extractTextFromHtml(html) {
    if (!html) return '';
    
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async scrape() {
    console.log('Starting Naver Cafe scraper...');
    
    const config = await this.getConfig();
    const cafeId = config.cafeId;
    const menuId = config.menuId;

    const articleList = await this.fetchArticleList(cafeId, menuId, 1);
    
    if (articleList.length === 0) {
      console.log('No articles found');
      return { newCount: 0, source: 'naver' };
    }

    console.log(`Found ${articleList.length} articles`);

    let newCount = 0;
    
    for (const item of articleList) {
      if (item.type !== 'ARTICLE') continue;

      const articleItem = item.item;
      const articleId = articleItem.articleId;

      // Check if article already exists
      const { results: existing } = await this.env.DB.prepare(
        'SELECT article_id FROM articles WHERE article_id = ?'
      ).bind(articleId).all();

      if (existing.length > 0) {
        continue;
      }

      console.log(`Processing article ${articleId}...`);

      // Get article detail for full content
      const articleDetail = await this.fetchArticleDetail(cafeId, articleId);
      
      let contentHtml = '';
      let content = '';
      
      if (articleDetail && articleDetail.contentHtml) {
        contentHtml = articleDetail.contentHtml;
        content = this.extractTextFromHtml(contentHtml);
      } else {
        content = articleItem.summary || '';
        contentHtml = content ? `<div class="article-content">${content.replace(/\n/g, '<br>')}</div>` : '';
      }

      const writerInfo = articleItem.writerInfo || {};
      const writerNick = writerInfo.nickName || 'Unknown';
      const writerImage = this.ISEDOL_AVATARS[writerNick] || this.DEFAULT_AVATAR;

      // Insert article into D1
      await this.env.DB.prepare(`
        INSERT INTO articles (
          article_id, subject, content, content_html, text_content,
          write_date, write_date_formatted, writer_json, menu_json,
          read_count, comment_count, like_count, source, fetched_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        articleId,
        articleItem.subject,
        content,
        contentHtml,
        articleItem.summary || '',
        articleItem.writeDateTimestamp || Date.now(),
        new Date(articleItem.writeDateTimestamp || Date.now()).toLocaleString('zh-CN'),
        JSON.stringify({
          nick: writerNick,
          image: writerImage,
          memberKey: writerInfo.memberKey || '',
          memberLevel: writerInfo.memberLevel || 0,
          memberLevelName: writerInfo.memberLevelName || ''
        }),
        JSON.stringify({
          id: articleItem.menuId,
          name: articleItem.menuName || ''
        }),
        articleItem.readCount || 0,
        articleItem.commentCount || 0,
        articleItem.likeCount || 0,
        'naver',
        new Date().toISOString()
      ).run();

      newCount++;
      console.log(`New article: [${writerNick}] ${articleItem.subject}`);

      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Naver scraper completed: ${newCount} new articles`);
    return { newCount, source: 'naver' };
  }
}
