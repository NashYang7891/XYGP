<template>
  <div class="register-page">
    <el-card class="register-card">
      <template #header><span>用户注册</span></template>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="账号或邮箱" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" show-password />
        </el-form-item>
        <el-form-item prop="invite_code">
          <el-input v-model="form.invite_code" placeholder="邀请码 (888888)" size="large" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="submit" style="width:100%">注册</el-button>
        </el-form-item>
        <div class="tips">已有账号？ <router-link to="/login">去登录</router-link></div>
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
const form = reactive({ username: '', password: '', invite_code: '888888' })
const rules = {
  username: [{ required: true, message: '请输入账号' }],
  password: [{ required: true, message: '请输入密码', min: 6 }],
  invite_code: [{ required: true, message: '请输入邀请码' }],
}

async function submit() {
  await formRef.value?.validate()
  loading.value = true
  try {
    await userStore.doRegister(form)
    ElMessage.success('注册成功')
    router.push('/')
  } catch (e) {
    ElMessage.error(e.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}
.register-card { width: 400px; }
.tips { text-align: center; color: #666; }
.tips a { color: #409eff; }
</style>
