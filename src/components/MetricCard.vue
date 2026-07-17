<template>
  <div class="metric-card">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <small>{{ helper }}</small>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  helper: {
    type: String,
    default: '',
  },
});
</script>
