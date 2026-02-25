// 图片代理工具
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js'

/**
 * 检查图片 URL 是否需要代理
 * @param {string} url - 图片 URL
 * @returns {boolean}
 */
export function needsProxy(url) {
  if (!url) return false
  
  // Naver 相关域名需要代理
  const naverDomains = [
    'cafeptthumb-phinf.pstatic.net',
    'storep-phinf.pstatic.net',
    'blogpfthumb-phinf.pstatic.net',
    'phinf.pstatic.net'
  ]
  
  return naverDomains.some(domain => url.includes(domain))
}

/**
 * 获取代理后的图片 URL
 * @param {string} url - 原始图片 URL
 * @returns {string}
 */
export function getProxiedImageUrl(url) {
  if (!url || !needsProxy(url)) {
    return url
  }
  
  // 使用 Cloudflare Workers 图片代理
  return buildApiUrl(`/api/proxy/image?url=${encodeURIComponent(url)}`)
}

/**
 * 处理 HTML 内容中的图片
 * @param {string} html - HTML 内容
 * @returns {string}
 */
export function proxyImagesInHtml(html) {
  if (!html) return html
  
  // 替换 img 标签的 src 属性
  return html.replace(/<img([^>]*?)src=["']([^"']+)["']/gi, (match, attrs, src) => {
    const proxiedSrc = getProxiedImageUrl(src)
    return `<img${attrs}src="${proxiedSrc}"`
  })
}

/**
 * Vue 指令：自动代理图片
 * 使用方法：<img v-proxy-image="imageUrl" />
 */
export const proxyImageDirective = {
  mounted(el, binding) {
    if (el.tagName === 'IMG' && binding.value) {
      el.src = getProxiedImageUrl(binding.value)
    }
  },
  updated(el, binding) {
    if (el.tagName === 'IMG' && binding.value) {
      el.src = getProxiedImageUrl(binding.value)
    }
  }
}
