<script setup>
import { computed, ref } from 'vue';
import { Close, Document, Download, Upload } from '@element-plus/icons-vue';
import FormDialog from './FormDialog.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '导入资料' },
  width: { type: [String, Number], default: '760px' },
  instructions: { type: String, default: '请先下载模板，按模板格式填写后再选择文件导入。' },
  fileName: { type: String, default: '' },
  accept: { type: String, default: '.xlsx,.xls,.csv' },
  status: {
    type: String,
    default: 'idle',
    validator: (value) => ['idle', 'ready', 'loading', 'success', 'error'].includes(value),
  },
  showTemplate: { type: Boolean, default: true },
  idleMessage: { type: String, default: '请先选择需要导入的文件。' },
  readyMessage: { type: String, default: '文件已选择，可以开始导入。' },
  loadingMessage: { type: String, default: '正在检查并导入文件，请稍候。' },
  successMessage: { type: String, default: '文件导入完成。' },
  errorMessage: { type: String, default: '文件存在异常，请修正后重新导入。' },
  summaryItems: { type: Array, default: () => [] },
  errors: { type: Array, default: () => [] },
  errorColumns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  confirmText: { type: String, default: '确认导入' },
  requireFile: { type: Boolean, default: true },
});

const emit = defineEmits([
  'update:modelValue',
  'download-template',
  'select-file',
  'remove-file',
  'confirm',
  'cancel',
]);
const fileInput = ref(null);
const effectiveStatus = computed(() => (props.loading ? 'loading' : props.status));
const isProcessing = computed(() => effectiveStatus.value === 'loading');
const confirmDisabled = computed(
  () => isProcessing.value || props.status === 'success' || (props.requireFile && !props.fileName),
);
const statusMessage = computed(() => {
  if (effectiveStatus.value === 'idle') return props.idleMessage;
  if (effectiveStatus.value === 'ready') return props.readyMessage;
  if (effectiveStatus.value === 'loading') return props.loadingMessage;
  if (effectiveStatus.value === 'success') return props.successMessage;
  return props.errorMessage;
});

function chooseFile() {
  fileInput.value?.click();
}

function handleFileChange(event) {
  const file = event.target.files?.[0];
  if (file) emit('select-file', file);
  event.target.value = '';
}

function handleCancel() {
  emit('cancel');
}
</script>

<template>
  <FormDialog
    :model-value="modelValue"
    :title="title"
    :width="width"
    :confirm-text="confirmText"
    :loading="isProcessing"
    :confirm-disabled="confirmDisabled"
    @update:model-value="emit('update:modelValue', $event)"
    @cancel="handleCancel"
    @confirm="emit('confirm')"
  >
    <div class="ui-file-import-dialog">
      <div class="ui-file-import-dialog__notice">
        <slot name="instructions">{{ instructions }}</slot>
      </div>
      <div class="ui-file-import-dialog__actions">
        <el-button v-if="showTemplate" :icon="Download" plain @click="emit('download-template')"
          >下载导入模板</el-button
        >
        <el-button type="primary" :icon="Upload" :disabled="isProcessing" @click="chooseFile">
          {{ fileName ? '重新选择文件' : '选择文件' }}
        </el-button>
        <slot name="actions" />
        <input
          ref="fileInput"
          class="ui-file-import-dialog__input"
          type="file"
          :accept="accept"
          @change="handleFileChange"
        />
      </div>
      <div :class="['ui-file-import-dialog__file', { 'has-file': fileName }]">
        <el-icon><Document /></el-icon>
        <span>{{ fileName || '尚未选择文件' }}</span>
        <el-button
          v-if="fileName && !isProcessing"
          class="ui-file-import-dialog__remove"
          link
          type="danger"
          :icon="Close"
          @click="emit('remove-file')"
          >移除</el-button
        >
      </div>
      <div
        v-if="statusMessage"
        :class="['ui-file-import-dialog__status', `is-${effectiveStatus}`]"
        role="status"
      >
        {{ statusMessage }}
      </div>
      <slot name="result">
        <div
          v-if="['success', 'error'].includes(effectiveStatus) && summaryItems.length"
          class="ui-file-import-dialog__summary"
        >
          <div v-for="(item, index) in summaryItems" :key="item.key || item.label || index">
            <span>{{ item.label }}</span
            ><strong :class="item.type ? `is-${item.type}` : ''">{{ item.value }}</strong>
          </div>
        </div>
      </slot>
      <div v-if="effectiveStatus === 'error' && errors.length" class="ui-file-import-dialog__errors">
        <div class="ui-file-import-dialog__error-title">导入异常，请修正后重新导入</div>
        <div class="ui-file-import-dialog__error-table-wrap">
          <table>
            <thead>
              <tr>
                <th v-for="column in errorColumns" :key="column.prop">{{ column.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in errors" :key="row.id || rowIndex">
                <td v-for="column in errorColumns" :key="column.prop">{{ row[column.prop] ?? '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <slot name="after" />
    </div>
  </FormDialog>
</template>

<style scoped>
.ui-file-import-dialog {
  display: grid;
  gap: var(--app-space-4);
}
.ui-file-import-dialog__notice {
  padding: var(--app-space-3);
  border: 1px solid var(--app-color-primary-border);
  border-radius: var(--app-radius-control);
  background: var(--app-color-primary-soft);
  color: var(--app-color-text-primary);
  font-size: var(--app-font-size-sm);
  line-height: 1.6;
}
.ui-file-import-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--app-space-2);
}
.ui-file-import-dialog__actions :deep(.el-button + .el-button) {
  margin-left: 0;
}
.ui-file-import-dialog__input {
  display: none;
}
.ui-file-import-dialog__file {
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: var(--app-space-2);
  padding: 0 var(--app-space-3);
  border: 1px dashed var(--app-color-border);
  border-radius: var(--app-radius-control);
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
}
.ui-file-import-dialog__file.has-file {
  border-style: solid;
  border-color: var(--app-color-primary-border);
  background: var(--app-color-primary-soft);
  color: var(--app-color-text-primary);
}
.ui-file-import-dialog__file span {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ui-file-import-dialog__remove {
  flex: none;
}
.ui-file-import-dialog__status {
  padding: var(--app-space-3);
  border: 1px solid var(--app-color-info-border);
  border-radius: var(--app-radius-control);
  background: var(--app-color-info-soft);
  color: var(--app-color-info-text);
  font-size: var(--app-font-size-sm);
}
.ui-file-import-dialog__status.is-loading {
  border-color: var(--app-color-primary-border);
  background: var(--app-color-primary-soft);
  color: var(--app-color-primary-text);
}
.ui-file-import-dialog__status.is-ready {
  border-color: var(--app-color-primary-border);
  background: var(--app-color-primary-soft);
  color: var(--app-color-primary-text);
}
.ui-file-import-dialog__status.is-success {
  border-color: var(--app-color-success-border);
  background: var(--app-color-success-soft);
  color: var(--app-color-success-text);
}
.ui-file-import-dialog__status.is-error {
  border-color: var(--app-color-danger-border);
  background: var(--app-color-danger-soft);
  color: var(--app-color-danger-text);
}
.ui-file-import-dialog__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--app-space-3);
}
.ui-file-import-dialog__summary > div {
  display: grid;
  gap: 4px;
  padding: var(--app-space-3);
  border: 1px solid var(--app-color-border-light);
  border-radius: var(--app-radius-control);
  background: var(--app-color-surface-subtle);
}
.ui-file-import-dialog__summary span {
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-xs);
}
.ui-file-import-dialog__summary strong {
  font-size: 20px;
}
.ui-file-import-dialog__summary strong.is-success {
  color: var(--app-color-success);
}
.ui-file-import-dialog__summary strong.is-danger {
  color: var(--app-color-danger);
}
.ui-file-import-dialog__error-title {
  margin-bottom: var(--app-space-2);
  color: var(--app-color-danger);
  font-size: var(--app-font-size-sm);
  font-weight: 600;
}
.ui-file-import-dialog__error-table-wrap {
  max-height: 220px;
  overflow: auto;
  border: 1px solid var(--app-color-border-light);
  border-radius: var(--app-radius-control);
}
.ui-file-import-dialog__errors table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--app-font-size-sm);
}
.ui-file-import-dialog__errors th,
.ui-file-import-dialog__errors td {
  padding: 9px 12px;
  border-bottom: 1px solid var(--app-color-border-light);
  text-align: left;
}
.ui-file-import-dialog__errors th {
  position: sticky;
  top: 0;
  background: var(--app-color-surface-muted);
  color: var(--app-color-text-secondary);
}
</style>
