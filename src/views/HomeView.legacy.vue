<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Document, Plus, Upload } from '@element-plus/icons-vue';

import ProjectPortal from '../components/ProjectPortal.vue';
import {
  getProject,
  getProjectEntryPath,
  installedProjects,
  resolveProjectIcon,
} from '../config/project-packages';
import { projectConfig } from '../config/project.config';
import { getProjectAssetUrl } from '../services/project-assets';

const route = useRoute();
const router = useRouter();

const ENGINEERING_TOOLS_KEY = 'project-platform:home-engineering-tools';
const showEngineeringTools = ref(window.sessionStorage.getItem(ENGINEERING_TOOLS_KEY) === 'true');
const selectableProjects = computed(() =>
  installedProjects.filter((project) => project.homepage?.visible !== false),
);

function toggleEngineeringTools() {
  showEngineeringTools.value = !showEngineeringTools.value;
  window.sessionStorage.setItem(ENGINEERING_TOOLS_KEY, String(showEngineeringTools.value));
}

function handleEngineeringToolsShortcut(event) {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'm') {
    event.preventDefault();
    toggleEngineeringTools();
  }
}

onMounted(() => window.addEventListener('keydown', handleEngineeringToolsShortcut));
onBeforeUnmount(() => window.removeEventListener('keydown', handleEngineeringToolsShortcut));

const selectedProjectId = computed({
  get() {
    const projectId = typeof route.query.project === 'string' ? route.query.project : '';
    return getProject(projectId)?.id || '';
  },
  set(projectId) {
    router.replace({ name: 'home', query: projectId ? { project: projectId } : {} });
  },
});
const selectedProject = computed(
  () => selectableProjects.value.find((project) => project.id === selectedProjectId.value) || null,
);
const projectOptions = computed(() =>
  selectableProjects.value.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description || '',
    version: project.version || '',
    logo: project.branding?.logo ? getProjectAssetUrl(project.id, project.branding.logo) : '',
  })),
);
const projectSections = computed(() => {
  if (!selectedProject.value) return [];
  const entries = [...(selectedProject.value.entries || [])]
    .sort((left, right) => (left.order || 0) - (right.order || 0))
    .map((entry) => ({
      ...entry,
      icon: resolveProjectIcon(entry.icon),
      to: getProjectEntryPath(selectedProject.value, entry),
    }));
  return [
    {
      id: 'clients',
      title: '客户端入口',
      description: '进入当前项目的客户端和演示入口。',
      items: entries.filter((entry) => entry.kind !== 'docs'),
    },
    {
      id: 'resources',
      title: '项目资料',
      description: '查看当前项目的产品文档和相关说明。',
      variant: 'resource',
      items: entries.filter((entry) => entry.kind === 'docs'),
    },
  ];
});
const emptyTitle = computed(() => {
  if (selectedProject.value) return '当前项目尚未配置入口';
  return selectableProjects.value.length ? '选择一个项目' : '尚未发现项目包';
});
const emptyDescription = computed(() => {
  if (selectedProject.value) return '请在项目包的 project.json 中配置 entries。';
  return selectableProjects.value.length
    ? '从左侧选择一个项目，查看该项目的客户端和资料入口。'
    : '将符合规范的项目文件夹放入 projects 目录后，项目会自动出现在这里。';
});

function handleProjectSelect(projectId) {
  selectedProjectId.value = projectId;
}
</script>

<template>
  <ProjectPortal
    :brand-title="projectConfig.name"
    brand-label="项目工作台"
    :project-selected="Boolean(selectedProject)"
    :projects="projectOptions"
    :selected-project-id="selectedProjectId"
    :accent="selectedProject?.theme?.primary || '#0071e3'"
    :title="selectedProject?.name || ''"
    :version="selectedProject?.version || ''"
    :description="selectedProject?.description || '统一管理项目原型、产品文档、演示入口和工程工具。'"
    :sections="projectSections"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    @select-project="handleProjectSelect"
  >
    <template #empty-actions>
      <RouterLink v-if="showEngineeringTools" to="/tools/projects">
        <el-icon><Plus /></el-icon>
        新增项目
      </RouterLink>
    </template>
    <template #footer>
      <RouterLink v-if="showEngineeringTools" to="/tools/page-transfer">
        <el-icon><Upload /></el-icon>
        页面导入导出
      </RouterLink>
      <RouterLink v-if="showEngineeringTools" to="/tools/projects">
        <el-icon><Document /></el-icon>
        项目管理
      </RouterLink>
      <RouterLink v-if="showEngineeringTools" to="/tools/project-routes">
        <el-icon><Document /></el-icon>
        路由菜单管理
      </RouterLink>
    </template>
    <template #new-project>
      <RouterLink to="/tools/projects">
        <el-icon><Plus /></el-icon>
        新建项目
      </RouterLink>
    </template>
  </ProjectPortal>
</template>
