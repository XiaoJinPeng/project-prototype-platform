<script setup>
defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'warning', 'danger', 'info', 'primary'].includes(value),
  },
  label: { type: String, default: '' },
});
</script>

<template>
  <span :class="['ui-status-tag', 'is-' + type]"
    ><slot>{{ label }}</slot></span
  >
</template>

<style scoped>
.ui-status-tag {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  padding: 0 var(--app-space-2);
  border-radius: var(--app-radius-control);
  font-size: var(--app-font-size-xs);
  font-weight: 700;
}
.is-primary {
  color: var(--app-color-primary-text);
  background: var(--app-color-primary-soft);
}
.is-success {
  color: var(--app-color-success-text);
  background: var(--app-color-success-soft);
}
.is-warning {
  color: var(--app-color-warning-text);
  background: var(--app-color-warning-soft);
}
.is-danger {
  color: var(--app-color-danger-text);
  background: var(--app-color-danger-soft);
}
.is-info {
  color: var(--app-color-info-text);
  background: var(--app-color-info-soft);
}
</style>
