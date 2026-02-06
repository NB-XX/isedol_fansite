import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import VueLazyload from 'vue3-lazy'
import './style.css'
import App from './App.vue'
import Home from './views/Home.vue'
import Settings from './views/Settings.vue'
import Admin from './views/Admin.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin
    }
  ]
})

const app = createApp(App)
app.use(router)
app.use(VueLazyload, {
  loading: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="40" fill="%23f0f0f0"/%3E%3C/svg%3E',
  error: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="40" fill="%23e0e0e0"/%3E%3C/svg%3E'
})
app.mount('#app')

