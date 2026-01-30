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

// API Routes

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
        streamUrlTemplate: 'https://play.sooplive.co.kr/gosegu/{broadNo}/embed'
      },
      'lilpa': {
        name: '릴파',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/li/lilpa0309/m/lilpa0309.webp',
        streamUrlTemplate: 'https://play.sooplive.co.kr/lilpa/{broadNo}/embed'
      },
      'ine': {
        name: '아이네',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/in/inehine/m/inehine.webp',
        streamUrlTemplate: 'https://play.sooplive.co.kr/ine/{broadNo}/embed'
      },
      'viichan': {
        name: '비챤',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/vi/viichan6/m/viichan6.webp',
        streamUrlTemplate: 'https://play.sooplive.co.kr/viichan/{broadNo}/embed'
      },
      'jingburger': {
        name: '징버거',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/ji/jingburger1/m/jingburger1.webp',
        streamUrlTemplate: 'https://play.sooplive.co.kr/jingburger/{broadNo}/embed'
      },
      'jururu': {
        name: '주르르',
        avatar: 'https://stimg.sooplive.co.kr/LOGO/co/cotton1217/m/cotton1217.webp',
        streamUrlTemplate: 'https://play.sooplive.co.kr/jururu/{broadNo}/embed'
      }
    }

    // 组合主播信息
    const streamers = Object.entries(data.streams).map(([id, stream]) => {
      const config = streamerConfig[id] || { name: id, avatar: '' }
      
      return {
        id,
        name: stream.name || config.name,
        avatar: config.avatar,
        isLive: stream.online || false,
        streamUrl: stream.online && stream.broadNo 
          ? config.streamUrlTemplate.replace('{broadNo}', stream.broadNo)
          : null,
        streamTitle: stream.title || '',
        streamCategory: stream.category || '',
        updatedAt: stream.updatedAt
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

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 API 服务器运行在 http://localhost:${PORT}`)
  console.log(`📁 数据目录: ${DATA_DIR}`)
  console.log(`📄 文章数据: ${ARTICLES_FILE}`)
  console.log(`📺 直播数据: ${STREAMS_FILE}`)
})
