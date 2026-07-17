<script setup>
defineProps({
  title: { type: String, default: '' },
  totalText: { type: String, default: '' },
  loading: { type: Boolean, default: false },
});
</script>

<template>
  <section class="ui-data-table-panel" v-loading="loading">
    <header v-if="title || totalText || $slots.toolbar || $slots.actions" class="ui-data-table-panel__header">
      <div class="ui-data-table-panel__heading">
        <slot name="toolbar">
          <h2 v-if="title">{{ title }}</h2>
          <span v-if="totalText">{{ totalText }}</span>
        </slot>
      </div>
      <div v-if="$slots.actions" class="ui-data-table-panel__actions"><slot name="actions" /></div>
    </header>
    <div v-if="$slots.filters" class="ui-data-table-panel__filters"><slot name="filters" /></div>
    <div class="ui-data-table-panel__table"><slot /></div>
    <footer v-if="$slots.pagination" class="ui-data-table-panel__pagination">
      <slot name="pagination" />
    </footer>
  </section>
</template>

<style scoped>
.ui-data-table-panel {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--app-color-border-subtle);
  border-radius: var(--app-radius-list-panel);
  background: var(--app-color-surface);
  box-shadow: var(--app-shadow-panel);
}
.ui-data-table-panel__header {
  display: flex;
  min-height: var(--app-panel-header-height);
  align-items: center;
  justify-content: space-between;
  gap: var(--app-space-4);
  padding: 0 var(--app-space-4);
  border-bottom: 1px solid var(--app-color-border-light);
}
.ui-data-table-panel__heading,
.ui-data-table-panel__actions {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--app-space-2);
}
.ui-data-table-panel__heading h2 {
  margin: 0;
  font-size: var(--app-font-size-md);
}
.ui-data-table-panel__heading span {
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
}
.ui-data-table-panel__actions {
  flex: 0 0 auto;
}
.ui-data-table-panel__table {
  min-width: 0;
}
:deep(.ui-data-table-panel__table .el-table th.el-table__cell) {
  color: var(--app-color-text-secondary);
  font-weight: 700;
  background: var(--app-color-surface-muted);
}
</style>
