<template>
  <div class="skeleton-container">
    <!-- 主播骨架屏 -->
    <div v-if="type === 'streamers'" class="mb-12">
      <div class="skeleton-title mb-6"></div>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
        <div v-for="i in 6" :key="i" class="flex flex-col items-center">
          <div class="skeleton-avatar w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full"></div>
          <div class="skeleton-text w-16 h-4 mt-2"></div>
        </div>
      </div>
    </div>

    <!-- 文章列表骨架屏 -->
    <div v-if="type === 'articles'" class="space-y-6">
      <div v-for="i in count" :key="i" class="skeleton-card bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 p-6 shadow-lg">
        <div class="flex items-start space-x-4 mb-4">
          <div class="skeleton-avatar w-12 h-12 rounded-full"></div>
          <div class="flex-1">
            <div class="skeleton-text w-24 h-4 mb-2"></div>
            <div class="skeleton-text w-32 h-3"></div>
          </div>
        </div>
        <div class="skeleton-text w-3/4 h-6 mb-3"></div>
        <div class="space-y-2">
          <div class="skeleton-text w-full h-4"></div>
          <div class="skeleton-text w-full h-4"></div>
          <div class="skeleton-text w-2/3 h-4"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'articles'
  },
  count: {
    type: Number,
    default: 3
  }
})
</script>

<style scoped>
.skeleton-container {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.skeleton-avatar,
.skeleton-text,
.skeleton-title {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-avatar {
  border-radius: 50%;
}

.skeleton-title {
  width: 150px;
  height: 28px;
  border-radius: 8px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
