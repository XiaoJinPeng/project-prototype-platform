import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import prettier from 'prettier';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectsRoot = path.join(projectRoot, 'projects');
const templatePath = path.join(projectRoot, 'templates', 'page', 'PageView.vue.template');
const projectIdPattern = /^[a-z][a-z0-9-]*$/;
const allowedIcons = new Set([
  'Calendar',
  'CirclePlus',
  'DataBoard',
  'Document',
  'Files',
  'House',
  'List',
  'Location',
  'Lock',
  'Management',
  'Medal',
  'Money',
  'Odometer',
  'Postcard',
  'Setting',
  'Tickets',
  'User',
  'Van',
  'Warning',
]);

function printHelp() {
  console.log(
    [
      '',
      '新页面生成器',
      '',
      '用法：',
      '  npm run generate:page -- --project sample-project --client admin --path example-page --title "示例页面" --section workspace',
      '',
      '参数：',
      '  --project      项目包 ID；工程只有一个项目包时可省略',
      '  --client       project.json 中登记的客户端 ID',
      '  --path         路由片段，使用 kebab-case',
      '  --title        页面和菜单标题',
      '  --description  页面说明，可选',
      '  --section      菜单分组 ID；可通过 --list-sections 查询',
      '  --icon         Element Plus 图标名，默认 Document',
      '  --hidden       只注册路由，不显示菜单',
      '  --dry-run      只校验并输出目标，不写文件',
      '  --list-projects           查看已安装项目包',
      '  --list-sections [client]  查看指定项目客户端的菜单分组',
      '',
    ].join('\n'),
  );
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith('--')) continue;
    const key = argument.slice(2);
    if (['hidden', 'dry-run', 'help', 'list-projects'].includes(key)) {
      options[key] = true;
      continue;
    }
    options[key] = argv[index + 1];
    index += 1;
  }
  return options;
}

function toPascalCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function escapeTemplateText(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

const options = parseArgs(process.argv.slice(2));
if (options.help) {
  printHelp();
  process.exit(0);
}

const availableProjectIds = fs
  .readdirSync(projectsRoot, { withFileTypes: true })
  .filter(
    (entry) => entry.isDirectory() && fs.existsSync(path.join(projectsRoot, entry.name, 'project.json')),
  )
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));

if (options['list-projects']) {
  for (const id of availableProjectIds) {
    const manifest = JSON.parse(fs.readFileSync(path.join(projectsRoot, id, 'project.json'), 'utf8'));
    console.log(`${id}\t${manifest.name || ''}`);
  }
  process.exit(0);
}

const projectId = options.project || (availableProjectIds.length === 1 ? availableProjectIds[0] : '');
if (!projectIdPattern.test(projectId) || !availableProjectIds.includes(projectId)) {
  throw new Error('请通过 --project 指定有效项目包；可运行 --list-projects 查询。');
}
const packageRoot = path.join(projectsRoot, projectId);
const manifest = JSON.parse(fs.readFileSync(path.join(packageRoot, 'project.json'), 'utf8'));
if (manifest.id !== projectId) throw new Error('项目 ID 与项目文件夹名称不一致。');
const definitionsPath = path.resolve(packageRoot, manifest.pageDefinitions || 'page-definitions.js');
const definitionsRelativePath = path.relative(packageRoot, definitionsPath);
if (definitionsRelativePath.startsWith('..') || path.isAbsolute(definitionsRelativePath)) {
  throw new Error('页面定义文件必须位于项目包内。');
}
const allowedClients = new Set((manifest.clients || []).map((item) => item.id));

const definitionsUrl = pathToFileURL(definitionsPath);
definitionsUrl.searchParams.set('timestamp', String(Date.now()));
const importedDefinitions = await import(definitionsUrl.href);
const clientPageDefinitions = importedDefinitions.clientPageDefinitions;

if (options['list-sections'] !== undefined) {
  const client = options['list-sections'] || options.client;
  if (!allowedClients.has(client)) throw new Error('请在 --list-sections 后指定项目内的客户端 ID。');
  for (const section of clientPageDefinitions[client].sections) {
    console.log(section.id + '\t' + section.title);
  }
  process.exit(0);
}

const client = options.client;
const routePath = options.path;
const title = options.title;
const description = options.description || '管理' + (title || '') + '相关资料与操作。';
const icon = options.icon || 'Document';
const hidden = Boolean(options.hidden);

if (!allowedClients.has(client)) throw new Error('--client 必须是 project.json 中登记的客户端 ID。');
if (!routePath || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(routePath)) {
  throw new Error('--path 必须使用 kebab-case，例如 vehicle-inspection。');
}
if (!title || !title.trim()) throw new Error('必须提供 --title。');
if (!allowedIcons.has(icon)) throw new Error('不支持的图标：' + icon + '。请使用现有 Element Plus 图标。');
if (!hidden && !options.section) throw new Error('显示在菜单中的页面必须提供 --section。');

const definition = clientPageDefinitions[client];
if (!hidden && !definition.sections.some((section) => section.id === options.section)) {
  throw new Error('菜单分组不存在：' + options.section + '。请运行 --list-sections ' + client + ' 查询。');
}

const componentName = toPascalCase(routePath) + 'View';
const routeName = client + '-' + routePath;
const relativeView = client + '/' + componentName + '.vue';
const targetPath = path.join(packageRoot, 'views', relativeView);
const duplicate = definition.pages.find(
  (page) => page.path === routePath || page.name === routeName || page.view === relativeView,
);

if (duplicate) throw new Error('页面已存在：' + duplicate.name + ' (' + duplicate.path + ')。');
if (fs.existsSync(targetPath)) throw new Error('目标文件已存在：' + targetPath);

const source = fs.readFileSync(definitionsPath, 'utf8');
const marker = '      // <generator:' + client + '-pages>';
if (!source.includes(marker)) throw new Error('页面注册表缺少生成器标记：' + marker);

const pageDefinition = {
  path: routePath,
  name: routeName,
  title: title.trim(),
  view: relativeView,
  ...(hidden ? { menu: false } : { section: options.section, icon }),
};
const registryLine = '      ' + JSON.stringify(pageDefinition) + ',';
const updatedDefinitions = source.replace(marker, registryLine + '\n' + marker);
const rawPageTemplate = fs
  .readFileSync(templatePath, 'utf8')
  .replaceAll('{{PAGE_TITLE}}', escapeTemplateText(title.trim()))
  .replaceAll('{{PAGE_DESCRIPTION}}', escapeTemplateText(description.trim()));
const pageTemplate = await prettier.format(rawPageTemplate, { parser: 'vue' });

console.log('页面文件：' + path.relative(projectRoot, targetPath));
console.log('访问地址：/p/' + projectId + '/' + client + '/' + routePath);
console.log(hidden ? '菜单：隐藏' : '菜单分组：' + options.section);

if (options['dry-run']) {
  console.log('校验通过，dry-run 未写入文件。');
  process.exit(0);
}

fs.writeFileSync(definitionsPath, updatedDefinitions, 'utf8');
try {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, pageTemplate, { encoding: 'utf8', flag: 'wx' });
} catch (error) {
  fs.writeFileSync(definitionsPath, source, 'utf8');
  throw error;
}

console.log('页面、路由和菜单登记已完成。');
