export function getThemeColor(name = 'primary') {
  return window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--app-color-' + name)
    .trim();
}

export function getThemeColorRgb(alpha = 1, name = 'primary') {
  const channels = getThemeColor(name + '-rgb');
  return `rgb(${channels || '37 99 235'} / ${alpha})`;
}

const PROJECT_THEME_VARIABLES = [
  '--app-color-primary',
  '--app-color-primary-rgb',
  '--app-color-primary-hover',
  '--app-color-primary-active',
  '--app-color-page',
];

function hexToRgbChannels(value) {
  const match = String(value || '')
    .trim()
    .match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return '';
  return `${Number.parseInt(match[1], 16)} ${Number.parseInt(match[2], 16)} ${Number.parseInt(match[3], 16)}`;
}

export function applyProjectTheme(project) {
  const root = document.documentElement;
  PROJECT_THEME_VARIABLES.forEach((name) => root.style.removeProperty(name));
  root.dataset.projectId = project?.id || '';
  if (!project?.theme) return;
  const primary = project.theme.primary;
  if (primary) {
    root.style.setProperty('--app-color-primary', primary);
    const rgbChannels = hexToRgbChannels(primary);
    if (rgbChannels) root.style.setProperty('--app-color-primary-rgb', rgbChannels);
  }
  if (project.theme.primaryHover)
    root.style.setProperty('--app-color-primary-hover', project.theme.primaryHover);
  if (project.theme.primaryActive)
    root.style.setProperty('--app-color-primary-active', project.theme.primaryActive);
  if (project.theme.pageBackground) root.style.setProperty('--app-color-page', project.theme.pageBackground);
}
