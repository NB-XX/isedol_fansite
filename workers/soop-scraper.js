// SOOP Scraper for Cloudflare Workers
export class SoopScraper {
  constructor(env) {
    this.env = env;
    this.baseUrl = 'https://chapi.sooplive.co.kr/api';
    
    // Streamer configuration
    this.streamers = [
      { userId: 'gosegu2', name: '고세구', avatar: 'https://stimg.sooplive.co.kr/LOGO/go/gosegu2/m/gosegu2.webp' },
      { userId: 'inehine', name: '아이네', avatar: 'https://stimg.sooplive.co.kr/LOGO/in/inehine/m/inehine.webp' },
      { userId: 'jingburger1', name: '징버거', avatar: 'https://stimg.sooplive.co.kr/LOGO/ji/jingburger1/m/jingburger1.webp' },
      { userId: 'cotton1217', name: '주르르', avatar: 'https://stimg.sooplive.co.kr/LOGO/co/cotton1217/m/cotton1217.webp' },
      { userId: 'lilpa0309', name: '릴파', avatar: 'https://stimg.sooplive.co.kr/LOGO/li/lilpa0309/m/lilpa0309.webp' },
      { userId: 'viichan6', name: '비챤', avatar: 'https://stimg.sooplive.co.kr/LOGO/vi/viichan6/m/viichan6.webp' }
    ];
  }

  async fetchBoardPosts(userId, page = 1) {
    try {
      const url = `${this.baseUrl}/${userId}/board/?per_page=20&page=${page}&field=title,contents,user_nick,user_id,hashtags&type=post&order_by=reg_date`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${userId} board:`, error);
      return null;
    }
  }

  parseRegDate(regDate) {
    // "2026-01-26 19:44:29" -> timestamp (KST)
    const date = new Date(regDate.replace(' ', 'T') + '+09:00');
    return date.getTime();
  }

  async scrapeStreamerBoard(streamer) {
    try {
      console.log(`Scraping ${streamer.name} board...`);
      
      const data = await this.fetchBoardPosts(streamer.userId);
      if (!data || !data.data) {
        console.log(`${streamer.name} returned no data`);
        return 0;
      }

      let newCount = 0;
      const posts = [...(data.notice_data || []), ...data.data];

      for (const post of posts) {
        // Check if article already exists
        const { results: existing } = await this.env.DB.prepare(
          'SELECT article_id FROM articles WHERE article_id = ?'
        ).bind(post.title_no).all();

        if (existing.length > 0) {
          continue;
        }

        // Insert article into D1
        await this.env.DB.prepare(`
          INSERT INTO articles (
            article_id, subject, content, content_html, text_content,
            write_date, write_date_formatted, writer_json, menu_json,
            read_count, comment_count, like_count, source, fetched_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          post.title_no,
          post.title_name,
          post.content.text_content || '',
          post.content.content || '',
          post.content.text_content || '',
          this.parseRegDate(post.reg_date),
          post.reg_date,
          JSON.stringify({
            nick: post.user_nick,
            image: post.profile_image,
            memberKey: post.user_id,
            memberLevel: 0,
            memberLevelName: 'SOOP公告栏'
          }),
          JSON.stringify({
            id: post.bbs_no,
            name: post.display?.bbs_name || 'SOOP公告栏'
          }),
          post.count.read_cnt,
          post.count.comment_cnt,
          post.count.like_cnt,
          'soop',
          new Date().toISOString()
        ).run();

        newCount++;
        console.log(`New article: ${post.title_name}`);
      }

      console.log(`${streamer.name} scraping completed: ${newCount} new articles`);
      return newCount;
    } catch (error) {
      console.error(`Failed to scrape ${streamer.name} board:`, error);
      return 0;
    }
  }

  async scrape() {
    console.log('Starting SOOP scraper...');
    
    let totalNew = 0;
    for (const streamer of this.streamers) {
      const count = await this.scrapeStreamerBoard(streamer);
      totalNew += count;
      
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`SOOP scraper completed: ${totalNew} new articles`);
    return { newCount: totalNew, source: 'soop' };
  }
}
