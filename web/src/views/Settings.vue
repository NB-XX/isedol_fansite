<template>
  <div>
    <!-- 登录表单 -->
    <div v-if="!isAuthenticated" class="flex items-center justify-center p-8">
      <div class="glass max-w-md w-full p-8 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900">访问设置</h2>
          <p class="mt-2 text-sm text-gray-500">请输入管理员密码</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              v-model="password"
              type="password"
              class="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
              placeholder="请输入密码"
              required
            />
          </div>

          <div v-if="loginError" class="p-3 bg-red-50/80 border border-red-100 rounded-xl text-sm text-red-600 flex items-center">
             <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {{ loginError }}
          </div>

          <button
            type="submit"
            class="w-full btn-primary py-3 font-medium tracking-wide"
            :disabled="loading"
          >
            {{ loading ? '验证中...' : '登录' }}
          </button>
        </form>
      </div>
    </div>

    <!-- 设置面板 -->
    <div v-else class="animate-fade-in">
      <!-- 保存提示 -->
      <div v-if="saveMessage" 
           :class="[
             'mb-6 p-4 rounded-xl border backdrop-blur-sm shadow-sm flex items-center transition-all duration-300',
             saveMessage.type === 'success' ? 'bg-green-50/80 border-green-200 text-green-800' : 'bg-red-50/80 border-red-200 text-red-800'
           ]">
        <div class="flex items-center">
          <span class="mr-2 text-lg">
            {{ saveMessage.type === 'success' ? '✅' : '❌' }}
          </span>
          <p class="text-sm font-medium">
            {{ saveMessage.text }}
          </p>
        </div>
      </div>

      <!-- 设置表单 -->
      <div class="card overflow-hidden">
        <!-- 🎨 个性化配置 -->
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span class="bg-purple-100 p-2 rounded-lg mr-3">🎨</span>
            个性化配置
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">背景图片 URL</label>
              <input v-model="config.BACKGROUND_IMAGE" type="text" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://example.com/image.jpg" />
              <p class="mt-1 text-xs text-gray-500">设置网站全局背景图片，留空则使用默认背景。</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">背景虚化程度 (px)</label>
              <input v-model="config.BACKGROUND_BLUR" type="number" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">音乐播放列表</label>
              <div class="space-y-3">
                <div v-for="(song, index) in musicPlaylist" :key="index" class="flex gap-2 items-start p-3 bg-white/50 rounded-lg border border-gray-200">
                  <div class="flex-1 grid grid-cols-2 gap-2">
                    <input v-model="song.name" type="text" placeholder="歌曲名称" class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    <input v-model="song.artist" type="text" placeholder="艺术家" class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    <input v-model="song.url" type="text" placeholder="音频 URL (mp3)" class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    <input v-model="song.cover" type="text" placeholder="封面 URL (jpg)" class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <button @click="removeSong(index)" class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
                <button @click="addSong" class="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                  添加歌曲
                </button>
              </div>
              <p class="mt-2 text-xs text-gray-500">配置音乐播放列表，将在右下角显示播放器（基于 APlayer）。</p>
            </div>
          </div>
        </div>

        <!-- Naver Cafe 配置 -->
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span class="bg-green-100 p-2 rounded-lg mr-3">📝</span>
            Naver Cafe 配置
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cafe ID</label>
              <input v-model="config.CAFE_ID" type="text" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Menu ID</label>
              <input v-model="config.MENU_ID" type="text" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">爬取间隔（毫秒）</label>
              <input v-model="config.SCRAPER_INTERVAL" type="number" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
        </div>

        <!-- 代理配置 -->
        <div class="p-6 border-b border-gray-100">
           <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span class="bg-blue-100 p-2 rounded-lg mr-3">🌐</span>
            代理配置
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="flex items-center p-3 bg-white/50 rounded-xl border border-gray-200 cursor-pointer hover:bg-white/80 transition-colors">
                <input v-model="config.USE_PROXY" type="checkbox" class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5" />
                <span class="ml-2 text-sm font-medium text-gray-700">启用代理服务器</span>
              </label>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">代理地址</label>
              <input v-model="config.PROXY_URL" type="text" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="http://127.0.0.1:7890" />
            </div>
          </div>
        </div>

        <!-- AI 翻译配置 -->
        <div class="p-6 border-b border-gray-100">
           <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span class="bg-indigo-100 p-2 rounded-lg mr-3">🤖</span>
            AI 翻译配置
          </h3>
          <div class="space-y-4">
            <div>
              <label class="flex items-center p-3 bg-white/50 rounded-xl border border-gray-200 cursor-pointer hover:bg-white/80 transition-colors">
                <input v-model="config.TRANSLATION_ENABLED" type="checkbox" class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5" />
                <span class="ml-2 text-sm font-medium text-gray-700">启用自动翻译</span>
              </label>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">API 地址</label>
                <input v-model="config.TRANSLATION_API_URL" type="text" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input v-model="config.TRANSLATION_API_KEY" type="password" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">模型名称</label>
                <input v-model="config.TRANSLATION_MODEL" type="text" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">温度参数 (0-1)</label>
                <input v-model="config.TRANSLATION_TEMPERATURE" type="number" step="0.1" min="0" max="1" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">最大 Token 数</label>
                <input v-model="config.TRANSLATION_MAX_TOKENS" type="number" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">超时时间（毫秒）</label>
                <input v-model="config.TRANSLATION_TIMEOUT" type="number" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">System Prompt</label>
              <textarea v-model="config.TRANSLATION_SYSTEM_PROMPT" rows="4" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
            </div>
          </div>
        </div>

        <!-- Firebase 配置 -->
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span class="bg-orange-100 p-2 rounded-lg mr-3">🔥</span>
            Firebase 配置
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input v-model="config.FIREBASE_API_KEY" type="password" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Database URL</label>
              <input v-model="config.FIREBASE_DATABASE_URL" type="text" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Project ID</label>
              <input v-model="config.FIREBASE_PROJECT_ID" type="text" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Auth Domain</label>
              <input v-model="config.FIREBASE_AUTH_DOMAIN" type="text" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
        </div>

        <!-- 日志配置 -->
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span class="bg-gray-100 p-2 rounded-lg mr-3">📊</span>
            日志配置
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">日志级别</label>
              <select v-model="config.LOG_LEVEL" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warn</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">日志文件路径</label>
              <input v-model="config.LOG_FILE" type="text" class="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="mt-8 flex justify-between items-center bg-white/40 backdrop-blur rounded-xl p-4 border border-white/50 shadow-sm">
        <button
          @click="handleLogout"
          class="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-white/50 transition-colors font-medium"
        >
          退出登录
        </button>
        <div class="space-x-4">
          <button
            @click="loadConfig"
            class="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-white/50 transition-colors font-medium"
            :disabled="loading"
          >
            重置
          </button>
          <button
            @click="saveConfig"
            class="btn-primary"
            :disabled="loading"
          >
            {{ loading ? '保存中...' : '保存配置' }}
          </button>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="mt-6 p-4 bg-amber-50/80 border border-amber-200 rounded-xl backdrop-blur-sm">
        <p class="text-sm text-amber-800 flex items-center">
          <span class="mr-2 text-lg">⚠️</span>
           修改配置后需要重启服务才能生效。建议在修改前备份 .env 文件。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const isAuthenticated = ref(false);
const password = ref('');
const loginError = ref('');
const loading = ref(false);
const saveMessage = ref(null);

const config = ref({
  CAFE_ID: '',
  MENU_ID: '',
  SCRAPER_INTERVAL: '',
  USE_PROXY: false,
  PROXY_URL: '',
  TRANSLATION_ENABLED: false,
  TRANSLATION_API_URL: '',
  TRANSLATION_API_KEY: '',
  TRANSLATION_MODEL: '',
  TRANSLATION_SYSTEM_PROMPT: '',
  TRANSLATION_TEMPERATURE: '',
  TRANSLATION_MAX_TOKENS: '',
  TRANSLATION_TIMEOUT: '',
  FIREBASE_API_KEY: '',
  FIREBASE_DATABASE_URL: '',
  FIREBASE_PROJECT_ID: '',
  FIREBASE_AUTH_DOMAIN: '',
  LOG_LEVEL: '',
  LOG_FILE: '',
  BACKGROUND_IMAGE: '',
  BACKGROUND_BLUR: '',
  MUSIC_PLAYLIST: '[]'
});

const musicPlaylist = ref([]);

// 检查是否已登录
onMounted(() => {
  const token = sessionStorage.getItem('settings_token');
  if (token) {
    isAuthenticated.value = true;
    loadConfig();
  }
});

// 登录
async function handleLogin() {
  loginError.value = '';
  loading.value = true;

  try {
    const response = await axios.post('http://localhost:8080/api/settings/auth', {
      password: password.value
    });

    if (response.data.success) {
      sessionStorage.setItem('settings_token', response.data.token);
      isAuthenticated.value = true;
      loadConfig();
    }
  } catch (error) {
    loginError.value = error.response?.data?.error || '密码错误';
  } finally {
    loading.value = false;
  }
}

// 退出登录
function handleLogout() {
  sessionStorage.removeItem('settings_token');
  isAuthenticated.value = false;
  password.value = '';
}

// 加载配置
async function loadConfig() {
  loading.value = true;

  try {
    const token = sessionStorage.getItem('settings_token');
    const response = await axios.get('http://localhost:8080/api/settings/config', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    config.value = response.data.config;
    
    // 解析音乐播放列表
    try {
      musicPlaylist.value = JSON.parse(config.value.MUSIC_PLAYLIST || '[]');
    } catch (e) {
      musicPlaylist.value = [];
    }
  } catch (error) {
    if (error.response?.status === 401) {
      handleLogout();
    }
    console.error('加载配置失败:', error);
  } finally {
    loading.value = false;
  }
}

// 添加歌曲
function addSong() {
  musicPlaylist.value.push({
    name: '',
    artist: '',
    url: '',
    cover: ''
  });
}

// 删除歌曲
function removeSong(index) {
  musicPlaylist.value.splice(index, 1);
}

// 保存配置
async function saveConfig() {
  loading.value = true;
  saveMessage.value = null;

  try {
    // 将音乐播放列表序列化
    config.value.MUSIC_PLAYLIST = JSON.stringify(musicPlaylist.value);
    
    const token = sessionStorage.getItem('settings_token');
    const response = await axios.post('http://localhost:8080/api/settings/config', 
      { config: config.value },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    saveMessage.value = {
      type: 'success',
      text: '✅ 配置保存成功！正在重启服务...'
    };

    // 等待 1 秒后触发服务重启
    setTimeout(async () => {
      try {
        const restartResponse = await axios.post('http://localhost:8080/api/admin/restart', {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (restartResponse.data.needManualRestart) {
          // 需要手动重启
          saveMessage.value = {
            type: 'success',
            text: '✅ 配置已保存！请手动重启服务使配置生效。\n提示：使用 PM2 可以实现自动重启。'
          };
        } else {
          // 自动重启成功
          saveMessage.value = {
            type: 'success',
            text: '✅ 配置已保存并应用！服务正在自动重启...'
          };
        }
      } catch (restartError) {
        // 重启 API 调用失败
        saveMessage.value = {
          type: 'success',
          text: '✅ 配置已保存！请手动重启服务使配置生效。'
        };
      }

      setTimeout(() => {
        saveMessage.value = null;
      }, 8000); // 延长显示时间到8秒
    }, 1000);

  } catch (error) {
    if (error.response?.status === 401) {
      handleLogout();
    }
    saveMessage.value = {
      type: 'error',
      text: '❌ 保存失败: ' + (error.response?.data?.error || error.message)
    };
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
