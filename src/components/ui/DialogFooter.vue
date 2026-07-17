<script setup>
defineProps({
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  loading: { type: Boolean, default: false },
  confirmDisabled: { type: Boolean, default: false },
  confirmType: { type: String, default: 'primary' },
});
defineEmits(['confirm', 'cancel']);
</script>

<template>
  <div class="ui-dialog-footer">
    <slot name="left" />
    <div class="ui-dialog-footer__actions">
      <el-button @click="$emit('cancel')">{{ cancelText }}</el-button>
      <el-button
        :type="confirmType"
        :loading="loading"
        :disabled="confirmDisabled"
        @click="$emit('confirm')"
        >{{ confirmText }}</el-button
      >
    </div>
  </div>
</template>

<style scoped>
.ui-dialog-footer {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--app-space-4);
}
.ui-dialog-footer__actions {
  display: flex;
  align-items: center;
  gap: var(--app-space-2);
  margin-left: auto;
}
</style>
