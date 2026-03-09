<template>
  <div class="admin-users">
    <el-card>
      <template #header><span>用户列表</span></template>
      <el-table :data="list" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="invite_code" label="邀请码" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">{{ row.status === 1 ? '正常' : '禁用' }}</template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180" />
      </el-table>
      <el-pagination
        v-model:current-page="page"
        :page-size="size"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="load"
        style="margin-top:16px"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '../../api/request'

const list = ref([])
const page = ref(1)
const size = ref(20)
const total = ref(0)

async function load() {
  try {
    const res = await adminApi.get('/users', { params: { page: page.value, size: size.value } })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch {}
}

onMounted(load)
</script>
