function endpoint(projectId) {
  return `/__projects/page-prd-links?project=${encodeURIComponent(projectId)}`;
}

function normalizeLinks(links) {
  const result = {};
  for (const [clientId, pages] of Object.entries(links || {})) {
    if (!pages || typeof pages !== 'object') continue;
    result[clientId] = {};
    for (const [pageName, value] of Object.entries(pages)) {
      if (value === null || value === '') {
        result[clientId][pageName] = null;
        continue;
      }
      const path = typeof value === 'string' ? value : value?.path || value?.file || '';
      if (path) result[clientId][pageName] = path;
    }
  }
  return result;
}

async function readJson(url, options) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  let payload = {};
  try {
    payload = await response.json();
  } catch {
    // 保留 HTTP 状态作为回退信息。
  }
  if (!response.ok) throw new Error(payload.message || '页面 PRD 关联配置请求失败。');
  return payload;
}

export function normalizePagePrdLinks(payload) {
  return normalizeLinks(payload?.links || payload || {});
}

export async function loadPagePrdLinks(projectId) {
  if (import.meta.env.DEV) return normalizePagePrdLinks(await readJson(endpoint(projectId)));
  return {};
}

export async function savePagePrdLinks(projectId, links) {
  if (!import.meta.env.DEV) {
    throw new Error('静态页面只能查看页面关联，请在本地开发环境中编辑。');
  }
  return normalizePagePrdLinks(
    await readJson(endpoint(projectId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, links: normalizeLinks(links) }),
    }),
  );
}
