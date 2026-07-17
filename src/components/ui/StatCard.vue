<script setup>
defineProps({
  as: { type: String, default: 'button' },
  label: { type: String, default: '' },
  value: { type: [String, Number], default: '' },
  helper: { type: String, default: '' },
  active: { type: Boolean, default: false },
  interactive: { type: Boolean, default: true },
});
</script>

<template>
  <component
    :is="as"
    class="ui-stat-card"
    :class="{ 'is-active': active, 'is-interactive': interactive }"
    :type="as === 'button' ? 'button' : undefined"
    :aria-pressed="interactive ? active : undefined"
  >
    <slot name="label"
      ><span class="ui-stat-card__label">{{ label }}</span></slot
    >
    <slot name="value"
      ><strong class="ui-stat-card__value">{{ value }}</strong></slot
    >
    <slot
      ><small v-if="helper" class="ui-stat-card__helper">{{ helper }}</small></slot
    >
  </component>
</template>

<style scoped>
.ui-stat-card {
  display: flex;
  min-height: 96px;
  width: 100%;
  flex-direction: column;
  padding: var(--app-space-4);
  text-align: left;
  border: 1px solid var(--app-color-border-light);
  border-radius: var(--app-radius-panel);
  background: var(--app-color-surface);
}
.ui-stat-card.is-interactive {
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    box-shadow 160ms ease;
}
.ui-stat-card.is-interactive:hover,
.ui-stat-card.is-active {
  border-color: var(--app-color-primary);
  background: var(--app-color-primary-soft);
}
.ui-stat-card.is-active {
  box-shadow: 0 0 0 1px var(--app-color-primary);
}
.ui-stat-card__label {
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
  font-weight: 600;
}
.ui-stat-card__value {
  margin-top: var(--app-space-2);
  color: var(--app-color-text-primary);
  font-size: 26px;
  line-height: 1;
}
.ui-stat-card__helper {
  margin-top: auto;
  padding-top: var(--app-space-2);
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-xs);
}
</style>
