const BASE_URL = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const EMPTY_BINDINGS = { schemaVersion: 1, bindings: [] };

function bindingsUrl(projectId) {
  const encodedProjectId = encodeURIComponent(projectId);
  return import.meta.env.DEV
    ? `/__projects/prd-bindings?project=${encodedProjectId}`
    : `${BASE_URL}projects/${encodedProjectId}/.platform/prd-bindings.json`;
}

async function readJson(url, options) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  if (!response.ok) {
    let message = `请求失败（${response.status}）`;
    try {
      const payload = await response.json();
      message = payload.message || message;
    } catch {
      // 使用 HTTP 状态作为回退提示。
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export function normalizePrdBindings(payload) {
  const bindings = Array.isArray(payload?.bindings) ? payload.bindings : [];
  return {
    schemaVersion: 1,
    bindings: bindings.filter((binding) => binding?.pagePath && binding?.target && binding?.prd),
  };
}

export async function loadPrdBindings(projectId) {
  try {
    return normalizePrdBindings(await readJson(bindingsUrl(projectId)));
  } catch (error) {
    if (error.status === 404) return { ...EMPTY_BINDINGS, bindings: [] };
    throw error;
  }
}

export async function savePrdBindings(projectId, bindings) {
  if (!import.meta.env.DEV) {
    throw new Error('静态页面只能查看关联，请在本地开发环境中进入关联编辑模式。');
  }
  return normalizePrdBindings(
    await readJson(bindingsUrl(projectId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, bindings }),
    }),
  );
}

export function onPrdBindingsChanged(projectId, callback) {
  if (!import.meta.hot) return () => {};
  const handleChange = (payload) => {
    if (!payload?.projectId || payload.projectId === projectId) callback();
  };
  import.meta.hot.on('prd-bindings:changed', handleChange);
  return () => import.meta.hot.off('prd-bindings:changed', handleChange);
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

export function extractPrdHeadings(source) {
  const headings = [];
  const usedIds = new Set();
  let inCodeBlock = false;
  for (const line of String(source || '').split(/\r?\n/u)) {
    if (/^\s*```/u.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const match = /^(#{1,3})\s+(.+?)\s*#*\s*$/u.exec(line);
    if (!match) continue;
    const text = match[2].replace(/\[([^\]]+)\]\([^)]*\)/gu, '$1').trim();
    headings.push({ id: createHeadingId(text, usedIds), text, level: match[1].length });
  }
  return headings;
}

export function createBindingId(pagePath, target) {
  const path = Array.isArray(target?.domPath) ? target.domPath.join('.') : '';
  return `${pagePath}::${path || target?.text || Date.now()}`;
}
