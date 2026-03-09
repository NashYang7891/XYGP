<template>
  <div class="admin-stocks">
    <el-card>
      <template #header>
        <span>股票管理</span>
        <el-button type="primary" size="small" @click="showAdd" style="float:right">添加股票</el-button>
      </template>
      <el-input v-model="searchKey" placeholder="搜索" style="width:200px;margin-bottom:12px" @input="load" />
      <el-table :data="list" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="symbol" label="代码" width="120" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="exchange" label="交易所" width="100" />
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
    <el-dialog v-model="addVisible" title="添加股票" width="400px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="代码"><el-input v-model="addForm.symbol" placeholder="如 AAPL" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="addForm.name" placeholder="如 Apple Inc" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible=false">取消</el-button>
        <el-button type="primary" @click="doAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '../../api/request'
import { ElMessage } from 'element-plus'

const list = ref([])
const page = ref(1)
const size = ref(20)
const total = ref(0)
const searchKey = ref('')
const addVisible = ref(false)
const addForm = reactive({ symbol: '', name: '' })

async function load() {
  try {
    const res = await adminApi.get('/stocks', {
      params: { page: page.value, size: size.value, q: searchKey.value || undefined },
    })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch {}
}

function showAdd() {
  addForm.symbol = ''
  addForm.name = ''
  addVisible.value = true
}

async function doAdd() {
  if (!addForm.symbol.trim()) {
    ElMessage.warning('请输入股票代码')
    return
  }
  try {
    await adminApi.post('/stocks', { symbol: addForm.symbol.trim(), name: addForm.name || addForm.symbol })
    ElMessage.success('添加成功')
    addVisible.value = false
    load()
  } catch (e) {
    ElMessage.error(e.msg || '添加失败')
  }
}

onMounted(load)
</script>
