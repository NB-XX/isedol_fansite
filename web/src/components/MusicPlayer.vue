<template>
  <div v-if="playlist && playlist.length > 0" class="fixed z-50 bottom-6 right-6 flex flex-col items-end">
    <!-- Toggle Button -->
    <button
      @click="togglePlayer"
      class="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-white/50 flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
      title="Music Player"
    >
      <span v-if="!isOpen" class="text-2xl group-hover:animate-bounce">🎵</span>
      <span v-else class="text-xl">✕</span>
    </button>

    <!-- Player Window -->
    <div
      v-show="isOpen"
      class="mt-4 w-[350px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 overflow-hidden transition-all duration-300 origin-bottom-right"
      :class="isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'"
    >
      <div ref="playerContainer" class="p-4"></div>
    </div>
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

const isOpen = ref(false)
const playerContainer = ref(null)
let player = null

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
    listMaxHeight: 250,
    volume: 0.7,
    preload: 'auto',
    order: 'list'
  })
}

const togglePlayer = async () => {
  isOpen.value = !isOpen.value
  
  if (isOpen.value) {
    await nextTick()
    initPlayer()
  }
}

watch(() => props.playlist, () => {
  if (isOpen.value && player) {
    initPlayer()
  }
}, { deep: true })

onMounted(() => {
  // 不自动初始化，等用户点击按钮
})
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
