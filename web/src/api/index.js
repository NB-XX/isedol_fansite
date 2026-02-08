import axios from 'axios'
import { API_BASE_URL } from '../config/api.js'

const api = axios.create({
  baseURL: API_BASE_URL + '/api',
  timeout: 10000
})

// 获取文章列表
export const fetchArticles = async (limit = 20) => {
  try {
    const response = await api.get('/articles', {
      params: { limit }
    })
    return {
      articles: response.data.articles || [],
      lastUpdate: response.data.lastUpdate || null
    }
  } catch (error) {
    console.error('获取文章失败:', error)
    // 返回模拟数据用于开发
    return {
      articles: getMockArticles(),
      lastUpdate: Date.now()
    }
  }
}

// 获取主播信息
export const fetchStreamers = async () => {
  try {
    const response = await api.get('/streamers')
    return response.data.streamers || []
  } catch (error) {
    console.error('获取主播信息失败:', error)
    // 返回模拟数据用于开发
    return getMockStreamers()
  }
}

// 获取主播历史记录
export const fetchStreamerHistory = async (streamerId) => {
  try {
    const response = await api.get(`/streamers/${streamerId}/history`)
    return response.data.history || []
  } catch (error) {
    console.error('获取主播历史失败:', error)
    return []
  }
}

// 模拟数据 - 用于开发测试
const getMockArticles = () => {
  return [
    {
      articleId: 1,
      subject: '[비챤] 챠니다!!!!!!!!',
      content: '안뇽하세여 챠니입니다!!!! 오늘 오후 9시에 롤 내전이 있어요!',
      contentHtml: '<p>안뇽하세여 챠니입니다!!!! 오늘 오후 9시에 롤 내전이 있어요!</p><p>멤버는 요렇게 된답니다~!!!</p>',
      writeDate: Date.now() - 3600000,
      writer: {
        nick: '비챤',
        memberLevelName: '카페스탭',
        image: 'https://via.placeholder.com/100'
      },
      menu: {
        name: '▶ 이세돌의 공지사항'
      },
      readCount: 1418,
      commentCount: 128
    },
    {
      articleId: 2,
      subject: '[고세구] 오늘 휴뱅입니다 ㅠ',
      content: '컨디션 이슈로 휴뱅입니다 ㅠㅁㅠ...!',
      contentHtml: '<p>컨디션 이슈로 휴뱅입니다 ㅠㅁㅠ...!</p>',
      writeDate: Date.now() - 7200000,
      writer: {
        nick: '고세구',
        memberLevelName: '카페스탭',
        image: 'https://via.placeholder.com/100'
      },
      menu: {
        name: '▶ 이세돌의 공지사항'
      },
      readCount: 2274,
      commentCount: 219
    }
  ]
}

const getMockStreamers = () => {
  return [
    {
      id: 'ine',
      name: '아이네',
      avatar: 'https://via.placeholder.com/150',
      isLive: true,
      streamUrl: 'https://play.sooplive.co.kr/ine/embed',
      streamTitle: '오늘도 즐거운 방송!',
      streamCategory: '저스트 채팅',
      history: [
        {
          action: 'start',
          timestamp: Date.now() - 3600000,
          title: '오늘도 즐거운 방송!',
          category: '저스트 채팅'
        }
      ]
    },
    {
      id: 'jingburger',
      name: '징버거',
      avatar: 'https://via.placeholder.com/150',
      isLive: false,
      history: [
        {
          action: 'end',
          timestamp: Date.now() - 7200000,
          title: '게임 방송',
          category: 'League of Legends'
        }
      ]
    },
    {
      id: 'lilpa',
      name: '릴파',
      avatar: 'https://via.placeholder.com/150',
      isLive: false,
      history: []
    },
    {
      id: 'jururu',
      name: '주르르',
      avatar: 'https://via.placeholder.com/150',
      isLive: false,
      history: []
    },
    {
      id: 'gosegu',
      name: '고세구',
      avatar: 'https://via.placeholder.com/150',
      isLive: false,
      history: []
    },
    {
      id: 'viichan',
      name: '비챤',
      avatar: 'https://via.placeholder.com/150',
      isLive: false,
      history: []
    }
  ]
}

export default api
