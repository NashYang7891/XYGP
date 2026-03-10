<template>
  <div class="login-page">
    <el-card class="login-card">
      <template #header>
        <span>用户登录</span>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="账号或邮箱 (test / test@qq.com)" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码 (123456)" size="large" show-password />
        </el-form-item>
        <el-form-item prop="invite_code">
          <el-input v-model="form.invite_code" placeholder="邀请码 (注册时需要)" size="large" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="submit" style="width:100%">登录</el-button>
        </el-form-item>
        <div class="tips">没有账号？ <router-link to="/register">立即注册</router-link></div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)
const form = reactive({ username: '', password: '', invite_code: '' })
const rules = {
  username: [{ required: true, message: '请输入账号' }],
  password: [{ required: true, message: '请输入密码' }],
}

async function submit() {
  await formRef.value?.validate()
  loading.value = true
  try {
    await userStore.doLogin(form)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e) {
    ElMessage.error(e?.msg || e?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}
.login-card { width: 400px; }
.tips { text-align: center; color: #666; }
.tips a { color: #409eff; }
</style>
