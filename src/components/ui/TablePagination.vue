<script setup>
defineProps({
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  pageSizes: { type: Array, default: () => [10, 20, 50] },
  total: { type: Number, default: 0 },
  layout: { type: String, default: 'total, sizes, prev, pager, next, jumper' },
  background: { type: Boolean, default: true },
  small: { type: Boolean, default: false },
});
defineEmits(['update:currentPage', 'update:pageSize', 'current-change', 'size-change']);
</script>

<template>
  <div class="ui-table-pagination">
    <slot name="summary" />
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="pageSizes"
      :total="total"
      :layout="layout"
      :background="background"
      :small="small"
      @update:current-page="$emit('update:currentPage', $event)"
      @update:page-size="$emit('update:pageSize', $event)"
      @current-change="$emit('current-change', $event)"
      @size-change="$emit('size-change', $event)"
    />
  </div>
</template>

<style scoped>
.ui-table-pagination {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: flex-end;
  gap: var(--app-space-4);
  padding: var(--app-space-4);
  border-top: 1px solid var(--app-color-border-light);
  background: var(--app-color-surface-muted);
}
</style>
