<script setup>
import { ArrowDown, ArrowUp, Filter } from '@element-plus/icons-vue';
import { computed, useSlots } from 'vue';

const props = defineProps({
  advancedOpen: { type: Boolean, default: false },
  advancedCount: { type: Number, default: 0 },
  advancedText: { type: String, default: '更多筛选' },
  collapseText: { type: String, default: '收起筛选' },
});

const emit = defineEmits(['update:advancedOpen', 'advanced-change']);
const slots = useSlots();
const hasAdvanced = computed(() => Boolean(slots.advanced));

function toggleAdvanced() {
  const value = !props.advancedOpen;
  emit('update:advancedOpen', value);
  emit('advanced-change', value);
}
</script>

<template>
  <div class="ui-filter-bar">
    <div class="ui-filter-bar__fields">
      <slot />
      <el-button
        v-if="hasAdvanced"
        class="ui-filter-bar__advanced-toggle"
        :icon="Filter"
        plain
        @click="toggleAdvanced"
      >
        {{ advancedOpen ? collapseText : advancedText }}
        <span v-if="advancedCount > 0" class="ui-filter-bar__advanced-count">{{ advancedCount }}</span>
        <el-icon class="ui-filter-bar__advanced-arrow">
          <ArrowUp v-if="advancedOpen" />
          <ArrowDown v-else />
        </el-icon>
      </el-button>
    </div>
    <div v-if="$slots.actions" class="ui-filter-bar__actions"><slot name="actions" /></div>
    <div v-if="$slots.summary" class="ui-filter-bar__summary"><slot name="summary" /></div>
    <div v-if="hasAdvanced && advancedOpen" class="ui-filter-bar__advanced"><slot name="advanced" /></div>
  </div>
</template>

<style scoped>
.ui-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--app-space-3);
  min-height: 60px;
  padding: var(--app-space-4);
  border-bottom: 1px solid var(--app-color-border-light);
  background: var(--app-color-surface-muted);
}
.ui-filter-bar__fields {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--app-space-3);
}
.ui-filter-bar__actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--app-space-2);
}
.ui-filter-bar__summary {
  flex: 0 0 auto;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-base);
}
.ui-filter-bar__advanced {
  flex: 0 0 100%;
  padding-top: var(--app-space-3);
  border-top: 1px solid var(--app-color-border-light);
}
.ui-filter-bar__advanced-toggle {
  margin-left: 0;
}
.ui-filter-bar__advanced-count {
  display: inline-flex;
  min-width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--app-color-primary-soft);
  color: var(--app-color-primary);
  font-size: var(--app-font-size-xs);
  font-weight: 700;
}
.ui-filter-bar__advanced-arrow {
  margin-left: 4px;
}
</style>
