<template>
  <div class="project-portal" :style="{ '--portal-accent': accent }">
    <aside class="project-portal__sidebar">
      <RouterLink class="project-portal__brand" to="/" aria-label="返回首页">
        <span class="project-portal__brand-icon"
          ><span class="material-symbols-outlined">deployed_code</span></span
        >
        <span class="project-portal__brand-copy">
          <strong>{{ brandTitle }}</strong>
          <small>{{ brandLabel }}</small>
        </span>
      </RouterLink>

      <section class="project-portal__project-section">
        <div class="project-portal__project-heading">
          <span>项目</span>
          <small>{{ projects.length }}</small>
        </div>
        <nav
          id="project-list"
          ref="projectListRef"
          class="project-portal__project-list"
          aria-label="选择项目"
        >
          <button type="button" :class="{ 'is-active': !selectedProjectId }" @click="selectProject('')">
            <span class="project-portal__project-logo project-portal__project-logo--overview">
              <el-icon><Grid /></el-icon>
            </span>
            <span class="project-portal__project-copy">
              <strong>项目总览</strong>
              <small>查看全部项目</small>
            </span>
          </button>
          <button
            v-for="project in projects"
            :key="project.id"
            type="button"
            :data-project-id="project.id"
            :class="{ 'is-active': project.id === selectedProjectId }"
            @click="selectProject(project.id)"
          >
            <span class="project-portal__project-logo">
              <img v-if="project.logo" :src="project.logo" :alt="project.name" />
              <b v-else>{{ project.name.slice(0, 1) }}</b>
            </span>
            <span class="project-portal__project-copy">
              <strong>{{ project.name }}</strong>
              <small>{{ project.version ? `V${project.version}` : '未设置版本' }}</small>
            </span>
          </button>
        </nav>
      </section>

      <div class="project-portal__sidebar-footer">
        <RouterLink to="/components">
          <el-icon><Setting /></el-icon>
          <span>组件规范</span>
        </RouterLink>
        <div v-if="$slots.footer" class="project-portal__engineering-links">
          <slot name="footer" />
        </div>
        <div class="project-portal__language-row">
          <span>界面语言</span>
          <el-select v-model="currentLocale" class="project-portal__language" size="small">
            <el-option
              v-for="option in localeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
        <div v-if="$slots['new-project']" class="project-portal__new-project">
          <slot name="new-project" />
        </div>
      </div>
    </aside>

    <main class="project-portal__content">
      <div class="project-portal__workspace">
        <template v-if="projectSelected">
          <header class="project-portal__header">
            <div class="project-portal__status-line">
              <span class="project-portal__version">当前项目</span>
              <span class="project-portal__status-dot" aria-hidden="true" />
              <span>项目可用</span>
            </div>
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
          </header>

          <div v-if="hasItems" class="project-portal__selected-content">
            <section v-if="clientItems.length" class="project-portal__section">
              <div class="project-portal__section-heading">
                <h2>客户端入口</h2>
                <span>共 {{ clientItems.length }} 个入口</span>
              </div>
              <div class="project-portal__client-grid">
                <RouterLink
                  v-for="(item, index) in clientItems"
                  :key="item.id"
                  :to="item.to"
                  class="project-portal__client-card"
                >
                  <div class="project-portal__client-card-top">
                    <span class="project-portal__client-icon">
                      <el-icon><component :is="item.icon" /></el-icon>
                    </span>
                    <span class="project-portal__client-status">
                      <i :class="`is-${index % 3}`" aria-hidden="true" />
                      {{ item.kind === 'mobile' ? '演示' : '可访问' }}
                    </span>
                  </div>
                  <div class="project-portal__client-copy">
                    <h3>{{ item.name }}</h3>
                    <p>{{ item.description || '进入当前客户端查看原型页面。' }}</p>
                    <div class="project-portal__client-footer">
                      <span>{{ version ? `V${version}` : '当前版本' }}</span>
                      <span>打开入口</span>
                    </div>
                  </div>
                </RouterLink>
              </div>
            </section>

            <section class="project-portal__lower-grid">
              <div class="project-portal__document-card">
                <div class="project-portal__document-heading">
                  <div>
                    <span class="material-symbols-outlined">description</span>
                    <h2>项目文档</h2>
                  </div>
                  <span>{{ resourceItems.length }} 个入口</span>
                </div>
                <p class="project-portal__document-description">
                  查看当前项目的产品需求、业务流程与项目说明。
                </p>
                <div v-if="resourceItems.length" class="project-portal__document-list">
                  <RouterLink v-for="item in resourceItems" :key="item.id" :to="item.to">
                    <span class="project-portal__document-icon">
                      <el-icon><component :is="item.icon" /></el-icon>
                    </span>
                    <span>
                      <strong>{{ item.name }}</strong>
                      <small>{{ item.description }}</small>
                    </span>
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </RouterLink>
                </div>
                <div v-else class="project-portal__document-empty">当前项目尚未配置文档入口。</div>
              </div>

              <div class="project-portal__activity-card">
                <div class="project-portal__activity-heading">
                  <h2>最近活动</h2>
                  <span class="material-symbols-outlined">more_horiz</span>
                </div>
                <div class="project-portal__timeline">
                  <div class="project-portal__timeline-item is-active">
                    <i aria-hidden="true"><b /></i>
                    <div>
                      <div><strong>项目包加载成功</strong><small>10分钟前</small></div>
                      <p>项目配置、客户端入口与资源已完成载入。</p>
                    </div>
                  </div>
                  <div class="project-portal__timeline-item">
                    <i aria-hidden="true"><b /></i>
                    <div>
                      <div><strong>组件规范已更新</strong><small>2小时前</small></div>
                      <p>公共组件示例与页面规范已同步。</p>
                    </div>
                  </div>
                  <div class="project-portal__timeline-item">
                    <i aria-hidden="true"><b /></i>
                    <div>
                      <div><strong>页面路由已同步</strong><small>昨天</small></div>
                      <p>项目菜单与页面路由已完成检查。</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section v-else class="project-portal__empty-state project-portal__empty-state--compact">
            <span class="project-portal__empty-icon"><FolderOpened /></span>
            <h2>{{ emptyTitle }}</h2>
            <p>{{ emptyDescription }}</p>
          </section>
        </template>

        <template v-else>
          <section class="project-portal__empty-state">
            <span class="project-portal__empty-icon"><Grid /></span>
            <h1>{{ emptyTitle }}</h1>
            <p>{{ emptyDescription }}</p>
            <div class="project-portal__empty-actions">
              <button v-if="projects.length" type="button" @click="focusProjectList">
                <el-icon><FolderOpened /></el-icon>
                浏览项目
              </button>
              <slot name="empty-actions" />
            </div>
          </section>

          <section v-if="projects.length" class="project-portal__available-projects">
            <div class="project-portal__available-heading">
              <h2>可用项目</h2>
              <span>共 {{ projects.length }} 个</span>
            </div>
            <div class="project-portal__available-grid">
              <button
                v-for="project in visibleProjects"
                :key="project.id"
                type="button"
                @click="selectProject(project.id)"
              >
                <span class="project-portal__available-icon">
                  <img v-if="project.logo" :src="project.logo" :alt="project.name" />
                  <b v-else>{{ project.name.slice(0, 1) }}</b>
                </span>
                <span class="project-portal__available-copy">
                  <strong>{{ project.name }}</strong>
                  <small>{{ project.description || '打开项目查看客户端、原型与产品资料。' }}</small>
                </span>
                <span class="project-portal__available-meta">
                  <small>{{ project.version ? `V${project.version}` : '未设置版本' }}</small>
                  <el-icon><ArrowRight /></el-icon>
                </span>
              </button>
            </div>
          </section>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowRight, FolderOpened, Grid, Setting } from '@element-plus/icons-vue';

import { localeOptions, setLocale } from '../i18n';

const props = defineProps({
  brandTitle: { type: String, required: true },
  brandLabel: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  projectSelected: { type: Boolean, default: false },
  projects: { type: Array, default: () => [] },
  selectedProjectId: { type: String, default: '' },
  accent: { type: String, default: '#0071e3' },
  version: { type: String, default: '' },
  sections: { type: Array, default: () => [] },
  emptyTitle: { type: String, default: '暂无可用内容' },
  emptyDescription: { type: String, default: '' },
});

const emit = defineEmits(['select-project']);
const projectListRef = ref(null);
const { locale } = useI18n({ useScope: 'global' });
const currentLocale = computed({
  get: () => locale.value,
  set: (value) => setLocale(value),
});
const visibleSections = computed(() => props.sections.filter((section) => section.items?.length));
const clientSection = computed(() => visibleSections.value.find((section) => section.variant !== 'resource'));
const resourceSection = computed(() =>
  visibleSections.value.find((section) => section.variant === 'resource'),
);
const clientItems = computed(() => clientSection.value?.items || []);
const resourceItems = computed(() => resourceSection.value?.items || []);
const visibleProjects = computed(() => props.projects.slice(0, 3));
const hasItems = computed(() => Boolean(clientItems.value.length || resourceItems.value.length));

function selectProject(projectId) {
  emit('select-project', projectId);
}

function focusProjectList() {
  projectListRef.value?.querySelector('[data-project-id]')?.focus();
}
</script>

<style scoped>
.project-portal {
  min-height: 100svh;
  background: #f2f2f7;
  color: #1b1b1d;
}
.project-portal__sidebar {
  position: fixed;
  z-index: 10;
  inset: 0 auto 0 0;
  width: 256px;
  display: flex;
  flex-direction: column;
  padding: 30px 16px 20px;
  border-right: 1px solid rgb(193 198 215 / 38%);
  background: #fff;
}
.project-portal__brand {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 0 8px;
  color: #1b1b1d;
}
.project-portal__brand strong {
  overflow: hidden;
  font-size: 21px;
  font-weight: 750;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-portal__brand small {
  margin-top: 5px;
  color: #555c69;
  font-size: 11px;
}
.project-portal__project-section {
  min-height: 0;
  margin-top: 42px;
}
.project-portal__project-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 8px;
  color: #7a808d;
  font-size: 11px;
}
.project-portal__project-heading small {
  min-width: 22px;
  text-align: right;
}
.project-portal__project-list {
  max-height: calc(100svh - 270px);
  overflow-y: auto;
}
.project-portal__project-list button {
  position: relative;
  width: 100%;
  min-height: 54px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 7px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #303746;
  cursor: pointer;
  text-align: left;
}
.project-portal__project-list button + button {
  margin-top: 4px;
}
.project-portal__project-list button:hover,
.project-portal__project-list button:focus-visible {
  background: #f6f3f5;
}
.project-portal__project-list button.is-active {
  background: #f6f3f5;
  color: var(--portal-accent);
}
.project-portal__project-list button.is-active::after {
  position: absolute;
  inset: 8px 0 8px auto;
  width: 2px;
  border-radius: 2px;
  background: var(--portal-accent);
  content: '';
}
.project-portal__project-logo {
  width: 34px;
  height: 34px;
  display: grid;
  flex: 0 0 34px;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e4e2e4;
  border-radius: 8px;
  background: #fff;
  color: #303746;
}
.project-portal__project-logo--overview {
  background: #f0edef;
  color: var(--portal-accent);
  font-size: 17px;
}
.project-portal__project-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.project-portal__project-logo b {
  font-size: 13px;
}
.project-portal__project-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
}
.project-portal__project-copy strong,
.project-portal__project-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-portal__project-copy strong {
  font-size: 13px;
  font-weight: 650;
}
.project-portal__project-copy small {
  margin-top: 2px;
  color: #7a808d;
  font-size: 10px;
}
.project-portal__sidebar-footer {
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #ebe8ec;
}
.project-portal__sidebar-footer > a,
.project-portal__engineering-links :deep(a) {
  display: flex;
  align-items: center;
  min-height: 32px;
  gap: 8px;
  padding: 0 9px;
  border-radius: 6px;
  color: #505765;
  font-size: 11px;
}
.project-portal__sidebar-footer > a:hover,
.project-portal__engineering-links :deep(a:hover) {
  background: #f6f3f5;
  color: var(--portal-accent);
}
.project-portal__engineering-links {
  display: flex;
  flex-direction: column;
}
.project-portal__language-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 9px 0;
  border-top: 1px solid #f0edef;
  color: #7a808d;
  font-size: 10px;
}
.project-portal__language {
  width: 88px;
}
.project-portal__language :deep(.el-select__wrapper) {
  min-height: 28px;
  border: 1px solid #e0dde2;
  border-radius: 6px;
  background: #fff;
  box-shadow: none;
}
.project-portal__language :deep(.el-select__selected-item) {
  font-size: 10px;
}
.project-portal__content {
  min-height: 100svh;
  margin-left: 256px;
}
.project-portal__workspace {
  width: min(1180px, calc(100% - 72px));
  margin: 0 auto;
  padding: 48px 0 60px;
}
.project-portal__header {
  padding-bottom: 26px;
  border-bottom: 1px solid rgb(193 198 215 / 35%);
}
.project-portal__status-line {
  display: flex;
  align-items: center;
  min-height: 26px;
  gap: 8px;
  color: var(--portal-accent);
  font-size: 12px;
  font-weight: 650;
}
.project-portal__version {
  display: inline-flex;
  align-items: center;
  min-height: 25px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--portal-accent);
  color: #fff;
}
.project-portal__status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--portal-accent);
}
.project-portal__header h1,
.project-portal__header p {
  margin: 0;
}
.project-portal__header h1 {
  margin-top: 8px;
  color: #111214;
  font-size: 48px;
  font-weight: 750;
  letter-spacing: 0;
  line-height: 1.15;
  overflow-wrap: anywhere;
}
.project-portal__header p {
  max-width: 760px;
  margin-top: 11px;
  color: #555c69;
  font-size: 15px;
  line-height: 1.65;
}
.project-portal__dashboard {
  display: grid;
  grid-template-columns: minmax(0, 2.15fr) minmax(280px, 1fr);
  gap: 30px;
  margin-top: 34px;
}
.project-portal__primary-column,
.project-portal__rail {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 30px;
}
.project-portal__section-title,
.project-portal__info-heading > div {
  display: flex;
  align-items: center;
  gap: 10px;
}
.project-portal__section-title .el-icon,
.project-portal__info-heading .el-icon {
  color: var(--portal-accent);
  font-size: 21px;
}
.project-portal__section-title h2,
.project-portal__info-heading h2 {
  margin: 0;
  color: #17181b;
  font-size: 20px;
  font-weight: 700;
}
.project-portal__client-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}
.project-portal__client-card {
  min-height: 280px;
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 24px;
  border: 1px solid rgb(0 0 0 / 10%);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 20px rgb(0 0 0 / 5%);
  color: #1b1b1d;
  transition:
    box-shadow 160ms ease,
    transform 160ms ease;
}
.project-portal__client-card:hover,
.project-portal__client-card:focus-visible {
  box-shadow: 0 12px 30px rgb(0 0 0 / 10%);
  transform: translateY(-2px);
}
.project-portal__client-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #e4e2e4;
  color: #555860;
  font-size: 27px;
}
.project-portal__client-card:nth-child(3n + 2) .project-portal__client-icon {
  background: var(--portal-accent);
  color: #fff;
}
.project-portal__client-card:nth-child(3n) .project-portal__client-icon {
  background: #737479;
  color: #fff;
}
.project-portal__client-copy {
  margin-top: 28px;
}
.project-portal__client-copy h3,
.project-portal__client-copy p {
  margin: 0;
}
.project-portal__client-copy h3 {
  font-size: 19px;
  font-weight: 650;
}
.project-portal__client-copy p {
  display: -webkit-box;
  margin-top: 8px;
  overflow: hidden;
  color: #4f5665;
  font-size: 14px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.project-portal__client-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #efedf0;
  color: #596170;
  font-size: 11px;
}
.project-portal__client-footer > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.project-portal__client-footer i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--portal-accent);
}
.project-portal__feature {
  position: relative;
  height: 220px;
  overflow: hidden;
  border: 1px solid rgb(0 0 0 / 10%);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 20px rgb(0 0 0 / 5%);
}
.project-portal__feature img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.project-portal__feature-caption {
  position: absolute;
  inset: auto 0 0;
  display: flex;
  flex-direction: column;
  padding: 15px 22px;
  background: rgb(255 255 255 / 82%);
  backdrop-filter: blur(14px);
}
.project-portal__feature-caption strong {
  font-size: 19px;
}
.project-portal__feature-caption span {
  margin-top: 3px;
  color: #555c69;
  font-size: 12px;
}
.project-portal__info-card {
  padding: 24px;
  border: 1px solid rgb(0 0 0 / 10%);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 20px rgb(0 0 0 / 5%);
}
.project-portal__info-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 17px;
}
.project-portal__info-heading--plain {
  justify-content: flex-start;
}
.project-portal__availability {
  padding: 5px 9px;
  border-radius: 999px;
  background: var(--portal-accent);
  color: #fff;
  font-size: 10px;
  font-weight: 650;
}
.project-portal__facts {
  margin: 0;
}
.project-portal__facts > div {
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid #efedf0;
}
.project-portal__facts dt,
.project-portal__facts dd {
  margin: 0;
  font-size: 12px;
}
.project-portal__facts dt {
  color: #626a78;
}
.project-portal__facts dd {
  font-weight: 650;
  text-align: right;
}
.project-portal__theme-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.project-portal__theme-value i {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}
.project-portal__quick-links > a {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  padding: 13px 0;
  border-top: 1px solid #efedf0;
  color: #1e2330;
}
.project-portal__quick-links > a:first-child {
  border-top: 0;
}
.project-portal__quick-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #f0edef;
  color: var(--portal-accent);
}
.project-portal__quick-links > a > span:nth-child(2) {
  display: flex;
  min-width: 0;
  flex-direction: column;
}
.project-portal__quick-links strong,
.project-portal__quick-links small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-portal__quick-links strong {
  font-size: 12px;
}
.project-portal__quick-links small {
  margin-top: 3px;
  color: #727987;
  font-size: 10px;
}
.project-portal__resource-empty {
  padding: 18px 0 4px;
  border-top: 1px solid #efedf0;
  color: #7a808d;
  font-size: 11px;
  line-height: 1.6;
}
.project-portal__empty-state {
  min-height: 560px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: 60px 20px 44px;
  text-align: center;
}
.project-portal__empty-state--compact {
  min-height: 420px;
}
.project-portal__empty-icon {
  width: 96px;
  height: 96px;
  display: grid;
  place-items: center;
  border: 1px solid rgb(193 198 215 / 28%);
  border-radius: 24px;
  background: #f6f3f5;
  box-shadow: 0 4px 20px rgb(0 0 0 / 5%);
  color: #5a5c60;
  font-size: 47px;
}
.project-portal__empty-state h1,
.project-portal__empty-state h2,
.project-portal__empty-state p {
  margin: 0;
}
.project-portal__empty-state h1 {
  margin-top: 32px;
  font-size: 48px;
  font-weight: 750;
}
.project-portal__empty-state h2 {
  margin-top: 24px;
  font-size: 25px;
}
.project-portal__empty-state p {
  max-width: 620px;
  margin-top: 12px;
  color: #414755;
  font-size: 16px;
  line-height: 1.65;
}
.project-portal__empty-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 32px;
}
.project-portal__empty-actions > button,
.project-portal__empty-actions :deep(a) {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 28px;
  border: 0;
  border-radius: 999px;
  background: var(--portal-accent);
  box-shadow: 0 4px 12px rgb(0 0 0 / 9%);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 650;
}
.project-portal__empty-actions :deep(a) {
  border: 1px solid rgb(193 198 215 / 35%);
  background: #fff;
  color: var(--portal-accent);
}
.project-portal__available-projects {
  padding-top: 34px;
  border-top: 1px solid rgb(193 198 215 / 35%);
}
.project-portal__available-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}
.project-portal__available-heading h2 {
  margin: 0;
  font-size: 20px;
}
.project-portal__available-heading span {
  color: #6e7480;
  font-size: 11px;
}
.project-portal__available-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}
.project-portal__available-grid button {
  min-height: 238px;
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 26px;
  border: 1px solid rgb(0 0 0 / 8%);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 20px rgb(0 0 0 / 5%);
  color: #1b1b1d;
  cursor: pointer;
  text-align: left;
}
.project-portal__available-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 9px;
  background: #dceaff;
  color: var(--portal-accent);
}
.project-portal__available-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}
.project-portal__available-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  margin-top: auto;
}
.project-portal__available-copy strong {
  font-size: 19px;
  line-height: 1.35;
}
.project-portal__available-copy small {
  display: -webkit-box;
  margin-top: 7px;
  overflow: hidden;
  color: #4f5665;
  font-size: 13px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.project-portal__available-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
  color: #6e7480;
}
.project-portal__available-meta small {
  font-size: 10px;
}
@media (max-width: 1120px) {
  .project-portal__client-grid,
  .project-portal__available-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 880px) {
  .project-portal__sidebar {
    position: static;
    width: 100%;
    min-height: auto;
    padding: 18px;
  }
  .project-portal__project-section {
    margin-top: 18px;
  }
  .project-portal__project-list {
    display: flex;
    max-height: none;
    gap: 8px;
    overflow-x: auto;
  }
  .project-portal__project-list button {
    width: 190px;
    flex: 0 0 190px;
  }
  .project-portal__project-list button + button {
    margin-top: 0;
  }
  .project-portal__sidebar-footer {
    display: none;
  }
  .project-portal__content {
    margin-left: 0;
  }
  .project-portal__workspace {
    width: min(100% - 36px, 860px);
    padding-top: 34px;
  }
  .project-portal__dashboard {
    grid-template-columns: 1fr;
  }
  .project-portal__rail {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}
@media (max-width: 640px) {
  .project-portal__workspace {
    width: calc(100% - 28px);
  }
  .project-portal__header h1,
  .project-portal__empty-state h1 {
    font-size: 34px;
  }
  .project-portal__client-grid,
  .project-portal__available-grid,
  .project-portal__rail {
    grid-template-columns: 1fr;
  }
  .project-portal__empty-state {
    min-height: 480px;
  }
  .project-portal__empty-actions {
    flex-direction: column;
  }
  .project-portal__empty-actions > button,
  .project-portal__empty-actions :deep(a) {
    width: 100%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .project-portal__client-card {
    transition: none;
  }
}

/* Final homepage treatment follows the supplied Cupertino glass reference. */
.project-portal {
  background-color: #f6f3f5;
  background-image:
    radial-gradient(at 0% 0%, hsl(210 100% 95%) 0, transparent 50%),
    radial-gradient(at 100% 0%, hsl(270 80% 95%) 0, transparent 50%),
    radial-gradient(at 100% 100%, hsl(180 80% 90%) 0, transparent 50%),
    radial-gradient(at 0% 100%, hsl(240 100% 97%) 0, transparent 50%);
  background-attachment: fixed;
  background-size: cover;
  font-family: var(--app-font-family-sans);
}
.project-portal__sidebar {
  padding: 16px;
  border-right: 1px solid rgb(0 0 0 / 4%);
  background: rgb(246 243 245 / 70%);
  backdrop-filter: blur(40px);
}
.project-portal__brand {
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 16px;
  margin-bottom: 32px;
  padding: 8px;
}
.project-portal__brand-icon {
  width: 40px;
  height: 40px;
  display: grid;
  flex: 0 0 40px;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgb(193 198 215 / 20%);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 6px rgb(0 0 0 / 6%);
  color: var(--portal-accent);
}
.project-portal__brand-icon .material-symbols-outlined {
  font-size: 22px;
}
.project-portal__brand-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
}
.project-portal__brand-copy strong {
  overflow: hidden;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-portal__brand-copy small {
  margin-top: 4px;
  overflow: hidden;
  color: #414755;
  font-size: 10px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.7;
}
.project-portal__project-section {
  min-height: 0;
  flex: 1;
  margin-top: 0;
}
.project-portal__project-heading {
  display: none;
}
.project-portal__project-list {
  max-height: calc(100svh - 292px);
}
.project-portal__project-list button {
  min-height: 44px;
  gap: 16px;
  padding: 8px 16px;
  border-radius: 8px;
  color: #414755;
}
.project-portal__project-list button + button {
  margin-top: 8px;
}
.project-portal__project-list button:hover,
.project-portal__project-list button:focus-visible {
  background: #eae7ea;
}
.project-portal__project-list button.is-active {
  background: var(--portal-accent);
  box-shadow: 0 2px 5px rgb(0 0 0 / 8%);
  color: #fff;
}
.project-portal__project-list button.is-active::after {
  display: none;
}
.project-portal__project-logo {
  width: 24px;
  height: 24px;
  flex-basis: 24px;
  border: 0;
  border-radius: 6px;
  background: transparent;
}
.project-portal__project-logo--overview {
  background: transparent;
  color: currentColor;
}
.project-portal__project-logo img {
  border-radius: 5px;
  background: #fff;
}
.project-portal__project-copy strong {
  font-size: 13px;
  font-weight: 500;
}
.project-portal__project-copy small {
  display: none;
}
.project-portal__project-list button.is-active .project-portal__project-copy strong {
  font-weight: 700;
}
.project-portal__sidebar-footer {
  padding-top: 20px;
  border-top: 1px solid rgb(193 198 215 / 20%);
}
.project-portal__sidebar-footer > a,
.project-portal__engineering-links :deep(a) {
  min-height: 34px;
  gap: 12px;
  padding: 6px 8px;
  color: #414755;
  font-size: 11px;
}
.project-portal__sidebar-footer > a:hover,
.project-portal__engineering-links :deep(a:hover) {
  background: transparent;
  color: var(--portal-accent);
}
.project-portal__language-row {
  margin-top: 5px;
  padding: 8px 8px 0;
  border-top: 0;
  color: #414755;
}
.project-portal__new-project {
  margin-top: 14px;
}
.project-portal__new-project :deep(a) {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  background: var(--portal-accent);
  box-shadow: 0 2px 5px rgb(0 0 0 / 8%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
.project-portal__content {
  overflow: hidden;
}
.project-portal__workspace {
  width: min(1200px, calc(100% - 80px));
  padding: 64px 0;
}
.project-portal__header {
  padding-bottom: 0;
  border-bottom: 0;
}
.project-portal__status-line {
  gap: 16px;
  min-height: 26px;
  color: #414755;
  font-size: 15px;
  font-weight: 400;
}
.project-portal__version {
  min-height: 25px;
  padding: 0 12px;
  background: rgb(0 112 235 / 24%);
  color: #004493;
  font-size: 11px;
  font-weight: 700;
}
.project-portal__status-dot {
  width: 8px;
  height: 8px;
  margin-right: -11px;
  background: #10b981;
}
.project-portal__header h1 {
  margin-top: 8px;
  font-size: 48px;
  font-weight: 700;
  line-height: 56px;
}
.project-portal__header p {
  max-width: 760px;
  margin-top: 12px;
  font-size: 17px;
  line-height: 1.65;
}
.project-portal__selected-content {
  display: flex;
  flex-direction: column;
  gap: 48px;
  margin-top: 48px;
}
.project-portal__section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.project-portal__section-heading h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.project-portal__section-heading > span {
  color: var(--portal-accent);
  font-size: 13px;
}
.project-portal__client-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin-top: 0;
}
.project-portal__client-card {
  min-height: 304px;
  padding: 24px;
  border: 1px solid rgb(255 255 255 / 40%);
  border-radius: 16px;
  background: rgb(255 255 255 / 60%);
  box-shadow:
    0 4px 24px -1px rgb(0 0 0 / 5%),
    0 2px 8px -1px rgb(0 0 0 / 2%);
  backdrop-filter: blur(24px);
}
.project-portal__client-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.project-portal__client-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgb(0 88 188 / 10%);
  color: var(--portal-accent);
  font-size: 24px;
}
.project-portal__client-card:nth-child(3n + 2) .project-portal__client-icon {
  background: rgb(115 116 121 / 10%);
  color: #5a5c60;
}
.project-portal__client-card:nth-child(3n) .project-portal__client-icon {
  background: rgb(224 223 228 / 30%);
  color: #5d5e63;
}
.project-portal__client-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid rgb(193 198 215 / 20%);
  border-radius: 999px;
  background: #f6f3f5;
  color: #414755;
  font-size: 11px;
  font-weight: 600;
}
.project-portal__client-status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}
.project-portal__client-status i.is-1 {
  background: #f59e0b;
}
.project-portal__client-status i.is-2 {
  background: #3b82f6;
}
.project-portal__client-copy {
  margin-top: auto;
}
.project-portal__client-copy h3 {
  font-size: 20px;
  font-weight: 600;
}
.project-portal__client-copy p {
  min-height: 46px;
  margin-top: 7px;
  font-size: 15px;
  line-height: 1.45;
}
.project-portal__client-footer {
  margin-top: 18px;
  padding-top: 12px;
  color: #414755;
  font-size: 13px;
}
.project-portal__client-footer > span {
  display: inline;
}
.project-portal__lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 24px;
}
.project-portal__document-card,
.project-portal__activity-card {
  min-height: 460px;
  padding: 32px;
  border: 1px solid rgb(255 255 255 / 50%);
  border-radius: 24px;
  background: rgb(255 255 255 / 60%);
  box-shadow:
    0 4px 24px -1px rgb(0 0 0 / 5%),
    0 2px 8px -1px rgb(0 0 0 / 2%);
  backdrop-filter: blur(24px);
}
.project-portal__document-heading,
.project-portal__activity-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.project-portal__document-heading > div {
  display: flex;
  align-items: center;
  gap: 8px;
}
.project-portal__document-heading .material-symbols-outlined {
  color: var(--portal-accent);
}
.project-portal__document-heading h2,
.project-portal__activity-heading h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.project-portal__document-heading > span {
  color: #414755;
  font-size: 13px;
}
.project-portal__document-description {
  margin: 7px 0 0;
  color: #414755;
  font-size: 15px;
}
.project-portal__document-list {
  margin-top: 34px;
  border-top: 1px solid rgb(193 198 215 / 20%);
}
.project-portal__document-list a {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-height: 92px;
  border-bottom: 1px solid rgb(193 198 215 / 20%);
  color: #1b1b1d;
}
.project-portal__document-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgb(0 88 188 / 10%);
  color: var(--portal-accent);
  font-size: 21px;
}
.project-portal__document-list a > span:nth-child(2) {
  display: flex;
  min-width: 0;
  flex-direction: column;
}
.project-portal__document-list strong {
  font-size: 15px;
}
.project-portal__document-list small {
  margin-top: 5px;
  overflow: hidden;
  color: #414755;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-portal__document-list a > .material-symbols-outlined {
  color: var(--portal-accent);
  font-size: 18px;
}
.project-portal__document-empty {
  min-height: 260px;
  display: grid;
  place-items: center;
  margin-top: 28px;
  border-top: 1px solid rgb(193 198 215 / 20%);
  color: #717786;
  font-size: 13px;
}
.project-portal__activity-heading .material-symbols-outlined {
  color: #414755;
  font-size: 20px;
}
.project-portal__timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 30px;
  padding-left: 40px;
}
.project-portal__timeline::before {
  position: absolute;
  inset: 8px auto 8px 11px;
  width: 1px;
  background: rgb(193 198 215 / 30%);
  content: '';
}
.project-portal__timeline-item {
  position: relative;
}
.project-portal__timeline-item > i {
  position: absolute;
  top: 2px;
  left: -40px;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border: 2px solid rgb(193 198 215 / 40%);
  border-radius: 50%;
  background: #f6f3f5;
  box-shadow: 0 1px 3px rgb(0 0 0 / 5%);
}
.project-portal__timeline-item.is-active > i {
  border-color: var(--portal-accent);
}
.project-portal__timeline-item > i b {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c1c6d7;
}
.project-portal__timeline-item.is-active > i b {
  width: 8px;
  height: 8px;
  background: var(--portal-accent);
}
.project-portal__timeline-item > div > div {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.project-portal__timeline-item strong {
  font-size: 13px;
  line-height: 1.35;
}
.project-portal__timeline-item small {
  flex: 0 0 auto;
  color: #414755;
  font-size: 10px;
}
.project-portal__timeline-item p {
  margin: 6px 0 0;
  color: #414755;
  font-size: 13px;
  line-height: 1.5;
}
@media (max-width: 1120px) {
  .project-portal__client-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 880px) {
  .project-portal__sidebar {
    background: rgb(246 243 245 / 92%);
  }
  .project-portal__brand {
    margin-bottom: 12px;
  }
  .project-portal__workspace {
    width: min(100% - 36px, 860px);
    padding: 40px 0;
  }
  .project-portal__lower-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .project-portal__client-grid {
    grid-template-columns: 1fr;
  }
  .project-portal__header h1 {
    font-size: 34px;
    line-height: 41px;
  }
  .project-portal__document-card,
  .project-portal__activity-card {
    padding: 24px;
  }
}
</style>
