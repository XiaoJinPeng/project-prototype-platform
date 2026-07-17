export function getProjectSourceDownloadUrl(projectId, sourcePath) {
  if (!projectId || !sourcePath || !import.meta.env.DEV) return '';
  return `/__projects/source?project=${encodeURIComponent(projectId)}&path=${encodeURIComponent(sourcePath)}`;
}

export async function downloadProjectSource(projectId, sourcePath) {
  const sourceUrl = getProjectSourceDownloadUrl(projectId, sourcePath);
  if (!sourceUrl || typeof document === 'undefined') return false;

  const response = await fetch(sourceUrl, { headers: { Accept: 'text/plain' } });
  if (!response.ok) {
    let message = `源文件下载失败（${response.status}）。`;
    try {
      const payload = await response.json();
      if (payload?.message) message = payload.message;
    } catch {
      // Keep the status-based message when the server does not return JSON.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  const fileName = encodedName
    ? decodeURIComponent(encodedName)
    : plainName || String(sourcePath).split('/').pop() || 'page.vue';
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
  return true;
}
