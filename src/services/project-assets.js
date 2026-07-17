const BASE_URL = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

function encodeResourcePath(resourcePath) {
  return String(resourcePath || '')
    .replaceAll('\\', '/')
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
}

export function getProjectAssetUrl(projectId, resourcePath) {
  if (!projectId || !resourcePath) return '';
  if (import.meta.env.DEV) {
    return `/__projects/file?project=${encodeURIComponent(projectId)}&path=${encodeURIComponent(resourcePath)}`;
  }
  return `${BASE_URL}projects/${encodeURIComponent(projectId)}/${encodeResourcePath(resourcePath)}`;
}

export function onProjectPackagesChanged(callback) {
  if (!import.meta.hot) return () => {};
  import.meta.hot.on('project-packages:changed', callback);
  return () => import.meta.hot.off('project-packages:changed', callback);
}
