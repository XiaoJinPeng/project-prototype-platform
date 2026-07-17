<template>
  <main class="project-unavailable">
    <el-result icon="warning" title="项目不可用" :sub-title="`未发现项目包：${projectId}`">
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回项目首页</el-button>
      </template>
    </el-result>
  </main>
</template>

<script setup>
defineProps({ projectId: { type: String, required: true } });
</script>

<style scoped>
.project-unavailable {
  min-height: 100svh;
  display: grid;
  place-items: center;
  background: var(--app-color-page);
}
</style>
