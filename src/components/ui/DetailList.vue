<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  columns: { type: Number, default: 2 },
  bordered: { type: Boolean, default: true },
  compact: { type: Boolean, default: false },
  labelWidth: { type: String, default: '32%' },
});
</script>

<template>
  <dl
    :class="['ui-detail-list', { 'is-bordered': bordered, 'is-compact': compact }]"
    :style="{ '--app-detail-columns': columns, '--app-detail-label-width': labelWidth }"
  >
    <div
      v-for="(item, index) in items"
      :key="item.key || item.label || index"
      class="ui-detail-list__item"
      :style="{ gridColumn: 'span ' + Math.min(item.span || 1, columns) }"
    >
      <dt>{{ item.label }}</dt>
      <dd>
        <slot name="value" :item="item">{{ item.value ?? '-' }}</slot>
      </dd>
    </div>
  </dl>
</template>

<style scoped>
.ui-detail-list {
  display: grid;
  grid-template-columns: repeat(var(--app-detail-columns), minmax(0, 1fr));
  margin: 0;
  font-size: var(--app-font-size-base);
  line-height: 1.5;
}
.ui-detail-list__item {
  display: grid;
  grid-template-columns: minmax(96px, var(--app-detail-label-width)) minmax(0, 1fr);
  min-height: 48px;
}
.ui-detail-list__item dt,
.ui-detail-list__item dd {
  display: flex;
  min-width: 0;
  align-items: center;
  margin: 0;
  padding: var(--app-space-2) var(--app-space-3);
}
.ui-detail-list__item dt {
  background: var(--app-color-surface-subtle);
  color: var(--app-color-text-secondary);
  font-weight: 600;
}
.ui-detail-list__item dd {
  color: var(--app-color-text-primary);
  font-weight: 400;
}
.ui-detail-list.is-bordered {
  overflow: hidden;
  border: 1px solid var(--app-color-border-light);
  border-radius: var(--app-radius-control);
}
.ui-detail-list.is-bordered .ui-detail-list__item {
  margin: -1px 0 0 -1px;
  border-top: 1px solid var(--app-color-border-light);
  border-left: 1px solid var(--app-color-border-light);
}
.ui-detail-list.is-compact .ui-detail-list__item {
  min-height: 40px;
}
.ui-detail-list.is-compact .ui-detail-list__item dt,
.ui-detail-list.is-compact .ui-detail-list__item dd {
  padding: var(--app-space-2);
}
@media (max-width: 760px) {
  .ui-detail-list {
    grid-template-columns: 1fr;
  }
  .ui-detail-list__item {
    grid-column: span 1 !important;
  }
}
</style>
