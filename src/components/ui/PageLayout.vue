<script setup>
defineProps({
  as: { type: String, default: 'div' },
  compact: { type: Boolean, default: false },
  maxWidth: { type: String, default: '' },
});
</script>

<template>
  <component
    :is="as"
    :class="['ui-page-layout', { 'is-compact': compact }]"
    :style="maxWidth ? { maxWidth } : undefined"
  >
    <slot />
  </component>
</template>

<style scoped>
.ui-page-layout {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: var(--app-space-5);
  margin: 0 auto;
}
.ui-page-layout.is-compact {
  gap: var(--app-space-3);
}
</style>
