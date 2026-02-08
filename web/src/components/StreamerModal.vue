<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="flex items-stretch max-w-7xl w-full max-h-[90vh]" @click.stop>
        <div class="bg-white shadow-2xl flex-1 overflow-hidden flex flex-col transition-all duration-300" :class="showAiSummary ? 'rounded-l-2xl' : 'rounded-2xl'">
          <div class="bg-green-600 p-6 text-white flex-shrink-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <img :src="streamer.avatar" :alt="streamer.name" class="w-16 h-16 rounded-full border-4 border-white shadow-lg" />
                <div>
                  <h2 class="text-2xl font-bold">{{ streamer.name }}</h2>
                  <p v-if="streamer.isLive" class="text-sm flex items-center mt-1">
                    <span class="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                    正在直播
                  </p>
                  <p v-else class="text-sm opacity-90">离线</p>
                </div>
              </div>
              <button @click="$emit('close')" class="text-white hover:bg-white/20 rounded-full p-2 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div class="p-6 overflow-y-auto flex-1">
            <div v-if="streamer.isLive && streamer.streamUrl" class="mb-6 relative">
              <div class="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                <iframe :src="streamer.streamUrl" class="w-full h-full" frameborder="0" allowfullscreen allow="autoplay; fullscreen"></iframe>
              </div>
              <div class="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h3 class="font-bold text-lg mb-1 text-gray-800">{{ streamer.streamTitle }}</h3>
                <p class="text-sm text-gray-600 mb-2">{{ streamer.streamCategory }}</p>
                <div v-if="streamer.broadStart" class="flex items-center space-x-4 text-sm text-gray-500 mt-3 pt-3 border-t border-green-200">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>开播时间: {{ formatBroadStart(streamer.broadStart) }}</span>
                  </div>
                  <div class="flex items-center font-medium text-green-600">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>已播: {{ liveDuration }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="!streamer.isLive" class="mb-6 p-6 bg-gray-50 rounded-lg text-center">
              <svg class="w-16 h-16 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p class="text-gray-600 font-medium">现在没播哦</p>
            </div>
            <div>
              <h3 class="text-xl font-bold mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                活动时间线
              </h3>
              <div v-if="groupedHistory && Object.keys(groupedHistory).length > 0" class="relative">
                <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div v-for="(records, date) in groupedHistory" :key="date" class="mb-8">
                  <div class="flex items-center mb-4">
                    <div class="relative z-10 bg-white pr-4">
                      <div class="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {{ date }}
                      </div>
                    </div>
                    <div class="flex-1 h-px bg-gray-200 ml-2"></div>
                  </div>
                  <div class="space-y-3 ml-4">
                    <div v-for="(record, index) in records" :key="index" class="flex items-start space-x-4">
                      <div class="relative flex-shrink-0">
                        <div :class="['w-4 h-4 rounded-full border-2 border-white shadow-md z-10 relative', getEventColor(record.action)]"></div>
                      </div>
                      <div class="flex-1 pb-4">
                        <div :class="['p-4 rounded-lg border-l-4 transition-all hover:shadow-md', getEventBorderColor(record.action), getEventBgColor(record.action)]">
                          <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center space-x-2">
                              <span :class="['text-sm font-bold', getEventTextColor(record.action)]">{{ getEventLabel(record.action) }}</span>
                              <span class="text-xs text-gray-500">{{ formatTime(record.timestamp) }}</span>
                            </div>
                          </div>
                          <div v-if="record.action === 'start' || record.action === 'end'">
                            <p class="text-sm text-gray-700 mb-1">
                              <span class="font-medium">标题:</span> {{ record.title }}
                            </p>
                            <p class="text-xs text-gray-600 mb-1">
                              <span class="font-medium">分类:</span> {{ record.category }}
                            </p>
                            <div v-if="record.broad_no" class="mt-2">
                              <span class="text-xs text-gray-500">直播ID: {{ record.broad_no }}</span>
                            </div>
                          </div>
                          <div v-if="record.action === 'title_change' && record.metadata && record.metadata.oldTitle" class="text-sm text-gray-700">
                            <span class="line-through opacity-60">{{ record.metadata.oldTitle }}</span>
                            <span class="mx-2">→</span>
                            <span>{{ record.title }}</span>
                          </div>
                          <div v-if="record.action === 'category_change' && record.metadata && record.metadata.oldCategory" class="text-sm text-gray-700">
                            <span class="line-through opacity-60">{{ record.metadata.oldCategory }}</span>
                            <span class="mx-2">→</span>
                            <span>{{ record.category }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-12 text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>暂无活动记录</p>
              </div>
            </div>
          </div>
        </div>
        <button v-if="streamer.isLive && streamer.broadNo" @click="toggleAiSummary" class="relative flex-shrink-0 w-12 bg-green-600 hover:bg-green-700 text-white shadow-xl transition-all duration-300 flex items-center justify-center group" title="AI 直播总结">
          <div class="flex flex-col items-center space-y-2">
            <svg class="w-5 h-5 transition-transform duration-300" :class="showAiSummary ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <div class="writing-vertical text-xs font-medium tracking-wider">AI总结</div>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </button>
        <Transition name="slide">
          <div v-if="showAiSummary" class="flex-shrink-0 w-96 bg-white shadow-2xl overflow-hidden flex flex-col rounded-r-2xl" @click.stop>
            <div class="bg-green-600 p-4 text-white flex items-center justify-between flex-shrink-0">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 class="font-bold">AI 直播总结</h3>
              </div>
              <div class="flex items-center space-x-2">
                <button v-if="aiSummary && !translatedSummary" @click="translateSummary" :disabled="loadingTranslation" class="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm flex items-center space-x-1 disabled:opacity-50" title="翻译为中文">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span>{{ loadingTranslation ? '翻译中...' : '翻译' }}</span>
                </button>
                <button v-if="translatedSummary" @click="translatedSummary = null" class="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm" title="显示原文">原文</button>
                <button @click="refreshAiSummary" :disabled="loadingAiSummary" class="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50" title="刷新总结">
                  <svg :class="['w-4 h-4', loadingAiSummary ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button @click="toggleAiSummary" class="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <div v-if="loadingAiSummary" class="flex flex-col items-center justify-center py-12">
                <svg class="animate-spin h-10 w-10 text-purple-500 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-600">AI 正在分析直播内容...</p>
              </div>
              <div v-else-if="aiSummaryError" class="text-center py-12">
                <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-red-600 mb-4">{{ aiSummaryError }}</p>
                <button @click="refreshAiSummary" class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">重试</button>
              </div>
              <div v-else-if="aiSummary">
                <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                  <h4 class="font-bold text-blue-900 mb-2 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    直播总结
                    <span v-if="translatedSummary" class="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">中文</span>
                  </h4>
                  <p class="text-sm text-gray-700 leading-relaxed" v-html="formatSummary(translatedSummary?.broadSummary || aiSummary.broadSummary)"></p>
                </div>
                <div v-if="(translatedSummary?.events || aiSummary.events) && (translatedSummary?.events || aiSummary.events).length > 0">
                  <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    重要事件
                  </h4>
                  <div class="space-y-2">
                    <div v-for="(event, index) in (translatedSummary?.events || aiSummary.events)" :key="index" class="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div class="flex items-start space-x-2">
                        <div class="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div class="flex-1">
                          <p class="text-xs text-gray-500 mb-1">{{ formatEventTime(event.timestamp) }}</p>
                          <p class="text-sm text-gray-700">{{ event.summary }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="(translatedSummary?.timeline || aiSummary.timeline) && (translatedSummary?.timeline || aiSummary.timeline).length > 0">
                  <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    内容时间线
                  </h4>
                  <div class="relative">
                    <div class="absolute left-2 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                    <div class="space-y-4">
                      <div v-for="(item, index) in (translatedSummary?.timeline || aiSummary.timeline)" :key="index" class="relative pl-6">
                        <div :class="['absolute left-0 w-4 h-4 rounded-full border-2 border-white', item.highlight ? 'bg-yellow-400' : 'bg-blue-400']"></div>
                        <div class="bg-white rounded-lg p-3 border border-gray-200">
                          <p class="text-xs text-gray-500 mb-1">{{ formatEventTime(item.timestamp) }}</p>
                          <p class="text-sm font-medium text-gray-800 mb-2">{{ item.summary }}</p>
                          <div v-if="item.details && item.details.length > 0" class="mt-2 space-y-1">
                            <div v-for="(detail, dIndex) in item.details" :key="dIndex" class="text-xs text-gray-600 pl-3 border-l-2 border-blue-200">{{ detail.summary }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js'

dayjs.extend(duration)

const props = defineProps({
  streamer: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const showAiSummary = ref(false)
const loadingAiSummary = ref(false)
const aiSummary = ref(null)
const aiSummaryError = ref(null)
const translatedSummary = ref(null)
const loadingTranslation = ref(false)
const liveDuration = ref('计算中...')
let durationInterval = null

// 缓存机制：存储原始数据和翻译结果
const summaryCache = ref({
  originalHash: null,  // 原始数据的哈希值
  original: null,      // 原始数据
  translated: null     // 翻译结果
})

// 生成简单的哈希值
const generateHash = (obj) => {
  const str = JSON.stringify(obj)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

const toggleAiSummary = () => {
  showAiSummary.value = !showAiSummary.value
  if (showAiSummary.value && !aiSummary.value && !loadingAiSummary.value) {
    fetchAiSummary()
  }
}

const fetchAiSummary = async () => {
  if (!props.streamer.broadNo) {
    aiSummaryError.value = '无法获取直播ID'
    return
  }
  loadingAiSummary.value = true
  aiSummaryError.value = null
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.broadSummary(props.streamer.broadNo)))
    if (!response.ok) {
      throw new Error('无法获取直播总结')
    }
    const data = await response.json()
    
    // 生成新数据的哈希值
    const newHash = generateHash(data)
    
    // 检查是否与缓存的数据相同
    if (summaryCache.value.originalHash === newHash && summaryCache.value.original) {
      console.log('AI 总结内容未变化，使用缓存')
      aiSummary.value = summaryCache.value.original
      // 如果有缓存的翻译，也恢复翻译
      if (summaryCache.value.translated) {
        translatedSummary.value = summaryCache.value.translated
      }
    } else {
      console.log('AI 总结内容已更新')
      aiSummary.value = data
      // 更新缓存的原始数据
      summaryCache.value.originalHash = newHash
      summaryCache.value.original = data
      // 清除旧的翻译（因为内容变了）
      summaryCache.value.translated = null
      translatedSummary.value = null
    }
  } catch (error) {
    console.error('获取 AI 总结失败:', error)
    aiSummaryError.value = error.message || '获取直播总结失败，请稍后重试'
  } finally {
    loadingAiSummary.value = false
  }
}

const refreshAiSummary = () => {
  // 刷新时不清除缓存，只重新获取
  aiSummary.value = null
  translatedSummary.value = null
  fetchAiSummary()
}

const translateSummary = async () => {
  if (!aiSummary.value) return
  
  // 检查是否有缓存的翻译
  const currentHash = generateHash(aiSummary.value)
  if (summaryCache.value.originalHash === currentHash && summaryCache.value.translated) {
    console.log('使用缓存的翻译结果')
    translatedSummary.value = summaryCache.value.translated
    return
  }
  
  loadingTranslation.value = true
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.translateJson), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: aiSummary.value
      })
    })
    if (!response.ok) {
      throw new Error('翻译失败')
    }
    const result = await response.json()
    translatedSummary.value = result.translated
    
    // 缓存翻译结果
    summaryCache.value.translated = result.translated
    
    // 显示是否使用了后端缓存
    if (result.cached) {
      console.log('使用了后端缓存的翻译结果')
    } else {
      console.log('新翻译已完成并缓存')
    }
  } catch (error) {
    console.error('翻译失败:', error)
    alert('翻译失败，请稍后重试')
  } finally {
    loadingTranslation.value = false
  }
}

const formatSummary = (text) => {
  if (!text) return ''
  return text.replace(/\n/g, '<br>')
}

const formatEventTime = (timestamp) => {
  return dayjs(timestamp).format('HH:mm:ss')
}

const updateDuration = () => {
  if (!props.streamer.broadStart) {
    liveDuration.value = '未知'
    return
  }
  const start = dayjs(props.streamer.broadStart)
  const now = dayjs()
  const diff = now.diff(start)
  const dur = dayjs.duration(diff)
  const hours = Math.floor(dur.asHours())
  const minutes = dur.minutes()
  const seconds = dur.seconds()
  if (hours > 0) {
    liveDuration.value = `${hours}小时${minutes}分${seconds}秒`
  } else if (minutes > 0) {
    liveDuration.value = `${minutes}分${seconds}秒`
  } else {
    liveDuration.value = `${seconds}秒`
  }
}

onMounted(() => {
  if (props.streamer.isLive && props.streamer.broadStart) {
    updateDuration()
    durationInterval = setInterval(updateDuration, 1000)
  }
})

onUnmounted(() => {
  if (durationInterval) {
    clearInterval(durationInterval)
  }
})

const groupedHistory = computed(() => {
  if (!props.streamer.history || props.streamer.history.length === 0) {
    return {}
  }
  const groups = {}
  props.streamer.history.forEach(record => {
    if (record.metadata && typeof record.metadata === 'string') {
      try {
        record.metadata = JSON.parse(record.metadata)
      } catch (e) {
        record.metadata = null
      }
    }
    const date = dayjs(record.timestamp).format('YYYY年MM月DD日')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(record)
  })
  return groups
})

const formatDate = (timestamp) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

const formatTime = (timestamp) => {
  return dayjs(timestamp).format('HH:mm:ss')
}

const formatBroadStart = (timestamp) => {
  return dayjs(timestamp).format('MM月DD日 HH:mm')
}

const getEventLabel = (action) => {
  const labels = {
    'start': '开播',
    'end': '下播',
    'title_change': '标题更新',
    'category_change': '分类更新'
  }
  return labels[action] || action
}

const getEventColor = (action) => {
  const colors = {
    'start': 'bg-green-500',
    'end': 'bg-gray-400',
    'title_change': 'bg-blue-500',
    'category_change': 'bg-purple-500'
  }
  return colors[action] || 'bg-gray-400'
}

const getEventBorderColor = (action) => {
  const colors = {
    'start': 'border-green-500',
    'end': 'border-gray-400',
    'title_change': 'border-blue-500',
    'category_change': 'border-purple-500'
  }
  return colors[action] || 'border-gray-400'
}

const getEventBgColor = (action) => {
  const colors = {
    'start': 'bg-green-50',
    'end': 'bg-gray-50',
    'title_change': 'bg-blue-50',
    'category_change': 'bg-purple-50'
  }
  return colors[action] || 'bg-gray-50'
}

const getEventTextColor = (action) => {
  const colors = {
    'start': 'text-green-700',
    'end': 'text-gray-700',
    'title_change': 'text-blue-700',
    'category_change': 'text-purple-700'
  }
  return colors[action] || 'text-gray-700'
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.writing-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
</style>
