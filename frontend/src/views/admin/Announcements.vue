<template>
  <div class="admin-announcements">
    <el-card>
      <template #header>
        <span>公告管理</span>
        <el-button type="primary" size="small" @click="showAdd" style="float:right">添加公告</el-button>
      </template>
      <el-table :data="list" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="is_active" label="状态" width="80">
          <template #default="{ row }">{{ row.is_active ? '启用' : '禁用' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="edit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑公告' : '添加公告'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" rows="4" /></el-form-item>
        <el-form-item v-if="editing" label="启用">
          <el-switch v-model="form.is_active" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '../../api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([])
const dialogVisible = ref(false)
const editing = ref(false)
const form = reactive({ id: null, title: '', content: '', is_active: 1 })

async function load() {
  try {
    const res = await adminApi.get('/announcements')
    list.value = res.data || []
  } catch {}
}

function showAdd() {
  editing.value = false
  form.id = null
  form.title = ''
  form.content = ''
  form.is_active = 1
  dialogVisible.value = true
}

function edit(row) {
  editing.value = true
  form.id = row.id
  form.title = row.title
  form.content = row.content
  form.is_active = row.is_active
  dialogVisible.value = true
}

async function save() {
  if (!form.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  try {
    if (editing.value) {
      await adminApi.put(`/announcements/${form.id}`, { title: form.title, content: form.content, is_active: form.is_active })
    } else {
      await adminApi.post('/announcements', { title: form.title, content: form.content })
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    load()
  } catch (e) {
    ElMessage.error(e.msg || '保存失败')
  }
}

async function del(row) {
  await ElMessageBox.confirm('确定删除？', '提示')
  try {
    await adminApi.delete(`/announcements/${row.id}`)
    ElMessage.success('删除成功')
    load()
  } catch (e) {
    ElMessage.error(e.msg || '删除失败')
  }
}

onMounted(load)
</script>
