import * as ElementIcons from '@element-plus/icons-vue';

const manifestModules = import.meta.glob('../../projects/*/project.json', {
  eager: true,
  import: 'default',
});
const definitionModules = import.meta.glob('../../projects/*/page-definitions.js', { eager: true });
const pagePrdLinkModules = import.meta.glob('../../projects/*/page-prd-links.js', {
  eager: true,
  import: 'default',
});
const pagePrdLinkConfigModules = import.meta.glob('../../projects/*/.platform/page-prd-links.json', {
  eager: true,
  import: 'default',
});
const packageViewModules = import.meta.glob('../../projects/*/views/**/*.vue');
const compatibilityViewModules = import.meta.glob('../views/{operation,enterprise}/*.vue');

function projectFolderFromPath(modulePath) {
  return modulePath.match(/\.\.\/\.\.\/projects\/([^/]+)\/project\.json$/)?.[1] || '';
}

function mergePagePrdLinks(baseLinks, overrideLinks) {
  const merged = Object.fromEntries(
    Object.entries(baseLinks || {}).map(([clientId, pages]) => [clientId, { ...(pages || {}) }]),
  );

  for (const [clientId, pages] of Object.entries(overrideLinks || {})) {
    if (!pages || typeof pages !== 'object') continue;
    merged[clientId] ||= {};
    for (const [pageName, documentPath] of Object.entries(pages)) {
      if (documentPath === null || documentPath === '') delete merged[clientId][pageName];
      else merged[clientId][pageName] = documentPath;
    }
  }

  return merged;
}

function normalizeProject(modulePath, manifest) {
  const folder = projectFolderFromPath(modulePath);
  const definitionsModule = definitionModules[`../../projects/${folder}/${manifest.pageDefinitions}`];
  const definitions = definitionsModule?.clientPageDefinitions || definitionsModule?.default;
  const legacyPagePrdLinks = pagePrdLinkModules[`../../projects/${folder}/page-prd-links.js`] || {};
  const pagePrdLinkConfig =
    pagePrdLinkConfigModules[`../../projects/${folder}/.platform/page-prd-links.json`];
  const pagePrdLinks = mergePagePrdLinks(legacyPagePrdLinks, pagePrdLinkConfig?.links || {});
  if (!folder || folder !== manifest.id || !definitions) return null;
  const clients = (manifest.clients || [])
    .filter((client) => definitions[client.id])
    .map((client) => ({ ...client, definition: definitions[client.id] }));
  return Object.freeze({ ...manifest, folder, definitions, pagePrdLinks, clients });
}

export const installedProjects = Object.freeze(
  Object.entries(manifestModules)
    .map(([modulePath, manifest]) => normalizeProject(modulePath, manifest))
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name, 'zh-Hans-CN', { numeric: true })),
);

export function getProject(projectId) {
  return installedProjects.find((project) => project.id === projectId) || null;
}

export function getProjectClient(projectId, clientId) {
  return getProject(projectId)?.clients.find((client) => client.id === clientId) || null;
}

export function resolveProjectIcon(iconName, fallback = 'Document') {
  return ElementIcons[iconName] || ElementIcons[fallback];
}

export function resolveProjectView(project, view) {
  const packageView = packageViewModules[`../../projects/${project.folder}/views/${view}`];
  if (packageView) return packageView;
  if (project.compatibility?.legacyViewRoot === 'src/views') {
    const compatibilityView = compatibilityViewModules[`../views/${view}`];
    if (compatibilityView) return compatibilityView;
  }
  throw new Error(`项目 ${project.id} 的页面模块不存在：${view}`);
}

export function createProjectMenus(projectId, clientId) {
  const project = getProject(projectId);
  const client = getProjectClient(projectId, clientId);
  if (!project || !client) return [];
  const definition = client.definition;
  return definition.sections
    .map((section) => ({
      title: section.title,
      items: definition.pages
        .filter((page) => page.section === section.id && page.menu !== false)
        .map((page) => ({
          label: page.title,
          path: `/p/${project.id}/${client.id}/${page.path}`,
          icon: resolveProjectIcon(page.icon),
        })),
    }))
    .filter((section) => section.items.length > 0);
}

export function createProjectPageRoutes(project, client) {
  return client.definition.pages.map((page) => ({
    path: page.path,
    name: `${project.id}-${client.id}-${page.name}`,
    component: resolveProjectView(project, page.view),
    meta: {
      title: page.title,
      projectId: project.id,
      clientId: client.id,
      ...(page.view ? { source: `views/${String(page.view).replace(/^\/+/, '')}` } : {}),
      ...(project.pagePrdLinks?.[client.id]?.[page.name]
        ? { prd: project.pagePrdLinks[client.id][page.name] }
        : {}),
      ...(page.legacy ? { legacy: true } : {}),
    },
  }));
}

export function getProjectEntryPath(project, entry) {
  if (entry.kind === 'client') return `/p/${project.id}/${entry.clientId}/login`;
  if (entry.kind === 'mobile') return `/p/${project.id}/mobile`;
  if (entry.kind === 'docs') return `/p/${project.id}/docs`;
  return `/p/${project.id}`;
}

export function getProjectPages(projectId) {
  const project = getProject(projectId);
  if (!project) return [];
  return project.clients.flatMap((client) =>
    client.definition.pages.map((page) => ({
      ...page,
      projectId: project.id,
      client: client.id,
      fullPath: `/p/${project.id}/${client.id}/${page.path}`,
    })),
  );
}
