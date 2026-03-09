<template>
  <el-container class="main-layout">
    <el-header class="header">
      <div class="logo" @click="$router.push('/')">日本股票管理</div>
      <el-menu mode="horizontal" :default-active="$route.path" router>
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/watchlist">自选股</el-menu-item>
      </el-menu>
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
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

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
  background: #1a1a2e;
  color: #fff;
  padding: 0 20px;
}
.logo {
  font-size: 18px;
  font-weight: bold;
  margin-right: 40px;
  cursor: pointer;
}
.el-menu { flex: 1; background: transparent; border: none; }
.el-menu--horizontal > .el-menu-item { color: #eee; }
.el-menu--horizontal > .el-menu-item.is-active { color: #409eff; }
.user-area { display: flex; align-items: center; gap: 12px; }
.username { font-size: 14px; }
.main { flex: 1; overflow: auto; padding: 20px; background: #f5f7fa; }
</style>
