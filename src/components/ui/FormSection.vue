<script setup>
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  columns: { type: Number, default: 2 },
});
</script>

<template>
  <section class="ui-form-section">
    <header v-if="title || description || $slots.actions" class="ui-form-section__header">
      <div>
        <h3 v-if="title">{{ title }}</h3>
        <p v-if="description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="ui-form-section__actions"><slot name="actions" /></div>
    </header>
    <div class="ui-form-section__body" :style="{ '--app-form-columns': columns }"><slot /></div>
  </section>
</template>

<style scoped>
.ui-form-section {
  min-width: 0;
}
.ui-form-section + .ui-form-section {
  margin-top: var(--app-space-6);
  padding-top: var(--app-space-5);
  border-top: 1px solid var(--app-color-border-light);
}
.ui-form-section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--app-space-4);
  margin-bottom: var(--app-space-4);
}
.ui-form-section h3 {
  margin: 0;
  font-size: var(--app-font-size-md);
}
.ui-form-section p {
  margin: var(--app-space-1) 0 0;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
}
.ui-form-section__actions {
  flex: 0 0 auto;
}
.ui-form-section__body {
  display: grid;
  grid-template-columns: repeat(var(--app-form-columns), minmax(0, 1fr));
  gap: 0 var(--app-space-4);
}
@media (max-width: 760px) {
  .ui-form-section__body {
    grid-template-columns: 1fr;
  }
}
</style>
