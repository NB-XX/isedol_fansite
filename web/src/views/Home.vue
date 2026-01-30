<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
            Isedol 粉丝站
          </h1>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">实时更新中</span>
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Streamers Section -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">主播动态</h2>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-4">
          <div
            v-for="streamer in streamers"
            :key="streamer.id"
            @click="openStreamerModal(streamer)"
            class="cursor-pointer group"
          >
            <div class="relative">
              <!-- Avatar with Rainbow Glow if Live -->
              <div
                :class="[
                  'relative w-20 h-20 mx-auto rounded-full overflow-hidden',
                  'transition-transform duration-300 group-hover:scale-105',
                  streamer.isLive ? 'animate-rainbow' : ''
                ]"
              >
                <img
                  :src="streamer.avatar"
                  :alt="streamer.name"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
                <!-- Live Badge -->
                <div
                  v-if="streamer.isLive"
                  class="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-xs py-0.5 text-center font-bold"
                >
                  LIVE
                </div>
              </div>
              <!-- Name -->
              <p class="mt-2 text-center text-sm font-medium text-gray-800 group-hover:text-primary transition-colors">
                {{ streamer.name }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Articles Section -->
      <section>
        <h2 class="text-2xl font-bold mb-6 text-gray-800">最新动态</h2>
        
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <!-- Articles Grid -->
        <div v-else class="space-y-6">
          <article
            v-for="article in articles"
            :key="article.articleId"
            class="card p-6 hover:scale-[1.01] transition-transform duration-300"
          >
            <!-- Article Header -->
            <div class="flex items-start space-x-4 mb-4">
              <!-- Author Avatar -->
              <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  v-if="article.writer.image"
                  :src="article.writer.image"
                  :alt="article.writer.nick"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
                <svg v-else class="w-6 h-6 text-gray-400 m-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <!-- Author Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <h3 class="font-bold text-gray-900">
                    {{ article.writer.nick || 'Unknown' }}
                  </h3>
                  <span v-if="article.writer.memberLevelName" class="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {{ article.writer.memberLevelName }}
                  </span>
                </div>
                <p class="text-sm text-gray-500">
                  {{ formatDate(article.writeDate) }}
                </p>
              </div>

              <!-- Stats -->
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {{ article.readCount || 0 }}
                </span>
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {{ article.commentCount || 0 }}
                </span>
              </div>
            </div>

            <!-- Article Title -->
            <h2 class="text-xl font-bold mb-3 text-gray-900 hover:text-primary transition-colors cursor-pointer">
              {{ article.subject }}
            </h2>

            <!-- Article Content -->
            <div
              class="cafe-content text-gray-700 leading-relaxed mb-4"
              v-html="article.contentHtml || article.content"
            ></div>

            <!-- Article Footer -->
            <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span class="text-sm text-gray-500">
                {{ article.menu.name }}
              </span>
              <a
                :href="`https://cafe.naver.com/steamindiegame/${article.articleId}`"
                target="_blank"
                class="text-sm text-primary hover:underline flex items-center"
              >
                查看原文
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </article>
        </div>

        <!-- Load More Button -->
        <div v-if="!loading && hasMore" class="text-center mt-8">
          <button
            @click="loadMore"
            class="btn-primary"
          >
            加载更多
          </button>
        </div>
      </section>
    </main>

    <!-- Streamer Modal -->
    <StreamerModal
      v-if="selectedStreamer"
      :streamer="selectedStreamer"
      @close="selectedStreamer = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import StreamerModal from '../components/StreamerModal.vue'
import { fetchArticles, fetchStreamers } from '../api'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// State
const articles = ref([])
const streamers = ref([])
const loading = ref(true)
const hasMore = ref(true)
const selectedStreamer = ref(null)

// Methods
const formatDate = (timestamp) => {
  return dayjs(timestamp).fromNow()
}

const loadArticles = async () => {
  try {
    loading.value = true
    const data = await fetchArticles()
    articles.value = data
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

const loadStreamers = async () => {
  try {
    const data = await fetchStreamers()
    streamers.value = data
  } catch (error) {
    console.error('加载主播信息失败:', error)
  }
}

const loadMore = () => {
  // TODO: 实现分页加载
  console.log('加载更多')
}

const openStreamerModal = (streamer) => {
  selectedStreamer.value = streamer
}

const handleImageError = (event) => {
  // 图片加载失败时使用默认头像（防止重复触发）
  if (!event.target.dataset.errorHandled) {
    event.target.dataset.errorHandled = 'true'
    event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E'
  }
}

// Lifecycle
onMounted(() => {
  loadArticles()
  loadStreamers()
  
  // 定时刷新主播状态
  setInterval(loadStreamers, 30000) // 30秒刷新一次
})
</script>
