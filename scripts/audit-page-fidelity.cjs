const fs = require('fs');
const path = require('path');
const { parse: parseSfc } = require('@vue/compiler-sfc');
const { parse: parseHtml } = require('node-html-parser');
const postcss = require('postcss');

const projectRoot = path.resolve(__dirname, '..');
const prototypeRoot = path.resolve(projectRoot, '..', '02_原型和PRD', '原型');
const projectsRoot = path.join(projectRoot, 'projects');
const viewRoots = fs.existsSync(projectsRoot)
  ? fs
      .readdirSync(projectsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) => [
        ['营运端', path.join(projectsRoot, entry.name, 'views', 'operation')],
        ['企业端', path.join(projectsRoot, entry.name, 'views', 'enterprise')],
      ])
      .filter(([, root]) => fs.existsSync(root))
  : [];
const structuralTags = [
  'button',
  'el-button',
  'el-dialog',
  'el-drawer',
  'el-table',
  'el-table-column',
  'el-tabs',
  'el-tab-pane',
  'el-form',
  'el-form-item',
  'el-select',
  'el-input',
  'el-date-picker',
  'el-pagination',
];
const ignoredClasses = new Set([
  'bg-[#F4F7F9]',
  'bg-gray-50',
  'custom-scroll',
  'el-icon',
  'flex',
  'flex-1',
  'flex-col',
  'flex-wrap',
  'gap-3',
  'h-full',
  'justify-end',
  'overflow-auto',
  'overflow-y-auto',
  'p-6',
  'pt-6',
  'px-6',
]);
const pageRootLayoutProperties = new Set([
  'background',
  'font-family',
  'height',
  'min-height',
  'overflow',
  'overflow-x',
  'overflow-y',
  'padding',
  'padding-block',
  'padding-inline',
]);

function normalizeThemeClass(name) {
  const normalizedName = name
    .replace(/^[a-z0-9]+-page-tabs$/i, 'app-page-tabs')
    .replace(/^[a-z0-9]+-primary-split$/i, 'primary-split');

  return normalizedName.replace(
    /^((?:[a-z0-9-]+:)*(?:text|bg|border|ring|shadow|from|to))-\[#00689e\](\/\d+)?$/i,
    '$1-theme-primary$2',
  );
}

function normalizeThemeValue(value) {
  return value
    .replace(/#00689e/gi, 'var(--app-color-primary)')
    .replace(/#005b8a/gi, 'var(--app-color-primary-hover)')
    .replace(
      /rgba\(\s*0\s*,\s*104\s*,\s*158\s*,\s*(0(?:\.\d+)?|1(?:\.0+)?)\s*\)/gi,
      (_, alpha) => 'rgb(var(--app-color-primary-rgb) / ' + Number(alpha) * 100 + '%)',
    )
    .replace(/rgb\(\s*0\s+104\s+158\s*\/\s*([\d.]+)%\s*\)/gi, 'rgb(var(--app-color-primary-rgb) / $1%)');
}

function toPrototypeFileName(file) {
  const baseName = path.basename(file, '.vue').replace(/View$/, '');
  if (baseName === 'EnterpriseDashboard') return 'dashboard.html';
  return `${baseName.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()}.html`;
}

function listVueFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) return listVueFiles(target);
    return entry.isFile() && entry.name.endsWith('.vue') ? [target] : [];
  });
}

function extractElements(source, tagName, startAt = 0) {
  const expression = new RegExp(`</?${tagName}\\b[^>]*>`, 'gi');
  expression.lastIndex = startAt;
  const elements = [];
  let depth = 0;
  let start = -1;
  let match;
  while ((match = expression.exec(source))) {
    const closing = match[0].startsWith('</');
    if (!closing) {
      if (depth === 0) start = match.index;
      depth += 1;
    } else if (depth > 0) {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        elements.push({ html: source.slice(start, expression.lastIndex), end: expression.lastIndex });
        start = -1;
      }
    }
  }
  return elements;
}

function parseBusinessHtml(source) {
  const main = extractElements(source, 'main')[0];
  if (!main) return null;
  const extras = [
    ...extractElements(source, 'el-dialog', main.end),
    ...extractElements(source, 'el-drawer', main.end),
  ].map((item) => item.html);
  const root = parseHtml('<div id="fidelity-root"></div>', {
    comment: false,
    lowerCaseTagName: false,
  }).querySelector('#fidelity-root');
  const appendFragment = (html) => {
    const fragment = parseHtml(html, { comment: false, lowerCaseTagName: false });
    [...fragment.childNodes].forEach((node) => root.appendChild(node));
  };
  const mainProbe = parseHtml(main.html, { comment: false, lowerCaseTagName: false }).querySelector('main');
  const hasDirectHeader = mainProbe?.childNodes.some((node) => node.tagName?.toLowerCase() === 'header');
  const oldHeader = hasDirectHeader ? extractElements(main.html, 'header')[0] : null;
  const businessMainHtml = oldHeader ? main.html.replace(oldHeader.html, '') : main.html;
  appendFragment(businessMainHtml);
  extras.forEach(appendFragment);
  root.fidelitySource = businessMainHtml + extras.join('');
  root?.querySelectorAll('main > header').forEach((node) => node.remove());
  return root;
}

function classSet(root) {
  const result = new Set();
  root.querySelectorAll('[class]').forEach((node) => {
    String(node.getAttribute('class') || '')
      .split(/\s+/)
      .forEach((name) => {
        if (name && !name.includes('{') && !name.startsWith(':') && !ignoredClasses.has(name)) {
          result.add(normalizeThemeClass(name));
        }
      });
  });
  root.querySelectorAll('[title-class], [description-class]').forEach((node) => {
    ['title-class', 'description-class'].forEach((attribute) => {
      String(node.getAttribute(attribute) || '')
        .split(/\s+/)
        .forEach((name) => {
          if (name && !ignoredClasses.has(name)) result.add(normalizeThemeClass(name));
        });
    });
  });
  return result;
}

function countTags(root) {
  return Object.fromEntries(structuralTags.map((tag) => [tag, root.querySelectorAll(tag).length]));
}

function selectorClasses(styles) {
  return new Set([...styles.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((match) => match[1]));
}

function cssRuleMap(styles, usedClasses) {
  const result = new Map();
  if (!styles.trim()) return result;
  const root = postcss.parse(styles);
  root.walkRules((rule) => {
    const classes = [...rule.selector.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((match) =>
      normalizeThemeClass(match[1]),
    );
    if (!classes.some((name) => usedClasses.has(name))) return;
    const selector = rule.selector
      .replace(/\.([A-Za-z_][\w-]*)/g, (_, name) => `.${normalizeThemeClass(name)}`)
      .replace(/\s+/g, ' ')
      .trim();
    const isPageRootRule = /^\.[a-z0-9_-]+-page$/i.test(selector);
    const declarations = rule.nodes
      .filter((node) => node.type === 'decl')
      .filter((node) => !(isPageRootRule && pageRootLayoutProperties.has(node.prop)))
      .map((node) => `${node.prop}:${normalizeThemeValue(node.value)}${node.important ? '!important' : ''}`)
      .sort()
      .join(';');
    result.set(selector, declarations);
  });
  return result;
}

function styleBlocks(source) {
  return [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]).join('\n');
}

function signature(node) {
  const tag = node.tagName.toLowerCase();
  const classes = String(node.getAttribute('class') || '')
    .split(/\s+/)
    .filter(Boolean)
    .map(normalizeThemeClass)
    .sort()
    .join('.');
  const title = node.getAttribute('title') || node.getAttribute(':title') || '';
  const width = node.getAttribute('width') || node.getAttribute(':width') || '';
  const type = node.getAttribute('type') || '';
  const size = node.getAttribute('size') || '';
  return `${tag}|${classes}|${title}|${width}|${type}|${size}`;
}

function signatureCounts(root, selector) {
  const counts = new Map();
  root.querySelectorAll(selector).forEach((node) => {
    const key = signature(node);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return counts;
}

function missingSignatures(sourceRoot, vueRoot, selector) {
  const sourceCounts = signatureCounts(sourceRoot, selector);
  const vueCounts = signatureCounts(vueRoot, selector);
  return [...sourceCounts.entries()]
    .filter(([key, count]) => (vueCounts.get(key) || 0) < count)
    .map(([key, count]) => `${key} x${count - (vueCounts.get(key) || 0)}`);
}

const focusNames = new Set(process.argv.slice(2));
const problems = [];
let checked = 0;

for (const [clientFolder, root] of viewRoots) {
  for (const file of listVueFiles(root)) {
    const baseName = path.basename(file, '.vue');
    if (focusNames.size && !focusNames.has(baseName)) continue;
    const prototypeFile = path.join(prototypeRoot, clientFolder, toPrototypeFileName(file));
    if (!fs.existsSync(prototypeFile)) continue;
    checked += 1;

    const vueSource = fs.readFileSync(file, 'utf8');
    const prototypeSource = fs.readFileSync(prototypeFile, 'utf8');
    const descriptor = parseSfc(vueSource, { filename: file }).descriptor;
    const vueRoot = parseHtml(descriptor.template?.content || '');
    const prototypeRootNode = parseBusinessHtml(prototypeSource);
    const violations = [];

    if (!prototypeRootNode) {
      violations.push('无法解析源 HTML 的 #app');
    } else {
      const prototypeClasses = classSet(prototypeRootNode);
      const vueClasses = classSet(vueRoot);
      const missingClasses = [...prototypeClasses].filter((name) => !vueClasses.has(name)).sort();
      if (missingClasses.length) {
        const details = missingClasses.map((name) => {
          const node = prototypeRootNode.querySelectorAll('[class]').find((item) =>
            String(item.getAttribute('class') || '')
              .split(/\s+/)
              .includes(name),
          );
          const text = String(node?.textContent || '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 32);
          return `${name}<${node?.tagName?.toLowerCase() || '?'}:${text}>`;
        });
        violations.push(`缺少静态 class：${details.join(', ')}`);
      }

      const prototypeCounts = Object.fromEntries(
        structuralTags.map((tag) => [
          tag,
          [...prototypeRootNode.fidelitySource.matchAll(new RegExp(`<${tag}(?=[\\s>/])`, 'gi'))].length,
        ]),
      );
      const vueCounts = countTags(vueRoot);
      for (const tag of structuralTags) {
        if (prototypeCounts[tag] !== vueCounts[tag]) {
          violations.push(`${tag} 数量不同：HTML ${prototypeCounts[tag]}，Vue ${vueCounts[tag]}`);
        }
      }

      const sourceStyles = styleBlocks(prototypeSource);
      const vueStyles = descriptor.styles.map((style) => style.content).join('\n');
      const sourceSelectors = selectorClasses(sourceStyles);
      const vueSelectors = selectorClasses(vueStyles);
      const missingCss = [...sourceSelectors]
        .filter((name) => prototypeClasses.has(name) && !vueSelectors.has(name))
        .sort();
      if (missingCss.length) violations.push(`缺少页面 CSS class：${missingCss.join(', ')}`);
      const sourceRules = cssRuleMap(sourceStyles, prototypeClasses);
      const vueRules = cssRuleMap(vueStyles, prototypeClasses);
      const changedRules = [...sourceRules.entries()]
        .filter(
          ([selector, declarations]) => vueRules.has(selector) && vueRules.get(selector) !== declarations,
        )
        .map(([selector]) => selector);
      if (changedRules.length) violations.push(`CSS 声明与原型不同：${changedRules.join(', ')}`);

      for (const selector of ['button, el-button', 'el-dialog, el-drawer']) {
        const missing = missingSignatures(prototypeRootNode, vueRoot, selector);
        if (missing.length) violations.push(`${selector} 样式签名缺失：${missing.join('；')}`);
      }
    }

    if (violations.length) {
      problems.push({
        file: path.relative(projectRoot, file).replaceAll('\\', '/'),
        violations,
      });
    }
  }
}

if (problems.length) {
  console.error(`页面保真审计发现 ${problems.length}/${checked} 个页面存在差异。`);
  problems.forEach((problem) => {
    console.error(`\n${problem.file}`);
    problem.violations.forEach((violation) => console.error(`  - ${violation}`));
  });
  process.exitCode = 1;
} else {
  console.log(`页面保真审计通过：${checked} 个页面未发现结构或页面样式缺失。`);
}
