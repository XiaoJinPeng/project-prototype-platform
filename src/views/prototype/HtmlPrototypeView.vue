<template>
  <section class="html-prototype-view" :aria-label="pageTitle">
    <div v-if="!sourcePath" class="html-prototype-view__state">
      <h1>HTML 原型未配置</h1>
      <p>当前页面没有登记可读取的 HTML 文件。</p>
    </div>
    <iframe
      v-else
      class="html-prototype-view__frame"
      :src="prototypeUrl"
      :title="pageTitle"
      loading="eager"
      allow="clipboard-read; clipboard-write"
    ></iframe>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { getHtmlPrototypeUrl } from '../../services/html-prototypes';

const props = defineProps({
  projectId: { type: String, required: true },
  clientId: { type: String, default: '' },
  sourcePath: { type: String, required: true },
});

const route = useRoute();
const pageTitle = computed(() => String(route.meta.title || 'HTML 原型'));
const prototypeUrl = computed(() => getHtmlPrototypeUrl(props.projectId, props.clientId, props.sourcePath));
</script>

<style scoped>
.html-prototype-view {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #fff;
}

.html-prototype-view__frame {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 720px;
  border: 0;
  background: #fff;
}

.html-prototype-view__state {
  display: grid;
  min-height: 320px;
  place-items: center;
  align-content: center;
  gap: 8px;
  color: var(--app-color-text-muted);
  text-align: center;
}

.html-prototype-view__state h1,
.html-prototype-view__state p {
  margin: 0;
}

.html-prototype-view__state h1 {
  color: var(--app-color-text-primary);
  font-size: 20px;
}
</style>
