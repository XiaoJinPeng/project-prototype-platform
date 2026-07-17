const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const excludedDirectories = new Set([
  '.git',
  '.page-transfer-work',
  'dist',
  'exports',
  'node_modules',
  'output',
  'projects',
]);
const supportedExtensions = new Set(['.cjs', '.css', '.js', '.json', '.md', '.vue']);
const excludedContentFiles = new Set([
  path.join(projectRoot, 'src', 'config', 'project.config.js'),
  path.join(projectRoot, 'tests', 'e2e', 'interactions.spec.js'),
  path.join(projectRoot, 'tests', 'e2e', 'visual.spec.js'),
  __filename,
]);
const contentRoots = [
  path.join(projectRoot, 'src', 'components'),
  path.join(projectRoot, 'src', 'config'),
  path.join(projectRoot, 'src', 'styles'),
  path.join(projectRoot, 'scripts'),
  path.join(projectRoot, 'plugins'),
  path.join(projectRoot, 'tests'),
];
const rootFiles = [
  'package.json',
  'package-lock.json',
  'tailwind.config.js',
  'README.md',
  'COMPONENT_GUIDE.md',
  'TESTING_GUIDE.md',
].map((name) => path.join(projectRoot, name));

function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (excludedDirectories.has(entry.name)) return [];
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) return listFiles(target);
    return entry.isFile() ? [target] : [];
  });
}

const allFiles = listFiles(projectRoot);
const nameViolations = allFiles.filter((file) => /rimo/i.test(path.basename(file)));
const contentFiles = [...contentRoots.flatMap(listFiles), ...rootFiles]
  .filter((file, index, files) => files.indexOf(file) === index)
  .filter((file) => supportedExtensions.has(path.extname(file)))
  .filter((file) => !excludedContentFiles.has(file));
const contentViolations = contentFiles.filter((file) => /rimo/i.test(fs.readFileSync(file, 'utf8')));

if (nameViolations.length || contentViolations.length) {
  console.error('通用模板命名审计失败：工程底座仍包含项目专用名称。');
  nameViolations.forEach((file) => console.error('  文件名：' + path.relative(projectRoot, file)));
  contentViolations.forEach((file) => console.error('  工程内容：' + path.relative(projectRoot, file)));
  process.exitCode = 1;
} else {
  console.log('通用模板命名审计通过：工程底座未发现项目专用命名。');
}
