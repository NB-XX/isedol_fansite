// api-server/server.js - API 服务器
import express from 'express'
import cors from 'cors'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 8080

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
      'ine': {
        name: '아이네',
        avatar: 'https://res.afreecatv.com/images/afmain/img_thumb_profile.gif',
        streamUrlTemplate: 'https://play.sooplive.co.kr/ine/{broadNo}/embed'
      },
      'jingburger': {
        name: '징버거',
        avatar: 'https://res.afreecatv.com/images/afmain/img_thumb_profile.gif',
        streamUrlTemplate: 'https://play.sooplive.co.kr/jingburger/{broadNo}/embed'
      },
      'lilpa': {
        name: '릴파',
        avatar: 'https://res.afreecatv.com/images/afmain/img_thumb_profile.gif',
        streamUrlTemplate: 'https://play.sooplive.co.kr/lilpa/{broadNo}/embed'
      },
      'jururu': {
        name: '주르르',
        avatar: 'https://res.afreecatv.com/images/afmain/img_thumb_profile.gif',
        streamUrlTemplate: 'https://play.sooplive.co.kr/jururu/{broadNo}/embed'
      },
      'gosegu': {
        name: '고세구',
        avatar: 'https://res.afreecatv.com/images/afmain/img_thumb_profile.gif',
        streamUrlTemplate: 'https://play.sooplive.co.kr/gosegu/{broadNo}/embed'
      },
      'viichan': {
        name: '비챤',
        avatar: 'https://res.afreecatv.com/images/afmain/img_thumb_profile.gif',
        streamUrlTemplate: 'https://play.sooplive.co.kr/viichan/{broadNo}/embed'
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

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 API 服务器运行在 http://localhost:${PORT}`)
  console.log(`📁 数据目录: ${DATA_DIR}`)
  console.log(`📄 文章数据: ${ARTICLES_FILE}`)
  console.log(`📺 直播数据: ${STREAMS_FILE}`)
})
