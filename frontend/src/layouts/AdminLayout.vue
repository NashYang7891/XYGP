<template>
  <el-container class="admin-layout" v-if="isAdminPage">
    <el-aside width="200px" class="aside">
      <div class="logo">后台管理</div>
      <el-menu :default-active="$route.path" router>
        <el-menu-item index="/admin/">首页</el-menu-item>
        <el-menu-item index="/admin/users">用户管理</el-menu-item>
        <el-menu-item index="/admin/stocks">股票管理</el-menu-item>
        <el-menu-item index="/admin/announcements">公告管理</el-menu-item>
        <el-menu-item index="/admin/invite-codes">邀请码</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="admin-header">
        <span></span>
        <el-button v-if="hasAdminToken" type="danger" size="small" @click="logout">退出</el-button>
      </el-header>
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
  <router-view v-else />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const isAdminPage = computed(() => route.path.startsWith('/admin') && route.path !== '/admin/login')
const hasAdminToken = computed(() => !!localStorage.getItem('admin_token'))

function logout() {
  localStorage.removeItem('admin_token')
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-layout { height: 100vh; }
.aside { background: #304156; }
.logo { color: #fff; padding: 20px; font-weight: bold; }
.el-menu { border: none; background: #304156; }
.el-menu-item { color: #bfcbd9; }
.el-menu-item.is-active { color: #409eff; background: #263445; }
.admin-header { background: #fff; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; border-bottom: 1px solid #eee; }
.admin-main { background: #f0f2f5; padding: 20px; overflow: auto; }
</style>
