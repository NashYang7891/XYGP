<template>
  <div class="admin-login-page">
    <el-card class="login-card">
      <template #header><span>后台管理登录</span></template>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="账号 (admin)" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码 (admin123456)" size="large" show-password />
        </el-form-item>
        <el-form-item prop="security_code">
          <el-input v-model="form.security_code" placeholder="安全码 (test66)" size="large" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="submit" style="width:100%">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { adminApi } from '../../api/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = reactive({ username: 'admin', password: 'admin123456', security_code: 'test66' })
const rules = {
  username: [{ required: true, message: '请输入账号' }],
  password: [{ required: true, message: '请输入密码' }],
  security_code: [{ required: true, message: '请输入安全码' }],
}

async function submit() {
  await formRef.value?.validate()
  loading.value = true
  try {
    const res = await adminApi.post('/auth/login', form)
    if (res.code === 0) {
      localStorage.setItem('admin_token', res.data.token)
      ElMessage.success('登录成功')
      router.push('/admin/')
    } else {
      ElMessage.error(res.msg || '登录失败')
    }
  } catch (e) {
    ElMessage.error(e.msg || e.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}
.login-card { width: 400px; }
</style>
