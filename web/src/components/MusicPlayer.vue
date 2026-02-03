<template>
  <div v-if="playlist && playlist.length > 0" class="fixed z-50 bottom-4 right-4 md:bottom-6 md:right-6 flex flex-col items-end">
    <!-- Player Window -->
    <div
      v-show="isOpen"
      class="w-[90vw] max-w-[400px] md:w-[400px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 overflow-hidden transition-all duration-300 origin-bottom-right"
      :class="isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'"
    >
      <div class="p-3 md:p-4 border-b border-white/30 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-lg md:text-xl">🎵</span>
          <span class="text-sm md:text-base font-medium text-gray-700">音乐播放器</span>
        </div>
        <button
          @click="togglePlayer"
          class="w-7 h-7 md:w-8 md:h-8 rounded-full hover:bg-white/50 flex items-center justify-center transition-colors"
          title="收起播放器"
        >
          <span class="text-gray-500">✕</span>
        </button>
      </div>
      <div ref="playerContainer" class="p-3 md:p-4"></div>
    </div>

    <!-- Toggle Button (when closed) -->
    <button
      v-show="!isOpen"
      @click="togglePlayer"
      class="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-white/50 flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
      title="打开音乐播放器"
    >
      <span class="text-xl md:text-2xl group-hover:animate-bounce">🎵</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import APlayer from 'aplayer'
import 'aplayer/dist/APlayer.min.css'

const props = defineProps({
  playlist: {
    type: Array,
    default: () => []
  }
})

const isOpen = ref(false) // 默认关闭
const playerContainer = ref(null)
let player = null

// 检测是否为移动设备
const isMobile = () => {
  return window.innerWidth < 768 // Tailwind 的 md 断点
}

// 初始化时根据设备类型决定是否打开
onMounted(async () => {
  // 桌面端默认打开，移动端默认关闭
  if (!isMobile()) {
    isOpen.value = true
  }
  
  // 如果已经有 playlist 且播放器是打开状态，初始化播放器
  if (props.playlist && props.playlist.length > 0 && isOpen.value) {
    await nextTick()
    setTimeout(() => {
      initPlayer()
    }, 100)
  }
})

const initPlayer = () => {
  if (!playerContainer.value || !props.playlist || props.playlist.length === 0) {
    return
  }

  // 销毁旧的播放器
  if (player) {
    player.destroy()
    player = null
  }

  // 创建新的播放器
  player = new APlayer({
    container: playerContainer.value,
    audio: props.playlist,
    theme: '#10b981',
    lrcType: 0,
    listFolded: false,
    listMaxHeight: 300,
    volume: 0.5,
    preload: 'auto',
    order: 'list',
    autoplay: false
  })
}

const togglePlayer = async () => {
  isOpen.value = !isOpen.value
  
  if (isOpen.value) {
    await nextTick()
    initPlayer()
  }
}

watch(() => props.playlist, async (newPlaylist) => {
  if (newPlaylist && newPlaylist.length > 0 && isOpen.value) {
    await nextTick()
    setTimeout(() => {
      initPlayer()
    }, 100)
  }
}, { deep: true, immediate: true })
</script>

<style>
/* APlayer 样式覆盖 */
.aplayer {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}

.aplayer .aplayer-body {
  background: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(10px);
  border-radius: 12px;
}

.aplayer .aplayer-list {
  background: rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px);
  border-radius: 12px;
  margin-top: 8px;
}

.aplayer .aplayer-list ol li {
  border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.aplayer .aplayer-list ol li:hover {
  background: rgba(16, 185, 129, 0.1) !important;
}
</style>
