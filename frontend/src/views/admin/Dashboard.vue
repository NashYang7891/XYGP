<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card><el-statistic title="用户数" :value="stats.users" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card><el-statistic title="股票数" :value="stats.stocks" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card><el-statistic title="公告数" :value="stats.announcements" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card><el-statistic title="邀请码数" :value="stats.inviteCodes" /></el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '../../api/request'

const stats = ref({ users: 0, stocks: 0, announcements: 0, inviteCodes: 0 })

onMounted(async () => {
  try {
    const [u, s, a, i] = await Promise.all([
      adminApi.get('/users?size=1'),
      adminApi.get('/stocks?size=1'),
      adminApi.get('/announcements'),
      adminApi.get('/invite_codes'),
    ])
    stats.value = {
      users: u.data?.total ?? 0,
      stocks: s.data?.total ?? 0,
      announcements: (a.data || []).length,
      inviteCodes: (i.data || []).length,
    }
  } catch {}
})
</script>
