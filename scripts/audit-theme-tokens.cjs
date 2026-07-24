const fs = require('node:fs');
const path = require('node:path');

const roots = [path.join(process.cwd(), 'src'), path.join(process.cwd(), 'projects')];
const allowedFile = path.normalize(path.join(process.cwd(), 'src', 'styles', 'tokens.css'));
const extensions = new Set(['.vue', '.css', '.js']);
const ignoredDirectories = new Set([
  '.backups',
  '.git',
  '.page-transfer-work',
  'dist',
  'exports',
  'node_modules',
]);
const forbidden = [
  { label: '工程主色十六进制硬编码', pattern: /#00689e/gi },
  { label: '工程主色 RGB 硬编码', pattern: /rgba?\(\s*0\s*(?:,|\s)\s*104\s*(?:,|\s)\s*158/gi },
];
const errors = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'assets' && !ignoredDirectories.has(entry.name)) walk(fullPath);
      continue;
    }
    if (!extensions.has(path.extname(entry.name)) || path.normalize(fullPath) === allowedFile) continue;
    const source = fs.readFileSync(fullPath, 'utf8');
    const lines = source.split(/\r?\n/);
    for (const rule of forbidden) {
      lines.forEach((line, index) => {
        rule.pattern.lastIndex = 0;
        if (rule.pattern.test(line)) {
          errors.push(rule.label + '：' + path.relative(process.cwd(), fullPath) + ':' + (index + 1));
        }
      });
    }
  }
}

roots.forEach(walk);

if (errors.length) {
  console.error(errors.join('\n'));
  console.error('请使用 src/styles/tokens.css、Tailwind theme-primary 或 src/config/theme.js。');
  process.exit(1);
}

console.log('主题审计通过：工程主色只在 tokens.css 定义，页面未发现主色硬编码。');
