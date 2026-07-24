import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const shellRoot = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(shellRoot, 'public');
const configPath = path.join(shellRoot, 'config.json');
const bindingsPath = path.join(shellRoot, 'bindings.json');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.map': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

async function loadSettings() {
  const config = await readJson(configPath, {});
  const bindings = await readJson(bindingsPath, []);
  return {
    ...config,
    port: Number(config.port) || 5190,
    prototypeRoot: path.resolve(shellRoot, config.prototypeRoot || '.'),
    docsRoot: path.resolve(shellRoot, config.docsRoot || '.'),
    hideSelectors: Array.isArray(config.hideSelectors) ? config.hideSelectors : [],
    bindings: Array.isArray(bindings) ? bindings.filter((item) => item && !item._comment) : [],
  };
}

function isInside(root, target) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function safePath(root, relativePath) {
  const decoded = decodeURIComponent(String(relativePath || '')).replace(/^[/\\]+/, '');
  const target = path.resolve(root, decoded);
  if (!isInside(root, target)) throw new Error('非法文件路径。');
  return target;
}

async function walkFiles(root, extensions) {
  const files = [];
  async function visit(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
    for (const entry of entries.sort((left, right) =>
      left.name.localeCompare(right.name, 'zh-CN', { numeric: true }),
    )) {
      if (['node_modules', 'dist', 'exports', '.git'].includes(entry.name)) continue;
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else if (extensions.has(path.extname(entry.name).toLowerCase())) {
        files.push(absolutePath);
      }
    }
  }
  await visit(root);
  return files;
}

function relativePath(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function readHtmlTitle(source, fallback) {
  return (
    source
      .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      ?.replace(/<[^>]+>/g, '')
      .trim() ||
    source
      .match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
      ?.replace(/<[^>]+>/g, '')
      .trim() ||
    fallback
  );
}

function readMarkdownTitle(source, fallback) {
  return source.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback;
}

function bindingFor(bindings, pagePath) {
  const normalized = pagePath.replaceAll('\\', '/');
  const exactMatch = bindings.find((item) => item.page === normalized);
  if (exactMatch) return exactMatch;

  const basenameMatches = bindings.filter(
    (item) => path.basename(item.page || '') === path.basename(normalized),
  );
  return basenameMatches.length === 1 ? basenameMatches[0] : null;
}

function escapeHtmlAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function jsonResponse(res, payload, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function textResponse(res, body, contentType = 'text/plain; charset=utf-8', statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function injectPrototypeBridge(source, pagePath, settings) {
  const selectorCss = settings.hideSelectors
    .filter((selector) => typeof selector === 'string' && selector.trim())
    .map((selector) => `${selector.trim()} { display: none !important; }`)
    .join('\n');
  const isolationCss = `
    html,
    body {
      width: 100% !important;
      min-width: 0 !important;
      min-height: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      overflow: auto !important;
    }
    #app,
    .app-shell,
    .prototype-app {
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      min-height: 100% !important;
      margin: 0 !important;
    }
    [data-html-prototype-grid-root] {
      grid-template-columns: minmax(0, 1fr) !important;
      grid-template-rows: minmax(0, 1fr) !important;
    }
    [data-html-prototype-content-host] {
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      flex: 1 1 auto !important;
    }
    [data-html-prototype-content-scroll] {
      max-width: none !important;
      min-width: 0 !important;
      margin-left: 0 !important;
    }
    ${selectorCss}
  `;
  const hiddenSelectors = JSON.stringify(settings.hideSelectors).replaceAll('<', '\\u003c');
  const bridgeScript = `
    <script id="html-prototype-shell-bridge">
      (() => {
        const hiddenSelectors = ${hiddenSelectors};
        const safeMatches = (element, selector) => {
          try {
            return element.matches(selector);
          } catch {
            return false;
          }
        };
        const isConfiguredShellElement = (element) =>
          hiddenSelectors.some((selector) => safeMatches(element, selector));
        const isLayoutElement = (element) =>
          !['SCRIPT', 'STYLE', 'TEMPLATE', 'LINK'].includes(element.tagName);

        const normalizeRoot = (root) => {
          if (!root) return;
          root.removeAttribute('data-html-prototype-grid-root');
          root.querySelectorAll('[data-html-prototype-content-host], [data-html-prototype-content-scroll]').forEach(
            (element) => {
              element.removeAttribute('data-html-prototype-content-host');
              element.removeAttribute('data-html-prototype-content-scroll');
            },
          );

          const children = [...root.children].filter(isLayoutElement);
          const hasHiddenShellChild = children.some(isConfiguredShellElement);
          const visibleChildren = children.filter(
            (element) => !isConfiguredShellElement(element) && getComputedStyle(element).display !== 'none',
          );
          if (!visibleChildren.length) return;

          const rootDisplay = getComputedStyle(root).display;
          if (hasHiddenShellChild && rootDisplay.includes('grid')) {
            root.setAttribute('data-html-prototype-grid-root', '');
          }

          const contentHost = visibleChildren.reduce((largest, element) => {
            const rect = element.getBoundingClientRect();
            const area = Math.max(rect.width, element.scrollWidth) * Math.max(rect.height, element.scrollHeight);
            return !largest || area > largest.area ? { element, area } : largest;
          }, null)?.element;
          if (!contentHost) return;

          contentHost.setAttribute('data-html-prototype-content-host', '');
          const contentScroll =
            (contentHost.matches('main') ? contentHost : contentHost.querySelector(':scope > main')) ||
            contentHost.querySelector('.page-container, .prototype-main, .main-content, .content-wrapper');
          contentScroll?.setAttribute('data-html-prototype-content-scroll', '');
        };

        const normalizeLayout = () => {
          const roots = [
            document.querySelector('#app'),
            document.querySelector('.app-shell'),
            document.querySelector('.prototype-app'),
          ].filter((root, index, list) => root && list.indexOf(root) === index);
          if (roots.length) roots.forEach(normalizeRoot);
          else normalizeRoot(document.body);
        };
        const resetHorizontalOffsets = () => {
          const candidates = [
            document.scrollingElement,
            document.documentElement,
            document.body,
            document.querySelector('#app'),
            document.querySelector('.app-shell'),
            document.querySelector('.prototype-app'),
            document.querySelector('[data-html-prototype-content-host]'),
            document.querySelector('[data-html-prototype-content-scroll]'),
          ].filter((element, index, list) => element && list.indexOf(element) === index);
          candidates.forEach((element) => {
            if (element.scrollLeft) element.scrollLeft = 0;
          });
        };
        const stabilizeLayout = () => {
          normalizeLayout();
          resetHorizontalOffsets();
        };
        const notify = () => window.parent?.postMessage({ type: 'html-prototype:navigate', path: location.pathname }, '*');
        const notifyReady = () => window.parent?.postMessage({ type: 'html-prototype:layout-ready', path: location.pathname }, '*');
        let readyTimer = 0;
        const settle = () => {
          stabilizeLayout();
          notify();
          requestAnimationFrame(stabilizeLayout);
          setTimeout(stabilizeLayout, 120);
          setTimeout(stabilizeLayout, 360);
          clearTimeout(readyTimer);
          readyTimer = setTimeout(() => {
            stabilizeLayout();
            notifyReady();
          }, 180);
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', settle, { once: true });
        else settle();
        window.addEventListener('load', settle, { once: true });
        window.addEventListener('resize', stabilizeLayout);
        window.addEventListener('hashchange', notify);
        document.addEventListener('click', () => setTimeout(notify, 0), true);
      })();
    </script>
  `;
  const styleBlock = `<style id="html-prototype-shell-isolation" data-page-path="${escapeHtmlAttribute(pagePath)}">${isolationCss}</style>`;
  if (/<\/head>/i.test(source)) {
    return source.replace(/<\/head>/i, `${styleBlock}</head>`).replace(/<\/body>/i, `${bridgeScript}</body>`);
  }
  return `${styleBlock}${source}${bridgeScript}`;
}

async function listPages(settings) {
  const files = await walkFiles(settings.prototypeRoot, new Set(['.html', '.htm']));
  return Promise.all(
    files.map(async (filePath) => {
      const source = await fs.readFile(filePath, 'utf8');
      const relative = relativePath(settings.prototypeRoot, filePath);
      const folder =
        path.dirname(relative).replaceAll('\\', '/') === '.'
          ? '未分组'
          : path.dirname(relative).replaceAll('\\', '/');
      return {
        path: relative,
        title: readHtmlTitle(source, path.basename(filePath, path.extname(filePath))),
        folder,
        binding: bindingFor(settings.bindings, relative),
      };
    }),
  );
}

async function listDocs(settings) {
  const files = await walkFiles(settings.docsRoot, new Set(['.md', '.markdown']));
  return Promise.all(
    files.map(async (filePath) => {
      const source = await fs.readFile(filePath, 'utf8');
      const fileStat = await fs.stat(filePath).catch(() => null);
      const relative = relativePath(settings.docsRoot, filePath);
      return {
        path: relative,
        title: readMarkdownTitle(source, path.basename(filePath, path.extname(filePath))),
        folder:
          path.dirname(relative).replaceAll('\\', '/') === '.'
            ? '根目录'
            : path.dirname(relative).replaceAll('\\', '/'),
        updatedAt: fileStat?.mtime?.toISOString() || null,
      };
    }),
  );
}

async function handleRequest(req, res) {
  const settings = await loadSettings();
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = requestUrl.pathname;

  if (pathname === '/api/config') {
    return jsonResponse(res, {
      port: settings.port,
      prototypeRoot: settings.prototypeRoot,
      docsRoot: settings.docsRoot,
      hideSelectors: settings.hideSelectors,
    });
  }
  if (pathname === '/api/pages') return jsonResponse(res, await listPages(settings));
  if (pathname === '/api/docs') return jsonResponse(res, await listDocs(settings));
  if (pathname === '/api/bindings') return jsonResponse(res, settings.bindings);
  if (pathname === '/api/doc') {
    const filePath = safePath(settings.docsRoot, requestUrl.searchParams.get('path'));
    if (!/\.(?:md|markdown)$/i.test(filePath))
      return textResponse(res, '只允许读取 Markdown 文件。', 'text/plain; charset=utf-8', 400);
    return textResponse(res, await fs.readFile(filePath, 'utf8'));
  }
  if (pathname.startsWith('/prototype/')) {
    const relative = pathname.slice('/prototype/'.length);
    const filePath = safePath(settings.prototypeRoot, relative);
    const extension = path.extname(filePath).toLowerCase();
    if (extension === '.html' || extension === '.htm') {
      const source = await fs.readFile(filePath, 'utf8');
      return textResponse(res, injectPrototypeBridge(source, relative, settings), 'text/html; charset=utf-8');
    }
    return textResponse(
      res,
      await fs.readFile(filePath),
      MIME_TYPES[extension] || 'application/octet-stream',
    );
  }

  const publicPath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const filePath = safePath(publicRoot, publicPath);
  const extension = path.extname(filePath).toLowerCase();
  return textResponse(res, await fs.readFile(filePath), MIME_TYPES[extension] || 'application/octet-stream');
}

const initialSettings = await loadSettings();
const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    const statusCode = error.code === 'ENOENT' ? 404 : 500;
    jsonResponse(res, { error: error.message || '读取失败。' }, statusCode);
  });
});

server.listen(initialSettings.port, '127.0.0.1', () => {
  console.log(`HTML 原型外壳已启动：http://127.0.0.1:${initialSettings.port}`);
  console.log(`HTML 来源：${initialSettings.prototypeRoot}`);
  console.log(`PRD 来源：${initialSettings.docsRoot}`);
});
