<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="glass-header sticky top-0 z-50 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center space-x-2">
            <span class="text-2xl animate-bounce">💜💛💙</span>
            <h1 class="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
              异世界女团粉丝站
            </h1>
            <span class="text-2xl animate-bounce">🩷🩵💚</span>
          </div>
          <div class="flex items-center space-x-2 sm:space-x-4">
            <router-link
              to="/admin"
              class="p-2 text-gray-600 hover:text-emerald-500 hover:bg-white/50 rounded-xl transition-all duration-300"
              title="管理员控制台"
            >
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </router-link>
            <span class="glass px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap" :title="lastUpdateTime ? formatFullDate(lastUpdateTime) : ''">
              {{ lastUpdateTime ? `更新于 ${formatDate(lastUpdateTime)}` : '加载中...' }}
            </span>
            <div class="relative w-3 h-3">
               <div class="absolute w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
               <div class="relative w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Streamers Section -->
      <section class="mb-12">
        <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 flex items-center">
          直播状态
        </h2>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
          <div
            v-for="streamer in streamers"
            :key="streamer.id"
            @click="openStreamerModal(streamer)"
            class="cursor-pointer group relative"
          >
            <div class="relative">
              <!-- Avatar with Rainbow Glow if Live -->
              <div
                :class="[
                  'relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto rounded-full overflow-hidden',
                  'transition-transform duration-300 group-hover:scale-105',
                  streamer.isLive ? 'ring-4 ring-red-500 ring-offset-2 animate-pulse' : 'ring-2 ring-gray-200'
                ]"
              >
                <img
                  :src="streamer.avatar"
                  :alt="streamer.name"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
              </div>
              <!-- Name -->
              <p class="mt-2 text-center text-sm sm:text-base font-medium text-gray-800 group-hover:text-primary transition-colors truncate">
                {{ streamer.name }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Articles Section -->
      <section>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800">通知帖文</h2>
          <!-- Author Filter Badge -->
          <div v-if="selectedAuthor" class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">筛选:</span>
            <button
              @click="clearAuthorFilter"
              class="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              {{ normalizeAuthorName(selectedAuthor) }}
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <!-- Articles Grid -->
        <div v-else class="space-y-6">
          <article
            v-for="article in filteredArticles"
            :key="article.articleId"
            class="w-full"
            :data-article-id="article.articleId"
          >
            <!-- 统一的卡片样式 -->
            <div class="bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 p-6 shadow-lg transition-all duration-300">
              <!-- Article Header -->
              <div class="flex items-start space-x-4 mb-4">
                <!-- Author Avatar -->
                <div 
                  @click="toggleAuthorFilter(article.writer.nick)"
                  class="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  :title="`点击只看 ${article.writer.nick} 的文章`"
                >
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
                    <h3 
                      @click="toggleAuthorFilter(article.writer.nick)"
                      class="font-bold text-gray-900 cursor-pointer hover:text-primary transition-colors"
                      :title="`点击只看 ${normalizeAuthorName(article.writer.nick)} 的文章`"
                    >
                      {{ normalizeAuthorName(article.writer.nick) }}
                    </h3>
                    <span 
                      :class="[
                        'text-xs px-2 py-1 rounded-full font-medium',
                        article.source === 'soop' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      ]"
                    >
                      {{ article.source === 'soop' ? 'SOOP 公告栏' : 'Naver 咖啡厅' }}
                    </span>
                  </div>
                  <p 
                    class="text-sm text-gray-500 cursor-help" 
                    :title="formatFullDate(article.writeDate)"
                  >
                    {{ formatDate(article.writeDate) }}
                  </p>
                </div>

                <!-- Translate Button -->
                <button
                  @click.stop="toggleFlip(article)"
                  :class="[
                    'p-2 transition-colors rounded-full relative',
                    isFlipped(article.articleId) 
                      ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' 
                      : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                  ]"
                  :title="isFlipped(article.articleId) ? '显示原文' : '显示翻译'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <!-- AI标识 -->
                  <span 
                    v-if="isFlipped(article.articleId) && article.isAiTranslated"
                    class="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm"
                    title="AI翻译"
                  >
                    AI
                  </span>
                </button>
              </div>

              <!-- Article Title -->
              <a
                :href="`https://cafe.naver.com/steamindiegame/${article.articleId}`"
                target="_blank"
                class="block"
              >
                <h2 class="text-xl font-bold mb-3 text-gray-900 hover:text-primary transition-colors cursor-pointer">
                  <!-- 显示原文或翻译标题 -->
                  <span v-if="!isFlipped(article.articleId)">{{ article.subject }}</span>
                  <span v-else class="text-blue-700">{{ article.subjectTranslated || article.subject }}</span>
                </h2>
              </a>

              <!-- Article Content Preview -->
              <div v-if="!isFlipped(article.articleId)">
                <!-- 原文内容 -->
                <div class="relative">
                  <div
                    class="article-content cafe-content text-gray-700 leading-relaxed mb-4 overflow-hidden transition-all duration-300"
                    :class="!isExpanded(article.articleId) && needsCollapse(article.articleId) ? 'max-h-[400px]' : ''"
                    v-html="article.contentHtml || article.content"
                  ></div>
                  <!-- 渐变遮罩和展开按钮 -->
                  <div 
                    v-if="!isExpanded(article.articleId) && needsCollapse(article.articleId)"
                    class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/90 via-white/60 to-transparent flex items-end justify-center pb-2"
                  >
                    <button
                      @click="toggleExpand(article.articleId)"
                      class="px-4 py-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-sm font-medium border border-gray-200"
                    >
                      展开全文
                      <svg class="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                  </div>
                  <!-- 收起按钮 -->
                  <div v-if="isExpanded(article.articleId) && needsCollapse(article.articleId)" class="flex justify-center mt-2">
                    <button
                      @click="toggleExpand(article.articleId)"
                      class="px-4 py-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-sm font-medium border border-gray-200"
                    >
                      收起
                      <svg class="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else>
                <!-- 翻译内容 -->
                <div v-if="loadingTranslation[article.articleId]" class="flex flex-col items-center justify-center text-blue-500 py-12">
                  <svg class="animate-spin h-8 w-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-sm">正在翻译中...</span>
                </div>
                <div v-else class="relative">
                  <div 
                    class="article-content cafe-content text-gray-700 leading-relaxed mb-4 overflow-hidden transition-all duration-300"
                    :class="!isExpanded(article.articleId) && needsCollapse(article.articleId) ? 'max-h-[400px]' : ''"
                  >
                    <!-- 翻译后的HTML内容（保留图片和格式） -->
                    <div v-if="article.contentHtmlTranslated" v-html="article.contentHtmlTranslated"></div>
                    <!-- 如果没有HTML翻译，显示纯文本翻译 -->
                    <div v-else-if="article.contentTranslated" class="whitespace-pre-wrap">{{ article.contentTranslated }}</div>
                    <!-- 都没有则显示原文 -->
                    <div v-else v-html="article.contentHtml || article.content"></div>
                  </div>
                  <!-- 渐变遮罩和展开按钮 -->
                  <div 
                    v-if="!isExpanded(article.articleId) && needsCollapse(article.articleId)"
                    class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/90 via-white/60 to-transparent flex items-end justify-center pb-2"
                  >
                    <button
                      @click="toggleExpand(article.articleId)"
                      class="px-4 py-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-sm font-medium border border-gray-200"
                    >
                      展开全文
                      <svg class="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                  </div>
                  <!-- 收起按钮 -->
                  <div v-if="isExpanded(article.articleId) && needsCollapse(article.articleId)" class="flex justify-center mt-2">
                    <button
                      @click="toggleExpand(article.articleId)"
                      class="px-4 py-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-sm font-medium border border-gray-200"
                    >
                      收起
                      <svg class="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Article Footer -->
              <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <span class="text-gray-500 truncate max-w-[150px]">
                  {{ article.menu.name }}
                </span>
                <div class="flex items-center space-x-4 text-gray-500">
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
            </div>
          </article>
        </div>

        <!-- Loading More Indicator -->
        <div v-if="loadingMore" class="flex justify-center items-center py-8">
          <div class="flex items-center space-x-2 text-gray-500">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span class="text-sm">加载更多...</span>
          </div>
        </div>

        <!-- No More Content -->
        <div v-if="!loading && !loadingMore && !hasMore && articles.length > 0" class="text-center py-8 text-gray-400">
          <p class="text-sm">没有更多内容了</p>
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
import { ref, onMounted, computed, onUnmounted, nextTick, watch } from 'vue'
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
const loadingMore = ref(false)
const selectedStreamer = ref(null)
const selectedAuthor = ref(null)
const lastUpdateTime = ref(null)
const nextCursor = ref(null)
const hasMore = ref(true)

// Flip & Translation State
const flippedArticles = ref(new Set())
const loadingTranslation = ref({})

// Expanded articles state
const expandedArticles = ref(new Set())
const collapsibleArticles = ref(new Set())

// 作者名称映射（合并同一个人的不同账号）
const authorNameMap = {
  '아이네♪': '아이네',
  '고세구!': '고세구',
  '징버거!': '징버거',
  '징버거☆': '징버거',
  '주르르!': '주르르',
  '주르르_': '주르르',
  '릴파!': '릴파',
  '릴파♬': '릴파',
  '릴파 LILPA': '릴파',
  '비챤!': '비챤',
  '비챤_': '비챤'
}

// 规范化作者名称
const normalizeAuthorName = (name) => {
  return authorNameMap[name] || name
}

// Check if article content needs collapsing
const checkContentHeight = (articleId) => {
  // 使用 nextTick 确保 DOM 已渲染
  nextTick(() => {
    const contentEl = document.querySelector(`[data-article-id="${articleId}"] .article-content`)
    if (contentEl && contentEl.scrollHeight > 400) {
      collapsibleArticles.value.add(articleId)
    }
  })
}

// Check if article needs collapse button
const needsCollapse = (articleId) => {
  return collapsibleArticles.value.has(articleId)
}

// Computed
const filteredArticles = computed(() => {
  if (!selectedAuthor.value) {
    return articles.value
  }
  // 使用规范化的名称进行筛选
  return articles.value.filter(article => {
    const normalizedArticleAuthor = normalizeAuthorName(article.writer.nick)
    const normalizedSelectedAuthor = normalizeAuthorName(selectedAuthor.value)
    return normalizedArticleAuthor === normalizedSelectedAuthor
  })
})

// Watch filteredArticles changes to re-check heights
watch(filteredArticles, () => {
  // 当筛选改变时，重新检测所有可见文章的高度
  // 使用 setTimeout 确保 DOM 完全更新
  nextTick(() => {
    setTimeout(() => {
      filteredArticles.value.forEach(article => {
        checkContentHeight(article.articleId)
      })
    }, 100)
  })
}, { immediate: false })

// Validation for flip
const isFlipped = (id) => flippedArticles.value.has(id)

// Validation for expanded
const isExpanded = (id) => expandedArticles.value.has(id)

// Toggle expand/collapse
const toggleExpand = (articleId) => {
  if (isExpanded(articleId)) {
    expandedArticles.value.delete(articleId)
  } else {
    expandedArticles.value.add(articleId)
  }
}

// Methods
const toggleFlip = async (article) => {
  const id = article.articleId
  
  if (isFlipped(id)) {
    flippedArticles.value.delete(id)
  } else {
    flippedArticles.value.add(id)
    
    // 如果没有翻译，且没有正在翻译，则请求翻译
    if ((!article.subjectTranslated || !article.contentTranslated) && !loadingTranslation.value[id]) {
        await requestTranslation(article)
    }
  }
}

const requestTranslation = async (article) => {
    const id = article.articleId
    loadingTranslation.value[id] = true
    
    try {
        console.log('Requesting translation for', id)
        
        const response = await fetch(`http://localhost:8080/api/articles/${id}/translate`, {
            method: 'POST'
        })
        
        if (response.ok) {
            const data = await response.json()
            // Update local article
            article.subjectTranslated = data.translation.subject
            article.contentTranslated = data.translation.content
            
            // 后端已经处理了图片，直接使用翻译结果作为 HTML
            if (data.translation.content) {
                article.contentHtmlTranslated = data.translation.content
            }
        }
        
    } catch (e) {
        console.error('Translation failed', e)
    } finally {
        loadingTranslation.value[id] = false
    }
}

// 创建翻译后的HTML（保留原HTML中的图片）
const formatDate = (timestamp) => {
  return dayjs(timestamp).fromNow()
}

const formatFullDate = (timestamp) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

const loadArticles = async (append = false) => {
  try {
    if (append) {
      loadingMore.value = true
    } else {
      loading.value = true
      nextCursor.value = null
      hasMore.value = true
    }
    
    // 构建 API URL
    const params = new URLSearchParams({ limit: '20' })
    if (append && nextCursor.value) {
      params.append('cursor', nextCursor.value)
    }
    
    const response = await fetch(`http://localhost:8080/api/articles?${params}`)
    const data = await response.json()
    
    if (append) {
      articles.value = [...articles.value, ...data.articles]
    } else {
      articles.value = data.articles
    }
    
    // 更新游标和是否有更多
    nextCursor.value = data.nextCursor
    hasMore.value = data.hasMore
    
    // 使用 API 返回的最后更新时间
    if (data.lastUpdate) {
      lastUpdateTime.value = new Date(data.lastUpdate).getTime()
    } else {
      lastUpdateTime.value = Date.now()
    }
    
    // 检查每篇文章的内容高度
    nextTick(() => {
      data.articles.forEach(article => {
        checkContentHeight(article.articleId)
      })
    })
  } catch (error) {
    console.error('加载文章失败:', error)
    lastUpdateTime.value = Date.now()
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const toggleAuthorFilter = (authorNick) => {
  if (selectedAuthor.value === authorNick) {
    selectedAuthor.value = null
  } else {
    selectedAuthor.value = authorNick
  }
}

const clearAuthorFilter = () => {
  selectedAuthor.value = null
}

const loadStreamers = async () => {
  try {
    const data = await fetchStreamers()
    
    // 定义主播顺序
    const streamerOrder = ['아이네', '징버거', '릴파', '주르르', '고세구', '비챤']
    
    // 按照指定顺序排序
    streamers.value = data.sort((a, b) => {
      const indexA = streamerOrder.indexOf(a.name)
      const indexB = streamerOrder.indexOf(b.name)
      
      // 如果名字在列表中，按列表顺序排序
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB
      }
      // 如果只有一个在列表中，在列表中的排前面
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1
      // 都不在列表中，保持原顺序
      return 0
    })
  } catch (error) {
    console.error('加载主播信息失败:', error)
  }
}

const loadMore = () => {
  if (!loadingMore.value && hasMore.value && nextCursor.value) {
    loadArticles(true)
  }
}

// 无限滚动监听
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  // 距离底部 200px 时触发加载
  if (scrollTop + windowHeight >= documentHeight - 200) {
    loadMore()
  }
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
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
})

// 清理监听器
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
