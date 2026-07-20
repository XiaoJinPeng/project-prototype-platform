<script setup>
import GlobalErrorBoundary from './components/GlobalErrorBoundary.vue';
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <GlobalErrorBoundary>
      <Transition
        :name="route.meta.transition === 'platform' ? 'platform-route' : undefined"
        mode="out-in"
      >
        <component
          :is="Component"
          :key="route.meta.transition === 'platform' ? route.path : route.fullPath"
        />
      </Transition>
    </GlobalErrorBoundary>
  </router-view>
</template>
