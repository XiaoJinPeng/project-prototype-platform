<script setup>
import { computed } from 'vue';
import FormDialog from './FormDialog.vue';
import InfoBanner from './InfoBanner.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  reason: { type: String, default: '' },
  reasonLabel: { type: String, default: '操作原因' },
  placeholder: { type: String, default: '请填写本次操作原因' },
  confirmText: { type: String, default: '确认' },
  confirmType: { type: String, default: 'danger' },
  noticeType: { type: String, default: 'warning' },
  width: { type: [String, Number], default: '520px' },
  maxLength: { type: Number, default: 200 },
  minLength: { type: Number, default: 1 },
  required: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'update:reason', 'confirm', 'cancel']);
const normalizedReason = computed(() => props.reason.trim());
const confirmDisabled = computed(
  () => props.loading || (props.required && normalizedReason.value.length < props.minLength),
);

function handleCancel() {
  emit('cancel');
}

function handleConfirm() {
  if (confirmDisabled.value) return;
  emit('confirm', normalizedReason.value);
}
</script>

<template>
  <FormDialog
    :model-value="modelValue"
    :title="title"
    :width="width"
    :confirm-text="confirmText"
    :confirm-type="confirmType"
    :confirm-disabled="confirmDisabled"
    :loading="loading"
    @update:model-value="emit('update:modelValue', $event)"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  >
    <div class="ui-reason-confirm-dialog">
      <InfoBanner v-if="description" :type="noticeType" :description="description" />
      <slot name="context" />
      <el-form-item :label="reasonLabel" :required="required">
        <el-input
          :model-value="reason"
          type="textarea"
          :rows="4"
          :maxlength="maxLength"
          :placeholder="placeholder"
          resize="none"
          show-word-limit
          @update:model-value="emit('update:reason', $event)"
        />
      </el-form-item>
      <slot />
    </div>
  </FormDialog>
</template>

<style scoped>
.ui-reason-confirm-dialog {
  display: grid;
  gap: var(--app-space-4);
}
.ui-reason-confirm-dialog :deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
