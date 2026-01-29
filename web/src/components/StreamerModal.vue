<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-primary to-green-600 p-6 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <img
                :src="streamer.avatar"
                :alt="streamer.name"
                class="w-16 h-16 rounded-full border-4 border-white shadow-lg"
              />
              <div>
                <h2 class="text-2xl font-bold">{{ streamer.name }}</h2>
                <p v-if="streamer.isLive" class="text-sm flex items-center mt-1">
                  <span class="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                  正在直播
                </p>
                <p v-else class="text-sm opacity-90">离线</p>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <!-- Live Stream Embed -->
          <div v-if="streamer.isLive && streamer.streamUrl" class="mb-6">
            <div class="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                :src="streamer.streamUrl"
                class="w-full h-full"
                frameborder="0"
                allowfullscreen
              ></iframe>
            </div>
            <div class="mt-3 p-4 bg-gray-50 rounded-lg">
              <h3 class="font-bold text-lg mb-1">{{ streamer.streamTitle }}</h3>
              <p class="text-sm text-gray-600">{{ streamer.streamCategory }}</p>
            </div>
          </div>

          <!-- Stream History -->
          <div>
            <h3 class="text-xl font-bold mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              开播历史
            </h3>
            
            <div v-if="streamer.history && streamer.history.length > 0" class="space-y-3">
              <div
                v-for="(record, index) in streamer.history"
                :key="index"
                class="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div
                  :class="[
                    'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                    record.action === 'start' ? 'bg-green-500' : 'bg-gray-400'
                  ]"
                ></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <span
                      :class="[
                        'text-sm font-medium',
                        record.action === 'start' ? 'text-green-600' : 'text-gray-600'
                      ]"
                    >
                      {{ record.action === 'start' ? '开播' : '下播' }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ formatDate(record.timestamp) }}
                    </span>
                  </div>
                  <p v-if="record.title" class="text-sm text-gray-700 truncate">
                    {{ record.title }}
                  </p>
                  <p v-if="record.category" class="text-xs text-gray-500 mt-1">
                    {{ record.category }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12 text-gray-400">
              <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>暂无开播记录</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import dayjs from 'dayjs'

const props = defineProps({
  streamer: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const formatDate = (timestamp) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}
</script>
