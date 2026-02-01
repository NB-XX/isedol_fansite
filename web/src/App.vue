<template>
  <div id="app" class="relative min-h-screen">
    <!-- Global Background -->
    <div 
      class="fixed inset-0 z-0 transition-all duration-700 ease-in-out bg-cover bg-center bg-no-repeat"
      :style="backgroundStyle"
    ></div>
    
    <!-- Content Overlay -->
    <div class="relative z-10 min-h-screen transition-colors duration-300" :class="{'bg-white/80': hasBackground}">
      <router-view />
    </div>

    <!-- Music Player -->
    <MusicPlayer :playlist="musicPlaylist" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import MusicPlayer from './components/MusicPlayer.vue'

const config = ref({
  BACKGROUND_IMAGE: '',
  BACKGROUND_BLUR: '0',
  MUSIC_PLAYLIST: '[]'
})

const musicPlaylist = computed(() => {
  try {
    return JSON.parse(config.value.MUSIC_PLAYLIST || '[]')
  } catch (e) {
    return []
  }
})

const hasBackground = computed(() => !!config.value.BACKGROUND_IMAGE)

const backgroundStyle = computed(() => {
  if (!config.value.BACKGROUND_IMAGE) {
    return { backgroundColor: '#f9fafb' } // default gray-50
  }
  return {
    backgroundImage: `url(${config.value.BACKGROUND_IMAGE})`,
    filter: `blur(${config.value.BACKGROUND_BLUR}px)`
  }
})

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/settings/public')
    if (response.data.config) {
      config.value = { ...config.value, ...response.data.config }
    }
  } catch (error) {
    console.error('Failed to load public settings:', error)
  }
})
</script>

<style>
/* Global Transitions */
body {
  margin: 0;
  transition: background-color 0.3s;
}
</style>
