<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  titleClass: { type: [String, Array, Object], default: '' },
  descriptionClass: { type: [String, Array, Object], default: '' },
  unstyled: { type: Boolean, default: false },
});
</script>

<template>
  <header :class="{ 'ui-page-header': !unstyled }">
    <div :class="{ 'ui-page-header__content': !unstyled }">
      <h1 :class="titleClass">{{ title }}</h1>
      <p v-if="description" :class="descriptionClass">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" :class="{ 'ui-page-header__actions': !unstyled }">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.ui-page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--app-space-5);
  margin-bottom: var(--app-space-6);
}
.ui-page-header__content {
  min-width: 0;
}
.ui-page-header h1 {
  margin: 0;
  color: var(--app-color-text-primary);
  font-size: var(--app-font-size-page-title);
  line-height: 1.25;
}
.ui-page-header p {
  margin: var(--app-space-1) 0 0;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-base);
}
.ui-page-header__actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--app-space-3);
}
</style>
