<template>
  <div class="topic-page" v-if="topic">
    <el-page-header @back="$router.push('/')" title="返回">
      <template #content>
        <span class="page-title">{{ topic.title }}</span>
      </template>
    </el-page-header>
    <p class="intro">{{ topic.intro }}</p>
    <section v-for="(s, i) in topic.sections" :key="i" class="block">
      <h3>{{ s.h }}</h3>
      <p>{{ s.p }}</p>
    </section>
    <div class="links" v-if="topic.links?.length">
      <span class="label">相关入口：</span>
      <template v-for="(l, j) in topic.links" :key="j">
        <el-button v-if="l.path" type="primary" link @click="$router.push(l.path)">{{ l.text }}</el-button>
        <el-button v-else-if="l.topic" type="primary" link @click="$router.push(`/topic/${l.topic}`)">{{ l.text }}</el-button>
      </template>
    </div>
  </div>
  <el-empty v-else description="未找到该专题" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getTopic } from '../data/marketTopics'

const route = useRoute()
const topic = computed(() => getTopic(route.params.slug))
</script>

<style scoped>
.topic-page { max-width: 800px; margin: 0 auto; }
.page-title { font-size: 18px; font-weight: 600; color: var(--xy-text, #0f172a); }
.intro { color: #64748b; line-height: 1.7; margin: 16px 0; }
.block { margin-bottom: 20px; }
.block h3 { font-size: 15px; margin-bottom: 8px; color: #0f172a; }
.block p { margin: 0; color: #475569; line-height: 1.65; }
.links { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
.label { color: #64748b; font-size: 14px; margin-right: 8px; }
</style>
