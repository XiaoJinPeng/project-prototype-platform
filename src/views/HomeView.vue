<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';

import { getProject, getProjectEntryPath, installedProjects } from '../config/project-packages';
import {
  loadPlatformSettings,
  platformSettings,
  setPlatformDeveloperMode,
} from '../services/platform-settings';

const route = useRoute();
const router = useRouter();
const showProjectMenu = ref(false);
const showConsole = computed(() => platformSettings.developerMode);

const selectableProjects = computed(() =>
  installedProjects.filter((project) => project.homepage?.visible !== false),
);

const selectedProjectId = computed({
  get() {
    const queryProject = typeof route.query.project === 'string' ? route.query.project : '';
    return getProject(queryProject)?.id || '';
  },
  set(projectId) {
    router.replace({ name: 'home', query: projectId ? { project: projectId } : {} });
  },
});

const selectedProject = computed(() => getProject(selectedProjectId.value));

const clientEntries = computed(() =>
  [...(selectedProject.value?.entries || [])]
    .filter((entry) => entry.kind !== 'docs')
    .sort((left, right) => (left.order || 0) - (right.order || 0))
    .map((entry, index) => ({
      ...entry,
      to: getProjectEntryPath(selectedProject.value, entry),
      icon: ['dashboard', 'storefront', 'smartphone'][index] || 'dashboard',
      displayDescription:
        entry.kind === 'mobile'
          ? '移动端业务流程与交互'
          : entry.clientId === 'enterprise'
            ? '企业公务用车管理后台'
            : entry.clientId === 'operation'
              ? '租赁营运管理工作台'
              : entry.description,
    })),
);

const documentEntries = computed(() =>
  [...(selectedProject.value?.entries || [])]
    .filter((entry) => entry.kind === 'docs')
    .sort((left, right) => (left.order || 0) - (right.order || 0))
    .map((entry) => ({
      ...entry,
      to: getProjectEntryPath(selectedProject.value, entry),
    })),
);

const activityItems = [
  {
    icon: 'check',
    tone: 'green',
    title: '版本发布',
    description: '当前项目入口已更新，可进入对应客户端查看。',
    time: '2 分钟前 · 系统',
  },
  {
    icon: 'commit',
    tone: 'blue',
    title: '项目配置',
    description: '项目名称、主题和客户端入口配置已读取。',
    time: '45 分钟前 · 管理员',
  },
  {
    icon: 'warning',
    tone: 'orange',
    title: '文档提醒',
    description: '产品文档入口已准备，可继续补充项目资料。',
    time: '2 小时前 · 系统',
  },
  {
    icon: 'add',
    tone: 'gray',
    title: '项目包就绪',
    description: '当前项目可以继续新增原型页面和菜单。',
    time: '昨天 · 管理员',
  },
];

const projectTitle = computed(() => selectedProject.value?.name || '项目资料与原型平台');
const projectVersion = computed(() => selectedProject.value?.version || '1.0.0');
const hasSelectedProject = computed(() => Boolean(selectedProject.value));

function chooseProject(projectId) {
  selectedProjectId.value = projectId;
  showProjectMenu.value = false;
}

async function toggleConsole() {
  try {
    await setPlatformDeveloperMode(!showConsole.value);
  } catch (error) {
    ElMessage.error(error.message || '共享开发模式保存失败。');
  }
}

function handleConsoleShortcut(event) {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'm') {
    event.preventDefault();
    toggleConsole();
  }
}

function openRecentActivity() {
  document.querySelector('#candidate-recent-activity')?.scrollIntoView({ behavior: 'smooth' });
}

function openProjectSettings() {
  router.push({ path: '/tools/projects', query: { project: selectedProjectId.value } });
}

function openPageTransfer() {
  router.push({ path: '/tools/page-transfer', query: { project: selectedProjectId.value } });
}

onMounted(() => {
  void loadPlatformSettings();
  window.addEventListener('keydown', handleConsoleShortcut);
});
onBeforeUnmount(() => window.removeEventListener('keydown', handleConsoleShortcut));
</script>

<template>
  <div class="candidate-home flex min-h-screen flex-col bg-[#F2F2F7] pt-16 text-on-surface">
    <nav class="fixed top-0 z-50 w-full border-b border-black/10 bg-white/80 shadow-sm backdrop-blur-xl">
      <div class="mx-auto flex h-16 max-w-container-max items-center justify-between px-margin-desktop">
        <div class="flex items-center gap-6">
          <RouterLink
            to="/"
            class="font-headline-md text-headline-md font-bold tracking-tight text-on-surface"
          >
            原型管理系统
          </RouterLink>
          <div class="hidden h-full items-center gap-6 pt-1 md:flex">
            <div class="relative flex h-full items-center">
              <button
                type="button"
                class="candidate-nav-button flex h-full items-center font-label-md text-label-md transition-colors"
                :class="
                  hasSelectedProject
                    ? 'border-b-2 border-primary pb-1 font-medium text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                "
                @click="showProjectMenu = !showProjectMenu"
              >
                项目
              </button>
              <div
                v-if="showProjectMenu"
                class="candidate-project-menu absolute left-1/2 top-[calc(100%+10px)] z-20 w-64 -translate-x-1/2 rounded-xl border border-black/10 bg-white p-2 shadow-xl"
              >
                <button
                  type="button"
                  class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-label-md text-label-md text-on-surface transition-colors hover:bg-[#F2F2F7]"
                  @click="chooseProject('')"
                >
                  <span>不选择项目</span>
                  <span
                    v-if="!hasSelectedProject"
                    class="material-symbols-outlined text-[18px] text-[#007AFF]"
                  >
                    check
                  </span>
                </button>
                <div class="my-1 h-px bg-black/5"></div>
                <button
                  v-for="project in selectableProjects"
                  :key="project.id"
                  type="button"
                  class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-label-md text-label-md text-on-surface transition-colors hover:bg-[#F2F2F7]"
                  @click="chooseProject(project.id)"
                >
                  <span>{{ project.name }}</span>
                  <span
                    v-if="project.id === selectedProjectId"
                    class="material-symbols-outlined text-[18px] text-[#007AFF]"
                  >
                    check
                  </span>
                </button>
              </div>
            </div>
            <RouterLink
              to="/components"
              class="flex h-full items-center font-label-md text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
            >
              组件库
            </RouterLink>
            <button
              type="button"
              class="flex h-full items-center border-0 bg-transparent p-0 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
              @click="openRecentActivity"
            >
              动态
            </button>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <RouterLink
            v-if="showConsole"
            to="/tools/console"
            class="hidden items-center justify-center rounded-full px-4 py-1.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-[#F2F2F7] hover:text-on-surface md:flex"
          >
            控制台
          </RouterLink>
          <RouterLink
            v-if="showConsole"
            to="/tools/projects"
            class="hidden items-center justify-center rounded-full bg-primary px-4 py-1.5 font-label-md text-label-md text-white transition-opacity hover:opacity-80 active:scale-95 md:flex"
          >
            新建项目
          </RouterLink>
          <div class="flex items-center gap-3 text-on-surface-variant">
            <button
              type="button"
              aria-label="查看最近动态"
              class="border-0 bg-transparent p-0 transition-colors hover:text-on-surface hover:opacity-80 active:scale-95"
              @click="openRecentActivity"
            >
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0"
                >notifications</span
              >
            </button>
            <button
              type="button"
              aria-label="账户"
              class="border-0 bg-transparent p-0 transition-colors hover:text-on-surface hover:opacity-80 active:scale-95"
            >
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0"
                >account_circle</span
              >
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main
      class="mx-auto w-full max-w-container-max flex-1 space-y-xl px-margin-mobile py-xl md:px-margin-desktop md:py-xxl"
    >
      <header class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div class="mb-2 flex items-center gap-3">
            <span
              class="material-symbols-outlined text-3xl text-primary"
              style="font-variation-settings: 'FILL' 1"
            >
              point_of_sale
            </span>
            <h1 class="font-display text-display tracking-tight text-on-surface">{{ projectTitle }}</h1>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="rounded-full border border-[#CCE0FF] bg-[#E5F0FF] px-2 py-0.5 font-label-sm text-label-sm text-[#0058BC]"
            >
              {{ hasSelectedProject ? `版本 v${projectVersion}` : '尚未选择项目' }}
            </span>
            <span class="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
              <span
                class="block h-1.5 w-1.5 rounded-full"
                :class="hasSelectedProject ? 'bg-green-500' : 'bg-gray-400'"
              ></span>
              {{ hasSelectedProject ? '项目可用' : '请选择项目' }}
            </span>
          </div>
        </div>
        <div v-if="showConsole" class="flex items-center gap-3">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
            @click="openProjectSettings"
          >
            <span class="material-symbols-outlined text-[18px]">settings</span>
            项目配置
          </button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg bg-[#007AFF] px-6 py-2 font-label-md text-label-md text-white shadow-sm transition-colors hover:bg-blue-600"
            @click="openPageTransfer"
          >
            <span class="material-symbols-outlined text-[18px]">rocket_launch</span>
            页面导入导出
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div class="space-y-xl lg:col-span-8">
          <section>
            <h2 class="mb-lg font-title text-title tracking-tight text-on-surface">客户端入口</h2>
            <div class="grid grid-cols-1 gap-gutter md:grid-cols-3">
              <RouterLink
                v-for="entry in clientEntries"
                :key="entry.id"
                :to="entry.to"
                class="premium-card candidate-client-card group cursor-pointer p-lg transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div
                  class="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low transition-colors group-hover:bg-[#E5F0FF]"
                >
                  <span class="material-symbols-outlined text-on-surface-variant group-hover:text-[#007AFF]">
                    {{ entry.icon }}
                  </span>
                </div>
                <h3 class="mb-1 font-label-md text-label-md font-semibold text-on-surface">
                  {{ entry.name }}
                </h3>
                <p class="mb-4 font-body-sm text-body-sm text-on-surface-variant">
                  {{ entry.displayDescription }}
                </p>
                <div
                  class="mt-auto flex items-center justify-between font-label-sm text-label-sm text-[#007AFF]"
                >
                  <span>进入系统</span>
                  <span
                    class="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1"
                  >
                    arrow_forward
                  </span>
                </div>
              </RouterLink>
              <div
                v-if="!clientEntries.length"
                class="premium-card p-lg font-body-sm text-body-sm text-on-surface-variant md:col-span-3"
              >
                当前项目还没有配置客户端入口。
              </div>
            </div>
          </section>

          <section>
            <h2 class="mb-lg font-title text-title tracking-tight text-on-surface">项目文档</h2>
            <div class="premium-card min-h-[304px] p-lg">
              <div class="mb-6 flex items-start justify-between border-b border-black/5 pb-6">
                <div>
                  <span class="mb-1 block font-label-sm text-label-sm text-on-surface-variant"
                    >当前项目资料</span
                  >
                  <span class="block font-headline-md text-headline-md text-on-surface"
                    >产品文档与原型说明</span
                  >
                </div>
                <span class="material-symbols-outlined text-primary">description</span>
              </div>
              <div v-if="documentEntries.length" class="space-y-3">
                <RouterLink
                  v-for="entry in documentEntries"
                  :key="entry.id"
                  :to="entry.to"
                  class="flex items-center justify-between rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-[#F2F2F7] hover:text-primary"
                >
                  <span class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">description</span>
                    {{ entry.name }}
                  </span>
                  <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </RouterLink>
              </div>
              <div v-else class="font-body-sm text-body-sm text-on-surface-variant">
                当前项目尚未配置文档入口。
              </div>
            </div>
          </section>
        </div>

        <div id="candidate-recent-activity" class="lg:col-span-4">
          <section class="h-full">
            <h2 class="mb-lg font-title text-title tracking-tight text-on-surface">最近动态</h2>
            <div class="premium-card candidate-activity-card hide-scrollbar overflow-y-auto p-lg">
              <div
                class="relative space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-outline-variant/30"
              >
                <div v-for="item in activityItems" :key="item.title" class="relative pl-8">
                  <div
                    class="absolute left-0 top-1 flex h-[23px] w-[23px] items-center justify-center rounded-full border-2 bg-white"
                    :class="{
                      'border-green-500': item.tone === 'green',
                      'border-blue-500': item.tone === 'blue',
                      'border-orange-500': item.tone === 'orange',
                      'border-gray-400': item.tone === 'gray',
                    }"
                  >
                    <span
                      class="material-symbols-outlined text-[12px]"
                      :class="{
                        'text-green-500': item.tone === 'green',
                        'text-blue-500': item.tone === 'blue',
                        'text-orange-500': item.tone === 'orange',
                        'text-gray-500': item.tone === 'gray',
                      }"
                    >
                      {{ item.icon }}
                    </span>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-label-md text-label-md font-semibold text-on-surface">{{
                      item.title
                    }}</span>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">{{
                      item.description
                    }}</span>
                    <span class="mt-1 font-label-sm text-label-sm text-tertiary">{{ item.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <footer class="mt-auto w-full shrink-0 border-t border-black/5 bg-surface py-xl">
      <div
        class="mx-auto flex max-w-container-max flex-wrap items-center justify-between gap-x-6 gap-y-3 px-margin-mobile md:px-margin-desktop"
      >
        <RouterLink
          to="/components"
          class="font-label-sm text-label-sm text-on-surface-variant transition-colors hover:text-primary"
        >
          组件规范
        </RouterLink>
        <span class="font-label-sm text-label-sm text-on-surface-variant"
          >© 2026 原型管理系统。保留所有权利。</span
        >
      </div>
    </footer>
  </div>
</template>

<style scoped>
.candidate-home {
  min-height: 100vh;
  background-color: #f2f2f7;
  color: #1b1b1d;
  font-family:
    -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Roboto, Helvetica, Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.candidate-home .material-symbols-outlined {
  display: inline-block;
  font-family: 'Material Symbols Outlined';
  font-size: 24px;
  font-style: normal;
  font-weight: normal;
  letter-spacing: normal;
  line-height: 1;
  text-transform: none;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

.candidate-home .premium-card {
  border: 0.5px solid rgb(0 0 0 / 10%);
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 4px 20px rgb(0 0 0 / 5%);
}

.candidate-home .candidate-client-card {
  display: flex;
  min-height: 182px;
  flex-direction: column;
}

.candidate-home .candidate-activity-card {
  height: calc(100% - 49px);
  min-height: 508px;
}

.candidate-home .hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.candidate-home .hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.candidate-home .candidate-nav-button {
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.candidate-home a,
.candidate-home button {
  -webkit-tap-highlight-color: transparent;
}

@media (max-width: 767px) {
  .candidate-home h1 {
    font-size: 34px;
    line-height: 41px;
  }
}
</style>
