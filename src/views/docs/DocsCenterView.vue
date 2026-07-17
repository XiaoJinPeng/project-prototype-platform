<template>
  <div
    class="docs-page"
    :class="{
      'docs-page--embedded': embedded,
      'docs-page--embedded-outline': embedded && outlineVisible,
    }"
  >
    <header class="docs-header">
      <div class="docs-header__brand">
        <RouterLink class="docs-home-link" :to="`/p/${projectId}`" :title="t('home.backToHome')">
          <el-icon><ArrowLeft /></el-icon>
        </RouterLink>
        <div>
          <strong>{{ project?.name }}</strong>
          <span>{{ t('docs.title') }}</span>
        </div>
      </div>

      <div class="docs-header__actions">
        <span class="docs-count">{{ t('docs.documentCount', { count: documents.length }) }}</span>
        <el-button class="mobile-directory-button" plain @click="mobileDirectoryVisible = true">
          <el-icon><Menu /></el-icon>
          {{ t('docs.directory') }}
        </el-button>
        <el-button
          circle
          plain
          :title="t('docs.refresh')"
          :loading="manifestLoading"
          @click="refreshManifest(true)"
        >
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
    </header>

    <div class="docs-workspace" :class="{ 'docs-workspace--embedded': embedded }">
      <aside class="docs-directory">
        <div class="directory-heading">
          <strong>{{ t('docs.directory') }}</strong>
          <span>{{ t('docs.directoryHint') }}</span>
        </div>
        <el-input v-model="searchKeyword" clearable :placeholder="t('docs.searchPlaceholder')">
          <template #prefix
            ><el-icon><Search /></el-icon
          ></template>
        </el-input>
        <div class="tree-scroll">
          <el-tree
            ref="desktopTreeRef"
            class="document-tree"
            :data="treeData"
            node-key="id"
            highlight-current
            :current-node-key="currentDocument ? `doc:${currentDocument.path}` : ''"
            :default-expanded-keys="defaultExpandedKeys"
            :expand-on-click-node="false"
            :filter-node-method="filterTreeNode"
            @node-click="handleTreeNodeClick"
          >
            <template #default="{ data }">
              <span class="tree-node" :class="{ 'tree-node--archived': data.archived }">
                <el-icon><Folder v-if="data.kind === 'folder'" /><Document v-else /></el-icon>
                <span class="tree-node__label">{{ data.label }}</span>
              </span>
            </template>
          </el-tree>
        </div>
      </aside>

      <main ref="readerScrollRef" class="docs-reader">
        <div v-if="manifestError" class="reader-state">
          <el-icon><Warning /></el-icon>
          <h2>{{ t('docs.loadFailed') }}</h2>
          <p>{{ manifestError }}</p>
          <el-button type="primary" @click="refreshManifest(true)">{{ t('docs.retry') }}</el-button>
        </div>

        <div v-else-if="manifestLoading && !documents.length" class="reader-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>{{ t('docs.loadingDirectory') }}</p>
        </div>

        <div v-else-if="!currentDocument" class="reader-state">
          <el-icon><Document /></el-icon>
          <h2>{{ t('docs.emptyTitle') }}</h2>
          <p>{{ t('docs.emptyDescription') }}</p>
        </div>

        <template v-else>
          <div class="document-shell">
            <div class="document-meta">
              <span class="document-path">{{ currentDocument.path }}</span>
              <span>{{ formattedUpdatedAt }}</span>
            </div>
            <div v-if="documentLoading" class="document-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              {{ t('docs.loadingDocument') }}
            </div>
            <div v-else-if="documentError" class="document-error">
              <strong>{{ t('docs.documentFailed') }}</strong>
              <span>{{ documentError }}</span>
              <el-button size="small" @click="loadCurrentDocument">{{ t('docs.retry') }}</el-button>
            </div>
            <article
              v-else
              ref="articleRef"
              class="markdown-body"
              @click="handleArticleClick"
              v-html="renderedHtml"
            ></article>
          </div>
        </template>
      </main>

      <nav v-if="headings.length" class="docs-outline" :aria-label="t('docs.outline')">
        <strong>{{ t('docs.outline') }}</strong>
        <button
          v-for="heading in headings"
          :key="heading.id"
          type="button"
          :class="[`outline-level-${heading.level}`]"
          @click="scrollToHeading(heading.id)"
        >
          {{ heading.text }}
        </button>
      </nav>
    </div>

    <el-drawer v-model="mobileDirectoryVisible" :title="t('docs.directory')" direction="ltr" size="86%">
      <div class="mobile-directory">
        <el-input v-model="searchKeyword" clearable :placeholder="t('docs.searchPlaceholder')">
          <template #prefix
            ><el-icon><Search /></el-icon
          ></template>
        </el-input>
        <el-tree
          ref="mobileTreeRef"
          class="document-tree"
          :data="treeData"
          node-key="id"
          highlight-current
          :current-node-key="currentDocument ? `doc:${currentDocument.path}` : ''"
          :default-expanded-keys="defaultExpandedKeys"
          :filter-node-method="filterTreeNode"
          @node-click="handleTreeNodeClick"
        >
          <template #default="{ data }">
            <span class="tree-node">
              <el-icon><Folder v-if="data.kind === 'folder'" /><Document v-else /></el-icon>
              <span class="tree-node__label">{{ data.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>
    </el-drawer>

    <el-dialog
      v-model="imagePreviewVisible"
      width="min(92vw, 1180px)"
      append-to-body
      class="document-image-dialog"
    >
      <img class="document-image-preview" :src="previewImageUrl" :alt="previewImageAlt" />
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Document,
  Folder,
  Loading,
  Menu,
  Refresh,
  Search,
  Warning,
} from '@element-plus/icons-vue';
import {
  getDocumentAssetUrl,
  loadDocument,
  loadDocumentManifest,
  normalizeDocumentPath,
  onDocumentsChanged,
  resolveDocumentReference,
} from '../../services/prd-documents';
import { getProject } from '../../config/project-packages';

const props = defineProps({
  projectId: { type: String, required: true },
  embedded: { type: Boolean, default: false },
  outlineVisible: { type: Boolean, default: false },
  documentPath: { type: String, default: '' },
});
const project = computed(() => getProject(props.projectId));

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const markdown = new MarkdownIt({ html: true, linkify: true, typographer: false, breaks: false });

const documents = ref([]);
const manifestLoading = ref(false);
const manifestError = ref('');
const currentDocument = ref(null);
const documentLoading = ref(false);
const documentError = ref('');
const renderedHtml = ref('');
const headings = ref([]);
const searchKeyword = ref('');
const desktopTreeRef = ref(null);
const mobileTreeRef = ref(null);
const readerScrollRef = ref(null);
const articleRef = ref(null);
const mobileDirectoryVisible = ref(false);
const imagePreviewVisible = ref(false);
const previewImageUrl = ref('');
const previewImageAlt = ref('');
const embeddedDocumentPath = ref(props.documentPath);
let documentSearchMarks = [];
let activeRenderId = 0;
let stopDocumentsChanged = () => {};
let mermaidApi;

function sortTree(nodes) {
  nodes.sort((a, b) => {
    if (a.archived !== b.archived) return a.archived ? 1 : -1;
    if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
    return a.label.localeCompare(b.label, 'zh-Hans-CN', { numeric: true });
  });
  nodes.forEach((node) => node.children && sortTree(node.children));
  return nodes;
}

function buildDocumentTree(items) {
  const roots = [];
  const foldersByPath = new Map();
  for (const document of items) {
    let children = roots;
    let folderPath = '';
    document.folders.forEach((folderName) => {
      folderPath = folderPath ? `${folderPath}/${folderName}` : folderName;
      let folder = foldersByPath.get(folderPath);
      if (!folder) {
        folder = {
          id: `folder:${folderPath}`,
          label: folderName,
          kind: 'folder',
          path: folderPath,
          archived: folderName === '归档' || folderName === '存档' || folderPath.includes('/存档'),
          children: [],
        };
        foldersByPath.set(folderPath, folder);
        children.push(folder);
      }
      children = folder.children;
    });
    children.push({
      id: `doc:${document.path}`,
      label: document.title,
      kind: 'document',
      document,
      archived: document.archived,
    });
  }
  return sortTree(roots);
}

const treeData = computed(() => buildDocumentTree(documents.value));
const requestedDocumentPath = computed(() =>
  normalizeDocumentPath(props.embedded ? embeddedDocumentPath.value : route.query.file),
);
const defaultExpandedKeys = computed(() =>
  treeData.value.filter((node) => !node.archived).map((node) => node.id),
);
const formattedUpdatedAt = computed(() => {
  if (!currentDocument.value?.updatedAt) return '';
  return new Intl.DateTimeFormat(locale.value === 'en-US' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(currentDocument.value.updatedAt));
});

function filterTreeNode(keyword, data) {
  if (!keyword) return true;
  return `${data.label} ${data.path || data.document?.path || ''}`
    .toLowerCase()
    .includes(keyword.toLowerCase());
}

function syncTreeFilter() {
  desktopTreeRef.value?.filter(searchKeyword.value);
  mobileTreeRef.value?.filter(searchKeyword.value);
}

watch(searchKeyword, () => nextTick(syncTreeFilter));

function handleTreeNodeClick(data) {
  if (data.kind !== 'document') return;
  mobileDirectoryVisible.value = false;
  openDocument(data.document.path);
}

function openDocument(documentPath, replace = false) {
  if (props.embedded) {
    embeddedDocumentPath.value = normalizeDocumentPath(documentPath);
    if (documents.value.length) selectCurrentDocument(documentPath);
    return;
  }
  const method = replace ? router.replace : router.push;
  method({ path: route.path, query: { file: documentPath } });
}

async function refreshManifest(preserveSelection = true) {
  manifestLoading.value = true;
  manifestError.value = '';
  try {
    const manifest = await loadDocumentManifest(props.projectId);
    documents.value = manifest.documents || [];
    const requestedPath = requestedDocumentPath.value;
    const selectedPath = preserveSelection ? currentDocument.value?.path : '';
    const nextDocument =
      documents.value.find((item) => item.path === requestedPath) ||
      documents.value.find((item) => item.path === selectedPath) ||
      documents.value.find((item) => !item.archived) ||
      documents.value[0];
    if (nextDocument && nextDocument.path !== requestedPath) openDocument(nextDocument.path, true);
    else if (nextDocument) await selectCurrentDocument(nextDocument.path);
  } catch (error) {
    manifestError.value = error.message;
  } finally {
    manifestLoading.value = false;
  }
}

async function selectCurrentDocument(documentPath) {
  const normalizedPath = normalizeDocumentPath(documentPath);
  const nextDocument = documents.value.find((item) => item.path === normalizedPath);
  if (!nextDocument) return;
  if (currentDocument.value?.path === nextDocument.path && renderedHtml.value) return;
  currentDocument.value = nextDocument;
  await nextTick(() => {
    desktopTreeRef.value?.setCurrentKey(`doc:${nextDocument.path}`);
    mobileTreeRef.value?.setCurrentKey(`doc:${nextDocument.path}`);
  });
  await loadCurrentDocument();
}

function createHeadingId(text, usedIds) {
  const base =
    text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-|-$/g, '') || 'section';
  let id = base;
  let index = 2;
  while (usedIds.has(id)) id = `${base}-${index++}`;
  usedIds.add(id);
  return id;
}

function prepareRenderedHtml(source, documentPath) {
  const sanitized = DOMPurify.sanitize(markdown.render(source), {
    ADD_ATTR: ['target', 'rel', 'data-doc-path'],
  });
  const parsed = new DOMParser().parseFromString(`<div id="document-root">${sanitized}</div>`, 'text/html');
  const root = parsed.getElementById('document-root');
  const nextHeadings = [];
  const usedIds = new Set();

  root.querySelectorAll('h1, h2, h3').forEach((heading) => {
    const id = createHeadingId(heading.textContent || '', usedIds);
    heading.id = id;
    nextHeadings.push({ id, text: heading.textContent || '', level: Number(heading.tagName.slice(1)) });
  });

  root.querySelectorAll('img[src]').forEach((image) => {
    const sourceUrl = image.getAttribute('src');
    if (!sourceUrl || /^(?:[a-z]+:|\/\/|data:)/i.test(sourceUrl)) return;
    const resolved = resolveDocumentReference(documentPath, sourceUrl).split(/[?#]/u)[0];
    image.setAttribute('src', getDocumentAssetUrl(props.projectId, resolved));
    image.setAttribute('loading', 'lazy');
    image.setAttribute('data-previewable', 'true');
  });

  root.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    if (/^(?:https?:|mailto:|tel:|\/\/)/i.test(href)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      return;
    }
    const resolved = resolveDocumentReference(documentPath, href);
    const pathOnly = resolved.split(/[?#]/u)[0];
    if (/\.md$/i.test(pathOnly)) {
      link.setAttribute('href', router.resolve({ path: route.path, query: { file: pathOnly } }).href);
      link.setAttribute('data-doc-path', pathOnly);
    } else {
      link.setAttribute('href', getDocumentAssetUrl(props.projectId, pathOnly));
      link.setAttribute('target', '_blank');
    }
  });

  headings.value = nextHeadings;
  return root.innerHTML;
}

async function renderMermaidBlocks(renderId) {
  const blocks = Array.from(articleRef.value?.querySelectorAll('pre > code.language-mermaid') || []);
  if (!blocks.length || renderId !== activeRenderId) return;
  if (!mermaidApi) {
    const module = await import('mermaid');
    mermaidApi = module.default;
    mermaidApi.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'default' });
  }
  for (const [index, code] of blocks.entries()) {
    if (renderId !== activeRenderId) return;
    const container = document.createElement('div');
    container.className = 'mermaid-diagram';
    code.parentElement.replaceWith(container);
    try {
      const result = await mermaidApi.render(`prd-mermaid-${renderId}-${index}`, code.textContent || '');
      container.innerHTML = result.svg;
      result.bindFunctions?.(container);
    } catch (error) {
      container.className = 'mermaid-error';
      container.textContent = `${t('docs.diagramFailed')}：${error.message}`;
    }
  }
}

async function loadCurrentDocument() {
  if (!currentDocument.value) return;
  const renderId = ++activeRenderId;
  documentLoading.value = true;
  documentError.value = '';
  headings.value = [];
  clearDocumentSearch();
  try {
    const source = await loadDocument(props.projectId, currentDocument.value.path);
    if (renderId !== activeRenderId) return;
    renderedHtml.value = prepareRenderedHtml(source, currentDocument.value.path);
    await nextTick();
    readerScrollRef.value?.scrollTo({ top: 0 });
    await renderMermaidBlocks(renderId);
  } catch (error) {
    if (renderId === activeRenderId) documentError.value = error.message;
  } finally {
    if (renderId === activeRenderId) documentLoading.value = false;
  }
}

function handleArticleClick(event) {
  const link = event.target.closest('a[data-doc-path]');
  if (link) {
    event.preventDefault();
    openDocument(link.dataset.docPath);
    return;
  }
  const image = event.target.closest('img[data-previewable="true"]');
  if (image) {
    previewImageUrl.value = image.currentSrc || image.src;
    previewImageAlt.value = image.alt || currentDocument.value?.title || '';
    imagePreviewVisible.value = true;
  }
}

function scrollToHeading(headingId) {
  articleRef.value
    ?.querySelector(`#${CSS.escape(headingId)}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearDocumentSearch() {
  documentSearchMarks.forEach((mark) => {
    mark.replaceWith(document.createTextNode(mark.textContent || ''));
  });
  documentSearchMarks = [];
  articleRef.value?.normalize();
}

function searchDocument(keyword) {
  clearDocumentSearch();
  const value = String(keyword || '').trim();
  if (!value || !articleRef.value) return { count: 0, index: 0 };

  const lowerValue = value.toLocaleLowerCase();
  const walker = document.createTreeWalker(articleRef.value, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let currentNode = walker.nextNode();
  while (currentNode) {
    if (!currentNode.parentElement?.closest('script, style, mark')) textNodes.push(currentNode);
    currentNode = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const text = textNode.nodeValue || '';
    const lowerText = text.toLocaleLowerCase();
    let cursor = 0;
    let matchIndex = lowerText.indexOf(lowerValue, cursor);
    if (matchIndex < 0) return;

    const fragment = document.createDocumentFragment();
    while (matchIndex >= 0) {
      fragment.append(text.slice(cursor, matchIndex));
      const mark = document.createElement('mark');
      mark.className = 'document-search-hit';
      mark.textContent = text.slice(matchIndex, matchIndex + value.length);
      fragment.append(mark);
      documentSearchMarks.push(mark);
      cursor = matchIndex + value.length;
      matchIndex = lowerText.indexOf(lowerValue, cursor);
    }
    fragment.append(text.slice(cursor));
    textNode.replaceWith(fragment);
  });

  if (documentSearchMarks.length)
    documentSearchMarks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  return { count: documentSearchMarks.length, index: documentSearchMarks.length ? 1 : 0 };
}

function focusSearchMatch(index) {
  const mark = documentSearchMarks[index];
  if (!mark) return;
  mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

defineExpose({ clearDocumentSearch, focusSearchMatch, searchDocument });

watch(
  () => route.query.file,
  (documentPath) => {
    if (!props.embedded && documents.value.length && documentPath) selectCurrentDocument(documentPath);
  },
);

watch(
  () => props.documentPath,
  (documentPath) => {
    if (!props.embedded) return;
    embeddedDocumentPath.value = documentPath;
    if (documents.value.length && documentPath) selectCurrentDocument(documentPath);
  },
);

onMounted(async () => {
  await refreshManifest(false);
  stopDocumentsChanged = onDocumentsChanged(props.projectId, () => refreshManifest(true));
});

onBeforeUnmount(() => {
  stopDocumentsChanged();
  activeRenderId += 1;
});
</script>

<style scoped>
.docs-page {
  height: 100vh;
  min-height: 0;
  overflow: hidden;
  background: #f5f7fa;
  color: #172033;
}
.docs-page--embedded {
  height: 100%;
  position: relative;
}
.docs-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 24px;
  border-bottom: 1px solid #e1e7ec;
  background: #fff;
}
.docs-header__brand,
.docs-header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.docs-header__brand > div {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}
.docs-header__brand strong {
  color: var(--app-color-primary);
  font-size: 18px;
  white-space: nowrap;
}
.docs-header__brand span {
  color: #667085;
  font-size: 13px;
  white-space: nowrap;
}
.docs-home-link {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid #d8e0e7;
  border-radius: 6px;
  color: #475467;
  transition:
    border-color 160ms ease,
    color 160ms ease;
}
.docs-home-link:hover {
  border-color: var(--app-color-primary);
  color: var(--app-color-primary);
}
.docs-count {
  color: #667085;
  font-size: 13px;
}
.docs-workspace {
  height: calc(100vh - 64px);
  min-height: 0;
  display: grid;
  grid-template-columns: 292px minmax(0, 1fr) 220px;
}
.docs-workspace--embedded {
  height: 100%;
  position: relative;
  display: block;
}
.docs-page--embedded .docs-header,
.docs-page--embedded .docs-directory,
.docs-page--embedded .docs-outline {
  display: none;
}
.docs-page--embedded-outline .docs-outline {
  position: absolute;
  z-index: 10;
  inset: 0 0 0 auto;
  width: 220px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  box-shadow: -8px 0 22px rgb(16 24 40 / 12%);
}
.docs-page--embedded-outline .docs-outline strong,
.docs-page--embedded-outline .docs-outline button {
  flex: 0 0 auto;
  min-width: 0;
}
.docs-page--embedded-outline .docs-outline button {
  width: 100%;
  white-space: normal;
}
.docs-directory {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px 16px;
  border-right: 1px solid #e1e7ec;
  background: #fbfcfd;
}
.directory-heading {
  display: grid;
  gap: 3px;
  padding: 0 4px;
}
.directory-heading strong {
  font-size: 16px;
}
.directory-heading span {
  color: #98a2b3;
  font-size: 12px;
}
.tree-scroll {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding-right: 4px;
}
.document-tree {
  background: transparent;
  --el-tree-node-hover-bg-color: #edf6fa;
}
.tree-node {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #344054;
  font-size: 13px;
}
.tree-node .el-icon {
  flex: 0 0 auto;
  color: var(--app-color-primary);
}
.tree-node--archived {
  color: #98a2b3;
}
.tree-node--archived .el-icon {
  color: #98a2b3;
}
.tree-node__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.docs-reader {
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: auto;
  background: #fff;
  scroll-behavior: smooth;
}
.docs-page--embedded .document-shell {
  width: 100%;
  padding: 32px 36px 64px;
}
.docs-page--embedded .docs-reader {
  overflow-x: hidden;
  overflow-y: scroll;
}
.document-shell {
  width: min(100%, 980px);
  margin: 0 auto;
  padding: 40px 48px 80px;
}
.document-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
  padding-bottom: 14px;
  border-bottom: 1px solid #edf0f3;
  color: #98a2b3;
  font-size: 12px;
}
.document-path {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.document-loading,
.document-error {
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #667085;
}
.document-error {
  flex-direction: column;
}
.reader-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #667085;
  text-align: center;
}
.reader-state > .el-icon {
  font-size: 30px;
  color: var(--app-color-primary);
}
.reader-state h2 {
  margin: 0;
  color: #172033;
  font-size: 20px;
}
.reader-state p {
  max-width: 560px;
  margin: 0;
  line-height: 1.7;
}
.docs-outline {
  min-height: 0;
  overflow: auto;
  padding: 28px 20px;
  border-left: 1px solid #edf0f3;
  background: #fff;
}
.docs-outline strong {
  display: block;
  margin-bottom: 12px;
  color: #344054;
  font-size: 13px;
}
.docs-outline button {
  width: 100%;
  display: block;
  padding: 5px 0;
  border: 0;
  color: #667085;
  background: transparent;
  font-size: 12px;
  line-height: 1.45;
  text-align: left;
}
.docs-outline button:hover {
  color: var(--app-color-primary);
}
.docs-outline .outline-level-2 {
  padding-left: 10px;
}
.docs-outline .outline-level-3 {
  padding-left: 22px;
  color: #98a2b3;
}
.mobile-directory-button {
  display: none;
}
.mobile-directory {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.mobile-directory .document-tree {
  min-height: 0;
  overflow: auto;
}
.document-image-preview {
  display: block;
  max-width: 100%;
  max-height: 78vh;
  margin: 0 auto;
  object-fit: contain;
}

:deep(.el-tree-node__content) {
  height: 34px;
  border-radius: 5px;
}
:deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content) {
  background: #e6f3f8;
}
:deep(.markdown-body) {
  color: #344054;
  font-size: 15px;
  line-height: 1.8;
}
:deep(.markdown-body h1) {
  margin: 0 0 24px;
  color: #101828;
  font-size: 30px;
  line-height: 1.3;
}
:deep(.markdown-body h2) {
  margin: 42px 0 16px;
  padding-bottom: 9px;
  border-bottom: 1px solid #e8edf1;
  color: #172033;
  font-size: 22px;
  line-height: 1.4;
  scroll-margin-top: 20px;
}
:deep(.markdown-body h3) {
  margin: 30px 0 12px;
  color: #172033;
  font-size: 18px;
  line-height: 1.5;
  scroll-margin-top: 20px;
}
:deep(.markdown-body h4) {
  margin: 24px 0 10px;
  color: #344054;
  font-size: 16px;
}
:deep(.markdown-body p) {
  margin: 0 0 15px;
}
:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  margin: 0 0 18px;
  padding-left: 26px;
  list-style: revert;
}
:deep(.markdown-body li) {
  margin: 5px 0;
}
:deep(.markdown-body a) {
  color: var(--app-color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}
:deep(.markdown-body strong) {
  color: #172033;
}
:deep(.markdown-body blockquote) {
  margin: 20px 0;
  padding: 13px 16px;
  border-left: 3px solid #38a3c5;
  background: #f3f9fb;
  color: #475467;
}
:deep(.markdown-body blockquote p:last-child) {
  margin-bottom: 0;
}
:deep(.markdown-body code) {
  padding: 2px 5px;
  border-radius: 4px;
  background: #f0f3f6;
  color: #9f2d42;
  font-family: Consolas, 'SFMono-Regular', monospace;
  font-size: 0.9em;
}
:deep(.markdown-body pre) {
  margin: 20px 0;
  overflow: auto;
  padding: 16px 18px;
  border: 1px solid #e1e7ec;
  border-radius: 6px;
  background: #f7f9fb;
}
:deep(.markdown-body pre code) {
  padding: 0;
  background: transparent;
  color: #25324a;
}
:deep(.markdown-body table) {
  width: 100%;
  margin: 20px 0;
  border-collapse: collapse;
  font-size: 14px;
}
:deep(.markdown-body th),
:deep(.markdown-body td) {
  padding: 10px 12px;
  border: 1px solid #dfe5ea;
  text-align: left;
  vertical-align: top;
}
:deep(.markdown-body th) {
  background: #f4f7f9;
  color: #344054;
  font-weight: 700;
}
:deep(.markdown-body tr:nth-child(even) td) {
  background: #fbfcfd;
}
:deep(.markdown-body img) {
  display: block;
  max-width: min(100%, 760px);
  max-height: 560px;
  margin: 24px auto;
  border: 1px solid #e1e7ec;
  border-radius: 6px;
  cursor: zoom-in;
  object-fit: contain;
}
:deep(.markdown-body hr) {
  margin: 32px 0;
  border: 0;
  border-top: 1px solid #e1e7ec;
}
:deep(.markdown-body .mermaid-diagram) {
  margin: 24px 0;
  overflow: auto;
  padding: 18px;
  border: 1px solid #e1e7ec;
  border-radius: 6px;
  background: #fff;
  text-align: center;
}
:deep(.markdown-body .mermaid-diagram svg) {
  max-width: 100%;
  height: auto;
}
:deep(.markdown-body .mermaid-error) {
  margin: 20px 0;
  padding: 14px;
  border: 1px solid #f3c7c7;
  border-radius: 6px;
  background: #fff5f5;
  color: #b42318;
  white-space: pre-wrap;
}
:deep(.document-search-hit) {
  padding: 1px 2px;
  border-radius: 2px;
  background: #ffe58f;
  color: inherit;
}

@media (max-width: 1180px) {
  .docs-workspace {
    grid-template-columns: 276px minmax(0, 1fr);
  }
  .docs-outline {
    display: none;
  }
}

@media (max-width: 760px) {
  .docs-header {
    height: 58px;
    padding: 0 14px;
  }
  .docs-header__brand span,
  .docs-count {
    display: none;
  }
  .docs-workspace {
    height: calc(100vh - 58px);
    display: block;
  }
  .docs-directory {
    display: none;
  }
  .mobile-directory-button {
    display: inline-flex;
  }
  .document-shell {
    padding: 26px 20px 60px;
  }
  .document-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 22px;
  }
  :deep(.markdown-body h1) {
    font-size: 25px;
  }
  :deep(.markdown-body h2) {
    margin-top: 34px;
    font-size: 20px;
  }
  :deep(.markdown-body table) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
