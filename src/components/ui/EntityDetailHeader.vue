<script setup>
import { ArrowLeft } from '@element-plus/icons-vue';

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  leadingText: { type: String, default: '' },
  showLeading: { type: Boolean, default: true },
  showBack: { type: Boolean, default: true },
  backText: { type: String, default: '返回' },
  tags: { type: Array, default: () => [] },
  metaItems: { type: Array, default: () => [] },
});

const emit = defineEmits(['back']);
</script>

<template>
  <div class="ui-entity-detail-header-wrap">
    <el-button v-if="showBack" plain :icon="ArrowLeft" @click="emit('back')">{{ backText }}</el-button>
    <section class="ui-entity-detail-header">
      <div v-if="showLeading" class="ui-entity-detail-header__leading">
        <slot name="leading"
          ><span>{{ leadingText || title.charAt(0) }}</span></slot
        >
      </div>
      <div class="ui-entity-detail-header__body">
        <div class="ui-entity-detail-header__title-row">
          <h1>{{ title }}</h1>
          <div v-if="tags.length || $slots.tags" class="ui-entity-detail-header__tags">
            <slot name="tags">
              <el-tag
                v-for="(tag, index) in tags"
                :key="tag.key || tag.label || index"
                :type="tag.type || 'info'"
                :effect="tag.effect || 'plain'"
                size="small"
              >
                {{ tag.label }}
              </el-tag>
            </slot>
          </div>
        </div>
        <p v-if="subtitle" class="ui-entity-detail-header__subtitle">{{ subtitle }}</p>
        <div v-if="metaItems.length || $slots.meta" class="ui-entity-detail-header__meta">
          <slot name="meta">
            <span v-for="(item, index) in metaItems" :key="item.key || item.label || index">
              <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
              <small v-if="item.label">{{ item.label }}</small
              >{{ item.value }}
            </span>
          </slot>
        </div>
      </div>
      <div v-if="$slots.actions" class="ui-entity-detail-header__actions"><slot name="actions" /></div>
    </section>
  </div>
</template>

<style scoped>
.ui-entity-detail-header-wrap {
  display: grid;
  gap: var(--app-space-4);
}
.ui-entity-detail-header-wrap > :deep(.el-button) {
  justify-self: start;
}
.ui-entity-detail-header {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: var(--app-space-5);
  padding: var(--app-space-5);
  border: 1px solid var(--app-color-border);
  border-radius: var(--app-radius-panel);
  background: var(--app-color-surface);
  box-shadow: var(--app-shadow-panel);
}
.ui-entity-detail-header__leading {
  display: flex;
  width: 72px;
  height: 72px;
  flex: 0 0 72px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--app-radius-panel);
  background: var(--app-color-primary-soft);
  color: var(--app-color-primary);
  font-size: 28px;
  font-weight: 700;
}
.ui-entity-detail-header__body {
  min-width: 0;
  flex: 1 1 auto;
}
.ui-entity-detail-header__title-row,
.ui-entity-detail-header__tags,
.ui-entity-detail-header__meta,
.ui-entity-detail-header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--app-space-2);
}
.ui-entity-detail-header h1 {
  margin: 0;
  color: var(--app-color-text-primary);
  font-size: 24px;
  line-height: 1.3;
}
.ui-entity-detail-header__subtitle {
  margin: 5px 0 0;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
}
.ui-entity-detail-header__meta {
  margin-top: var(--app-space-3);
  gap: var(--app-space-5);
  color: var(--app-color-text-secondary);
  font-size: var(--app-font-size-sm);
}
.ui-entity-detail-header__meta > span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.ui-entity-detail-header__meta small {
  color: var(--app-color-text-muted);
  font-size: inherit;
}
.ui-entity-detail-header__actions {
  flex: 0 0 auto;
  justify-content: flex-end;
}
.ui-entity-detail-header__actions :deep(.el-button + .el-button) {
  margin-left: 0;
}
@media (max-width: 760px) {
  .ui-entity-detail-header {
    flex-wrap: wrap;
  }
  .ui-entity-detail-header__actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
