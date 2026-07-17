<script setup>
defineProps({
  columns: { type: Number, default: 4 },
  minItemWidth: { type: String, default: '180px' },
});
</script>

<template>
  <div
    class="ui-summary-grid"
    :style="{ '--app-summary-columns': columns, '--app-summary-min-width': minItemWidth }"
  >
    <slot />
  </div>
</template>

<style scoped>
.ui-summary-grid {
  display: grid;
  grid-template-columns: repeat(var(--app-summary-columns), minmax(0, 1fr));
  gap: var(--app-space-3);
}
@media (max-width: 1100px) {
  .ui-summary-grid {
    grid-template-columns: repeat(auto-fit, minmax(var(--app-summary-min-width), 1fr));
  }
}
</style>
