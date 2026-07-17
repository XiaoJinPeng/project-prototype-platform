<script setup>
import { ArrowDown, Close, Download, Upload } from '@element-plus/icons-vue';
import { computed } from 'vue';

const props = defineProps({
  showImport: { type: Boolean, default: true },
  showExport: { type: Boolean, default: true },
  importText: { type: String, default: '导入' },
  exportText: { type: String, default: '导出' },
  batchText: { type: String, default: '批量操作' },
  selectedCount: { type: Number, default: 0 },
  batchActions: { type: Array, default: () => [] },
  importDisabled: { type: Boolean, default: false },
  exportDisabled: { type: Boolean, default: false },
  importLoading: { type: Boolean, default: false },
  exportLoading: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
});

const emit = defineEmits(['import', 'export', 'batch', 'clear-selection']);
const batchDisabled = computed(() => props.selectedCount === 0 || props.batchActions.length === 0);
</script>

<template>
  <div class="ui-list-action-group">
    <slot name="before" />
    <el-button
      v-if="showImport"
      type="success"
      plain
      :icon="Upload"
      :disabled="importDisabled"
      :loading="importLoading"
      @click="emit('import')"
    >
      {{ importText }}
    </el-button>
    <el-button
      v-if="showExport"
      type="primary"
      plain
      :icon="Download"
      :disabled="exportDisabled"
      :loading="exportLoading"
      @click="emit('export')"
    >
      {{ exportText }}
    </el-button>
    <el-dropdown
      v-if="batchActions.length"
      trigger="click"
      :disabled="batchDisabled"
      @command="emit('batch', $event)"
    >
      <el-button type="warning" plain :disabled="batchDisabled">
        {{ batchText }}<el-icon class="ui-list-action-group__arrow"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="item in batchActions"
            :key="item.command"
            :command="item.command"
            :disabled="item.disabled"
            :divided="item.divided"
          >
            <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>{{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <span v-if="selectedCount > 0" class="ui-list-action-group__selection">
      已选 {{ selectedCount }} 项
      <button
        v-if="clearable"
        type="button"
        class="ui-list-action-group__clear"
        aria-label="清除选择"
        @click="emit('clear-selection')"
      >
        <el-icon><Close /></el-icon>
      </button>
    </span>
    <slot name="after" />
  </div>
</template>

<style scoped>
.ui-list-action-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--app-space-2);
}
.ui-list-action-group :deep(.el-button + .el-button) {
  margin-left: 0;
}
.ui-list-action-group__arrow {
  margin-left: 6px;
}
.ui-list-action-group__selection {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border: 1px solid var(--app-color-primary-border);
  border-radius: var(--app-radius-control);
  background: var(--app-color-primary-soft);
  color: var(--app-color-primary);
  font-size: var(--app-font-size-xs);
  font-weight: 600;
  white-space: nowrap;
}
.ui-list-action-group__clear {
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: currentColor;
  cursor: pointer;
}
.ui-list-action-group__clear:hover {
  background: var(--app-color-primary-soft);
}
</style>
