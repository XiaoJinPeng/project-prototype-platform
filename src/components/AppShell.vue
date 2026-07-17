<template>
  <div class="app-shell">
    <aside class="app-sidebar">
      <div class="sidebar-brand">
        <div class="brand-box">
          <span>{{ appName }}</span>
          <small>{{ translatedClientName }}</small>
        </div>
      </div>

      <nav class="side-section">
        <template v-for="section in visibleMenus" :key="section.title">
          <div class="side-section-title">{{ translateStaticCopy(section.title, currentLocale) }}</div>
          <template v-for="item in section.items" :key="item.path">
            <a
              v-if="exportConfig"
              :href="exportFileFor(item.path)"
              class="side-link"
              :class="{ 'router-link-active': route.path === item.path }"
            >
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <span>{{ translateStaticCopy(item.label, currentLocale) }}</span>
            </a>
            <RouterLink v-else :to="item.path" class="side-link">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <span>{{ translateStaticCopy(item.label, currentLocale) }}</span>
            </RouterLink>
          </template>
        </template>
      </nav>
    </aside>

    <div class="app-main">
      <header class="topbar">
        <div class="breadcrumb">
          {{ t('common.home') }} / {{ translatedClientName }} / {{ translatedCurrentTitle }}
        </div>
        <div class="topbar-actions">
          <el-select v-model="currentLocale" class="locale-switch" size="small">
            <el-option
              v-for="option in localeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-select v-model="selectedClient" class="client-switch" size="small" @change="switchClient">
            <el-option v-for="item in availableClients" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <el-tag v-if="developerMode" class="developer-mode-badge" type="warning" size="small">
            开发模式
          </el-tag>
          <el-button
            v-if="developerMode && sourcePath"
            class="source-trigger"
            :disabled="Boolean(exportConfig)"
            text
            size="small"
            @click="handleSourceDownload"
          >
            <el-icon><Download /></el-icon>
            下载源文件
          </el-button>
          <el-button
            v-if="developerMode && prdDocumentPath"
            class="prd-trigger"
            :disabled="Boolean(exportConfig)"
            text
            size="small"
            @click="prdPanelOpen = !prdPanelOpen"
          >
            <el-icon><Document /></el-icon>
            {{ prdPanelOpen ? '关闭 PRD' : '查看 PRD' }}
          </el-button>
          <el-dropdown trigger="click">
            <span class="user-pill">
              <el-avatar :size="32">A</el-avatar>
              <span>Admin</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">{{ t('common.logout') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <div class="page-workspace">
        <main class="page-container" :class="{ 'legacy-page-container': route.meta.legacy }">
          <RouterView />
        </main>
        <PrdReviewPanel
          v-if="developerMode && prdPanelOpen && prdDocumentPath && !exportConfig"
          :project-id="props.projectId"
          :document-path="prdDocumentPath"
          :document-paths="prdDocuments"
          :page-title="currentTitle"
          :layout-mode="prdLayoutMode"
          @close="prdPanelOpen = false"
          @open-window="openDocumentWindow"
          @update:layout-mode="prdLayoutMode = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Document, Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { getProject } from '../config/project-packages';
import PrdReviewPanel from './PrdReviewPanel.vue';
import { localeOptions, setLocale } from '../i18n';
import { translateStaticCopy } from '../i18n/legacy-localizer';
import { downloadProjectSource } from '../services/project-sources';

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
  appName: {
    type: String,
    required: true,
  },
  client: {
    type: String,
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  menus: {
    type: Array,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n({ useScope: 'global' });
const selectedClient = ref(props.client);
const exportConfig = typeof window !== 'undefined' ? window.__PROJECT_EXPORT__ || null : null;
const currentLocale = computed({
  get: () => locale.value,
  set: (value) => setLocale(value),
});
const developerModeKey = 'project-platform:developer-mode';
const developerMode = ref(
  typeof window !== 'undefined' && window.sessionStorage.getItem(developerModeKey) === 'true',
);
const prdPanelOpen = ref(false);
const prdLayoutMode = ref('split');

const currentTitle = computed(() => route.meta.title || route.name || '工作台');
function normalizePrdDocument(entry) {
  const path = typeof entry === 'string' ? entry : entry?.path || entry?.file || '';
  if (!path) return null;
  const title =
    typeof entry === 'object' && entry?.title ? entry.title : path.split('/').pop().replace(/\.md$/i, '');
  return { path, title };
}

const prdDocuments = computed(() => {
  const raw = route.meta.prd;
  const entries = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return entries.map(normalizePrdDocument).filter(Boolean);
});
const prdDocumentPath = computed(() => {
  return prdDocuments.value[0]?.path || '';
});
const sourcePath = computed(() => (typeof route.meta.source === 'string' ? route.meta.source : ''));

watch(
  () => props.client,
  (next) => {
    selectedClient.value = next;
  },
);

watch(
  () => route.query.__dev,
  (value) => {
    if (value === '1' || value === 'true') setDeveloperMode(true);
  },
  { immediate: true },
);

watch(
  () => route.fullPath,
  () => {
    if (!prdDocumentPath.value) prdPanelOpen.value = false;
  },
);

const project = computed(() => getProject(props.projectId));
const availableClients = computed(() => {
  const clients = project.value?.clients || [];
  if (!exportConfig?.clients?.length) return clients;
  return clients.filter((client) => exportConfig.clients.includes(client.id));
});
const translatedClientName = computed(() => translateStaticCopy(props.clientName, currentLocale.value));
const translatedCurrentTitle = computed(() => translateStaticCopy(currentTitle.value, currentLocale.value));
const visibleMenus = computed(() => {
  if (!exportConfig?.pages?.length) return props.menus;
  const selectedPaths = new Set(
    exportConfig.pages.map((page) => (typeof page === 'string' ? page : page.path)),
  );
  return props.menus
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => selectedPaths.has(item.path)),
    }))
    .filter((section) => section.items.length > 0);
});

function switchClient(value) {
  if (exportConfig?.pages?.length) {
    const target = exportConfig.pages.find((page) => {
      const path = typeof page === 'string' ? page : page.path;
      return path.includes(`/${value}/`);
    });
    if (target) window.location.href = exportFileFor(typeof target === 'string' ? target : target.path);
    return;
  }
  router.push(`/p/${props.projectId}/${value}/login`);
}

function logout() {
  if (exportConfig?.pages?.length) {
    const target = exportConfig.pages.find((page) => {
      const path = typeof page === 'string' ? page : page.path;
      return path.includes(`/${props.client}/`);
    });
    if (target) window.location.href = exportFileFor(typeof target === 'string' ? target : target.path);
    return;
  }
  router.push(`/p/${props.projectId}/${props.client}/login`);
}

function setDeveloperMode(enabled) {
  developerMode.value = enabled;
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(developerModeKey, String(enabled));
  }
  if (!enabled) prdPanelOpen.value = false;
}

function openDocumentWindow(documentUrl) {
  if (typeof window === 'undefined') return;
  window.open(documentUrl, '_blank', 'noopener,noreferrer');
}

async function handleSourceDownload() {
  try {
    await downloadProjectSource(props.projectId, sourcePath.value);
  } catch (error) {
    ElMessage.error(error.message || '源文件下载失败。');
  }
}

function toggleDeveloperMode() {
  setDeveloperMode(!developerMode.value);
}

function handleDeveloperShortcut(event) {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'm') {
    event.preventDefault();
    toggleDeveloperMode();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleDeveloperShortcut);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleDeveloperShortcut);
});

function exportFileFor(routePath) {
  const target = exportConfig?.pages?.find((page) => {
    const path = typeof page === 'string' ? page : page.path;
    return path === routePath;
  });
  return typeof target === 'object' && target.file ? `./${target.file}` : `#${routePath}`;
}
</script>
