const BASE_URL = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

function encodeDocumentPath(documentPath) {
  return documentPath.split('/').map(encodeURIComponent).join('/');
}

async function fetchOrThrow(url, responseType = 'json') {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    let message = `请求失败（${response.status}）`;
    try {
      const payload = await response.json();
      message = payload.message || message;
    } catch {
      // Keep the HTTP fallback message when the response is not JSON.
    }
    throw new Error(message);
  }
  return responseType === 'text' ? response.text() : response.json();
}

export function normalizeDocumentPath(value) {
  const segments = String(value || '').replaceAll('\\', '/').split('/');
  const normalized = [];
  for (const segment of segments) {
    if (!segment || segment === '.') continue;
    if (segment === '..') normalized.pop();
    else normalized.push(segment);
  }
  return normalized.join('/');
}

export function resolveDocumentReference(currentDocumentPath, reference) {
  const value = String(reference || '').trim();
  if (!value || /^(?:[a-z]+:|#|\/\/)/i.test(value)) return value;

  const [pathPart, suffix = ''] = value.split(/(?=[?#])/u, 2);
  const currentFolder = currentDocumentPath.split('/').slice(0, -1).join('/');
  const resolved = normalizeDocumentPath(pathPart.startsWith('/') ? pathPart : `${currentFolder}/${pathPart}`);
  return `${resolved}${suffix}`;
}

export function getDocumentAssetUrl(projectId, documentPath) {
  const normalizedPath = normalizeDocumentPath(documentPath);
  if (import.meta.env.DEV) {
    return `/__prd/file?project=${encodeURIComponent(projectId)}&path=${encodeURIComponent(normalizedPath)}`;
  }
  return `${BASE_URL}projects/${encodeURIComponent(projectId)}/docs/content/${encodeDocumentPath(normalizedPath)}`;
}

export function loadDocumentManifest(projectId) {
  const url = import.meta.env.DEV
    ? `/__prd/manifest?project=${encodeURIComponent(projectId)}`
    : `${BASE_URL}projects/${encodeURIComponent(projectId)}/docs/manifest.json`;
  return fetchOrThrow(url);
}

export function loadDocument(projectId, documentPath) {
  return fetchOrThrow(getDocumentAssetUrl(projectId, documentPath), 'text');
}

export function onDocumentsChanged(projectId, callback) {
  if (!import.meta.hot) return () => {};
  const handleChange = (payload) => {
    if (!payload?.projectId || payload.projectId === projectId) callback();
  };
  import.meta.hot.on('prd-docs:changed', handleChange);
  return () => import.meta.hot.off('prd-docs:changed', handleChange);
}
