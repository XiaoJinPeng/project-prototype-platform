<template>
  <main class="routes-page">
    <header class="routes-header">
      <RouterLink to="/tools/projects" class="back-link">
        <el-icon><ArrowLeft /></el-icon>
        返回项目包状态
      </RouterLink>
      <div>
        <p class="eyebrow">PROJECT ROUTES</p>
        <h1>路由菜单管理</h1>
        <p class="subtitle">管理每个项目客户端的页面路由和菜单登记；删除或替换前会保留可恢复备份。</p>
      </div>
      <div class="header-actions">
        <el-select v-model="selectedProjectId" class="project-select" placeholder="选择项目">
          <el-option
            v-for="project in installedProjects"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          />
        </el-select>
        <el-button :loading="loading" @click="loadRoutes">
          <el-icon><Refresh /></el-icon>
          重新读取
        </el-button>
      </div>
    </header>

    <el-alert
      title="路由新增会同时生成一个可运行的占位页面；页面内容可继续通过“页面导入导出”中的替换页面功能更新。"
      type="info"
      :closable="false"
      class="routes-alert"
    />
    <el-alert v-if="error" :title="error" type="error" :closable="false" class="routes-alert" />

    <section v-if="routeData" class="routes-panel">
      <div class="panel-heading">
        <div>
          <h2>{{ routeData.project.name }}</h2>
          <p>项目 ID：{{ routeData.project.id }} · {{ routeData.project.version || '未设置版本' }}</p>
        </div>
        <el-tag type="info">{{ routeData.clients.length }} 个客户端</el-tag>
      </div>

      <el-tabs v-model="activeClientId" class="client-tabs">
        <el-tab-pane
          v-for="client in routeData.clients"
          :key="client.id"
          :label="client.name"
          :name="client.id"
        >
          <div class="client-toolbar">
            <div class="client-summary">
              <strong>{{ client.name }}</strong>
              <span>{{ client.basePath }} · {{ client.pages.length }} 个路由</span>
            </div>
            <div class="client-actions">
              <el-button @click="openSectionManager(client)">
                <el-icon><Edit /></el-icon>
                编辑分组
              </el-button>
              <el-button type="primary" @click="openCreateRoute(client)">
                <el-icon><Plus /></el-icon>
                新增路由
              </el-button>
            </div>
          </div>

          <el-table :data="client.pages" border class="route-table" empty-text="当前客户端暂无页面路由">
            <el-table-column prop="title" label="路由名称" min-width="180" />
            <el-table-column label="路由" min-width="220">
              <template #default="{ row }">{{ client.basePath }}/{{ row.path }}</template>
            </el-table-column>
            <el-table-column label="菜单分组" width="150">
              <template #default="{ row }">{{ sectionTitle(client, row.section) }}</template>
            </el-table-column>
            <el-table-column prop="view" label="页面文件" min-width="280" />
            <el-table-column label="来源" width="120">
              <template #default="{ row }">
                <el-tag size="small" :type="row.source === 'html-template' ? 'success' : 'info'">
                  {{ row.source === 'html-template' ? 'HTML 导入' : '工程页面' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openEditRoute(client, row)">编辑</el-button>
                <el-button link type="danger" @click="deleteRoute(client, row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </section>

    <section class="routes-panel backup-panel">
      <div class="panel-heading">
        <div>
          <h2>页面备份</h2>
          <p>删除路由和替换导入都会产生备份；还原后备份仍会保留记录。</p>
        </div>
        <el-tag type="warning">{{ routeData?.backups?.length || 0 }} 条</el-tag>
      </div>
      <el-table :data="routeData?.backups || []" border empty-text="暂无页面备份">
        <el-table-column label="处理类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'deleted' ? 'danger' : 'warning'">
              {{ row.type === 'deleted' ? '删除备份' : row.type === 'edited' ? '编辑备份' : '替换备份' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="原页面" min-width="240">
          <template #default="{ row }">
            <strong>{{ row.original?.title || '-' }}</strong>
            <small>{{ row.client }}/{{ row.original?.path }}</small>
          </template>
        </el-table-column>
        <el-table-column label="备份时间" width="190">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.restoredAt" type="success">已还原</el-tag>
            <el-tag v-else type="info">待还原</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :disabled="Boolean(row.restoredAt)" @click="restoreBackup(row)">
              还原
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section class="routes-panel backup-panel">
      <div class="panel-heading">
        <div>
          <h2>分组备份</h2>
          <p>修改菜单分组名称前会保留备份；还原后备份仍会保留记录。</p>
        </div>
        <el-tag type="warning">{{ routeData?.sectionBackups?.length || 0 }} 条</el-tag>
      </div>
      <el-table :data="routeData?.sectionBackups || []" border empty-text="暂无菜单分组备份">
        <el-table-column label="客户端" width="130">
          <template #default="{ row }">{{ row.client }}</template>
        </el-table-column>
        <el-table-column label="分组变更" min-width="300">
          <template #default="{ row }">
            <div v-for="section in row.replacement || []" :key="section.id" class="backup-section-row">
              <span>{{ row.original?.find((item) => item.id === section.id)?.title || '-' }}</span>
              <el-icon><ArrowRight /></el-icon>
              <strong>{{ section.title }}</strong>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="修改时间" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.restoredAt" type="success">已还原</el-tag>
            <el-tag v-else type="info">待还原</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :disabled="Boolean(row.restoredAt)"
              @click="restoreSectionBackup(row)"
            >
              还原
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'edit' ? '编辑路由' : '新增路由'"
      width="560px"
      destroy-on-close
    >
      <el-form label-position="top">
        <el-form-item label="客户端">
          <el-select v-model="routeForm.client" style="width: 100%" @change="syncRouteSections">
            <el-option
              v-for="client in routeData?.clients || []"
              :key="client.id"
              :label="client.name"
              :value="client.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="路由片段">
          <el-input v-model="routeForm.routePath" placeholder="例如 vehicle-inspection" />
          <div class="form-help">仅使用小写英文字母、数字和连字符。</div>
        </el-form-item>
        <el-form-item label="路由名称">
          <el-input v-model="routeForm.pageTitle" placeholder="同时作为菜单显示名称" />
        </el-form-item>
        <div class="form-grid">
          <el-form-item label="菜单分组">
            <el-select v-model="routeForm.menuSection" style="width: 100%">
              <el-option
                v-for="section in selectedRouteClient?.sections || []"
                :key="section.id"
                :label="section.title"
                :value="section.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="菜单图标">
            <el-select v-model="routeForm.menuIcon" style="width: 100%">
              <el-option v-for="icon in iconOptions" :key="icon" :label="icon" :value="icon" />
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitRoute">
          {{ dialogMode === 'edit' ? '保存修改' : '生成路由' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="sectionDialogVisible" title="编辑菜单分组" width="560px" destroy-on-close>
      <div class="section-editor-heading">
        <p class="dialog-help">
          可新增、修改或删除菜单分组；已有分组 ID 保持不变，删除仍被页面使用的分组时系统会阻止保存。
        </p>
        <el-button size="small" @click="addSection">
          <el-icon><Plus /></el-icon>
          新增分组
        </el-button>
      </div>
      <div class="section-editor-list">
        <div v-for="(section, index) in sectionDraft" :key="section.id" class="section-editor-row">
          <el-input v-model="section.id" :disabled="!section.isNew" placeholder="分组 ID" />
          <el-input v-model="section.title" placeholder="请输入分组名称" />
          <el-button link type="danger" @click="removeSection(index)">删除</el-button>
        </div>
        <el-empty v-if="!sectionDraft.length" description="当前客户端暂无菜单分组" :image-size="70" />
      </div>
      <template #footer>
        <el-button @click="sectionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="sectionSaving" @click="saveSections">保存分组</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, ArrowRight, Edit, Plus, Refresh } from '@element-plus/icons-vue';

import { installedProjects } from '../../config/project-packages';

const selectedProjectId = ref(installedProjects[0]?.id || '');
const activeClientId = ref('');
const routeData = ref(null);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const dialogVisible = ref(false);
const dialogMode = ref('create');
const sectionDialogVisible = ref(false);
const sectionSaving = ref(false);
const sectionClientId = ref('');
const sectionDraft = ref([]);
const routeForm = reactive({
  client: '',
  originalPath: '',
  routePath: '',
  pageTitle: '',
  menuSection: '',
  menuIcon: 'Document',
});
const iconOptions = [
  'Calendar',
  'CirclePlus',
  'DataBoard',
  'Document',
  'Files',
  'House',
  'List',
  'Location',
  'Lock',
  'Management',
  'Medal',
  'Money',
  'Odometer',
  'Postcard',
  'Setting',
  'Tickets',
  'User',
  'Van',
  'Warning',
];

const selectedRouteClient = computed(
  () => routeData.value?.clients.find((client) => client.id === routeForm.client) || null,
);

watch(selectedProjectId, () => loadRoutes(), { immediate: true });

async function loadRoutes() {
  if (!selectedProjectId.value) {
    routeData.value = null;
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const response = await fetch(
      `/__page-transfer/routes?projectId=${encodeURIComponent(selectedProjectId.value)}`,
      {
        cache: 'no-store',
      },
    );
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || '路由读取失败。');
    routeData.value = payload;
    if (!routeData.value.clients.some((client) => client.id === activeClientId.value)) {
      activeClientId.value = routeData.value.clients[0]?.id || '';
    }
  } catch (loadError) {
    routeData.value = null;
    error.value = loadError.message;
  } finally {
    loading.value = false;
  }
}

function sectionTitle(client, sectionId) {
  return client.sections.find((section) => section.id === sectionId)?.title || sectionId || '-';
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}

function syncRouteSections() {
  const firstSection = selectedRouteClient.value?.sections[0];
  if (!selectedRouteClient.value?.sections.some((section) => section.id === routeForm.menuSection)) {
    routeForm.menuSection = firstSection?.id || '';
  }
}

function openCreateRoute(client) {
  Object.assign(routeForm, {
    client: client.id,
    originalPath: '',
    routePath: '',
    pageTitle: '',
    menuSection: client.sections[0]?.id || '',
    menuIcon: 'Document',
  });
  dialogMode.value = 'create';
  dialogVisible.value = true;
}

function openEditRoute(client, page) {
  Object.assign(routeForm, {
    client: client.id,
    originalPath: page.path,
    routePath: page.path,
    pageTitle: page.title,
    menuSection: page.section || client.sections[0]?.id || '',
    menuIcon: page.icon || 'Document',
  });
  dialogMode.value = 'edit';
  dialogVisible.value = true;
}

function openSectionManager(client) {
  sectionClientId.value = client.id;
  sectionDraft.value = client.sections.map((section) => ({
    id: section.id,
    title: section.title,
    isNew: false,
  }));
  sectionDialogVisible.value = true;
}

function addSection() {
  const existingIds = new Set(sectionDraft.value.map((section) => section.id));
  let index = sectionDraft.value.length + 1;
  let id = `group-${index}`;
  while (existingIds.has(id)) {
    index += 1;
    id = `group-${index}`;
  }
  sectionDraft.value.push({ id, title: '新分组', isNew: true });
}

async function removeSection(index) {
  const section = sectionDraft.value[index];
  if (!section) return;
  if (!section.isNew) {
    try {
      await ElMessageBox.confirm(
        `确认删除菜单分组“${section.title}”？如果仍有页面使用该分组，保存时会被阻止。`,
        '确认删除分组',
        { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' },
      );
    } catch {
      return;
    }
  }
  sectionDraft.value.splice(index, 1);
}

async function submitRoute() {
  if (!routeForm.routePath.trim() || !routeForm.pageTitle.trim() || !routeForm.menuSection) {
    ElMessage.error('请补充路由片段、页面名称和菜单分组。');
    return;
  }
  saving.value = true;
  try {
    const isEdit = dialogMode.value === 'edit';
    const response = await fetch(`/__page-transfer/route/${isEdit ? 'update' : 'create'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: selectedProjectId.value, ...routeForm }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok)
      throw new Error(payload.error || (isEdit ? '路由编辑失败。' : '路由新增失败。'));
    ElMessage.success(
      isEdit ? '路由信息已保存，请重新载入开发服务。' : '路由和占位页面已生成，请重新载入开发服务。',
    );
    dialogVisible.value = false;
    await loadRoutes();
  } catch (createError) {
    ElMessage.error(createError.message);
  } finally {
    saving.value = false;
  }
}

async function saveSections() {
  if (sectionDraft.value.some((section) => !section.title.trim())) {
    ElMessage.error('菜单分组名称不能为空。');
    return;
  }
  sectionSaving.value = true;
  try {
    const response = await fetch('/__page-transfer/section/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: selectedProjectId.value,
        client: sectionClientId.value,
        sections: sectionDraft.value,
      }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || '菜单分组保存失败。');
    ElMessage.success(`菜单分组已保存，备份编号：${payload.result.backupId}`);
    sectionDialogVisible.value = false;
    await loadRoutes();
  } catch (sectionError) {
    ElMessage.error(sectionError.message);
  } finally {
    sectionSaving.value = false;
  }
}

async function deleteRoute(client, page) {
  try {
    await ElMessageBox.confirm(
      `删除“${page.title}”后，路由会从菜单和页面注册表移除，但 Vue 文件和原定义会备份到项目包内。`,
      '确认删除路由',
      { confirmButtonText: '删除并备份', cancelButtonText: '取消', type: 'warning' },
    );
  } catch {
    return;
  }
  saving.value = true;
  try {
    const response = await fetch('/__page-transfer/route/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: selectedProjectId.value, client: client.id, pagePath: page.path }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || '路由删除失败。');
    ElMessage.success(`路由已删除，备份编号：${payload.result.backupId}`);
    await loadRoutes();
  } catch (deleteError) {
    ElMessage.error(deleteError.message);
  } finally {
    saving.value = false;
  }
}

async function restoreBackup(backup) {
  try {
    await ElMessageBox.confirm(
      `确认还原“${backup.original?.title || backup.original?.path}”？当前修改后的页面会被移除，原页面会重新登记。`,
      '确认还原页面',
      { confirmButtonText: '确认还原', cancelButtonText: '取消', type: 'warning' },
    );
  } catch {
    return;
  }
  saving.value = true;
  try {
    const response = await fetch('/__page-transfer/route/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: selectedProjectId.value, backupId: backup.id }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || '页面还原失败。');
    ElMessage.success('页面已还原，请重新载入开发服务。');
    await loadRoutes();
  } catch (restoreError) {
    ElMessage.error(restoreError.message);
  } finally {
    saving.value = false;
  }
}

async function restoreSectionBackup(backup) {
  try {
    await ElMessageBox.confirm(
      '确认还原这次菜单分组修改？当前分组名称会恢复为修改前的版本。',
      '确认还原菜单分组',
      { confirmButtonText: '确认还原', cancelButtonText: '取消', type: 'warning' },
    );
  } catch {
    return;
  }
  sectionSaving.value = true;
  try {
    const response = await fetch('/__page-transfer/section/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: selectedProjectId.value, backupId: backup.id }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || '菜单分组还原失败。');
    ElMessage.success('菜单分组已还原，请重新载入开发服务。');
    await loadRoutes();
  } catch (sectionError) {
    ElMessage.error(sectionError.message);
  } finally {
    sectionSaving.value = false;
  }
}
</script>

<style scoped>
.routes-page {
  width: min(1240px, calc(100% - 64px));
  min-height: 100svh;
  margin: 0 auto;
  padding: 28px 0 48px;
  color: var(--app-color-text-primary);
}
.routes-header {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr) auto;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--app-color-text-secondary);
  font-size: 13px;
}
.eyebrow {
  margin: 0 0 6px;
  color: var(--app-color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.routes-header h1,
.routes-header p,
.panel-heading h2,
.panel-heading p {
  margin: 0;
}
.routes-header h1 {
  font-size: 26px;
}
.subtitle,
.panel-heading p,
.client-summary span {
  margin-top: 6px !important;
  color: var(--app-color-text-muted);
  font-size: 13px;
}
.header-actions,
.client-toolbar,
.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.header-actions {
  justify-content: flex-end;
}
.project-select {
  width: 220px;
}
.routes-alert {
  margin-bottom: 16px;
}
.routes-panel {
  margin-bottom: 20px;
  padding: 22px;
  border: 1px solid var(--app-color-border);
  border-radius: var(--app-radius-panel);
  background: var(--app-color-surface);
  box-shadow: var(--app-shadow-panel);
}
.panel-heading {
  margin-bottom: 18px;
}
.panel-heading h2 {
  font-size: 18px;
}
.client-tabs :deep(.el-tabs__header) {
  margin-bottom: 18px;
}
.client-toolbar {
  margin-bottom: 14px;
}
.client-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.client-summary {
  display: grid;
  gap: 2px;
}
.route-table {
  width: 100%;
}
.dialog-help {
  margin: 0 0 16px;
  color: var(--app-color-text-muted);
  font-size: 13px;
}
.section-editor-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.section-editor-heading .dialog-help {
  flex: 1;
}
.section-editor-list {
  display: grid;
  gap: 12px;
}
.section-editor-row {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}
.backup-section-row {
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 24px;
}
.backup-section-row .el-icon {
  color: var(--app-color-text-muted);
}
.backup-panel :deep(.el-table__body) small,
.backup-panel :deep(.el-table__body) strong {
  display: block;
}
.backup-panel :deep(.el-table__body) small {
  margin-top: 4px;
  color: var(--app-color-text-muted);
  font-size: 12px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 18px;
}
.form-help {
  margin-top: 5px;
  color: var(--app-color-text-muted);
  font-size: 12px;
  line-height: 1.5;
}
@media (max-width: 840px) {
  .routes-page {
    width: calc(100% - 32px);
  }
  .routes-header {
    grid-template-columns: 1fr;
    align-items: start;
  }
  .header-actions {
    justify-content: flex-start;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
