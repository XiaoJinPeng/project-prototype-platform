<script setup>
defineProps({
  label: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
  type: { type: String, default: '' },
  size: { type: String, default: 'default' },
  placement: { type: String, default: 'top' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  plain: { type: Boolean, default: false },
});

defineEmits(['click']);
</script>

<template>
  <el-tooltip :content="label" :placement="placement">
    <el-button
      class="ui-filter-icon-button"
      circle
      :aria-label="label"
      :icon="icon"
      :type="type"
      :size="size"
      :plain="plain"
      :disabled="disabled"
      :loading="loading"
      @click="$emit('click', $event)"
    />
  </el-tooltip>
</template>

<style scoped>
.ui-filter-icon-button {
  flex: none;
}
</style>
