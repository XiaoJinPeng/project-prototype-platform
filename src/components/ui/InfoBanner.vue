<script setup>
defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'danger'].includes(value),
  },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
});
</script>

<template>
  <aside :class="['ui-info-banner', 'is-' + type]">
    <div class="ui-info-banner__content">
      <strong v-if="title">{{ title }}</strong>
      <p v-if="description">{{ description }}</p>
      <slot />
    </div>
    <div v-if="$slots.actions" class="ui-info-banner__actions"><slot name="actions" /></div>
  </aside>
</template>

<style scoped>
.ui-info-banner {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: var(--app-space-4);
  padding: var(--app-space-3) var(--app-space-4);
  border: 1px solid;
  border-radius: var(--app-radius-panel);
}
.ui-info-banner__content {
  min-width: 0;
}
.ui-info-banner strong {
  display: block;
  font-size: var(--app-font-size-base);
}
.ui-info-banner p {
  margin: var(--app-space-1) 0 0;
  color: var(--app-color-text-secondary);
  font-size: var(--app-font-size-sm);
}
.ui-info-banner__actions {
  flex: 0 0 auto;
}
.ui-info-banner.is-info {
  border-color: var(--app-color-primary-border);
  background: var(--app-color-primary-soft);
}
.ui-info-banner.is-success {
  border-color: var(--app-color-success-border);
  background: var(--app-color-success-soft);
}
.ui-info-banner.is-warning {
  border-color: var(--app-color-warning-border);
  background: var(--app-color-warning-soft);
}
.ui-info-banner.is-danger {
  border-color: var(--app-color-danger-border);
  background: var(--app-color-danger-soft);
}
</style>
