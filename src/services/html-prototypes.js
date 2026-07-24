const BASE_URL = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

function encodePath(relativePath) {
  const segments = String(relativePath || '')
    .replaceAll('\\', '/')
    .split('/')
    .filter((segment) => segment && segment !== '.');
  if (segments.includes('..')) return '';
  return segments.map((segment) => encodeURIComponent(segment)).join('/');
}

export function getHtmlPrototypeUrl(projectId, clientId, sourcePath) {
  const encodedProjectId = encodeURIComponent(projectId);
  const encodedClientId = encodeURIComponent(clientId || '_');
  const encodedPath = encodePath(sourcePath);
  if (!encodedProjectId || !encodedPath) return '';
  const hasSourceRoot = clientId && clientId !== '_';
  if (import.meta.env.DEV) {
    return `/__projects/html-content/${encodedProjectId}/${encodedClientId}/${encodedPath}`;
  }
  return `${BASE_URL}projects/${encodedProjectId}/prototype/${hasSourceRoot ? `${encodedClientId}/` : ''}${encodedPath}`;
}
