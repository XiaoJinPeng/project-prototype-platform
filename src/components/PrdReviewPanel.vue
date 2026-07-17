<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  ArrowLeft,
  ArrowRight,
  Close,
  Document,
  FullScreen,
  Link,
  Menu,
  Search,
} from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

import DocsCenterView from '../views/docs/DocsCenterView.vue';

const props = defineProps({
  projectId: { type: String, required: true },
  documentPath: { type: String, default: '' },
  documentPaths: { type: Array, default: () => [] },
  pageTitle: { type: String, required: true },
  layoutMode: { type: String, default: 'split' },
});

const emit = defineEmits(['close', 'open-window', 'update:layoutMode']);
const router = useRouter();
const outlineVisible = ref(false);
const activeDocumentPath = ref(props.documentPath);
const documentSearch = ref('');
const searchMatchCount = ref(0);
const searchMatchIndex = ref(0);
const readerRef = ref(null);

function handleOutsideOutline(event) {
  if (!outlineVisible.value) return;

  const target = event.target;
  if (target?.closest?.('.docs-outline, .prd-review-pane__directory-action')) return;

  outlineVisible.value = false;
}

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsideOutline);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutsideOutline);
});

function normalizeDocument(entry) {
  const path = typeof entry === 'string' ? entry : entry?.path || entry?.file || '';
  if (!path) return null;
  const title =
    typeof entry === 'object' && entry?.title ? entry.title : path.split('/').pop().replace(/\.md$/i, '');
  return { path, title };
}

const availableDocuments = computed(() => {
  const entries = props.documentPaths.length ? props.documentPaths : [props.documentPath];
  return entries.map(normalizeDocument).filter(Boolean);
});

watch(
  availableDocuments,
  (documents) => {
    if (!documents.some((document) => document.path === activeDocumentPath.value)) {
      activeDocumentPath.value = documents[0]?.path || '';
    }
  },
  { immediate: true },
);

watch(
  () => props.documentPath,
  (documentPath) => {
    if (!availableDocuments.value.some((document) => document.path === activeDocumentPath.value)) {
      activeDocumentPath.value = documentPath || '';
    }
  },
);

watch(activeDocumentPath, () => {
  documentSearch.value = '';
  searchMatchCount.value = 0;
  searchMatchIndex.value = 0;
  readerRef.value?.clearDocumentSearch();
});

const documentUrl = computed(
  () =>
    router.resolve({
      path: `/p/${props.projectId}/docs`,
      query: { file: activeDocumentPath.value },
    }).href,
);
function openDocumentWindow() {
  emit('open-window', documentUrl.value);
}

function setLayoutMode(mode) {
  emit('update:layoutMode', mode);
}

function updateDocumentSearch() {
  const result = readerRef.value?.searchDocument(documentSearch.value) || { count: 0, index: 0 };
  searchMatchCount.value = result.count;
  searchMatchIndex.value = result.index;
}

function moveSearchMatch(step) {
  if (!searchMatchCount.value) return;
  const nextIndex = (searchMatchIndex.value - 1 + step + searchMatchCount.value) % searchMatchCount.value;
  searchMatchIndex.value = nextIndex + 1;
  readerRef.value?.focusSearchMatch(nextIndex);
}
</script>

<template>
  <section class="prd-review-pane" :class="`prd-review-pane--${layoutMode}`">
    <header class="prd-review-pane__header">
      <div class="prd-review-pane__identity">
        <span class="prd-review-pane__eyebrow">
          <el-icon><Document /></el-icon>
          PRD
        </span>
        <strong>{{ pageTitle }}</strong>
        <span class="prd-review-pane__path">{{ activeDocumentPath }}</span>
      </div>
      <div class="prd-review-pane__actions">
        <button
          type="button"
          class="prd-review-pane__icon-button"
          title="新窗口打开"
          aria-label="新窗口打开"
          @click="openDocumentWindow"
        >
          <el-icon><Link /></el-icon>
        </button>
        <button
          type="button"
          class="prd-review-pane__icon-button"
          title="关闭 PRD"
          aria-label="关闭 PRD"
          @click="emit('close')"
        >
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </header>

    <div class="prd-review-pane__toolbar">
      <span>查看方式</span>
      <div class="prd-review-pane__modes" role="group" aria-label="PRD 查看方式">
        <button
          v-for="mode in [
            { value: 'split', label: '固定分屏' },
            { value: 'overlay', label: '浮层' },
          ]"
          :key="mode.value"
          type="button"
          :class="{ 'is-active': layoutMode === mode.value }"
          @click="setLayoutMode(mode.value)"
        >
          {{ mode.label }}
        </button>
      </div>
      <button
        type="button"
        class="prd-review-pane__window-action prd-review-pane__directory-action"
        :title="outlineVisible ? '关闭目录' : '查看目录'"
        @click="outlineVisible = !outlineVisible"
      >
        <el-icon><Menu /></el-icon>
        {{ outlineVisible ? '关闭目录' : '查看目录' }}
      </button>
      <button type="button" class="prd-review-pane__window-action" @click="openDocumentWindow">
        <el-icon><FullScreen /></el-icon>
        新窗口
      </button>
    </div>

    <div class="prd-review-pane__searchbar">
      <el-select
        v-if="availableDocuments.length > 1"
        v-model="activeDocumentPath"
        class="prd-review-pane__document-select"
        size="small"
        aria-label="关联文档"
      >
        <el-option
          v-for="document in availableDocuments"
          :key="document.path"
          :label="document.title"
          :value="document.path"
        />
      </el-select>
      <el-input
        v-model="documentSearch"
        class="prd-review-pane__search-input"
        size="small"
        clearable
        placeholder="搜索本文"
        @input="updateDocumentSearch"
        @clear="updateDocumentSearch"
      >
        <template #prefix
          ><el-icon><Search /></el-icon
        ></template>
      </el-input>
      <span v-if="documentSearch" class="prd-review-pane__search-count">
        {{ searchMatchIndex }}/{{ searchMatchCount }}
      </span>
      <button
        type="button"
        class="prd-review-pane__search-action"
        :disabled="!searchMatchCount"
        title="上一个匹配"
        @click="moveSearchMatch(-1)"
      >
        <el-icon><ArrowLeft /></el-icon>
      </button>
      <button
        type="button"
        class="prd-review-pane__search-action"
        :disabled="!searchMatchCount"
        title="下一个匹配"
        @click="moveSearchMatch(1)"
      >
        <el-icon><ArrowRight /></el-icon>
      </button>
    </div>

    <div class="prd-review-pane__reader">
      <DocsCenterView
        ref="readerRef"
        :project-id="projectId"
        :embedded="true"
        :outline-visible="outlineVisible"
        :document-path="documentPath"
      />
    </div>
  </section>
</template>

<style scoped>
.prd-review-pane {
  display: grid;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex: 0 0 min(42%, 560px);
  grid-template-rows: auto auto auto minmax(0, 1fr);
  align-self: stretch;
  overflow: hidden;
  border-left: 1px solid var(--border);
  background: #fff;
  box-shadow: -8px 0 24px rgb(16 24 40 / 6%);
}

.prd-review-pane--overlay {
  position: absolute;
  z-index: 20;
  inset: 0 0 0 auto;
  width: min(560px, 100%);
  box-shadow: -16px 0 32px rgb(16 24 40 / 16%);
}

.prd-review-pane__header,
.prd-review-pane__toolbar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
}

.prd-review-pane__header {
  justify-content: space-between;
  gap: 16px;
  min-height: 76px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
}

.prd-review-pane__identity {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.prd-review-pane__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--app-color-primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.prd-review-pane__identity strong {
  overflow: hidden;
  color: var(--text);
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prd-review-pane__path {
  overflow: hidden;
  color: var(--muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prd-review-pane__actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
}

.prd-review-pane__icon-button,
.prd-review-pane__window-action,
.prd-review-pane__modes button {
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font: inherit;
}

.prd-review-pane__icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
}

.prd-review-pane__icon-button:hover,
.prd-review-pane__window-action:hover {
  background: var(--surface-muted);
  color: var(--app-color-primary);
}

.prd-review-pane__toolbar {
  gap: 10px;
  min-height: 42px;
  padding: 0 18px;
  border-bottom: 1px solid var(--border);
  color: var(--muted);
  font-size: 12px;
}

.prd-review-pane__modes {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border-radius: 6px;
  background: var(--surface-muted);
}

.prd-review-pane__modes button {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.prd-review-pane__modes button.is-active {
  background: #fff;
  color: var(--app-color-primary);
  box-shadow: 0 1px 2px rgb(16 24 40 / 10%);
}

.prd-review-pane__window-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 4px 0;
  color: var(--app-color-primary);
  font-size: 12px;
}
.prd-review-pane__directory-action {
  margin-left: auto;
}
.prd-review-pane__directory-action + .prd-review-pane__window-action {
  margin-left: 0;
}

.prd-review-pane__searchbar {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 46px;
  padding: 0 18px;
  border-bottom: 1px solid var(--border);
}

.prd-review-pane__document-select {
  flex: 0 0 150px;
}

.prd-review-pane__search-input {
  min-width: 0;
  flex: 1 1 auto;
}

.prd-review-pane__search-count {
  flex: 0 0 auto;
  color: var(--muted);
  font-size: 11px;
  white-space: nowrap;
}

.prd-review-pane__search-action {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 4px;
  color: var(--muted);
  background: transparent;
  cursor: pointer;
}

.prd-review-pane__search-action:hover:not(:disabled) {
  color: var(--app-color-primary);
  background: var(--surface-muted);
}

.prd-review-pane__search-action:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.prd-review-pane__reader {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.prd-review-pane__reader :deep(.docs-page--embedded) {
  height: 100%;
}

@media (max-width: 900px) {
  .prd-review-pane {
    flex-basis: min(48%, 480px);
  }
}

@media (max-width: 760px) {
  .prd-review-pane {
    position: absolute;
    z-index: 20;
    inset: 0;
    width: 100%;
    flex-basis: auto;
  }
}
</style>
