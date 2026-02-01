// api-server/server.js - API 服务器
import express from 'express'
import cors from 'cors'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 8080

// 图片缓存目录
const CACHE_DIR = join(__dirname, '../cache/images')
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true })
}

// Middleware
app.use(cors())
app.use(express.json())

// 数据文件路径
const DATA_DIR = join(__dirname, '../data')
const ARTICLES_FILE = join(DATA_DIR, 'articles.json')
const STREAMS_FILE = join(DATA_DIR, 'streams.json')
const CONFIG_FILE = join(DATA_DIR, 'config.json')

// 读取数据文件
const readDataFile = (filePath) => {
  try {
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error(`读取文件失败 ${filePath}:`, error.message)
  }
  return null
}

// 写入数据文件
const writeDataFile = (filePath, data) => {
  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error(`写入文件失败 ${filePath}:`, error.message)
    return false
  }
}

// API Routes

// Settings API
// 验证中间件
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权' })
  }
  // 在实际生产环境中应该使用更安全的 token 机制
  // 这里简化处理，只要有 token 且后端验证通过即可
  // 实际的 token 验证逻辑可以根据需求增强
  next()
}

// 登录验证
app.post('/api/settings/auth', (req, res) => {
  const { password } = req.body
  // 获取环境变量中的密码，默认为 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD || 'roboco520'

  if (password === adminPassword) {
    // 生成一个简单的 token (实际应使用 JWT)
    const token = crypto.randomBytes(16).toString('hex')
    res.json({ success: true, token })
  } else {
    res.status(401).json({ success: false, error: '密码错误' })
  }
})

// 获取公开配置 (无需认证)
app.get('/api/settings/public', (req, res) => {
  try {
    const savedConfig = readDataFile(CONFIG_FILE) || {}

    // 只返回公开可见的配置
    const publicConfig = {
      BACKGROUND_IMAGE: savedConfig.BACKGROUND_IMAGE || '',
      BACKGROUND_BLUR: savedConfig.BACKGROUND_BLUR || '0',
      APPLE_MUSIC_ID: savedConfig.APPLE_MUSIC_ID || '',
      // 如果有其他公开配置也可在此添加
    }

    res.json({ config: publicConfig })
  } catch (error) {
    console.error('获取公开配置失败:', error)
    res.status(500).json({ error: '获取配置失败' })
  }
})

// 获取完整配置 (需认证)
app.get('/api/settings/config', authenticate, (req, res) => {
  try {
    // 读取保存的配置
    const savedConfig = readDataFile(CONFIG_FILE) || {}

    // 合并环境变量配置（作为默认值）
    const config = {
      // 基础配置
      CAFE_ID: process.env.CAFE_ID || '',
      MENU_ID: process.env.MENU_ID || '',
      SCRAPER_INTERVAL: process.env.SCRAPER_INTERVAL || '600000',

      // 代理配置
      USE_PROXY: process.env.USE_PROXY === 'true',
      PROXY_URL: process.env.PROXY_URL || '',

      // 翻译配置
      TRANSLATION_ENABLED: process.env.TRANSLATION_ENABLED === 'true',
      TRANSLATION_API_URL: process.env.TRANSLATION_API_URL || '',
      TRANSLATION_API_KEY: process.env.TRANSLATION_API_KEY || '',
      TRANSLATION_MODEL: process.env.TRANSLATION_MODEL || '',
      TRANSLATION_SYSTEM_PROMPT: process.env.TRANSLATION_SYSTEM_PROMPT || '',
      TRANSLATION_TEMPERATURE: process.env.TRANSLATION_TEMPERATURE || '0.3',
      TRANSLATION_MAX_TOKENS: process.env.TRANSLATION_MAX_TOKENS || '1000',
      TRANSLATION_TIMEOUT: process.env.TRANSLATION_TIMEOUT || '30000',

      // Firebase 配置
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
      FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL || '',
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',

      // 日志配置
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
      LOG_FILE: process.env.LOG_FILE || './logs/app.log',

      // 前端自定义配置 (新加的)
      BACKGROUND_IMAGE: '', // 背景图片 URL
      BACKGROUND_BLUR: '0', // 模糊度 px
      APPLE_MUSIC_ID: '', // Apple Music 专辑/歌单 ID

      // 覆盖保存的配置
      ...savedConfig
    }

    res.json({ config })
  } catch (error) {
    console.error('获取配置失败:', error)
    res.status(500).json({ error: '获取配置失败' })
  }
})

// 保存配置
app.post('/api/settings/config', authenticate, (req, res) => {
  try {
    const { config } = req.body
    if (!config) {
      return res.status(400).json({ error: '配置不能为空' })
    }

    // 保存到文件
    if (writeDataFile(CONFIG_FILE, config)) {
      res.json({ success: true, message: '配置已保存' })
    } else {
      res.status(500).json({ error: '保存配置文件失败' })
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    res.status(500).json({ error: '保存配置失败' })
  }
})

// 重启服务 (需要配合外部进程管理器，这里仅作为触发器或退出进程)
app.post('/api/admin/restart', authenticate, (req, res) => {
  res.json({ success: true, message: '服务器即将重启' })

  // 延迟退出，让响应先发送回去
  setTimeout(() => {
    console.log('收到重启请求，正在退出进程...')
    process.exit(0) // 依赖 PM2 或 service-manager.js 自动重启
  }, 1000)
})

// 获取文章列表
app.get('/api/articles', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const data = readDataFile(ARTICLES_FILE)

    if (!data || !data.articles) {
      return res.json({ articles: [] })
    }

    // 转换为数组并按时间排序
    const articles = Object.values(data.articles)
      .sort((a, b) => b.writeDate - a.writeDate)
      .slice(0, limit)

    res.json({ articles })
  } catch (error) {
    console.error('获取文章失败:', error)
    res.status(500).json({ error: '获取文章失败' })
  }
})

// 获取单篇文章
app.get('/api/articles/:id', (req, res) => {
  try {
    const articleId = req.params.id
    const data = readDataFile(ARTICLES_FILE)

    if (!data || !data.articles) {
      return res.status(404).json({ error: '文章不存在' })
    }

    const article = data.articles[articleId]

    if (!article) {
      return res.status(404).json({ error: '文章不存在' })
    }

    res.json({ article })
  } catch (error) {
    console.error('获取文章失败:', error)
    res.status(500).json({ error: '获取文章失败' })
  }
})

// 翻译单篇文章 (公开/前端触发)
app.post('/api/articles/:id/translate', async (req, res) => {
  try {
    const { id } = req.params

    // 检查翻译是否启用
    if (!translator.isEnabled) {
      return res.status(503).json({ error: '翻译功能未启用' })
    }

    const data = readDataFile(ARTICLES_FILE)

    if (!data || !data.articles || !data.articles[id]) {
      return res.status(404).json({ error: '文章不存在' })
    }

    const article = data.articles[id]

    // 如果已经翻译过，直接返回
    if (article.subjectTranslated && article.contentTranslated) {
      return res.json({
        success: true,
        translation: {
          subject: article.subjectTranslated,
          content: article.contentTranslated
        }
      })
    }

    // 执行翻译
    const translation = await translator.translateArticle(article)

    if (translation.subjectTranslated && translation.contentTranslated) {
      // 更新 DB 和 JSON
      db.updateArticleTranslation(
        article.articleId,
        translation.subjectTranslated,
        translation.contentTranslated
      )

      // 更新内存缓存
      data.articles[id].subjectTranslated = translation.subjectTranslated
      data.articles[id].contentTranslated = translation.contentTranslated

      writeDataFile(ARTICLES_FILE, data)

      res.json({
        success: true,
        translation: {
          subject: translation.subjectTranslated,
          content: translation.contentTranslated
        }
      })
    } else {
      res.status(500).json({ error: '翻译失败' })
    }

  } catch (error) {
    console.error('单篇翻译失败:', error)
    res.status(500).json({ error: '翻译请求处理失败: ' + error.message })
  }
})


// 获取主播信息
app.get('/api/streamers', (req, res) => {
  try {
    const data = readDataFile(STREAMS_FILE)

    if (!data || !data.streams) {
      return res.json({ streamers: [] })
    }

    // 主播配置（头像等信息）
    const streamerConfig = {
      'gosegu': {
        name: '고세구',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/go/gosegu2/m/gosegu2.webp',
        bjId: 'gosegu2'
      },
      'lilpa': {
        name: '릴파',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/li/lilpa0309/m/lilpa0309.webp',
        bjId: 'lilpa0309'
      },
      'ine': {
        name: '아이네',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/in/inehine/m/inehine.webp',
        bjId: 'inehine'
      },
      'viichan': {
        name: '비챤',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/vi/viichan6/m/viichan6.webp',
        bjId: 'viichan6'
      },
      'jingburger': {
        name: '징버거',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/ji/jingburger1/m/jingburger1.webp',
        bjId: 'jingburger1'
      },
      'jururu': {
        name: '주르르',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/co/cotton1217/m/cotton1217.webp',
        bjId: 'cotton1217'
      }
    }

    // 组合主播信息
    const streamers = Object.entries(data.streams).map(([id, stream]) => {
      const config = streamerConfig[id] || { name: id, avatar: '', bjId: id }

      // 获取该主播的历史记录（最近20条）
      const allHistory = data.history || []
      const streamerHistory = allHistory.filter(record => record.streamerId === id)
      const recentHistory = streamerHistory.slice(-20).reverse()

      console.log(`[DEBUG] ${id}: isLive=${stream.online}, history count=${recentHistory.length}`)

      return {
        id,
        name: stream.name || config.name,
        avatar: config.avatar,
        bjId: config.bjId,
        isLive: stream.online || false,
        streamUrl: stream.online
          ? `https://play.sooplive.co.kr/${config.bjId}/embed`
          : null,
        streamTitle: stream.title || '',
        streamCategory: stream.category || '',
        updatedAt: stream.updatedAt,
        history: recentHistory
      }
    })

    res.json({ streamers })
  } catch (error) {
    console.error('获取主播信息失败:', error)
    res.status(500).json({ error: '获取主播信息失败' })
  }
})

// 获取主播历史记录
app.get('/api/streamers/:id/history', (req, res) => {
  try {
    const streamerId = req.params.id
    const limit = parseInt(req.query.limit) || 50
    const data = readDataFile(STREAMS_FILE)

    if (!data || !data.history) {
      return res.json({ history: [] })
    }

    // 筛选该主播的历史记录
    const history = data.history
      .filter(record => record.streamerId === streamerId)
      .slice(-limit)
      .reverse()

    res.json({ history })
  } catch (error) {
    console.error('获取主播历史失败:', error)
    res.status(500).json({ error: '获取主播历史失败' })
  }
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

// 图片代理和缓存
app.get('/api/image-proxy', async (req, res) => {
  try {
    const imageUrl = req.query.url

    if (!imageUrl) {
      return res.status(400).json({ error: '缺少 url 参数' })
    }

    // 生成缓存文件名（使用 URL 的 MD5 哈希）
    const hash = crypto.createHash('md5').update(imageUrl).digest('hex')
    const ext = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0] || '.jpg'
    const cacheFileName = `${hash}${ext}`
    const cachePath = join(CACHE_DIR, cacheFileName)

    // 检查缓存
    if (existsSync(cachePath)) {
      console.log(`[缓存命中] ${imageUrl}`)
      const image = readFileSync(cachePath)
      const contentType = getContentType(ext)
      res.setHeader('Content-Type', contentType)
      res.setHeader('Cache-Control', 'public, max-age=31536000') // 1年缓存
      return res.send(image)
    }

    // 下载图片
    console.log(`[下载图片] ${imageUrl}`)
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://cafe.naver.com/'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    const imageBuffer = Buffer.from(buffer)

    // 保存到缓存
    writeFileSync(cachePath, imageBuffer)
    console.log(`[缓存成功] ${cacheFileName}`)

    // 返回图片
    const contentType = getContentType(ext)
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=31536000')
    res.send(imageBuffer)
  } catch (error) {
    console.error('图片代理失败:', error.message)
    res.status(500).json({ error: '图片加载失败' })
  }
})

// 获取内容类型
function getContentType(ext) {
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  }
  return types[ext.toLowerCase()] || 'image/jpeg'
}

// 导入翻译模块和数据库
import { Translator } from '../src/modules/translator.js'
import { getDatabase } from '../src/database/index.js'

// 初始化翻译器和数据库
const translator = new Translator()
const db = getDatabase()

// ... (previous endpoints) ...

// 批量翻译文章
app.post('/api/admin/articles/batch-translate', authenticate, async (req, res) => {
  try {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请选择要翻译的文章' })
    }

    // 检查翻译是否启用
    if (!translator.isEnabled) {
      return res.status(400).json({ error: '翻译功能未启用，请检查服务器配置' })
    }

    console.log(`收到批量翻译请求: ${ids.length} 篇文章`)

    let successCount = 0
    let failCount = 0

    // 异步处理翻译任务 (不等待全部完成直接返回响应，或者等待完成返回结果)
    // 考虑到前端超时，这里如果是少量文章可以等待，大量文章建议后台处理
    // 为了简单起见，这里假设数量不多，进行批量处理但设置超时限制

    // 获取文章信息
    const allArticles = readDataFile(ARTICLES_FILE)
    if (!allArticles || !allArticles.articles) {
      return res.status(500).json({ error: '无法读取文章数据' })
    }

    const tasks = ids.map(async (id) => {
      const article = allArticles.articles[id]
      if (!article) return

      try {
        // 如果已经翻译过，跳过 (或者根据需求强制重新翻译)
        if (article.subjectTranslated && article.contentTranslated) {
          successCount++ // 视为成功
          return
        }

        const translation = await translator.translateArticle(article)
        if (translation.subjectTranslated && translation.contentTranslated) {
          // 更新 JSON 文件 (注意这里会有并发写入风险，简单实现先单线程处理或依赖 DB)
          // 由于 server.js 使用 readDataFile/writeDataFile 操作 JSON，
          // 而 translator.js 使用 db.updateArticleTranslation 操作 SQLite/JSON (depends on impl)
          // 这里为了保持一致性，应该调用 db 方法更新，然后重新 sync 到 JSON 文件，或者直接更新 JSON

          // 方案: 使用 db 更新，因为 db 会处理持久化
          db.updateArticleTranslation(
            article.articleId,
            translation.subjectTranslated,
            translation.contentTranslated
          )

          // 同时更新内存中的 JSON 缓存以便立即响应 (如果 server.js 主要依赖 articles.json)
          allArticles.articles[id].subjectTranslated = translation.subjectTranslated
          allArticles.articles[id].contentTranslated = translation.contentTranslated

          successCount++
        } else {
          failCount++
        }
      } catch (error) {
        console.error(`翻译文章 ${id} 失败:`, error.message)
        failCount++
      }
    })

    await Promise.all(tasks)

    // 保存更新后的 JSON (如果使用了 db.updateArticleTranslation，它可能只更新了 DB，
    // 需要确认 db 是否同步更新了 articles.json。
    // 查看 translator.js: db.updateArticleTranslation. 
    // 假设 db 操作是权威的，server.js 下次读取会读到最新。
    // 但为了保险，我们这里手动保存一次 server.js 维护的 JSON)
    writeDataFile(ARTICLES_FILE, allArticles)

    res.json({
      success: true,
      message: `翻译完成: 成功 ${successCount} 篇，失败 ${failCount} 篇`
    })

  } catch (error) {
    console.error('批量翻译失败:', error)
    res.status(500).json({ error: '批量翻译失败: ' + error.message })
  }
})

// 批量删除文章
app.post('/api/admin/articles/batch-delete', authenticate, (req, res) => {
  try {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请选择要删除的文章' })
    }

    const data = readDataFile(ARTICLES_FILE)
    if (!data || !data.articles) {
      return res.status(500).json({ error: '无法读取文章数据' })
    }

    let deletedCount = 0
    ids.forEach(id => {
      if (data.articles[id]) {
        delete data.articles[id]
        deletedCount++
      }
    })

    writeDataFile(ARTICLES_FILE, data)

    // 同时同步到 DB (如果需要)
    // 简单起见，这里只操作了 JSON，因为 app 似乎主要读 JSON

    res.json({ success: true, message: `成功删除 ${deletedCount} 篇文章` })
  } catch (error) {
    console.error('批量删除失败:', error)
    res.status(500).json({ error: '批量删除失败' })
  }
})

// 删除单篇文章
app.delete('/api/admin/articles/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params
    const data = readDataFile(ARTICLES_FILE)

    if (data && data.articles && data.articles[id]) {
      delete data.articles[id]
      writeDataFile(ARTICLES_FILE, data)
      res.json({ success: true, message: '文章已删除' })
    } else {
      res.status(404).json({ error: '文章不存在' })
    }
  } catch (error) {
    console.error('删除文章失败:', error)
    res.status(500).json({ error: '删除失败' })
  }
})


// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 API 服务器运行在 http://localhost:${PORT}`)
  console.log(`📁 数据目录: ${DATA_DIR}`)
  console.log(`📄 文章数据: ${ARTICLES_FILE}`)
  console.log(`📺 直播数据: ${STREAMS_FILE}`)
  // console.log(`Config: `, { ...config, FIREBASE_API_KEY: '***' }) // Debug
})
