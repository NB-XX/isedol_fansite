import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
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
app.mount('#app')
