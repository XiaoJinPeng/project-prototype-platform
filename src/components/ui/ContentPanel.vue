<script setup>
defineProps({
  as: { type: String, default: 'section' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  padded: { type: Boolean, default: true },
  compact: { type: Boolean, default: false },
  headerBorder: { type: Boolean, default: true },
});
</script>

<template>
  <component :is="as" :class="['ui-content-panel', { 'is-compact': compact }]">
    <header
      v-if="title || description || $slots.header || $slots.meta || $slots.actions"
      :class="['ui-content-panel__header', { 'has-border': headerBorder }]"
    >
      <slot name="header">
        <div class="ui-content-panel__heading">
          <h2 v-if="title">{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>
      </slot>
      <div v-if="$slots.meta || $slots.actions" class="ui-content-panel__header-end">
        <div v-if="$slots.meta" class="ui-content-panel__meta"><slot name="meta" /></div>
        <div v-if="$slots.actions" class="ui-content-panel__actions"><slot name="actions" /></div>
      </div>
    </header>
    <div :class="['ui-content-panel__body', { 'is-padded': padded }]"><slot /></div>
  </component>
</template>

<style scoped>
.ui-content-panel {
  overflow: hidden;
  border: 1px solid var(--app-color-border);
  border-radius: var(--app-radius-panel);
  background: var(--app-color-surface);
  box-shadow: var(--app-shadow-panel);
}
.ui-content-panel__header {
  display: flex;
  min-height: var(--app-panel-header-height);
  align-items: center;
  justify-content: space-between;
  gap: var(--app-space-4);
  padding: 0 var(--app-space-5);
}
.ui-content-panel__header.has-border {
  border-bottom: 1px solid var(--app-color-border-light);
}
.ui-content-panel__heading {
  min-width: 0;
}
.ui-content-panel__header h2 {
  margin: 0;
  font-size: var(--app-font-size-md);
}
.ui-content-panel__header p {
  margin: 3px 0 0;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
}
.ui-content-panel__header-end,
.ui-content-panel__actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--app-space-2);
}
.ui-content-panel__meta {
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-xs);
}
.ui-content-panel__body.is-padded {
  padding: var(--app-space-4);
}
.ui-content-panel.is-compact .ui-content-panel__header {
  min-height: 44px;
  padding: 0 var(--app-space-4);
}
.ui-content-panel.is-compact .ui-content-panel__body.is-padded {
  padding: var(--app-space-3);
}
@media (max-width: 760px) {
  .ui-content-panel__header {
    align-items: flex-start;
    flex-direction: column;
    padding-top: var(--app-space-3);
    padding-bottom: var(--app-space-3);
  }
  .ui-content-panel__header-end {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
