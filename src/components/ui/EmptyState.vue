<script setup>
defineProps({
  title: { type: String, default: '暂无数据' },
  description: { type: String, default: '' },
  imageSize: { type: Number, default: 72 },
});
</script>

<template>
  <div class="ui-empty-state">
    <el-empty :description="title" :image-size="imageSize">
      <p v-if="description" class="ui-empty-state__description">{{ description }}</p>
      <div v-if="$slots.actions" class="ui-empty-state__actions"><slot name="actions" /></div>
    </el-empty>
  </div>
</template>

<style scoped>
.ui-empty-state {
  display: grid;
  min-height: 220px;
  place-items: center;
  padding: var(--app-space-6);
}
.ui-empty-state__description {
  margin: 0 0 var(--app-space-3);
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
}
.ui-empty-state__actions {
  display: flex;
  justify-content: center;
  gap: var(--app-space-2);
}
</style>
