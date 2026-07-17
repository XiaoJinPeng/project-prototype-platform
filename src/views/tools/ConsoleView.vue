<script setup>
import { ref } from 'vue';
import { ArrowRight, FolderOpened, Menu, SetUp, Upload } from '@element-plus/icons-vue';

const developerModeKey = 'project-platform:developer-mode';
const developerMode = ref(window.sessionStorage.getItem(developerModeKey) === 'true');

function toggleDeveloperMode() {
  developerMode.value = !developerMode.value;
  window.sessionStorage.setItem(developerModeKey, String(developerMode.value));
}

const tools = [
  {
    title: '组件规范',
    description: '查看和验证项目统一使用的界面组件。',
    to: '/components',
    icon: SetUp,
  },
  {
    title: '页面导入导出',
    description: '导入 HTML 原型，或导出独立页面用于评审。',
    to: '/tools/page-transfer',
    icon: Upload,
  },
  {
    title: '项目包状态',
    description: '管理项目名称、Logo、主题和客户端入口。',
    to: '/tools/projects',
    icon: FolderOpened,
  },
  {
    title: '路由菜单管理',
    description: '维护项目页面、菜单分组和页面备份。',
    to: '/tools/project-routes',
    icon: Menu,
  },
];
</script>

<template>
  <div class="min-h-screen bg-[#F2F2F7] px-6 py-8 text-[#1D1D1F] md:px-10 md:py-10">
    <main class="mx-auto max-w-5xl">
      <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <RouterLink
            to="/"
            class="mb-4 inline-flex items-center text-sm text-[#6E6E73] transition-colors hover:text-[#0071E3]"
          >
            <span class="mr-1">‹</span>
            返回首页
          </RouterLink>
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#6E6E73]">
            Engineering Tools
          </p>
          <h1 class="text-3xl font-semibold tracking-tight md:text-4xl">控制台</h1>
          <p class="mt-3 text-sm leading-6 text-[#6E6E73] md:text-base">
            集中管理项目包、页面、菜单和公共组件规范。
          </p>
        </div>
      </div>

      <section
        class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white px-6 py-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
      >
        <div>
          <h2 class="text-base font-semibold">开发模式</h2>
          <p class="mt-1 text-sm leading-6 text-[#6E6E73]">
            开启后，在查看原型页面的同时显示对应的 PRD。默认使用固定分屏。
          </p>
        </div>
        <button
          type="button"
          class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
          :class="developerMode ? 'bg-[#0071E3] text-white' : 'bg-[#F2F2F7] text-[#6E6E73]'"
          @click="toggleDeveloperMode"
        >
          {{ developerMode ? '已开启' : '开启开发模式' }}
        </button>
      </section>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RouterLink
          v-for="tool in tools"
          :key="tool.to"
          :to="tool.to"
          class="group flex min-h-[150px] items-start justify-between rounded-2xl border border-black/5 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#0071E3]/30 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
        >
          <div>
            <div
              class="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F2F7] text-[#0071E3] transition-colors group-hover:bg-[#E5F0FF]"
            >
              <component :is="tool.icon" class="h-5 w-5" />
            </div>
            <h2 class="text-lg font-semibold">{{ tool.title }}</h2>
            <p class="mt-2 max-w-md text-sm leading-6 text-[#6E6E73]">{{ tool.description }}</p>
          </div>
          <ArrowRight
            class="mt-1 h-5 w-5 shrink-0 text-[#6E6E73] transition-transform group-hover:translate-x-1 group-hover:text-[#0071E3]"
          />
        </RouterLink>
      </section>
    </main>
  </div>
</template>
