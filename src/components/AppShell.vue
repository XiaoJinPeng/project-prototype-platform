<template>
  <div class="app-shell" :class="shellClasses">
    <aside class="app-sidebar">
      <div class="sidebar-brand">
        <div class="brand-box" :title="appName">
          <span :data-initial="appName.slice(0, 1)">{{ appName }}</span>
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
              :title="sidebarCollapsed ? translateStaticCopy(item.label, currentLocale) : undefined"
              @click="handleSidebarNavigate"
            >
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <span>{{ translateStaticCopy(item.label, currentLocale) }}</span>
            </a>
            <RouterLink
              v-else
              :to="item.path"
              class="side-link"
              :title="sidebarCollapsed ? translateStaticCopy(item.label, currentLocale) : undefined"
              @click="handleSidebarNavigate"
            >
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <span>{{ translateStaticCopy(item.label, currentLocale) }}</span>
            </RouterLink>
          </template>
        </template>
      </nav>
    </aside>
    <button
      v-if="mobileSidebarOpen"
      type="button"
      class="sidebar-scrim"
      aria-label="关闭菜单"
      @click="closeMobileSidebar"
    ></button>

    <div class="app-main">
      <header class="topbar">
        <button
          type="button"
          class="sidebar-toggle"
          :aria-expanded="isNarrowViewport ? mobileSidebarOpen : !sidebarCollapsed"
          :aria-label="isNarrowViewport ? '打开菜单' : sidebarCollapsed ? '展开侧栏' : '收缩侧栏'"
          :title="isNarrowViewport ? '打开菜单' : sidebarCollapsed ? '展开侧栏' : '收缩侧栏'"
          @click="toggleSidebar"
        >
          <el-icon>
            <component :is="isNarrowViewport ? Menu : sidebarCollapsed ? Expand : Fold" />
          </el-icon>
        </button>
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
                <el-dropdown-item divided @click="goHome">回到首页</el-dropdown-item>
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
          v-if="prdPanelOpen && prdDocumentPath && !exportConfig"
          :project-id="props.projectId"
          :document-path="prdDocumentPath"
          :document-paths="prdDocuments"
          :page-title="currentTitle"
          :document-anchor="prdDocumentAnchor"
          :layout-mode="prdLayoutMode"
          @close="closePrdPanel"
          @open-window="openDocumentWindow"
          @update:layout-mode="prdLayoutMode = $event"
        />
      </div>
    </div>
    <PrdAssociationLayer
      v-if="!exportConfig"
      :project-id="props.projectId"
      :page-path="route.path"
      :enabled="true"
      :can-edit="developerMode"
      @open="openPrdBinding"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Document, Download, Expand, Fold, Menu } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import PrdAssociationLayer from './PrdAssociationLayer.vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { getProject } from '../config/project-packages';
import PrdReviewPanel from './PrdReviewPanel.vue';
import { localeOptions, setLocale } from '../i18n';
import { translateStaticCopy } from '../i18n/legacy-localizer';
import { downloadProjectSource } from '../services/project-sources';
import {
  canPersistPlatformSettings,
  loadPlatformSettings,
  platformSettings,
  setPlatformDeveloperMode,
} from '../services/platform-settings';

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
const developerModeOverride = ref(false);
const developerMode = computed(() => platformSettings.developerMode || developerModeOverride.value);
const prdPanelOpen = ref(false);
const prdTarget = ref(null);
const prdLayoutMode = ref('split');
const sidebarCollapsed = ref(false);
const mobileSidebarOpen = ref(false);
const isNarrowViewport = ref(false);
const sidebarStorageKey = computed(() => `platform-sidebar-collapsed:${props.projectId}`);
const shellClasses = computed(() => ({
  'sidebar-collapsed': sidebarCollapsed.value && !isNarrowViewport.value,
  'sidebar-drawer-open': mobileSidebarOpen.value,
}));

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
const prdDocumentPath = computed(() => prdTarget.value?.documentPath || prdDocuments.value[0]?.path || '');
const prdDocumentAnchor = computed(() => prdTarget.value?.anchor || '');
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
    developerModeOverride.value = value === '1' || value === 'true';
  },
  { immediate: true },
);

watch(
  () => route.fullPath,
  () => {
    prdTarget.value = null;
    closeMobileSidebar();
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

function goHome() {
  router.push({ name: 'home' });
}

async function setDeveloperMode(enabled) {
  if (!canPersistPlatformSettings) return;

  try {
    await setPlatformDeveloperMode(enabled);
  } catch (error) {
    ElMessage.error(error.message || '共享开发模式保存失败。');
  }
  if (!enabled && !developerModeOverride.value) prdPanelOpen.value = false;
}

function openDocumentWindow(documentUrl) {
  if (typeof window === 'undefined') return;
  window.open(documentUrl, '_blank', 'noopener,noreferrer');
}

function openPrdBinding(target) {
  prdTarget.value = target;
  prdPanelOpen.value = true;
}

function closePrdPanel() {
  prdPanelOpen.value = false;
  prdTarget.value = null;
}

function loadSidebarPreference() {
  try {
    sidebarCollapsed.value = window.localStorage.getItem(sidebarStorageKey.value) === '1';
  } catch {
    sidebarCollapsed.value = false;
  }
}

function saveSidebarPreference() {
  try {
    window.localStorage.setItem(sidebarStorageKey.value, sidebarCollapsed.value ? '1' : '0');
  } catch {
    // Sidebar state is a local convenience and does not affect the project package.
  }
}

function updateViewportMode() {
  const narrow = window.matchMedia?.('(max-width: 760px)').matches ?? window.innerWidth <= 760;
  isNarrowViewport.value = narrow;
  if (!narrow) mobileSidebarOpen.value = false;
}

function toggleSidebar() {
  if (isNarrowViewport.value) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value;
    return;
  }

  sidebarCollapsed.value = !sidebarCollapsed.value;
  saveSidebarPreference();
}

function closeMobileSidebar() {
  if (isNarrowViewport.value) mobileSidebarOpen.value = false;
}

function handleSidebarNavigate() {
  closeMobileSidebar();
}

function handleSidebarEscape(event) {
  if (event.key === 'Escape') closeMobileSidebar();
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
  void loadPlatformSettings();
  loadSidebarPreference();
  updateViewportMode();
  window.addEventListener('keydown', handleDeveloperShortcut);
  window.addEventListener('resize', updateViewportMode);
  document.addEventListener('keydown', handleSidebarEscape);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleDeveloperShortcut);
  window.removeEventListener('resize', updateViewportMode);
  document.removeEventListener('keydown', handleSidebarEscape);
});

function exportFileFor(routePath) {
  const target = exportConfig?.pages?.find((page) => {
    const path = typeof page === 'string' ? page : page.path;
    return path === routePath;
  });
  return typeof target === 'object' && target.file ? `./${target.file}` : `#${routePath}`;
}
</script>
