<script setup>
import { onErrorCaptured, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const hasError = ref(false);

onErrorCaptured((error, instance, info) => {
  hasError.value = true;
  console.error('[prototype page error]', error, info, instance);
  return false;
});

watch(
  () => route.fullPath,
  () => {
    hasError.value = false;
  },
);

const retry = () => window.location.reload();
const returnHome = () => router.push('/');
</script>

<template>
  <slot v-if="!hasError" />
  <main v-else class="error-page">
    <section class="error-panel">
      <h1>页面载入失败</h1>
      <p>当前原型页面发生异常，可重新载入页面或返回项目首页。</p>
      <div class="error-actions">
        <button type="button" class="secondary-button" @click="returnHome">返回首页</button>
        <button type="button" class="primary-button" @click="retry">重新载入</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background: #f6f8fa;
  color: #172033;
}

.error-panel {
  width: min(480px, 100%);
  padding: 40px;
  text-align: center;
  background: #fff;
  border: 1px solid #dfe5ec;
  border-radius: 8px;
}

h1 {
  margin: 0 0 12px;
  font-size: 24px;
}

p {
  margin: 0 0 24px;
  color: #667085;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

button {
  min-height: 36px;
  padding: 0 18px;
  border: 1px solid var(--app-color-primary);
  border-radius: 4px;
  cursor: pointer;
}

.primary-button {
  color: #fff;
  background: var(--app-color-primary);
}

.secondary-button {
  color: var(--app-color-primary);
  background: #fff;
}
</style>
