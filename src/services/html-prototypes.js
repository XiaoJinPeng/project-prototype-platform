const BASE_URL = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

function encodePath(relativePath) {
  return String(relativePath || '')
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function getHtmlPrototypeUrl(projectId, clientId, sourcePath) {
  const encodedProjectId = encodeURIComponent(projectId);
  const encodedClientId = encodeURIComponent(clientId || '_');
  const encodedPath = encodePath(sourcePath);
  const hasSourceRoot = clientId && clientId !== '_';
  if (import.meta.env.DEV) {
    return `/__projects/html-content/${encodedProjectId}/${encodedClientId}/${encodedPath}`;
  }
  return `${BASE_URL}projects/${encodedProjectId}/prototype/${hasSourceRoot ? `${encodedClientId}/` : ''}${encodedPath}`;
}
