<script setup>
import GlobalErrorBoundary from './components/GlobalErrorBoundary.vue';
</script>

<template>
  <router-view v-slot="{ Component }">
    <GlobalErrorBoundary>
      <component :is="Component" />
    </GlobalErrorBoundary>
  </router-view>
</template>
