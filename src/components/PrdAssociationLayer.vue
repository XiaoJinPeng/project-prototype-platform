<template>
  <span v-if="editMode" class="prd-association-edit-status">
    <span class="prd-association-edit-status__dot"></span>
    关联编辑中
    <button type="button" @click="toggleEditMode">退出</button>
  </span>

  <template v-if="enabled">
    <button
      v-for="item in overlayItems"
      :key="item.binding.id"
      type="button"
      class="prd-association-marker"
      :style="markerStyle(item)"
      :title="editMode ? '修改此关联' : '查看 PRD：' + (item.binding.prd.label || item.binding.prd.document)"
      @click.stop="handleBindingClick(item.binding)"
    >
      PRD
    </button>
  </template>

  <div v-if="editMode && previewRect" class="prd-association-preview" :style="previewStyle">
    <span>点击此区域设置 PRD 关联</span>
  </div>

  <el-dialog
    v-model="dialogVisible"
    title="关联 PRD"
    width="520px"
    append-to-body
    class="apple-tool-dialog"
    @closed="resetDialog"
  >
    <div class="prd-association-dialog">
      <div class="prd-association-dialog__target">
        <span>当前功能区域</span>
        <strong>{{ targetDescription || '未选择' }}</strong>
      </div>

      <el-form label-position="top">
        <el-form-item label="PRD 文档">
          <el-select
            v-model="form.documentPath"
            filterable
            :loading="documentsLoading"
            placeholder="选择 PRD 文档"
            @change="loadHeadingsForDocument(form.documentPath, false)"
          >
            <el-option
              v-for="document in documents"
              :key="document.path"
              :label="document.title"
              :value="document.path"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="PRD 章节">
          <el-select
            v-model="form.anchor"
            filterable
            :loading="headingsLoading"
            :disabled="!form.documentPath || !headings.length"
            placeholder="选择要定位的章节"
          >
            <el-option
              v-for="heading in headings"
              :key="heading.id"
              :label="headingLabel(heading)"
              :value="heading.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标记名称">
          <el-input v-model="form.label" maxlength="40" placeholder="例如：查看范围" />
        </el-form-item>

        <el-form-item label="说明（可选）">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            maxlength="160"
            show-word-limit
            placeholder="给其他开发人员的简短提示"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button v-if="editingBindingId" text type="danger" @click="removeBinding">取消关联</el-button>
      <el-button type="primary" :loading="saving" @click="saveBinding">保存关联</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import { loadDocument, loadDocumentManifest } from '../services/prd-documents';
import {
  createBindingId,
  extractPrdHeadings,
  loadPrdBindings,
  onPrdBindingsChanged,
  savePrdBindings,
} from '../services/prd-bindings';

const props = defineProps({
  projectId: { type: String, required: true },
  pagePath: { type: String, required: true },
  enabled: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
});

const emit = defineEmits(['open']);
const editMode = ref(false);
const documents = ref([]);
const bindings = ref([]);
const documentsLoading = ref(false);
const headingsLoading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const editingBindingId = ref('');
const selectedElement = ref(null);
const targetDescription = ref('');
const headings = ref([]);
const previewRect = ref(null);
const overlayItems = ref([]);
const form = reactive({
  documentPath: '',
  anchor: '',
  label: '',
  summary: '',
});
let layoutObserver = null;
let overlayRefreshFrame = 0;
let overlayRefreshDisposed = false;

const currentBindings = computed(() =>
  bindings.value.filter((binding) => binding.pagePath === props.pagePath),
);

const previewStyle = computed(() => {
  if (!previewRect.value) return {};
  return {
    top: String(previewRect.value.top) + 'px',
    left: String(previewRect.value.left) + 'px',
    width: String(previewRect.value.width) + 'px',
    height: String(previewRect.value.height) + 'px',
  };
});

function normalizeText(value) {
  return String(value || '')
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, 100);
}

function pageRoot() {
  return document.querySelector('.page-container');
}

function isBusinessClass(value) {
  return (
    value &&
    !/^(?:el-|is-|has-|text-|mt-|mb-|ml-|mr-|mx-|my-|p[trblxy]?-)$/u.test(value) &&
    !/^(?:page-container|app-|platform-)/u.test(value)
  );
}

function candidateFor(target) {
  const root = pageRoot();
  if (!root || !target || !root.contains(target)) return null;
  let current = target.nodeType === Node.ELEMENT_NODE ? target : target.parentElement;
  while (current && current !== root) {
    const businessClasses = Array.from(current.classList || []).filter(isBusinessClass);
    if (businessClasses.length || ['BUTTON', 'A', 'SECTION', 'ARTICLE'].includes(current.tagName))
      return current;
    current = current.parentElement;
  }
  return target;
}

function getDomPath(root, element) {
  const path = [];
  let current = element;
  while (current && current !== root) {
    const parent = current.parentElement;
    if (!parent) return [];
    path.unshift(Array.from(parent.children).indexOf(current));
    current = parent;
  }
  return current === root ? path : [];
}

function resolveDomPath(root, path) {
  if (!root || !Array.isArray(path)) return null;
  let current = root;
  for (const index of path) {
    current = current.children?.[index];
    if (!current) return null;
  }
  return current;
}

function targetText(element) {
  return normalizeText(element?.innerText || element?.textContent);
}

function targetSnapshot(root, element) {
  return {
    domPath: getDomPath(root, element),
    tag: element.tagName,
    classes: Array.from(element.classList || [])
      .filter(isBusinessClass)
      .slice(0, 8),
    text: targetText(element),
  };
}

function scoreElement(element, target) {
  if (!element || !target) return -1;
  let score = element.tagName === target.tag ? 5 : 0;
  const classes = Array.isArray(target.classes) ? target.classes : [];
  score += classes.filter((name) => element.classList.contains(name)).length * 3;
  if (target.text) {
    const text = targetText(element);
    if (text === target.text) score += 6;
    else if (text.includes(target.text) || target.text.includes(text)) score += 3;
  }
  return score;
}

function resolveBindingElement(binding) {
  const root = pageRoot();
  if (!root) return null;
  const target = binding?.target;
  const direct = resolveDomPath(root, target?.domPath);
  if (direct && scoreElement(direct, target) >= 5) return direct;

  let best = null;
  let bestScore = 0;
  for (const element of root.querySelectorAll('*')) {
    const score = scoreElement(element, target);
    if (score > bestScore) {
      best = element;
      bestScore = score;
    }
  }
  return bestScore >= 5 ? best : null;
}

function markerStyle(item) {
  return {
    top: String(item.top) + 'px',
    left: String(item.left) + 'px',
  };
}

function headingLabel(heading) {
  return '\u3000'.repeat(Math.max(0, heading.level - 1)) + heading.text;
}

function visibleContentBounds() {
  const root = pageRoot();
  if (!root) return null;

  const rect = root.getBoundingClientRect();
  return {
    left: Math.max(0, rect.left),
    top: Math.max(0, rect.top),
    right: Math.min(window.innerWidth, rect.right),
    bottom: Math.min(window.innerHeight, rect.bottom),
  };
}

function isVisibleTarget(element, rect, bounds) {
  if (!element || rect.width <= 0 || rect.height <= 0) return false;

  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;

  return (
    rect.right > bounds.left &&
    rect.left < bounds.right &&
    rect.bottom > bounds.top &&
    rect.top < bounds.bottom
  );
}

function refreshOverlayItems() {
  if (!props.enabled) {
    overlayItems.value = [];
    return;
  }
  const bounds = visibleContentBounds();
  if (!bounds || bounds.right <= bounds.left || bounds.bottom <= bounds.top) {
    overlayItems.value = [];
    return;
  }

  overlayItems.value = currentBindings.value
    .map((binding) => {
      const element = resolveBindingElement(binding);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      if (!isVisibleTarget(element, rect, bounds)) return null;
      return {
        binding,
        top: Math.max(bounds.top + 8, Math.min(bounds.bottom - 32, rect.top + 6)),
        left: Math.max(bounds.left + 8, Math.min(bounds.right - 54, rect.right - 54)),
      };
    })
    .filter(Boolean);
}

function requestOverlayRefresh() {
  if (overlayRefreshDisposed || overlayRefreshFrame) return;
  overlayRefreshFrame = window.requestAnimationFrame(() => {
    overlayRefreshFrame = 0;
    refreshOverlayItems();
  });
}

function scheduleOverlayRefresh() {
  void nextTick(() => {
    requestOverlayRefresh();
  });
}

function observePageLayout() {
  if (typeof ResizeObserver === 'undefined') return;

  const root = pageRoot();
  if (!root) return;

  layoutObserver?.disconnect();
  layoutObserver = new ResizeObserver(() => {
    requestOverlayRefresh();
  });
  layoutObserver.observe(root);

  const workspace = root.closest('.page-workspace');
  if (workspace) layoutObserver.observe(workspace);
}

function updatePreview(target) {
  if (!target) {
    previewRect.value = null;
    return;
  }
  const rect = target.getBoundingClientRect();
  previewRect.value = {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

async function loadData() {
  documentsLoading.value = true;
  try {
    const [manifest, payload] = await Promise.all([
      loadDocumentManifest(props.projectId),
      loadPrdBindings(props.projectId),
    ]);
    documents.value = manifest.documents || [];
    bindings.value = payload.bindings || [];
    await nextTick();
    refreshOverlayItems();
  } catch (error) {
    ElMessage.error(error.message || 'PRD 关联配置读取失败。');
  } finally {
    documentsLoading.value = false;
  }
}

async function loadHeadingsForDocument(documentPath, resetAnchor = true) {
  headings.value = [];
  if (!documentPath) return;
  headingsLoading.value = true;
  try {
    const source = await loadDocument(props.projectId, documentPath);
    headings.value = extractPrdHeadings(source);
    if (resetAnchor || !headings.value.some((heading) => heading.id === form.anchor)) {
      form.anchor = headings.value[0]?.id || '';
    }
    if (!form.label && headings.value.length) {
      form.label = headings.value.find((heading) => heading.id === form.anchor)?.text || '';
    }
  } catch (error) {
    ElMessage.error(error.message || 'PRD 章节读取失败。');
  } finally {
    headingsLoading.value = false;
  }
}

function openBindingDialog(element, binding = null) {
  const root = pageRoot();
  if (!root || !element) return;
  const target = binding?.target || targetSnapshot(root, element);
  selectedElement.value = element;
  targetDescription.value = [target.tag, target.classes?.length ? '.' + target.classes[0] : '', target.text]
    .filter(Boolean)
    .join(' · ');
  editingBindingId.value = binding?.id || '';
  form.documentPath = binding?.prd?.document || documents.value[0]?.path || '';
  form.anchor = binding?.prd?.anchor || '';
  form.label = binding?.prd?.label || target.text || '';
  form.summary = binding?.prd?.summary || '';
  dialogVisible.value = true;
  void loadHeadingsForDocument(form.documentPath, !binding);
}

function handleBindingClick(binding) {
  const element = resolveBindingElement(binding);
  if (editMode.value) {
    openBindingDialog(element, binding);
    return;
  }
  emit('open', {
    documentPath: binding.prd.document,
    anchor: binding.prd.anchor,
  });
  scheduleOverlayRefresh();
}

function handlePointerMove(event) {
  if (!editMode.value) return;
  const target = candidateFor(event.target);
  updatePreview(target);
}

function handlePointerDown(event) {
  if (!editMode.value || dialogVisible.value) return;
  const target = candidateFor(event.target);
  if (!target) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
  openBindingDialog(target);
}

function toggleEditMode() {
  if (!props.canEdit) return;
  editMode.value = !editMode.value;
  previewRect.value = null;
  if (editMode.value && !documents.value.length) void loadData();
  refreshOverlayItems();
}

function handleShortcut(event) {
  if (!props.canEdit || !event.ctrlKey || !event.shiftKey || event.key.toLowerCase() !== 'a') return;
  event.preventDefault();
  toggleEditMode();
}

async function saveBinding() {
  const element = selectedElement.value;
  const root = pageRoot();
  if (!element || !root || !form.documentPath || !form.anchor) {
    ElMessage.warning('请选择页面区域、PRD 文档和章节。');
    return;
  }

  const target = editingBindingId.value
    ? bindings.value.find((binding) => binding.id === editingBindingId.value)?.target ||
      targetSnapshot(root, element)
    : targetSnapshot(root, element);
  const binding = {
    id: editingBindingId.value || createBindingId(props.pagePath, target),
    pagePath: props.pagePath,
    target,
    prd: {
      document: form.documentPath,
      anchor: form.anchor,
      label:
        form.label.trim() || headings.value.find((heading) => heading.id === form.anchor)?.text || '查看 PRD',
      summary: form.summary.trim(),
    },
  };
  const nextBindings = bindings.value.filter(
    (item) =>
      item.id !== binding.id ||
      item.pagePath !== binding.pagePath ||
      JSON.stringify(item.target?.domPath) !== JSON.stringify(binding.target?.domPath),
  );
  nextBindings.push(binding);

  saving.value = true;
  try {
    const payload = await savePrdBindings(props.projectId, nextBindings);
    bindings.value = payload.bindings || [];
    dialogVisible.value = false;
    ElMessage.success('PRD 关联已保存。');
    await nextTick();
    refreshOverlayItems();
  } catch (error) {
    ElMessage.error(error.message || 'PRD 关联保存失败。');
  } finally {
    saving.value = false;
  }
}

async function removeBinding() {
  if (!editingBindingId.value) return;
  try {
    await ElMessageBox.confirm('取消后，页面上的 PRD 标记也会消失。', '取消 PRD 关联', {
      type: 'warning',
      customClass: 'apple-confirm-dialog',
      confirmButtonText: '取消关联',
      cancelButtonText: '保留关联',
    });
  } catch {
    return;
  }

  saving.value = true;
  try {
    const payload = await savePrdBindings(
      props.projectId,
      bindings.value.filter((binding) => binding.id !== editingBindingId.value),
    );
    bindings.value = payload.bindings || [];
    dialogVisible.value = false;
    ElMessage.success('PRD 关联已取消。');
    await nextTick();
    refreshOverlayItems();
  } catch (error) {
    ElMessage.error(error.message || '取消 PRD 关联失败。');
  } finally {
    saving.value = false;
  }
}

function resetDialog() {
  editingBindingId.value = '';
  selectedElement.value = null;
  targetDescription.value = '';
  headings.value = [];
  form.documentPath = '';
  form.anchor = '';
  form.label = '';
  form.summary = '';
}

const stopBindingsChanged = ref(() => {});

watch(
  () => props.enabled,
  (enabled) => {
    if (!enabled) {
      editMode.value = false;
      previewRect.value = null;
      overlayItems.value = [];
    } else {
      void loadData();
    }
  },
);
watch(
  () => props.canEdit,
  (canEdit) => {
    if (!canEdit) {
      editMode.value = false;
      previewRect.value = null;
    }
  },
);
watch(
  () => props.pagePath,
  async () => {
    await nextTick();
    refreshOverlayItems();
  },
);

watch(
  currentBindings,
  async () => {
    await nextTick();
    refreshOverlayItems();
  },
  { deep: true },
);

onMounted(() => {
  overlayRefreshDisposed = false;
  void loadData();
  observePageLayout();
  document.addEventListener('keydown', handleShortcut);
  document.addEventListener('pointermove', handlePointerMove, true);
  document.addEventListener('pointerdown', handlePointerDown, true);
  window.addEventListener('resize', requestOverlayRefresh);
  window.addEventListener('scroll', requestOverlayRefresh, true);
  stopBindingsChanged.value = onPrdBindingsChanged(props.projectId, loadData);
});

onBeforeUnmount(() => {
  overlayRefreshDisposed = true;
  document.removeEventListener('keydown', handleShortcut);
  document.removeEventListener('pointermove', handlePointerMove, true);
  document.removeEventListener('pointerdown', handlePointerDown, true);
  window.removeEventListener('resize', requestOverlayRefresh);
  window.removeEventListener('scroll', requestOverlayRefresh, true);
  window.cancelAnimationFrame(overlayRefreshFrame);
  overlayRefreshFrame = 0;
  layoutObserver?.disconnect();
  layoutObserver = null;
  stopBindingsChanged.value();
});
</script>

<style scoped>
.prd-association-edit-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 28px;
  padding: 0 8px;
  border: 1px solid rgb(0 113 227 / 20%);
  border-radius: 999px;
  color: #0071e3;
  background: rgb(0 113 227 / 8%);
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
}

.prd-association-edit-status__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #0071e3;
  box-shadow: 0 0 0 4px rgb(0 113 227 / 12%);
}

.prd-association-edit-status button {
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
  font: inherit;
}

.prd-association-marker {
  position: fixed;
  z-index: 35;
  min-width: 42px;
  height: 24px;
  padding: 0 8px;
  border: 1px solid rgb(0 113 227 / 25%);
  border-radius: 999px;
  color: #fff;
  background: #0071e3;
  box-shadow: 0 5px 16px rgb(0 113 227 / 28%);
  cursor: pointer;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.prd-association-marker:hover {
  background: #0077ed;
  box-shadow: 0 7px 20px rgb(0 113 227 / 35%);
}

.prd-association-preview {
  position: fixed;
  z-index: 34;
  pointer-events: none;
  border: 2px solid #0071e3;
  border-radius: 10px;
  background: rgb(0 113 227 / 6%);
  box-shadow: 0 0 0 5px rgb(0 113 227 / 12%);
}

.prd-association-preview span {
  position: absolute;
  top: -31px;
  left: -2px;
  padding: 6px 9px;
  border-radius: 8px;
  color: #fff;
  background: #1d1d1f;
  font-size: 11px;
  white-space: nowrap;
}

.prd-association-dialog__target {
  display: grid;
  gap: 5px;
  margin-bottom: 18px;
  padding: 12px 14px;
  border: 1px solid rgb(0 0 0 / 8%);
  border-radius: 12px;
  background: #f5f5f7;
}

.prd-association-dialog__target span {
  color: #6e6e73;
  font-size: 12px;
}

.prd-association-dialog__target strong {
  overflow: hidden;
  color: #1d1d1f;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prd-association-dialog .el-select,
.prd-association-dialog .el-input {
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .prd-association-marker,
  .prd-association-preview {
    transition: none;
  }
}
</style>
