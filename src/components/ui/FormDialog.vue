<script setup>
import DialogFooter from './DialogFooter.vue';

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  width: { type: [String, Number], default: '640px' },
  confirmText: { type: String, default: '保存' },
  cancelText: { type: String, default: '取消' },
  loading: { type: Boolean, default: false },
  confirmDisabled: { type: Boolean, default: false },
  confirmType: { type: String, default: 'primary' },
  destroyOnClose: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue', 'cancel', 'confirm']);

function updateVisible(value) {
  emit('update:modelValue', value);
}

function handleCancel() {
  emit('update:modelValue', false);
  emit('cancel');
}
</script>

<template>
  <el-dialog
    class="ui-form-dialog"
    :model-value="modelValue"
    :title="title"
    :width="width"
    :destroy-on-close="destroyOnClose"
    append-to-body
    @update:model-value="updateVisible"
  >
    <slot />
    <template #footer>
      <slot name="footer">
        <DialogFooter
          :confirm-text="confirmText"
          :cancel-text="cancelText"
          :loading="loading"
          :confirm-disabled="confirmDisabled"
          :confirm-type="confirmType"
          @cancel="handleCancel"
          @confirm="emit('confirm')"
        />
      </slot>
    </template>
  </el-dialog>
</template>

<style scoped>
:global(.ui-form-dialog) {
  border-radius: var(--app-radius-panel);
}
:global(.ui-form-dialog .el-dialog__header) {
  margin: 0;
  padding: var(--app-space-4) var(--app-space-5);
  border-bottom: 1px solid var(--app-color-border-light);
}
:global(.ui-form-dialog .el-dialog__body) {
  padding: var(--app-space-5);
}
:global(.ui-form-dialog .el-dialog__footer) {
  padding: var(--app-space-3) var(--app-space-5);
  border-top: 1px solid var(--app-color-border-light);
}
</style>
