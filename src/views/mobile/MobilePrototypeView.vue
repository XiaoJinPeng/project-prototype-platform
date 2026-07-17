<template>
  <main class="mobile-preview-page">
    <header class="mobile-preview-header">
      <div>
        <strong>{{ project?.name }}</strong>
        <span>{{ $t('home.mobileTitle') }}</span>
      </div>
      <div class="mobile-preview-actions">
        <el-select v-model="currentLocale" class="mobile-locale-switch" size="small">
          <el-option v-for="option in localeOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <RouterLink :to="`/p/${projectId}`" class="mobile-preview-back">{{ $t('home.backToHome') }}</RouterLink>
      </div>
    </header>
    <iframe
      ref="previewFrame"
      class="mobile-preview-frame"
      :src="mobileEntryUrl"
      :title="$t('home.mobileTitle')"
      sandbox="allow-scripts allow-same-origin"
      @load="syncFrameLocale"
    ></iframe>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import enUSCatalog from '../../i18n/catalog/en-US.json';
import zhCNCatalog from '../../i18n/catalog/zh-CN.json';
import zhTWCatalog from '../../i18n/catalog/zh-TW.json';
import { localeOptions, setLocale } from '../../i18n';
import { getThemeColor } from '../../config/theme';
import { getProject } from '../../config/project-packages';
import { getProjectAssetUrl } from '../../services/project-assets';

const props = defineProps({ projectId: { type: String, required: true } });
const project = computed(() => getProject(props.projectId));
const mobileEntryUrl = computed(() =>
  project.value?.mobile?.entry ? getProjectAssetUrl(props.projectId, project.value.mobile.entry) : '',
);

const catalogs = {
  'zh-CN': zhCNCatalog,
  'zh-TW': zhTWCatalog,
  'en-US': enUSCatalog,
};
const previewFrame = ref(null);
const { locale } = useI18n({ useScope: 'global' });
const currentLocale = computed({
  get: () => locale.value,
  set: (value) => setLocale(value),
});

function syncFrameLocale() {
  const frameRoot = previewFrame.value?.contentDocument?.documentElement;
  if (frameRoot) {
    frameRoot.style.setProperty('--brand', getThemeColor());
    frameRoot.style.setProperty('--brand-dark', getThemeColor('primary-hover'));
    frameRoot.style.setProperty('--brand-soft', 'color-mix(in srgb, ' + getThemeColor() + ' 10%, white)');
  }

  previewFrame.value?.contentWindow?.postMessage({
    type: 'prototype:set-locale',
    locale: locale.value,
    catalog: catalogs[locale.value],
  }, window.location.origin);
}

function handleFrameMessage(event) {
  if (event.origin === window.location.origin && event.data?.type === 'prototype:mobile-ready') syncFrameLocale();
}

watch(locale, syncFrameLocale);
onMounted(() => window.addEventListener('message', handleFrameMessage));
onBeforeUnmount(() => window.removeEventListener('message', handleFrameMessage));
</script>

<style scoped>
.mobile-preview-page {
  display: flex;
  height: 100vh;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  background: #eaf0f4;
}

.mobile-preview-header {
  display: flex;
  height: 56px;
  flex: 0 0 56px;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid #dbe3ec;
  background: #fff;
}

.mobile-preview-header > div {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.mobile-preview-header strong {
  color: var(--app-color-primary);
  font-size: 16px;
}

.mobile-preview-header span {
  color: #64748b;
  font-size: 13px;
}

.mobile-preview-back {
  color: var(--app-color-primary);
  font-size: 13px;
  font-weight: 700;
}

.mobile-preview-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-locale-switch {
  width: 96px;
}

.mobile-preview-frame {
  width: 100%;
  min-height: 0;
  flex: 1;
  border: 0;
  background: #f3f4f6;
}
</style>
