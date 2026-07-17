<template>
  <div class="ui-table-toolbar">
    <div class="ui-table-toolbar__main"><slot /></div>
    <div v-if="$slots.actions" class="ui-table-toolbar__actions"><slot name="actions" /></div>
  </div>
</template>

<style scoped>
.ui-table-toolbar {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: var(--app-space-4);
  padding: var(--app-space-3) var(--app-space-4);
  border-bottom: 1px solid var(--app-color-border-light);
}
.ui-table-toolbar__main,
.ui-table-toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--app-space-2);
}
.ui-table-toolbar__main {
  min-width: 0;
  flex: 1;
}
.ui-table-toolbar__actions {
  flex: 0 0 auto;
}
</style>
