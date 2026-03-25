<template>
  <el-container class="main-layout">
    <el-header class="header">
      <div class="brand" @click="$router.push('/')">
        <span class="logo-mark">XY</span>
        <div class="brand-text">
          <span class="title">日股行情</span>
          <span class="tagline">日本股票 · 专业看盘</span>
        </div>
      </div>

      <div class="nav-scroll">
        <el-menu mode="horizontal" :default-active="activeMenu" router class="top-menu">
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/intraday">日内</el-menu-item>
          <el-menu-item index="/etf">ETF</el-menu-item>
          <el-menu-item index="/watchlist">自选股</el-menu-item>
        </el-menu>
      </div>

      <div class="user-area">
        <span v-if="userStore.user" class="username">{{ userStore.user.username }}</span>
        <el-button v-if="userStore.user" type="danger" size="small" @click="logout">退出</el-button>
      </div>
    </el-header>

    <el-main class="main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../store/user'
import { useRouter, useRoute } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => {
  const p = route.path
  if (p.startsWith('/stock')) return '/'
  if (p === '/intraday') return '/intraday'
  if (p === '/etf') return '/etf'
  if (p === '/watchlist') return '/watchlist'
  return p === '/' ? '/' : p
})

function logout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.main-layout { height: 100%; flex-direction: column; }
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #0c1929 0%, #132a45 50%, #0f172a 100%);
  color: #fff;
  padding: 0 16px 0 20px;
  border-bottom: 1px solid rgba(245, 158, 11, 0.25);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
}
.logo-mark {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(145deg, #f59e0b, #d97706);
  color: #0d1520;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-text { display: flex; flex-direction: column; line-height: 1.2; }
.title { font-size: 17px; font-weight: 700; color: #f8fafc; }
.tagline { font-size: 11px; color: #94a3b8; }

.nav-scroll {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.top-menu {
  background: transparent !important;
  border: none !important;
  min-width: max-content;
}
:deep(.el-menu--horizontal) { border: none !important; }
:deep(.el-menu--horizontal > .el-menu-item) {
  color: #cbd5e1 !important;
  border-bottom: 2px solid transparent !important;
}
:deep(.el-menu--horizontal > .el-menu-item:hover) {
  color: #fbbf24 !important;
  background: rgba(245, 158, 11, 0.08) !important;
}
:deep(.el-menu--horizontal > .el-menu-item.is-active) {
  color: #fbbf24 !important;
  border-bottom-color: #f59e0b !important;
  background: transparent !important;
}

.user-area { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.username { font-size: 14px; color: #e2e8f0; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.main {
  flex: 1;
  overflow: auto;
  padding: 20px 16px;
  background: linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%);
  min-height: 0;
}
</style>
