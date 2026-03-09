<template>
  <div class="admin-invite-codes">
    <el-card>
      <template #header><span>邀请码列表</span></template>
      <el-table :data="list" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="code" label="邀请码" width="120" />
        <el-table-column prop="total_count" label="总量" width="80" />
        <el-table-column prop="used_count" label="已用" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">{{ row.status === 1 ? '启用' : '禁用' }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '../../api/request'

const list = ref([])

async function load() {
  try {
    const res = await adminApi.get('/invite_codes')
    list.value = res.data || []
  } catch {}
}

onMounted(load)
</script>
