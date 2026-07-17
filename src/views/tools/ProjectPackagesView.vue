<template>
  <main class="packages-page">
    <header class="packages-header">
      <RouterLink to="/" class="packages-back">
        <el-icon><ArrowLeft /></el-icon>
        返回首页
      </RouterLink>
      <div>
        <h1>项目包状态</h1>
        <p>管理项目包的基础资料；新增项目会从模板生成初始化包。</p>
      </div>
      <div class="packages-header__actions">
        <el-button v-if="canManageProjects" type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新建项目
        </el-button>
        <el-button v-if="canManageProjects" @click="$router.push('/tools/project-routes')">
          路由菜单管理
        </el-button>
        <el-button :loading="loading" @click="loadPackages">
          <el-icon><Refresh /></el-icon>
          重新扫描
        </el-button>
      </div>
    </header>

    <el-alert v-if="error" :title="error" type="error" :closable="false" />
    <el-alert v-if="notice" :title="notice" type="success" :closable="true" @close="notice = ''" />

    <section class="packages-section">
      <div class="packages-section__heading">
        <h2>可用项目</h2>
        <span>{{ projects.length }} 个</span>
      </div>
      <el-table :data="projects" border empty-text="尚未发现有效项目包">
        <el-table-column prop="name" label="项目名称" min-width="180" />
        <el-table-column prop="id" label="项目 ID" min-width="160" />
        <el-table-column prop="version" label="版本" width="110" />
        <el-table-column label="客户端" min-width="220">
          <template #default="{ row }">{{
            row.clients.map((client) => client.name).join('、') || '-'
          }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default><el-tag type="success">可用</el-tag></template>
        </el-table-column>
        <el-table-column label="首页显示" width="110">
          <template #default="{ row }">
            <el-tag :type="row.homepage?.visible !== false ? 'success' : 'info'">
              {{ row.homepage?.visible !== false ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="canManageProjects" label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section v-if="invalidProjects.length" class="packages-section">
      <div class="packages-section__heading">
        <h2>无效项目包</h2>
        <span>{{ invalidProjects.length }} 个</span>
      </div>
      <el-table :data="invalidProjects" border>
        <el-table-column prop="folder" label="文件夹" width="220" />
        <el-table-column label="问题">
          <template #default="{ row }">{{ row.errors.join('；') }}</template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="920px"
      destroy-on-close
      class="project-dialog"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="112px" class="project-form">
        <el-tabs v-model="activeConfigTab" class="project-config-tabs">
          <el-tab-pane label="基础资料" name="basic">
            <el-form-item label="项目 ID" prop="id">
              <el-input
                v-model="form.id"
                :disabled="dialogMode === 'edit'"
                placeholder="例如：demo-project"
              />
              <div class="form-help">仅使用小写英文字母、数字和连字符，创建后不能修改。</div>
            </el-form-item>
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="form.name" placeholder="用于首页和页面顶栏显示" />
            </el-form-item>
            <el-form-item label="项目简称" prop="shortName">
              <el-input v-model="form.shortName" placeholder="用于空间较小的入口位置" />
            </el-form-item>
            <el-form-item label="项目版本">
              <el-input v-model="form.version" placeholder="例如：0.1.0" />
            </el-form-item>
            <el-form-item label="默认语言">
              <el-select v-model="form.defaultLocale" style="width: 220px">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="繁體中文" value="zh-TW" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
            <el-form-item label="项目说明">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="2"
                placeholder="可选，用于项目首页说明"
              />
            </el-form-item>
            <el-form-item label="主题色" prop="primary">
              <div class="color-field">
                <el-color-picker v-model="form.primary" color-format="hex" />
                <el-input v-model="form.primary" maxlength="7" />
              </div>
            </el-form-item>
            <el-form-item label="内容区背景" prop="pageBackground">
              <div class="color-field">
                <el-color-picker v-model="form.pageBackground" color-format="hex" />
                <el-input v-model="form.pageBackground" maxlength="7" />
              </div>
            </el-form-item>
            <el-form-item label="项目 Logo">
              <div class="logo-field">
                <div class="logo-preview">
                  <img v-if="logoPreview" :src="logoPreview" alt="项目 Logo 预览" />
                  <span v-else>Logo</span>
                </div>
                <div class="logo-actions">
                  <input
                    ref="logoInput"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    hidden
                    @change="handleLogoChange"
                  />
                  <el-button @click="chooseLogo">
                    <el-icon><Upload /></el-icon>
                    选择图片
                  </el-button>
                  <el-button v-if="logoPreview" link type="danger" @click="clearLogo">移除 Logo</el-button>
                  <div class="form-help">支持 PNG、JPG、WebP、SVG，大小不超过 2 MB。</div>
                </div>
              </div>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="客户端入口" name="clients">
            <div class="tab-intro-row">
              <div class="tab-intro">
                管理项目已有客户端的显示名称、入口说明、默认页面和首页是否展示。客户端 ID
                与页面定义保持一致，新增客户端后可继续导入页面。
              </div>
              <el-button type="primary" plain size="small" @click="addClient">新增客户端入口</el-button>
            </div>
            <div class="client-config-list">
              <article v-for="client in form.clients" :key="client.id" class="client-config-card">
                <div class="client-config-card__header">
                  <div>
                    <strong>{{ client.name || '未命名客户端' }}</strong>
                    <el-tag size="small" :type="client.isNew ? 'warning' : 'info'">{{
                      client.id || '待填写 ID'
                    }}</el-tag>
                  </div>
                  <div class="client-config-card__actions">
                    <el-checkbox v-model="client.entryEnabled">在项目首页展示</el-checkbox>
                    <el-button v-if="client.isNew" link type="danger" @click="removeClient(client)"
                      >移除</el-button
                    >
                  </div>
                </div>
                <div class="client-config-grid">
                  <el-form-item v-if="client.isNew" label="客户端 ID" class="client-config-grid__wide">
                    <el-input v-model="client.id" placeholder="例如：admin、operation、enterprise" />
                    <div class="form-help">使用小写英文字母、数字和连字符；保存后作为客户端路由标识。</div>
                  </el-form-item>
                  <el-form-item label="入口名称">
                    <el-input v-model="client.name" placeholder="例如：营运端" />
                  </el-form-item>
                  <el-form-item label="入口图标">
                    <el-input v-model="client.entryIcon" placeholder="例如：Van、OfficeBuilding" />
                  </el-form-item>
                  <el-form-item label="入口顺序">
                    <el-input-number
                      v-model="client.entryOrder"
                      :min="1"
                      :max="999"
                      controls-position="right"
                    />
                  </el-form-item>
                  <el-form-item label="默认页面">
                    <el-input v-model="client.defaultPage" placeholder="例如：dashboard" />
                  </el-form-item>
                  <el-form-item label="登录账号">
                    <el-input v-model="client.loginAccount" placeholder="登录演示默认账号" />
                  </el-form-item>
                  <el-form-item label="租户代码">
                    <el-input v-model="client.tenantCode" placeholder="登录演示租户代码" />
                  </el-form-item>
                  <el-form-item label="客户端说明" class="client-config-grid__wide">
                    <el-input v-model="client.description" placeholder="用于首页入口卡片和客户端切换说明" />
                  </el-form-item>
                  <el-form-item label="登录背景路径" class="client-config-grid__wide">
                    <el-input
                      v-model="client.loginBackground"
                      placeholder="可选，例如：assets/auth/operation-login-bg.jpg"
                    />
                  </el-form-item>
                </div>
              </article>
              <el-empty v-if="!form.clients.length" description="当前项目尚未登记客户端" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="其他入口与能力" name="features">
            <div class="tab-intro">
              配置项目文档、移动端和工程工具是否对外展示，以及这些入口的名称和说明。
            </div>
            <div class="resource-entry-list">
              <article v-for="entry in form.resourceEntries" :key="entry.kind" class="resource-entry-card">
                <div class="resource-entry-card__header">
                  <div>
                    <strong>{{ entry.kind === 'docs' ? '文档中心' : '移动端' }}</strong>
                    <el-tag size="small" type="info">{{ entry.kind }}</el-tag>
                  </div>
                  <el-checkbox v-model="entry.enabled">在项目首页展示</el-checkbox>
                </div>
                <div class="client-config-grid">
                  <el-form-item label="入口名称">
                    <el-input v-model="entry.name" />
                  </el-form-item>
                  <el-form-item label="入口图标">
                    <el-input v-model="entry.icon" placeholder="例如：Document、Iphone" />
                  </el-form-item>
                  <el-form-item label="入口顺序">
                    <el-input-number v-model="entry.order" :min="1" :max="999" controls-position="right" />
                  </el-form-item>
                  <el-form-item label="入口说明" class="client-config-grid__wide">
                    <el-input v-model="entry.description" />
                  </el-form-item>
                  <el-form-item
                    v-if="entry.kind === 'docs'"
                    label="文档目录"
                    class="client-config-grid__wide"
                  >
                    <el-input v-model="form.docsRoot" placeholder="项目内目录，例如：docs" />
                  </el-form-item>
                  <el-form-item v-else label="移动端文件" class="client-config-grid__wide">
                    <el-input v-model="form.mobileEntry" placeholder="项目内文件，例如：mobile/app.html" />
                  </el-form-item>
                </div>
              </article>
            </div>

            <el-divider content-position="left">首页显示</el-divider>
            <div class="feature-switches">
              <el-checkbox v-model="form.homepageVisible">在首页项目选择中显示</el-checkbox>
            </div>

            <el-divider content-position="left">工程能力</el-divider>
            <div class="feature-switches">
              <el-checkbox v-model="form.features.pageTransfer">允许页面导入导出</el-checkbox>
              <el-checkbox v-model="form.features.designSystem">显示组件规范</el-checkbox>
              <el-checkbox v-model="form.features.legacyI18n">启用历史页面多语言映射</el-checkbox>
              <el-checkbox v-model="form.compatibility.legacyRoutes">保留历史路由兼容</el-checkbox>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Edit, Plus, Refresh, Upload } from '@element-plus/icons-vue';

import { getProjectAssetUrl, onProjectPackagesChanged } from '../../services/project-assets';

const projects = ref([]);
const invalidProjects = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const notice = ref('');
const dialogVisible = ref(false);
const dialogMode = ref('create');
const activeConfigTab = ref('basic');
const formRef = ref();
const logoInput = ref();
const logoPreview = ref('');
const canManageProjects = import.meta.env.DEV;
const form = reactive({
  id: '',
  name: '',
  shortName: '',
  version: '0.1.0',
  defaultLocale: 'zh-CN',
  description: '',
  primary: '#2563eb',
  pageBackground: '#f5f7fb',
  homepageVisible: true,
  clients: [],
  resourceEntries: [],
  docsRoot: 'docs',
  mobileEntry: 'mobile/app.html',
  features: {
    pageTransfer: true,
    designSystem: true,
    legacyI18n: false,
  },
  compatibility: {
    legacyRoutes: false,
  },
  logoDataUrl: '',
  removeLogo: false,
});
const formRules = {
  id: [
    { required: true, message: '请输入项目 ID', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9-]*$/, message: '请输入小写 kebab-case，例如 demo-project', trigger: 'blur' },
  ],
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  shortName: [{ required: true, message: '请输入项目简称', trigger: 'blur' }],
  primary: [{ pattern: /^#[a-f\d]{6}$/i, message: '请输入六位十六进制色值', trigger: 'blur' }],
  pageBackground: [{ pattern: /^#[a-f\d]{6}$/i, message: '请输入六位十六进制色值', trigger: 'blur' }],
};
const dialogTitle = computed(() => (dialogMode.value === 'create' ? '新建项目' : '编辑项目'));
let stopWatching = () => {};

function createClientDraft(client = {}, entry = null) {
  return {
    id: client.id || '',
    isNew: Boolean(client.isNew),
    name: client.name || '',
    description: client.description || '',
    icon: client.icon || 'Document',
    defaultPage: client.defaultPage || '',
    loginAccount: client.login?.account || '',
    tenantCode: client.login?.tenantCode || '',
    loginBackground: client.login?.background || '',
    entryEnabled: Boolean(entry),
    entryIcon: entry?.icon || client.icon || 'Document',
    entryOrder: Number(entry?.order) || 10,
  };
}

function createResourceEntryDraft(kind, entry = null) {
  const defaults = {
    docs: { name: '产品文档', description: '阅读项目 PRD 与产品说明。', icon: 'Document', order: 40 },
    mobile: { name: '移动端', description: '查看移动端业务流程和页面交互。', icon: 'Iphone', order: 30 },
  };
  return {
    kind,
    enabled: Boolean(entry),
    name: entry?.name || defaults[kind].name,
    description: entry?.description || defaults[kind].description,
    icon: entry?.icon || defaults[kind].icon,
    order: Number(entry?.order) || defaults[kind].order,
  };
}

async function loadPackages() {
  loading.value = true;
  error.value = '';
  try {
    const response = await fetch('/__projects/manifest', { cache: 'no-store' });
    if (!response.ok) throw new Error(`项目包扫描失败（${response.status}）`);
    const payload = await response.json();
    projects.value = payload.projects || [];
    invalidProjects.value = payload.invalidProjects || [];
  } catch (loadError) {
    error.value = loadError.message;
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  Object.assign(form, {
    id: '',
    name: '',
    shortName: '',
    version: '0.1.0',
    defaultLocale: 'zh-CN',
    description: '',
    primary: '#2563eb',
    pageBackground: '#f5f7fb',
    homepageVisible: true,
    clients: [
      createClientDraft(
        {
          id: 'admin',
          name: '管理端',
          description: '项目管理后台。',
          icon: 'Management',
          defaultPage: 'home',
        },
        { name: '管理端', description: '进入项目管理后台。', icon: 'Management', order: 10 },
      ),
    ],
    resourceEntries: [
      createResourceEntryDraft('docs', {
        name: '产品文档',
        description: '阅读项目 PRD 与产品说明。',
        icon: 'Document',
        order: 20,
      }),
      createResourceEntryDraft('mobile'),
    ],
    docsRoot: 'docs',
    mobileEntry: 'mobile/app.html',
    features: { pageTransfer: true, designSystem: true, legacyI18n: false },
    compatibility: { legacyRoutes: false },
    logoDataUrl: '',
    removeLogo: false,
  });
  logoPreview.value = '';
  activeConfigTab.value = 'basic';
  if (logoInput.value) logoInput.value.value = '';
}

function openCreateDialog() {
  resetForm();
  dialogMode.value = 'create';
  dialogVisible.value = true;
  nextTick(() => formRef.value?.clearValidate());
}

function openEditDialog(project) {
  resetForm();
  dialogMode.value = 'edit';
  const entries = project.entries || [];
  Object.assign(form, {
    id: project.id,
    name: project.name,
    shortName: project.shortName || project.name,
    version: project.version || '0.1.0',
    defaultLocale: project.defaultLocale || 'zh-CN',
    description: project.description || '',
    primary: project.theme?.primary || '#2563eb',
    pageBackground: project.theme?.pageBackground || '#f5f7fb',
    homepageVisible: project.homepage?.visible !== false,
    clients: (project.clients || []).map((client) =>
      createClientDraft(
        client,
        entries.find((entry) => entry.kind === 'client' && entry.clientId === client.id),
      ),
    ),
    resourceEntries: ['docs', 'mobile'].map((kind) =>
      createResourceEntryDraft(
        kind,
        entries.find((entry) => entry.kind === kind),
      ),
    ),
    docsRoot: project.docs?.root || 'docs',
    mobileEntry: project.mobile?.entry || 'mobile/app.html',
    features: {
      pageTransfer: project.features?.pageTransfer !== false,
      designSystem: project.features?.designSystem !== false,
      legacyI18n: Boolean(project.features?.legacyI18n),
    },
    compatibility: {
      legacyRoutes: Boolean(project.compatibility?.legacyRoutes),
    },
  });
  logoPreview.value = project.branding?.logo ? getProjectAssetUrl(project.id, project.branding.logo) : '';
  dialogVisible.value = true;
  nextTick(() => formRef.value?.clearValidate());
}

function chooseLogo() {
  logoInput.value?.click();
}

function clearLogo() {
  form.logoDataUrl = '';
  form.removeLogo = Boolean(dialogMode.value === 'edit' && logoPreview.value);
  logoPreview.value = '';
}

function handleLogoChange(event) {
  const [file] = event.target.files || [];
  event.target.value = '';
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('Logo 文件大小需控制在 2 MB 以内。');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    form.logoDataUrl = String(reader.result || '');
    form.removeLogo = false;
    logoPreview.value = form.logoDataUrl;
  };
  reader.onerror = () => ElMessage.error('Logo 读取失败，请重新选择。');
  reader.readAsDataURL(file);
}

function addClient() {
  let index = form.clients.length + 1;
  let id = `client-${index}`;
  while (form.clients.some((client) => client.id === id)) {
    index += 1;
    id = `client-${index}`;
  }
  form.clients.push(
    createClientDraft(
      {
        id,
        isNew: true,
        name: `客户端 ${index}`,
        description: '项目客户端入口。',
        icon: 'Management',
      },
      null,
    ),
  );
  activeConfigTab.value = 'clients';
}

function removeClient(client) {
  if (!client.isNew) return;
  const index = form.clients.indexOf(client);
  if (index >= 0) form.clients.splice(index, 1);
}

function buildProjectPayload() {
  const clients = form.clients.map((client) => ({
    id: client.id,
    name: client.name.trim(),
    description: client.description.trim(),
    icon: client.icon.trim() || 'Document',
    defaultPage: client.defaultPage.trim(),
    login: {
      account: client.loginAccount.trim(),
      tenantCode: client.tenantCode.trim(),
      ...(client.loginBackground.trim() ? { background: client.loginBackground.trim() } : {}),
    },
  }));
  const entries = [
    ...form.clients
      .filter((client) => client.entryEnabled)
      .map((client) => ({
        id: client.id,
        kind: 'client',
        clientId: client.id,
        name: client.name.trim(),
        description: client.description.trim(),
        icon: client.entryIcon.trim() || client.icon.trim() || 'Document',
        order: Number(client.entryOrder) || 10,
      })),
    ...form.resourceEntries
      .filter((entry) => entry.enabled)
      .map((entry) => ({
        id: entry.kind,
        kind: entry.kind,
        name: entry.name.trim(),
        description: entry.description.trim(),
        icon: entry.icon.trim() || (entry.kind === 'docs' ? 'Document' : 'Iphone'),
        order: Number(entry.order) || 30,
      })),
  ];
  const docsEntry = form.resourceEntries.find((entry) => entry.kind === 'docs');
  const mobileEntry = form.resourceEntries.find((entry) => entry.kind === 'mobile');
  return {
    id: form.id,
    name: form.name,
    shortName: form.shortName,
    version: form.version,
    defaultLocale: form.defaultLocale,
    description: form.description,
    primary: form.primary,
    pageBackground: form.pageBackground,
    homepage: { visible: Boolean(form.homepageVisible) },
    clients,
    entries,
    docs: { enabled: Boolean(docsEntry?.enabled), root: form.docsRoot.trim() || 'docs' },
    mobile: { enabled: Boolean(mobileEntry?.enabled), entry: form.mobileEntry.trim() || 'mobile/app.html' },
    features: { ...form.features },
    compatibility: { legacyRoutes: Boolean(form.compatibility.legacyRoutes) },
    logoDataUrl: form.logoDataUrl,
    removeLogo: form.removeLogo,
  };
}

async function submitForm() {
  if (saving.value) return;
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  if (form.clients.some((client) => !client.id.trim() || !/^[a-z][a-z0-9-]*$/.test(client.id.trim()))) {
    ElMessage.error('请补充正确的客户端 ID。');
    activeConfigTab.value = 'clients';
    return;
  }
  if (form.clients.some((client) => !client.name.trim())) {
    ElMessage.error('请补充所有客户端的入口名称。');
    activeConfigTab.value = 'clients';
    return;
  }
  saving.value = true;
  try {
    const endpoint = dialogMode.value === 'create' ? '/__projects/create' : '/__projects/update';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildProjectPayload()),
    });
    const payload = await response.json();
    if (!response.ok || payload.ok === false) throw new Error(payload.message || '项目保存失败');
    notice.value = `${payload.message} 如首页没有立即出现变化，请重启一次 Vite 开发服务。`;
    ElMessage.success(payload.message || '项目配置已保存');
    dialogVisible.value = false;
    await loadPackages();
  } catch (saveError) {
    ElMessage.error(saveError.message);
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadPackages();
  stopWatching = onProjectPackagesChanged(loadPackages);
});
onBeforeUnmount(() => stopWatching());
</script>

<style scoped>
.packages-page {
  width: min(1120px, calc(100% - 64px));
  margin: 0 auto;
  padding: 28px 0 48px;
}
.packages-header {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) auto;
  align-items: center;
  gap: 20px;
  margin-bottom: 22px;
}
.packages-header h1,
.packages-header p {
  margin: 0;
}
.packages-header h1 {
  font-size: 26px;
}
.packages-header p {
  margin-top: 6px;
  color: var(--app-color-text-muted);
  font-size: 13px;
}
.packages-header__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
.packages-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--app-color-text-secondary);
  font-size: 13px;
}
.packages-section {
  margin-top: 20px;
}
.packages-section__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}
.packages-section__heading h2 {
  margin: 0;
  font-size: 17px;
}
.packages-section__heading span {
  color: var(--app-color-text-muted);
  font-size: 12px;
}
.project-form {
  padding-top: 4px;
}
.project-config-tabs {
  min-height: 520px;
}
.tab-intro {
  margin: 0;
  color: var(--app-color-text-muted);
  font-size: 13px;
  line-height: 1.6;
}
.tab-intro-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.client-config-list,
.resource-entry-list {
  display: grid;
  gap: 14px;
}
.client-config-card,
.resource-entry-card {
  padding: 16px;
  border: 1px solid var(--app-color-border);
  border-radius: var(--app-radius-panel);
  background: var(--app-color-surface-subtle);
}
.client-config-card__header,
.resource-entry-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.client-config-card__header > div,
.resource-entry-card__header > div {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.client-config-card__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.client-config-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 18px;
}
.client-config-grid .el-form-item {
  margin-bottom: 14px;
}
.client-config-grid__wide {
  grid-column: 1 / -1;
}
.feature-switches {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, max-content));
  gap: 16px 28px;
  padding: 4px 0 12px 112px;
}
.form-help {
  margin-top: 5px;
  color: var(--app-color-text-muted);
  font-size: 12px;
  line-height: 1.5;
}
.color-field {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 220px;
}
.color-field .el-input {
  flex: 1;
}
.logo-field {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.logo-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 56px;
  overflow: hidden;
  border: 1px solid var(--app-color-border);
  border-radius: 6px;
  background: var(--app-color-page);
  color: var(--app-color-text-muted);
  font-size: 12px;
}
.logo-preview img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.logo-actions {
  min-width: 0;
}
@media (max-width: 760px) {
  .packages-page {
    width: calc(100% - 32px);
  }
  .packages-header {
    grid-template-columns: 1fr auto;
  }
  .packages-header__actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
  .packages-header > div:not(.packages-header__actions) {
    grid-column: 1 / -1;
    grid-row: 1;
  }
  .client-config-grid {
    grid-template-columns: 1fr;
  }
  .tab-intro-row {
    flex-direction: column;
  }
  .client-config-grid__wide {
    grid-column: auto;
  }
  .feature-switches {
    grid-template-columns: 1fr;
    padding-left: 0;
  }
}
</style>
