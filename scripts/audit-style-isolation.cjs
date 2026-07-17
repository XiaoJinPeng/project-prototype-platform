const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const viewRoots = [path.join(projectRoot, 'src', 'views'), path.join(projectRoot, 'projects')];
const legacyFile = path.join(__dirname, 'style-isolation-legacy.json');
const legacyUnscoped = new Set(JSON.parse(fs.readFileSync(legacyFile, 'utf8')));

function toProjectPath(filePath) {
  return path.relative(projectRoot, filePath).split(path.sep).join('/');
}

function listVueFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return listVueFiles(target);
    return entry.isFile() && entry.name.endsWith('.vue') ? [target] : [];
  });
}

const unscopedPattern = /<style(?![^>]*\b(?:scoped|module)\b)[^>]*>/i;
const externalImportPattern = /@import\s+(?:url\()?['"]?https?:\/\//i;
const currentUnscoped = new Set();
const failures = [];

for (const file of viewRoots.flatMap(listVueFiles)) {
  const source = fs.readFileSync(file, 'utf8');
  const relativePath = toProjectPath(file);
  if (unscopedPattern.test(source)) {
    currentUnscoped.add(relativePath);
    if (!legacyUnscoped.has(relativePath)) failures.push(`${relativePath}: 新页面或已隔离页面不得新增非 scoped 样式`);
  }
  if (externalImportPattern.test(source)) failures.push(`${relativePath}: 禁止通过远程 @import 加载样式或字体`);
}

const migrated = [...legacyUnscoped].filter((file) => !currentUnscoped.has(file));
if (migrated.length) {
  failures.push(...migrated.map((file) => `${file}: 已不再使用全局样式，请从 style-isolation-legacy.json 移除`));
}

if (failures.length) {
  console.error('样式隔离审计失败：');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`样式隔离审计通过：现有 ${currentUnscoped.size} 个历史页面受基线管控，新页面必须使用 scoped 或 CSS Modules。`);
