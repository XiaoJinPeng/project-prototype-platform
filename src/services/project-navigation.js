function normalizePagePath(value) {
  return String(value || '')
    .trim()
    .replace(/^\/+|\/+$/g, '');
}

export function getClientDefaultPagePath(client) {
  const pages = Array.isArray(client?.definition?.pages) ? client.definition.pages : [];
  const configuredPath = normalizePagePath(client?.defaultPage);
  const configuredPage = pages.find((page) => normalizePagePath(page?.path) === configuredPath && configuredPath);
  if (configuredPage) return normalizePagePath(configuredPage.path);

  const firstMenuPage = pages.find((page) => page?.menu !== false && normalizePagePath(page?.path));
  if (firstMenuPage) return normalizePagePath(firstMenuPage.path);

  const firstPage = pages.find((page) => normalizePagePath(page?.path));
  return firstPage ? normalizePagePath(firstPage.path) : '';
}
