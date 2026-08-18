// Cloudflare Workers API 入口
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS 处理
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    // 路由处理
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env, ctx);
    }

    return new Response('Not Found', { status: 404 });
  },

  // 定时任务（爬虫）
  async scheduled(event, env, ctx) {
    console.log('Cron triggered at', new Date(event.scheduledTime));

    try {
      const { SoopScraper } = await import('./soop-scraper.js');
      const soopScraper = new SoopScraper(env);

      // Workers Cron 仅负责 SOOP 公告板抓取。
      // Naver Cafe 抓取由 VPS 负责（需要代理绕过地域限制 + 自动翻译），
      // VPS 的 CafeScraper 自带 10 分钟定时器，无需在此重复触发。
      console.log('Starting SOOP scraper...');
      const soopResult = await soopScraper.scrape();
      console.log('SOOP scraper completed:', soopResult);

      return new Response(JSON.stringify({
        success: true,
        results: {
          soop: soopResult
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Scraper failed:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

// 从 D1 读取配置的辅助函数
async function getConfig(env, keys) {
  try {
    const placeholders = keys.map(() => '?').join(',');
    const { results } = await env.DB.prepare(`
      SELECT key, value FROM settings WHERE key IN (${placeholders})
    `).bind(...keys).all();
    
    const config = {};
    results.forEach(row => {
      config[row.key] = row.value;
    });
    
    return config;
  } catch (error) {
    console.error('Failed to load config from D1:', error);
    return {};
  }
}

// CORS 处理
function handleCORS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
}

// API 路由处理
async function handleAPI(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 添加 CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
    // 健康检查
    if (path === '/api/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString()
      }), { headers: corsHeaders });
    }

    // 获取文章列表
    if (path === '/api/articles' && request.method === 'GET') {
      return getArticles(request, env, corsHeaders);
    }

    // 获取单篇文章
    if (path.match(/^\/api\/articles\/\d+$/) && request.method === 'GET') {
      const id = path.split('/').pop();
      return getArticle(id, env, corsHeaders);
    }

    // 获取主播信息
    if (path === '/api/streamers' && request.method === 'GET') {
      return getStreamers(env, corsHeaders);
    }

    // 翻译文章
    if (path.match(/^\/api\/articles\/\d+\/translate$/) && request.method === 'POST') {
      const id = path.split('/')[3];
      return translateArticle(id, request, env, corsHeaders);
    }

    // 人工翻译文章
    if (path.match(/^\/api\/articles\/\d+\/manual-translate$/) && request.method === 'POST') {
      const id = path.split('/')[3];
      return manualTranslateArticle(id, request, env, corsHeaders);
    }

    // 翻译 JSON（用于 AI 总结等）
    if (path === '/api/translate-json' && request.method === 'POST') {
      return translateJson(request, env, corsHeaders);
    }

    // 删除文章翻译
    if (path.match(/^\/api\/admin\/articles\/\d+\/translation$/) && request.method === 'DELETE') {
      const id = path.split('/')[4];
      return deleteArticleTranslation(id, request, env, corsHeaders);
    }

    // 搜索文章
    if (path === '/api/articles/search' && request.method === 'GET') {
      return searchArticles(request, env, corsHeaders);
    }

    // 图片代理
    if (path.startsWith('/api/proxy/image')) {
      return proxyImage(request, corsHeaders);
    }

    // 获取主播历史记录
    if (path.match(/^\/api\/streamers\/[^\/]+\/history$/) && request.method === 'GET') {
      const streamerId = path.split('/')[3];
      return getStreamerHistory(streamerId, env, corsHeaders, request);
    }

    // 获取直播总结
    if (path.match(/^\/api\/broad-summary\/\d+$/) && request.method === 'GET') {
      const broadNo = path.split('/').pop();
      return getBroadSummary(broadNo, request, env, corsHeaders);
    }

    // 获取公共设置
    if (path === '/api/settings/public' && request.method === 'GET') {
      return getPublicSettings(env, corsHeaders);
    }

    // 管理员认证
    if (path === '/api/settings/auth' && request.method === 'POST') {
      return adminAuth(request, env, corsHeaders);
    }

    // 管理员设置配置
    if (path === '/api/settings/config' && request.method === 'GET') {
      if (!await verifyAdminToken(request, env)) {
        return new Response(JSON.stringify({ error: '未授权' }), {
          status: 401,
          headers: corsHeaders
        });
      }
      
      // 从 D1 读取所有配置
      try {
        const { results } = await env.DB.prepare(`
          SELECT key, value FROM settings
        `).all();
        
        const config = {};
        results.forEach(row => {
          config[row.key] = row.value;
        });
        
        return new Response(JSON.stringify({ config }), { headers: corsHeaders });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // 保存配置
    if (path === '/api/settings/config' && request.method === 'POST') {
      if (!await verifyAdminToken(request, env)) {
        return new Response(JSON.stringify({ error: '未授权' }), {
          status: 401,
          headers: corsHeaders
        });
      }
      
      try {
        const { config } = await request.json();
        
        // 保存每个配置项到 D1
        for (const [key, value] of Object.entries(config)) {
          await env.DB.prepare(`
            INSERT OR REPLACE INTO settings (key, value, updated_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP)
          `).bind(key, value).run();
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          message: '配置已保存'
        }), { headers: corsHeaders });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // 重启服务（通知 VPS 重新加载配置）
    if (path === '/api/admin/restart' && request.method === 'POST') {
      if (!await verifyAdminToken(request, env)) {
        return new Response(JSON.stringify({ error: '未授权' }), {
          status: 401,
          headers: corsHeaders
        });
      }
      
      try {
        // 尝试通知 VPS 重新加载配置
        let vpsRestarted = false;
        
        // 从 D1 读取 VPS 配置
        const config = await getConfig(env, ['VPS_API_URL', 'VPS_API_KEY']);
        
        if (config.VPS_API_URL && config.VPS_API_KEY) {
          try {
            const response = await fetch(`${config.VPS_API_URL}/reload-config`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${config.VPS_API_KEY}`,
                'Content-Type': 'application/json'
              },
              timeout: 5000 // 5秒超时
            });
            
            if (response.ok) {
              vpsRestarted = true;
            }
          } catch (vpsError) {
            console.error('VPS reload failed:', vpsError);
          }
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          message: '配置已保存',
          vpsRestarted,
          needManualRestart: !vpsRestarted,
          note: vpsRestarted 
            ? 'VPS 服务已自动重新加载配置' 
            : 'Workers 配置将在下次请求时生效。VPS 需要手动重启以应用新配置。'
        }), { headers: corsHeaders });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // 管理员统计
    if (path === '/api/admin/stats' && request.method === 'GET') {
      return getAdminStats(request, env, corsHeaders);
    }

    // 管理员文章列表
    if (path === '/api/admin/articles' && request.method === 'GET') {
      return getAdminArticles(request, env, corsHeaders);
    }

    // 删除文章
    if (path.match(/^\/api\/admin\/articles\/\d+$/) && request.method === 'DELETE') {
      const id = path.split('/')[4];
      return deleteArticle(request, env, corsHeaders, id);
    }

    // 批量删除文章
    if (path === '/api/admin/articles/batch-delete' && request.method === 'POST') {
      return batchDeleteArticles(request, env, corsHeaders);
    }

    // 批量翻译文章
    if (path === '/api/admin/articles/batch-translate' && request.method === 'POST') {
      return batchTranslateArticles(request, env, corsHeaders, ctx);
    }

    // 手动触发爬虫
    if (path === '/api/admin/trigger-scraper' && request.method === 'POST') {
      if (!await verifyAdminToken(request, env)) {
        return new Response(JSON.stringify({ error: '未授权' }), {
          status: 401,
          headers: corsHeaders
        });
      }
      return triggerScraper(env, corsHeaders);
    }

    // 其他管理员端点返回未实现
    if (path.startsWith('/api/admin/') || path.startsWith('/api/settings/')) {
      if (!await verifyAdminToken(request, env)) {
        return new Response(JSON.stringify({ error: '未授权' }), {
          status: 401,
          headers: corsHeaders
        });
      }
      return new Response(JSON.stringify({ error: '功能未实现' }), {
        status: 501,
        headers: corsHeaders
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// 获取文章列表
async function getArticles(request, env, headers) {
  const url = new URL(request.url);
  // 限制单页大小，防止 ?limit=超大值 拉取整表 / 撑爆 Worker
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 100);
  const cursor = url.searchParams.get('cursor');

  // 复合游标 (write_date|article_id)：单一 write_date 作游标时，若多篇文章
  // 时间戳相同（SOOP 仅到秒），超出本页的同时间戳文章会被“本页 LIMIT 截断 +
  // 下页 < 排除”永久跳过。复合游标用严格字典序避免丢数据。
  let query;
  const params = [];
  if (cursor) {
    const [wd, aid] = cursor.split('|');
    query = `
      SELECT * FROM articles
      WHERE (write_date < ?) OR (write_date = ? AND article_id < ?)
      ORDER BY write_date DESC, article_id DESC
      LIMIT ?
    `;
    params.push(parseInt(wd), parseInt(wd), parseInt(aid), limit);
  } else {
    query = `
      SELECT * FROM articles
      ORDER BY write_date DESC, article_id DESC
      LIMIT ?
    `;
    params.push(limit);
  }

  const { results } = await env.DB.prepare(query).bind(...params).all();

  // 获取最新的 fetched_at 时间作为 lastUpdate
  const { results: lastUpdateResults } = await env.DB.prepare(`
    SELECT MAX(fetched_at) as last_update FROM articles
  `).all();
  
  const lastUpdate = lastUpdateResults[0]?.last_update || new Date().toISOString();

  // 转换数据格式
  const articles = results.map(row => ({
    articleId: row.article_id,
    subject: row.subject,
    subjectTranslated: row.subject_translated,
    content: row.content,
    contentTranslated: row.content_translated,
    contentHtml: row.content_html,
    contentHtmlTranslated: row.content_html_translated,
    writeDate: row.write_date,
    writeDateFormatted: row.write_date_formatted,
    writer: JSON.parse(row.writer_json || '{}'),
    menu: JSON.parse(row.menu_json || '{}'),
    readCount: row.read_count,
    commentCount: row.comment_count,
    likeCount: row.like_count,
    source: row.source,
    isAiTranslated: row.is_ai_translated === 1,
    translatedAt: row.translated_at,
    fetchedAt: row.fetched_at
  }));

  const hasMore = results.length === limit;
  // 使用复合游标 write_date|article_id，避免同时间戳文章在翻页时丢失
  const lastArticle = articles[articles.length - 1];
  const nextCursor = hasMore && lastArticle
    ? `${lastArticle.writeDate}|${lastArticle.articleId}`
    : null;

  return new Response(JSON.stringify({
    articles,
    hasMore,
    nextCursor,
    lastUpdate: lastUpdate
  }), { headers });
}

// 代理请求到 VPS
async function proxyToVPS(request, env, headers) {
  const url = new URL(request.url);
  
  // 从 D1 读取 VPS 配置
  const config = await getConfig(env, ['VPS_API_URL', 'VPS_API_KEY']);
  const vpsUrl = `${config.VPS_API_URL}${url.pathname}${url.search}`;

  try {
    // 获取请求体（如果有）
    let body = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text();
    }

    // 转发请求到 VPS
    const response = await fetch(vpsUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: body
    });

    // 获取响应
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        ...headers,
        'Content-Type': response.headers.get('Content-Type') || 'application/json'
      }
    });
  } catch (error) {
    console.error('Proxy to VPS error:', error);
    return new Response(JSON.stringify({ 
      error: 'VPS 服务暂时不可用',
      details: error.message 
    }), {
      status: 503,
      headers
    });
  }
}

// 图片代理
async function proxyImage(request, headers) {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get('url');

  if (!imageUrl) {
    return new Response('Missing image URL', { status: 400, headers });
  }

  // SSRF 防护：仅允许 Naver / SOOP 图片域名，拒绝任意 URL 代理
  let parsed;
  try {
    parsed = new URL(imageUrl);
  } catch {
    return new Response('Invalid image URL', { status: 400, headers });
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return new Response('Unsupported protocol', { status: 400, headers });
  }
  const host = parsed.hostname.toLowerCase();
  const allowedSuffixes = ['pstatic.net', 'sooplive.co.kr', 'sooplive.com', 'naver.com'];
  const isAllowed = host === 'localhost'
    ? false
    : allowedSuffixes.some(s => host === s || host.endsWith('.' + s));
  if (!isAllowed) {
    return new Response('URL not allowed', { status: 403, headers });
  }

  try {
    // 根据图片 URL 设置不同的 Referer
    let referer = 'https://cafe.naver.com/';
    if (imageUrl.includes('pstatic.net')) {
      referer = 'https://cafe.naver.com/';
    } else if (imageUrl.includes('sooplive.co.kr')) {
      referer = 'https://www.sooplive.co.kr/';
    }

    const response = await fetch(imageUrl, {
      headers: {
        'Referer': referer,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      }
    });

    if (!response.ok) {
      console.error(`Image proxy failed: ${response.status} for ${imageUrl}`);
      return new Response('Image not found', { status: 404, headers });
    }

    const imageHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    };

    return new Response(response.body, { headers: imageHeaders });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new Response('Failed to fetch image', { status: 500, headers });
  }
}

// 获取单篇文章
async function getArticle(id, env, headers) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM articles WHERE article_id = ?'
  ).bind(parseInt(id)).all();

  if (results.length === 0) {
    return new Response(JSON.stringify({ error: '文章不存在' }), {
      status: 404,
      headers
    });
  }

  const row = results[0];
  const article = {
    articleId: row.article_id,
    subject: row.subject,
    subjectTranslated: row.subject_translated,
    content: row.content,
    contentTranslated: row.content_translated,
    contentHtml: row.content_html,
    contentHtmlTranslated: row.content_html_translated,
    writeDate: row.write_date,
    writeDateFormatted: row.write_date_formatted,
    writer: JSON.parse(row.writer_json || '{}'),
    menu: JSON.parse(row.menu_json || '{}'),
    readCount: row.read_count,
    commentCount: row.comment_count,
    likeCount: row.like_count,
    source: row.source,
    isAiTranslated: row.is_ai_translated === 1,
    translatedAt: row.translated_at,
    fetchedAt: row.fetched_at
  };

  return new Response(JSON.stringify({ article }), { headers });
}

// 获取主播信息
async function getStreamers(env, headers) {
  // 从 D1 获取主播状态
  const { results: statusResults } = await env.DB.prepare(
    'SELECT * FROM stream_status'
  ).all();

  const { results: streamerResults } = await env.DB.prepare(
    'SELECT * FROM streamers'
  ).all();

  // 不再获取历史记录，只返回主播状态
  const streamers = streamerResults.map(streamer => {
    const status = statusResults.find(s => s.streamer_id === streamer.streamer_id) || {};
    
    return {
      id: streamer.streamer_id,
      name: streamer.name,
      avatar: streamer.avatar,
      bjId: streamer.bj_id,
      isLive: status.online === 1,
      streamUrl: status.online === 1 
        ? `https://play.sooplive.co.kr/${streamer.bj_id}/embed`
        : null,
      streamTitle: status.title || '',
      streamCategory: status.category || '',
      broadNo: status.broad_no,
      broadStart: status.broad_start,
      updatedAt: status.updated_at
    };
  });

  return new Response(JSON.stringify({ streamers }), { headers });
}

// 获取主播历史记录
async function getStreamerHistory(streamerId, env, headers, request) {
  try {
    // 解析查询参数
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const beforeTimestamp = url.searchParams.get('before'); // 获取此时间戳之前的记录
    const afterTimestamp = url.searchParams.get('after');   // 获取此时间戳之后的记录
    
    // 获取总记录数
    const { results: countResults } = await env.DB.prepare(
      'SELECT COUNT(*) as total FROM stream_history WHERE streamer_id = ?'
    ).bind(streamerId).all();
    const totalRecords = countResults[0]?.total || 0;
    
    // 获取最早和最晚的记录时间
    const { results: timeRangeResults } = await env.DB.prepare(
      'SELECT MIN(timestamp) as earliest, MAX(timestamp) as latest FROM stream_history WHERE streamer_id = ?'
    ).bind(streamerId).all();
    const earliest = timeRangeResults[0]?.earliest || null;
    const latest = timeRangeResults[0]?.latest || null;
    
    // 构建查询
    let query = 'SELECT * FROM stream_history WHERE streamer_id = ?';
    const params = [streamerId];
    
    if (beforeTimestamp) {
      query += ' AND timestamp < ?';
      params.push(beforeTimestamp);
    }
    
    if (afterTimestamp) {
      query += ' AND timestamp > ?';
      params.push(afterTimestamp);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);
    
    // 执行查询
    const { results } = await env.DB.prepare(query).bind(...params).all();
    
    const history = results.map(row => ({
      action: row.action,
      title: row.title,
      category: row.category,
      broadNo: row.broad_no,
      timestamp: row.timestamp,
      metadata: {
        oldTitle: row.old_title,
        oldCategory: row.old_category
      }
    }));
    
    return new Response(JSON.stringify({
      streamerId,
      totalRecords,
      earliest,
      latest,
      limit,
      count: history.length,
      history
    }), { headers });
  } catch (error) {
    console.error('Get streamer history error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers
    });
  }
}

// 获取直播总结
async function getBroadSummary(broadNo, request, env, headers) {
  // 直接调用 SOOP 官方 AI 总结 API
  try {
    const response = await fetch(`https://soop-ai-api.sooplive.co.kr/v1.1/broad-summary/kr/${broadNo}`);

    if (!response.ok) {
      console.warn(`SOOP AI API 返回错误: ${response.status}`);
      return new Response(JSON.stringify({ error: '无法获取直播总结' }), {
        status: response.status,
        headers
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { headers });
  } catch (error) {
    console.error('获取直播总结失败:', error.message);
    return new Response(JSON.stringify({ error: '直播总结服务暂时不可用' }), {
      status: 503,
      headers
    });
  }
}

// 获取公共设置
async function getPublicSettings(env, headers) {
  try {
    // 定义允许公开访问的配置键
    const publicKeys = [
      'BACKGROUND_IMAGE',
      'BACKGROUND_BLUR',
      'MUSIC_PLAYLIST'
    ];
    
    const config = await getConfig(env, publicKeys);

    // 如果没有配置，返回空默认值
    if (Object.keys(config).length === 0) {
      config.BACKGROUND_IMAGE = '';
      config.BACKGROUND_BLUR = '0';
      config.MUSIC_PLAYLIST = '[]';
    }

    return new Response(JSON.stringify({ config }), { headers });
  } catch (error) {
    console.error('Get settings error:', error);
    // 返回空默认值
    const config = {
      BACKGROUND_IMAGE: '',
      BACKGROUND_BLUR: '0',
      MUSIC_PLAYLIST: '[]'
    };
    return new Response(JSON.stringify({ config }), { headers });
  }
}

// 管理员认证
async function adminAuth(request, env, headers) {
  try {
    const { password } = await request.json();
    
    // 从 D1 读取管理员密码
    const config = await getConfig(env, ['ADMIN_PASSWORD']);
    const adminPassword = config.ADMIN_PASSWORD;

    // 未配置管理员密码时拒绝认证，避免回退到默认凭据
    if (!adminPassword) {
      return new Response(JSON.stringify({
        success: false,
        error: '管理员密码未配置'
      }), { status: 401, headers });
    }

    if (password === adminPassword) {
      // 生成简单的 token（实际应该使用 JWT）
      const token = btoa(`admin:${Date.now()}:${password}`);
      
      return new Response(JSON.stringify({
        success: true,
        token: token
      }), { headers });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: '密码错误'
      }), { status: 401, headers });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: '请求格式错误' }), {
      status: 400,
      headers
    });
  }
}

// 验证管理员 token
async function verifyAdminToken(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = atob(token);
    const [user, timestamp, password] = decoded.split(':');
    
    // 从 D1 读取管理员密码
    const config = await getConfig(env, ['ADMIN_PASSWORD']);
    const adminPassword = config.ADMIN_PASSWORD;

    // 未配置管理员密码时拒绝认证，避免回退到默认凭据
    if (!adminPassword) {
      return false;
    }

    // 验证密码和时间戳（24小时有效）
    if (user === 'admin' && password === adminPassword) {
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      if (now - tokenTime < 24 * 60 * 60 * 1000) {
        return true;
      }
    }
  } catch (e) {
    return false;
  }
  
  return false;
}

// 获取管理员统计
async function getAdminStats(request, env, headers) {
  if (!await verifyAdminToken(request, env)) {
    return new Response(JSON.stringify({ error: '未授权' }), {
      status: 401,
      headers
    });
  }

  try {
    // 获取文章统计
    const { results: articleStats } = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN source = 'naver' THEN 1 ELSE 0 END) as naver_count,
        SUM(CASE WHEN source = 'soop' THEN 1 ELSE 0 END) as soop_count,
        SUM(CASE WHEN subject_translated IS NOT NULL THEN 1 ELSE 0 END) as translated_count
      FROM articles
    `).all();

    const stats = articleStats[0];
    const totalArticles = stats.total || 0;
    const translatedArticles = stats.translated_count || 0;
    const untranslatedArticles = totalArticles - translatedArticles;
    const translationProgress = totalArticles > 0 
      ? Math.round((translatedArticles / totalArticles) * 100) 
      : 0;

    // 获取作者统计
    const { results: authorResults } = await env.DB.prepare(`
      SELECT 
        json_extract(writer_json, '$.nick') as author,
        json_extract(writer_json, '$.image') as avatar,
        source,
        COUNT(*) as count
      FROM articles
      WHERE writer_json IS NOT NULL AND writer_json != ''
      GROUP BY author, source
    `).all();

    // 昵称映射表 - 将不同平台的昵称统一到同一个显示名称
    const nicknameMapping = {
      '고세구!': '고세구',
      '비찬_': '비챤',
      '비챤_': '비챤',
      '아이네♪': '아이네',
      '징버거☆': '징버거',
      '주르르_': '주르르',
      '릴파_': '릴파'
    };
    
    // 组织作者统计数据
    const authorStats = {};
    authorResults.forEach(row => {
      let author = row.author || 'Unknown';
      // 跳过 null 或空作者
      if (!author || author === 'null' || author === 'Unknown') {
        return;
      }
      
      // 应用昵称映射
      author = nicknameMapping[author] || author;
      
      if (!authorStats[author]) {
        authorStats[author] = {
          avatar: row.avatar || 'https://via.placeholder.com/100',
          naver: 0,
          soop: 0,
          total: 0
        };
      }
      if (row.source === 'naver') {
        authorStats[author].naver += row.count;
      } else if (row.source === 'soop') {
        authorStats[author].soop += row.count;
      }
      authorStats[author].total += row.count;
    });

    return new Response(JSON.stringify({
      totalArticles,
      translatedArticles,
      untranslatedArticles,
      translationProgress,
      authorStats
    }), { headers });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers
    });
  }
}

// 获取管理员文章列表
async function getAdminArticles(request, env, headers) {
  if (!await verifyAdminToken(request, env)) {
    return new Response(JSON.stringify({ error: '未授权' }), {
      status: 401,
      headers
    });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 100);
  const offset = (page - 1) * limit;

  try {
    // 获取文章列表
    const { results } = await env.DB.prepare(`
      SELECT * FROM articles 
      ORDER BY write_date DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();

    // 获取总数
    const { results: countResults } = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM articles
    `).all();

    const articles = results.map(row => {
      let writer = { nick: 'Unknown', image: '' };
      let menu = { id: '', name: '' };
      try {
        if (row.writer_json) {
          writer = JSON.parse(row.writer_json);
        }
        if (row.menu_json) {
          menu = JSON.parse(row.menu_json);
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
      
      return {
        articleId: row.article_id,
        subject: row.subject,
        subjectTranslated: row.subject_translated,
        content: row.content,
        contentTranslated: row.content_translated,
        contentHtml: row.content_html,
        contentHtmlTranslated: row.content_html_translated,
        writeDate: row.write_date,
        writeDateFormatted: row.write_date_formatted,
        writer: writer,
        menu: menu,
        readCount: row.read_count,
        commentCount: row.comment_count,
        likeCount: row.like_count,
        source: row.source,
        isTranslated: !!row.subject_translated,
        isAiTranslated: row.is_ai_translated === 1,
        translatedAt: row.translated_at,
        fetchedAt: row.fetched_at
      };
    });

    const total = countResults[0].total;
    const totalPages = Math.ceil(total / limit);

    return new Response(JSON.stringify({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers
    });
  }
}

// 删除文章
async function deleteArticle(request, env, headers, articleId) {
  if (!await verifyAdminToken(request, env)) {
    return new Response(JSON.stringify({ error: '未授权' }), {
      status: 401,
      headers
    });
  }

  try {
    await env.DB.prepare(`
      DELETE FROM articles WHERE article_id = ?
    `).bind(parseInt(articleId)).run();

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers
    });
  }
}

// 批量删除文章
async function batchDeleteArticles(request, env, headers) {
  if (!await verifyAdminToken(request, env)) {
    return new Response(JSON.stringify({ error: '未授权' }), {
      status: 401,
      headers
    });
  }

  try {
    const { ids } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: '无效的文章ID列表' }), {
        status: 400,
        headers
      });
    }

    // 批量删除
    const placeholders = ids.map(() => '?').join(',');
    await env.DB.prepare(`
      DELETE FROM articles WHERE article_id IN (${placeholders})
    `).bind(...ids.map(id => parseInt(id))).run();

    return new Response(JSON.stringify({ 
      success: true,
      deleted: ids.length 
    }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers
    });
  }
}

// 批量翻译文章
async function batchTranslateArticles(request, env, headers, ctx) {
  if (!await verifyAdminToken(request, env)) {
    return new Response(JSON.stringify({ error: '未授权' }), {
      status: 401,
      headers
    });
  }

  try {
    const { ids } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: '无效的文章ID列表' }), {
        status: 400,
        headers
      });
    }

    // 获取翻译配置
    const { results: configResults } = await env.DB.prepare(`
      SELECT key, value FROM settings 
      WHERE key IN ('TRANSLATION_ENABLED', 'TRANSLATION_API_URL', 'TRANSLATION_API_KEY', 
                    'TRANSLATION_MODEL', 'TRANSLATION_SYSTEM_PROMPT', 'TRANSLATION_TEMPERATURE',
                    'TRANSLATION_MAX_TOKENS', 'TRANSLATION_TIMEOUT')
    `).all();

    const config = {};
    configResults.forEach(row => {
      let value = row.value;
      // 移除可能的引号
      if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      config[row.key] = value;
    });

    // 检查翻译是否启用（归一化：接受 '1'/'1.0'/'true'/'yes'/'on'/数字>0）
    const isEnabled = ['1', '1.0', 'true', 'yes', 'on'].includes(
      String(config.TRANSLATION_ENABLED ?? '').trim().toLowerCase()
    ) || parseFloat(config.TRANSLATION_ENABLED) > 0;
    if (!isEnabled) {
      return new Response(JSON.stringify({ error: '翻译功能未启用' }), {
        status: 400,
        headers
      });
    }

    // 检查必需的配置
    if (!config.TRANSLATION_API_URL || !config.TRANSLATION_API_KEY) {
      return new Response(JSON.stringify({ error: '翻译配置不完整' }), {
        status: 400,
        headers
      });
    }

    // 获取需要翻译的文章（只翻译未翻译的）
    const placeholders = ids.map(() => '?').join(',');
    const { results: articles } = await env.DB.prepare(`
      SELECT article_id, subject, content 
      FROM articles 
      WHERE article_id IN (${placeholders}) 
      AND (subject_translated IS NULL OR subject_translated = '')
    `).bind(...ids.map(id => parseInt(id))).all();

    if (articles.length === 0) {
      return new Response(JSON.stringify({ 
        success: true,
        total: 0,
        message: '所有文章都已翻译'
      }), { headers });
    }

    // 异步翻译所有文章（不等待完成）
    // 注意：在Workers中，请求结束后异步操作会被取消
    // 所以我们需要使用waitUntil或者返回后让前端轮询
    const translationPromises = articles.map(async (article) => {
      try {
        const systemPrompt = config.TRANSLATION_SYSTEM_PROMPT || 
          '你是一个专业的韩中翻译，请将以下韩文内容翻译成中文。保持原文的语气和风格，确保翻译准确流畅。';
        
        const response = await fetch(config.TRANSLATION_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.TRANSLATION_API_KEY}`
          },
          body: JSON.stringify({
            model: config.TRANSLATION_MODEL || 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `标题：${article.subject}\n\n内容：${article.content}` }
            ],
            temperature: parseFloat(config.TRANSLATION_TEMPERATURE || '0.3'),
            max_tokens: parseInt(config.TRANSLATION_MAX_TOKENS || '2000')
          }),
          signal: AbortSignal.timeout(parseInt(config.TRANSLATION_TIMEOUT || '30000'))
        });

        if (!response.ok) {
          console.error(`翻译文章 ${article.article_id} 失败: ${response.status}`);
          return;
        }

        const data = await response.json();
        const translatedText = data.choices[0].message.content;
        
        // 解析翻译结果
        const titleMatch = translatedText.match(/标题[：:]\s*(.+?)(?:\n|$)/);
        const contentMatch = translatedText.match(/内容[：:]\s*(.+)/s);
        
        const subjectTranslated = titleMatch ? titleMatch[1].trim() : article.subject;
        const contentTranslated = contentMatch ? contentMatch[1].trim() : translatedText;

        // 更新数据库
        await env.DB.prepare(`
          UPDATE articles 
          SET subject_translated = ?,
              content_translated = ?,
              content_html_translated = ?,
              is_ai_translated = 1,
              translated_at = ?
          WHERE article_id = ?
        `).bind(
          subjectTranslated,
          contentTranslated,
          contentTranslated.replace(/\n/g, '<br>'),
          new Date().toISOString(),
          article.article_id
        ).run();

        console.log(`文章 ${article.article_id} 翻译完成`);
      } catch (error) {
        console.error(`翻译文章 ${article.article_id} 失败:`, error);
      }
    });

    // 用 ctx.waitUntil 让翻译在响应返回后继续完成，
    // 避免 Worker 返回响应后进行中的翻译 fetch 被掐断而静默丢失。
    const allDone = Promise.allSettled(translationPromises);
    if (ctx && typeof ctx.waitUntil === 'function') {
      ctx.waitUntil(allDone);
    } else {
      await allDone;
    }

    return new Response(JSON.stringify({
      success: true,
      total: articles.length,
      message: `正在后台翻译 ${articles.length} 篇文章`
    }), { headers });
  } catch (error) {
    console.error('批量翻译失败:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers
    });
  }
}

// 翻译文章
async function translateArticle(id, request, env, headers) {
  const articleId = parseInt(id);
  if (Number.isNaN(articleId)) {
    return new Response(JSON.stringify({ error: '无效的文章 ID' }), {
      status: 400,
      headers
    });
  }

  // 检查是否已有翻译（同时取出原文用于翻译）
  const { results } = await env.DB.prepare(
    'SELECT subject, content, subject_translated, content_translated FROM articles WHERE article_id = ?'
  ).bind(articleId).all();

  if (results.length === 0) {
    return new Response(JSON.stringify({ error: '文章不存在' }), {
      status: 404,
      headers
    });
  }

  const article = results[0];

  // 如果已有翻译，直接返回缓存
  if (article.subject_translated && article.content_translated) {
    return new Response(JSON.stringify({
      translation: {
        subject: article.subject_translated,
        content: article.content_translated
      }
    }), { headers });
  }

  try {
    // 直接在 Worker 内调用 LLM，不再回源 VPS。
    // 原实现 fetch(config.VPS_API_URL + '/translate') 会从 Worker 发 subrequest 到
    // 裸 IP + 非标准端口 + 明文 HTTP，Cloudflare Workers 运行时不稳定，
    // 是"翻译服务暂时不可用"(catch-all 503) 的根因。
    const { results: configResults } = await env.DB.prepare(`
      SELECT key, value FROM settings
      WHERE key IN ('TRANSLATION_ENABLED', 'TRANSLATION_API_URL', 'TRANSLATION_API_KEY',
                    'TRANSLATION_MODEL', 'TRANSLATION_SYSTEM_PROMPT', 'TRANSLATION_TEMPERATURE',
                    'TRANSLATION_MAX_TOKENS', 'TRANSLATION_TIMEOUT')
    `).all();

    const config = {};
    configResults.forEach(row => {
      let value = row.value;
      // 移除可能的引号
      if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      config[row.key] = value;
    });

    const isEnabled = ['1', '1.0', 'true', 'yes', 'on'].includes(
      String(config.TRANSLATION_ENABLED ?? '').trim().toLowerCase()
    ) || parseFloat(config.TRANSLATION_ENABLED) > 0;
    if (!isEnabled) {
      return new Response(JSON.stringify({ error: '翻译功能未启用' }), {
        status: 400,
        headers
      });
    }

    if (!config.TRANSLATION_API_URL || !config.TRANSLATION_API_KEY) {
      return new Response(JSON.stringify({ error: '翻译配置不完整' }), {
        status: 400,
        headers
      });
    }

    const systemPrompt = config.TRANSLATION_SYSTEM_PROMPT ||
      '你是一个专业的韩中翻译，请将以下韩文内容翻译成中文。保持原文的语气和风格，确保翻译准确流畅。';
    const apiUrl = config.TRANSLATION_API_URL;
    const model = config.TRANSLATION_MODEL || 'gpt-3.5-turbo';
    const temperature = parseFloat(config.TRANSLATION_TEMPERATURE || '0.3');
    const maxTokens = parseInt(config.TRANSLATION_MAX_TOKENS || '2000');
    const timeoutMs = parseInt(config.TRANSLATION_TIMEOUT || '30000');

    // 标题、正文分别翻译，互不依赖正则切分，结果更可靠；并发以缩短等待
    const callLLM = async (text) => {
      if (!text || text.trim().length === 0) return null;
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.TRANSLATION_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature,
          max_tokens: maxTokens
        }),
        signal: AbortSignal.timeout(timeoutMs)
      });

      if (!resp.ok) {
        throw new Error(`翻译 API 返回 ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
      }
      const data = await resp.json();
      if (!data.choices || data.choices.length === 0) {
        throw new Error('翻译 API 未返回 choices');
      }
      return data.choices[0].message.content.trim();
    };

    const [subjectTranslated, contentTranslated] = await Promise.all([
      callLLM(article.subject).catch(() => null),
      callLLM(article.content).catch(() => null)
    ]);

    if (!subjectTranslated && !contentTranslated) {
      return new Response(JSON.stringify({ error: '翻译失败：LLM 未返回结果' }), {
        status: 502,
        headers
      });
    }

    const finalSubject = subjectTranslated || article.subject || '';
    const finalContent = contentTranslated || article.content || '';

    // 译文直接写入 D1（单一数据源，无需 VPS 内存库 + syncToD1 中转）
    await env.DB.prepare(`
      UPDATE articles
      SET subject_translated = ?,
          content_translated = ?,
          content_html_translated = ?,
          is_ai_translated = 1,
          translated_at = CURRENT_TIMESTAMP
      WHERE article_id = ?
    `).bind(
      finalSubject,
      finalContent,
      finalContent.replace(/\n/g, '<br>'),
      articleId
    ).run();

    return new Response(JSON.stringify({
      translation: { subject: finalSubject, content: finalContent }
    }), { headers });
  } catch (error) {
    console.error('translateArticle 失败:', error);
    return new Response(JSON.stringify({ error: '翻译服务暂时不可用', detail: error.message }), {
      status: 503,
      headers
    });
  }
}

// 搜索文章
async function searchArticles(request, env, headers) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const time = url.searchParams.get('time');
  const source = url.searchParams.get('source');

  let query = 'SELECT * FROM articles WHERE 1=1';
  const params = [];

  // 关键词搜索
  if (q) {
    query += ' AND (subject LIKE ? OR content LIKE ? OR writer_json LIKE ?)';
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  // 时间筛选
  if (time) {
    const now = Date.now();
    const timeFilters = {
      'today': 24 * 60 * 60 * 1000,
      'week': 7 * 24 * 60 * 60 * 1000,
      'month': 30 * 24 * 60 * 60 * 1000,
      '3months': 90 * 24 * 60 * 60 * 1000
    };
    
    if (timeFilters[time]) {
      const timeLimit = now - timeFilters[time];
      query += ' AND write_date >= ?';
      params.push(timeLimit);
    }
  }

  // 来源筛选
  if (source) {
    query += ' AND source = ?';
    params.push(source);
  }

  query += ' ORDER BY write_date DESC LIMIT 100';

  const { results } = await env.DB.prepare(query).bind(...params).all();

  const articles = results.map(row => ({
    articleId: row.article_id,
    subject: row.subject,
    subjectTranslated: row.subject_translated,
    content: row.content,
    writeDate: row.write_date,
    writer: JSON.parse(row.writer_json || '{}'),
    source: row.source
  }));

  return new Response(JSON.stringify({
    articles,
    total: articles.length
  }), { headers });
}

// 人工翻译文章
async function manualTranslateArticle(id, request, env, headers) {
  try {
    const { subjectTranslated, contentHtmlTranslated } = await request.json();
    
    if (!subjectTranslated || !contentHtmlTranslated) {
      return new Response(JSON.stringify({ error: '缺少必要的翻译内容' }), {
        status: 400,
        headers
      });
    }

    // 更新文章翻译，标记为人工翻译（is_ai_translated = 0）
    await env.DB.prepare(`
      UPDATE articles 
      SET subject_translated = ?,
          content_html_translated = ?,
          content_translated = ?,
          is_ai_translated = 0,
          translated_at = CURRENT_TIMESTAMP
      WHERE article_id = ?
    `).bind(
      subjectTranslated,
      contentHtmlTranslated,
      contentHtmlTranslated.replace(/<[^>]+>/g, ''), // 移除 HTML 标签作为纯文本翻译
      parseInt(id)
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: '人工翻译保存成功'
    }), { headers });
  } catch (error) {
    console.error('Manual translation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers
    });
  }
}

// 删除文章翻译
async function deleteArticleTranslation(id, request, env, headers) {
  if (!await verifyAdminToken(request, env)) {
    return new Response(JSON.stringify({ error: '未授权' }), {
      status: 401,
      headers
    });
  }

  try {
    // 清除文章的翻译内容
    await env.DB.prepare(`
      UPDATE articles 
      SET subject_translated = NULL,
          content_translated = NULL,
          content_html_translated = NULL,
          is_ai_translated = 0,
          translated_at = NULL
      WHERE article_id = ?
    `).bind(parseInt(id)).run();

    return new Response(JSON.stringify({
      success: true,
      message: '翻译已删除'
    }), { headers });
  } catch (error) {
    console.error('Delete translation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers
    });
  }
}

// 翻译 JSON 数据（用于 AI 总结等）
async function translateJson(request, env, headers) {
  try {
    let requestData;
    try {
      requestData = await request.json();
    } catch (jsonError) {
      return new Response(JSON.stringify({ 
        error: '请求数据格式错误'
      }), {
        status: 400,
        headers
      });
    }
    
    const { data } = requestData;

    if (!data) {
      return new Response(JSON.stringify({ error: '请提供要翻译的数据' }), {
        status: 400,
        headers
      });
    }

    // 限制输入体积，防止用超大 JSON 滥用翻译 API（烧额度）
    const MAX_TRANSLATE_JSON_BYTES = 64 * 1024;
    const serialized = JSON.stringify(data);
    if (serialized.length > MAX_TRANSLATE_JSON_BYTES) {
      return new Response(JSON.stringify({ error: '待翻译数据过大' }), {
        status: 413,
        headers
      });
    }

    // 从 D1 读取翻译配置
    const queryResult = await env.DB.prepare(`
      SELECT key, value FROM settings 
      WHERE key LIKE 'TRANSLATION_%'
    `).all();

    const config = {};
    if (queryResult.results && Array.isArray(queryResult.results)) {
      queryResult.results.forEach(row => {
        config[row.key] = row.value;
      });
    }
    
    // 检查翻译是否启用（兼容多种格式）
    const isEnabled = config.TRANSLATION_ENABLED === 'true' || 
                     config.TRANSLATION_ENABLED === '1' || 
                     config.TRANSLATION_ENABLED === 1 ||
                     parseFloat(config.TRANSLATION_ENABLED) > 0;
    
    if (!isEnabled) {
      return new Response(JSON.stringify({ error: '翻译功能未启用' }), {
        status: 503,
        headers
      });
    }

    if (!config.TRANSLATION_API_KEY) {
      return new Response(JSON.stringify({ error: '翻译 API 未配置' }), {
        status: 503,
        headers
      });
    }

    // 构建翻译提示词
    const jsonString = JSON.stringify(data, null, 2);
    const prompt = `请将以下 JSON 数据中的所有韩语文本翻译成简体中文，保持 JSON 结构不变，只翻译文本内容。请直接返回翻译后的 JSON，不要添加任何解释。\n\n${jsonString}`;

    // 清理 system prompt 中的额外引号
    let systemPrompt = config.TRANSLATION_SYSTEM_PROMPT || '你是一个专业的韩中翻译助手。';
    if (systemPrompt.startsWith('""') && systemPrompt.endsWith('""')) {
      systemPrompt = systemPrompt.slice(2, -2);
    } else if (systemPrompt.startsWith('"') && systemPrompt.endsWith('"')) {
      systemPrompt = systemPrompt.slice(1, -1);
    }

    // 调用 OpenAI 兼容 API
    const response = await fetch(config.TRANSLATION_API_URL || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.TRANSLATION_API_KEY}`
      },
      body: JSON.stringify({
        model: config.TRANSLATION_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: parseFloat(config.TRANSLATION_TEMPERATURE || '0.3'),
        max_tokens: parseInt(config.TRANSLATION_MAX_TOKENS || '2000')
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Translation API error:', response.status, errorText);
      throw new Error(`Translation API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.choices || result.choices.length === 0) {
      throw new Error('Translation API returned invalid response');
    }

    const translatedText = result.choices[0].message.content.trim();
    
    // 尝试解析翻译后的 JSON
    let translated;
    try {
      // 移除可能的 markdown 代码块标记
      const cleanedText = translatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      translated = JSON.parse(cleanedText);
    } catch (parseError) {
      // 如果解析失败，返回原始文本
      translated = translatedText;
    }

    return new Response(JSON.stringify({
      translated,
      cached: false
    }), { headers });
  } catch (error) {
    console.error('Translate JSON error:', error);
    return new Response(JSON.stringify({ 
      error: '翻译服务暂时不可用'
    }), {
      status: 503,
      headers
    });
  }
}


// 手动触发爬虫
async function triggerScraper(env, headers) {
  try {
    const { SoopScraper } = await import('./soop-scraper.js');
    const soopScraper = new SoopScraper(env);

    // 本地抓取 SOOP 公告板
    console.log('Manually triggering SOOP scraper...');
    const soopResult = await soopScraper.scrape();
    console.log('SOOP scraper completed:', soopResult);

    // Naver Cafe 由 VPS 抓取（代理 + 翻译），通知 VPS 立即执行一次
    let naverTriggered = null;
    const cfg = await getConfig(env, ['VPS_API_URL', 'VPS_API_KEY']);
    if (cfg.VPS_API_URL && cfg.VPS_API_KEY) {
      try {
        const vpsRes = await fetch(`${cfg.VPS_API_URL}/trigger-scraper`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfg.VPS_API_KEY}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(15000)
        });
        naverTriggered = vpsRes.ok
          ? await vpsRes.json()
          : { error: `VPS returned ${vpsRes.status}` };
      } catch (e) {
        console.error('Trigger VPS scraper failed:', e);
        naverTriggered = { error: e.message };
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: '爬虫已触发',
      results: {
        soop: soopResult,
        naver: naverTriggered
      }
    }), { headers });
  } catch (error) {
    console.error('Scraper failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers
    });
  }
}
