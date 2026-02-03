<template>
  <div class="min-h-screen bg-transparent">
    <!-- 顶部导航 -->
    <nav class="glass-header sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <router-link to="/" class="text-gray-600 hover:text-emerald-500 transition-colors flex items-center">
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              返回首页
            </router-link>
            <h1 class="text-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">管理员控制台</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600 px-3 py-1 bg-white/50 rounded-full">管理员</span>
            <button @click="handleLogout" class="text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded-full transition-colors">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 登录表单 -->
    <div v-if="!isAuthenticated" class="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div class="glass max-w-md w-full p-8 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900">管理员登录</h2>
          <p class="mt-2 text-sm text-gray-500">请输入管理员密码以继续</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
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

    <!-- 主控制台 -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <!-- 通知提示 -->
      <div v-if="notification" 
           :class="[
             'mb-6 p-4 rounded-xl border backdrop-blur-sm shadow-sm flex items-center transition-all duration-300',
             notification.type === 'success' ? 'bg-green-50/80 border-green-200 text-green-800' : 
             notification.type === 'error' ? 'bg-red-50/80 border-red-200 text-red-800' :
             notification.type === 'info' ? 'bg-blue-50/80 border-blue-200 text-blue-800' :
             'bg-blue-50/80 border-blue-200 text-blue-800'
           ]">
        <p class="text-sm font-medium">{{ notification.message }}</p>
      </div>

      <!-- 标签页导航 -->
      <div class="mb-8 p-1 bg-white/40 backdrop-blur rounded-xl inline-flex shadow-inner">
        <button
          @click="activeTab = 'dashboard'"
          :class="[
            'px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            activeTab === 'dashboard'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          ]"
        >
          仪表板
        </button>
        <button
          @click="activeTab = 'articles'"
          :class="[
            'px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            activeTab === 'articles'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          ]"
        >
          文章管理
        </button>
        <button
          @click="activeTab = 'settings'"
          :class="[
            'px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            activeTab === 'settings'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          ]"
        >
          系统设置
        </button>
      </div>

      <!-- 仪表板 -->
      <div v-if="activeTab === 'dashboard'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="card p-6 border-t-4 border-t-blue-400">
            <div class="text-sm text-gray-500 mb-2 text-center">文章总数</div>
            <div class="text-4xl font-bold text-gray-800 text-center">{{ stats.totalArticles || 0 }}</div>
          </div>
          <div class="card p-6 border-t-4 border-t-emerald-400">
            <div class="text-sm text-gray-500 mb-2 text-center">已翻译</div>
            <div class="text-4xl font-bold text-emerald-600 text-center">{{ stats.translatedArticles || 0 }}</div>
          </div>
          <div class="card p-6 border-t-4 border-t-amber-400">
            <div class="text-sm text-gray-500 mb-2 text-center">未翻译</div>
            <div class="text-4xl font-bold text-amber-600 text-center">{{ stats.untranslatedArticles || 0 }}</div>
          </div>
          <div class="card p-6 border-t-4 border-t-purple-400">
            <div class="text-sm text-gray-500 mb-2 text-center">翻译进度</div>
            <div class="text-4xl font-bold text-purple-600 text-center">{{ stats.translationProgress || 0 }}%</div>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="text-lg font-bold mb-6 text-gray-800 flex items-center">
            作者统计
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="(stat, author) in stats.authorStats" :key="author" 
                 class="bg-white/50 rounded-xl p-4 hover:bg-white transition-colors border border-gray-100">
              <div class="flex items-center space-x-3 mb-3">
                <img :src="stat.avatar" class="w-10 h-10 rounded-full shadow-sm" />
                <span class="font-medium text-gray-800">{{ author }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center space-x-2">
                  <span class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                    Naver: {{ stat.naver }}
                  </span>
                  <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    SOOP: {{ stat.soop }}
                  </span>
                </div>
                <span class="px-3 py-1 bg-gray-100 rounded-full text-gray-600 font-bold">
                  {{ stat.total }} 篇
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 文章管理 -->
      <div v-if="activeTab === 'articles'" class="space-y-6">
        <!-- 搜索和筛选 -->
        <div class="card p-6">
          <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索文章标题或内容..."
              class="col-span-2 px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              @keyup.enter="loadArticles"
            />
            <select
              v-model="authorFilter"
              class="px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              @change="loadArticles"
            >
              <option value="">全部作者</option>
              <option v-for="(stat, author) in stats.authorStats" :key="author" :value="author">
                {{ author }}
              </option>
            </select>
            <select
              v-model="sourceFilter"
              class="px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              @change="loadArticles"
            >
              <option value="">全部来源</option>
              <option value="naver">Naver Cafe</option>
              <option value="soop">SOOP 公告栏</option>
            </select>
            <select
              v-model="dateFilter"
              class="px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              @change="loadArticles"
            >
              <option value="">全部时间</option>
              <option value="today">今天</option>
              <option value="week">最近一周</option>
              <option value="month">最近一月</option>
              <option value="3months">最近三月</option>
            </select>
            <button
              @click="loadArticles"
              class="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              搜索
            </button>
          </div>
        </div>

        <!-- 批量操作 -->
        <div class="glass p-4 rounded-xl flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <label class="flex items-center cursor-pointer select-none px-2 py-1 hover:bg-white/50 rounded-lg transition-colors">
              <input
                type="checkbox"
                @change="toggleSelectAll"
                :checked="selectedArticles.length === articles.length && articles.length > 0"
                class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5"
              />
              <span class="ml-2 text-sm font-medium text-gray-700">全选当前页</span>
            </label>
            <span class="text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full">
              已选择 <span class="font-bold text-emerald-600">{{ selectedArticles.length }}</span> 篇
            </span>
          </div>
          <div class="flex space-x-3">
            <button
              @click="batchTranslate"
              :disabled="selectedArticles.length === 0"
              class="btn-primary disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              批量翻译
            </button>
            <button
              @click="batchDelete"
              :disabled="selectedArticles.length === 0"
              class="bg-rose-500 text-white px-6 py-2 rounded-xl shadow-md hover:bg-rose-600 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              批量删除
            </button>
          </div>
        </div>

        <!-- 文章表格 -->
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50/50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">
                    选择
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">标题</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">作者</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">来源</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">发布时间</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">翻译状态</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="article in articles" :key="article.articleId" class="hover:bg-blue-50/30 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      :value="article.articleId"
                      v-model="selectedArticles"
                      class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {{ article.articleId }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-800 max-w-md truncate font-medium">
                    {{ article.subject }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <img :src="article.writer.image" class="w-8 h-8 rounded-full mr-2 border border-gray-200" />
                      <span class="text-sm text-gray-700">{{ article.writer.nick }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-semibold rounded-full',
                        article.source === 'soop' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      ]"
                    >
                      {{ article.source === 'soop' ? 'SOOP' : 'Naver' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(article.writeDate) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      v-if="article.subjectTranslated"
                      :class="[
                        'px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center',
                        article.isAiTranslated 
                          ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      ]"
                    >
                      {{ article.isAiTranslated ? 'AI翻译' : '人工翻译' }}
                    </span>
                    <span
                      v-else
                      class="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200"
                    >
                      未翻译
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      @click="viewArticle(article)"
                      class="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      查看
                    </button>
                    <button
                      @click="openTranslateModal(article)"
                      class="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      人工翻译
                    </button>
                    <button
                      @click="deleteArticle(article.articleId)"
                      class="text-rose-500 hover:text-rose-700 font-medium"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 分页 -->
        <div class="card p-4 flex items-center justify-between">
          <div class="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
            第 <span class="font-medium text-gray-900">{{ pagination.page }}</span> / {{ pagination.totalPages }} 页，
            共 <span class="font-medium text-gray-900">{{ pagination.total }}</span> 篇文章
          </div>
          <div class="flex space-x-2">
            <button
              @click="prevPage"
              :disabled="pagination.page === 1"
              class="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:bg-gray-50 transition-all"
            >
              上一页
            </button>
            <button
              @click="nextPage"
              :disabled="pagination.page === pagination.totalPages"
              class="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:bg-gray-50 transition-all"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      <!-- 系统设置 -->
      <div v-if="activeTab === 'settings'">
        <Settings />
      </div>
    </div>

    <!-- 文章详情弹窗 -->
    <div v-if="selectedArticle" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" @click="selectedArticle = null">
      <div class="glass max-w-4xl w-full max-h-[85vh] overflow-hidden m-4 rounded-2xl flex flex-col shadow-2xl animate-scale-in" @click.stop>
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50">
          <h2 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">文章详情</h2>
          <button @click="selectedArticle = null" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto custom-scrollbar space-y-6 bg-white/30">
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-white/60 rounded-xl border border-white/50">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">文章 ID</label>
              <div class="text-gray-900 font-mono">{{ selectedArticle.articleId }}</div>
            </div>
             <div class="p-4 bg-white/60 rounded-xl border border-white/50">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">作者</label>
              <div class="flex items-center space-x-2">
                <img :src="selectedArticle.writer.image" class="w-6 h-6 rounded-full" />
                <span class="font-medium">{{ selectedArticle.writer.nick }}</span>
              </div>
            </div>
          </div>

          <div class="p-4 bg-white/60 rounded-xl border border-white/50">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">标题</label>
            <div class="text-lg font-bold text-gray-900 mb-2">{{ selectedArticle.subject }}</div>
            <div v-if="selectedArticle.subjectTranslated" class="text-emerald-700 border-t border-gray-200 pt-2 mt-2">
              {{ selectedArticle.subjectTranslated }}
            </div>
          </div>

          <div class="p-4 bg-white/60 rounded-xl border border-white/50">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">内容</label>
            <div class="text-gray-900 whitespace-pre-wrap leading-relaxed">{{ selectedArticle.content }}</div>
             <div v-if="selectedArticle.contentTranslated" class="text-gray-700 bg-emerald-50/50 p-4 rounded-lg mt-4 border border-emerald-100">
              <div class="text-xs font-bold text-emerald-600 mb-2">翻译内容</div>
              <div class="whitespace-pre-wrap leading-relaxed">{{ selectedArticle.contentTranslated }}</div>
            </div>
          </div>

          <div class="flex space-x-4 pt-2">
            <a
              :href="`https://cafe.naver.com/steamindiegame/${selectedArticle.articleId}`"
              target="_blank"
              class="flex-1 bg-blue-600 text-white text-center py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 font-medium"
            >
              查看原帖
            </a>
            <button
              v-if="selectedArticle.subjectTranslated"
              @click="deleteTranslation(selectedArticle.articleId)"
              class="flex-1 bg-amber-500 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200 font-medium"
            >
              删除翻译
            </button>
            <button
              @click="deleteArticle(selectedArticle.articleId); selectedArticle = null"
              class="flex-1 bg-rose-500 text-white py-3 rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200 font-medium"
            >
              删除文章
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 人工翻译模态框 -->
    <div v-if="translateModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- 模态框头部 -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
          <div>
            <h3 class="text-xl font-bold text-gray-900">人工翻译</h3>
            <p class="text-sm text-gray-500 mt-1">编辑翻译内容（支持HTML格式）</p>
          </div>
          <button
            @click="closeTranslateModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 模态框内容 -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- 原文信息 -->
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h4 class="text-sm font-semibold text-gray-700 mb-2">原文标题</h4>
            <p class="text-gray-900">{{ translateModal.article?.subject }}</p>
          </div>

          <!-- 翻译标题 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">翻译标题</label>
            <input
              v-model="translateModal.subjectTranslated"
              type="text"
              class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="输入翻译后的标题"
            />
          </div>

          <!-- 原文内容预览 -->
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h4 class="text-sm font-semibold text-gray-700 mb-2">原文内容（HTML）</h4>
            <div class="max-h-40 overflow-y-auto">
              <pre class="text-xs text-gray-600 whitespace-pre-wrap font-mono">{{ translateModal.article?.contentHtml || translateModal.article?.content }}</pre>
            </div>
          </div>

          <!-- 翻译内容（HTML编辑器） -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">翻译内容（HTML格式）</label>
            <textarea
              v-model="translateModal.contentHtmlTranslated"
              rows="12"
              class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-mono text-sm"
              placeholder="输入翻译后的HTML内容..."
            ></textarea>
            <p class="mt-2 text-xs text-gray-500">提示：可以直接编辑HTML标签，保留图片和格式</p>
          </div>

          <!-- 预览 -->
          <div v-if="translateModal.contentHtmlTranslated" class="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 class="text-sm font-semibold text-blue-700 mb-2">翻译预览</h4>
            <div class="prose prose-sm max-w-none" v-html="translateModal.contentHtmlTranslated"></div>
          </div>
        </div>

        <!-- 模态框底部 -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            @click="closeTranslateModal"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button
            @click="saveManualTranslation"
            :disabled="!translateModal.subjectTranslated || !translateModal.contentHtmlTranslated"
            class="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存翻译
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Settings from './Settings.vue';

const router = useRouter();
const isAuthenticated = ref(false);
const password = ref('');
const loginError = ref('');
const loading = ref(false);
const activeTab = ref('dashboard');

const stats = ref({});
const articles = ref([]);
const selectedArticles = ref([]);
const selectedArticle = ref(null);
const searchQuery = ref('');
const authorFilter = ref('');
const sourceFilter = ref('');
const dateFilter = ref('');
const translateModal = ref({
  show: false,
  article: null,
  subjectTranslated: '',
  contentHtmlTranslated: ''
});
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1
});
const notification = ref(null);

// 显示通知
function showNotification(message, type = 'success') {
  notification.value = { message, type };
  
  // info 类型的通知显示更长时间（10秒），其他类型3秒
  const duration = type === 'info' ? 10000 : 3000;
  
  setTimeout(() => {
    notification.value = null;
  }, duration);
}

onMounted(() => {
  const token = sessionStorage.getItem('settings_token');
  if (token) {
    isAuthenticated.value = true;
    loadStats();
    loadArticles();
  }
});

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
      loadStats();
      loadArticles();
    }
  } catch (error) {
    loginError.value = error.response?.data?.error || '密码错误';
  } finally {
    loading.value = false;
  }
}

function handleLogout() {
  sessionStorage.removeItem('settings_token');
  isAuthenticated.value = false;
  password.value = '';
}

async function loadStats() {
  try {
    const token = sessionStorage.getItem('settings_token');
    const response = await axios.get('http://localhost:8080/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    stats.value = response.data;
  } catch (error) {
    console.error('加载统计失败:', error);
  }
}

async function loadArticles() {
  try {
    const token = sessionStorage.getItem('settings_token');
    const response = await axios.get('http://localhost:8080/api/admin/articles', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        author: authorFilter.value,
        source: sourceFilter.value,
        dateFilter: dateFilter.value
      },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    articles.value = response.data.articles;
    pagination.value = response.data.pagination;
    selectedArticles.value = [];
  } catch (error) {
    console.error('加载文章失败:', error);
  }
}

function toggleSelectAll() {
  if (selectedArticles.value.length === articles.value.length) {
    selectedArticles.value = [];
  } else {
    selectedArticles.value = articles.value.map(a => a.articleId);
  }
}

async function deleteArticle(id) {
  if (!confirm('确定要删除这篇文章吗？此操作不可恢复！')) return;

  try {
    const token = sessionStorage.getItem('settings_token');
    await axios.delete(`http://localhost:8080/api/admin/articles/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    showNotification('文章已删除', 'success');
    loadArticles();
    loadStats();
  } catch (error) {
    showNotification('删除失败: ' + (error.response?.data?.error || error.message), 'error');
  }
}

async function deleteTranslation(id) {
  if (!confirm('确定要删除这篇文章的翻译吗？')) return;

  try {
    const token = sessionStorage.getItem('settings_token');
    await axios.delete(`http://localhost:8080/api/admin/articles/${id}/translation`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    showNotification('翻译已删除', 'success');
    
    // 更新当前显示的文章详情
    if (selectedArticle.value && selectedArticle.value.articleId === id) {
      selectedArticle.value.subjectTranslated = null;
      selectedArticle.value.contentTranslated = null;
      selectedArticle.value.translatedAt = null;
    }
    
    loadArticles();
    loadStats();
  } catch (error) {
    showNotification('删除翻译失败: ' + (error.response?.data?.error || error.message), 'error');
  }
}

async function batchDelete() {
  if (!confirm(`确定要删除选中的 ${selectedArticles.value.length} 篇文章吗？此操作不可恢复！`)) return;

  try {
    const token = sessionStorage.getItem('settings_token');
    await axios.post('http://localhost:8080/api/admin/articles/batch-delete',
      { ids: selectedArticles.value },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    showNotification(`成功删除 ${selectedArticles.value.length} 篇文章`, 'success');
    selectedArticles.value = [];
    loadArticles();
    loadStats();
  } catch (error) {
    showNotification('批量删除失败: ' + (error.response?.data?.error || error.message), 'error');
  }
}

async function batchTranslate() {
  if (!confirm(`确定要翻译选中的 ${selectedArticles.value.length} 篇文章吗？\n\n翻译可能需要较长时间，请耐心等待。`)) return;

  try {
    const token = sessionStorage.getItem('settings_token');
    
    // 显示翻译中的通知
    showNotification(`开始翻译 ${selectedArticles.value.length} 篇文章，请稍候...`, 'info');
    
    const response = await axios.post('http://localhost:8080/api/admin/articles/batch-translate',
      { ids: selectedArticles.value },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (response.data.success) {
      const total = response.data.total;
      showNotification(`正在后台翻译 ${total} 篇文章，请稍后刷新查看结果`, 'info');
      
      // 开始轮询检查翻译进度
      let checkCount = 0;
      const maxChecks = 60; // 最多检查60次（5分钟）
      
      const checkInterval = setInterval(async () => {
        checkCount++;
        
        try {
          // 重新加载文章列表
          await loadArticles();
          
          // 检查选中的文章是否都已翻译
          const articles = await axios.get('http://localhost:8080/api/admin/articles', {
            params: {
              page: pagination.value.page,
              limit: pagination.value.limit
            },
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const selectedIds = selectedArticles.value;
          const translatedCount = articles.data.articles.filter(a => 
            selectedIds.includes(a.articleId) && a.subjectTranslated
          ).length;
          
          if (translatedCount === total) {
            clearInterval(checkInterval);
            showNotification(`翻译完成！成功翻译 ${total} 篇文章`, 'success');
            selectedArticles.value = [];
            await loadStats();
          } else if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
            showNotification(`翻译超时，已完成 ${translatedCount}/${total} 篇`, 'error');
          }
        } catch (error) {
          console.error('检查翻译进度失败:', error);
        }
      }, 5000); // 每5秒检查一次
    }
  } catch (error) {
    showNotification('批量翻译失败: ' + (error.response?.data?.error || error.message), 'error');
  }
}

function viewArticle(article) {
  selectedArticle.value = article;
}

function openTranslateModal(article) {
  translateModal.value = {
    show: true,
    article: article,
    subjectTranslated: article.subjectTranslated || '',
    contentHtmlTranslated: article.contentHtmlTranslated || article.contentHtml || article.content?.replace(/\n/g, '<br>') || ''
  };
}

function closeTranslateModal() {
  translateModal.value = {
    show: false,
    article: null,
    subjectTranslated: '',
    contentHtmlTranslated: ''
  };
}

async function saveManualTranslation() {
  try {
    const articleId = translateModal.value.article.articleId;
    
    showNotification('正在保存翻译...', 'info');
    
    await axios.post(`http://localhost:8080/api/articles/${articleId}/manual-translate`, {
      subjectTranslated: translateModal.value.subjectTranslated,
      contentHtmlTranslated: translateModal.value.contentHtmlTranslated
    });
    
    showNotification('人工翻译保存成功！', 'success');
    closeTranslateModal();
    loadArticles(); // 重新加载文章列表
  } catch (error) {
    showNotification('保存翻译失败: ' + (error.response?.data?.error || error.message), 'error');
  }
}

function prevPage() {
  if (pagination.value.page > 1) {
    pagination.value.page--;
    loadArticles();
  }
}

function nextPage() {
  if (pagination.value.page < pagination.value.totalPages) {
    pagination.value.page++;
    loadArticles();
  }
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN');
}
</script>
