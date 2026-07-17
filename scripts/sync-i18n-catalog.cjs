const fs = require('fs');
const path = require('path');
const babelParser = require('@babel/parser');
const { parse: parseSfc } = require('@vue/compiler-sfc');
const { parse: parseTemplate } = require('@vue/compiler-dom');

const projectRoot = path.resolve(__dirname, '..');
const sourceRoots = [
  path.join(projectRoot, 'src', 'views'),
  path.join(projectRoot, 'src', 'components'),
  path.join(projectRoot, 'src', 'layouts'),
];
const sourceScripts = [path.join(projectRoot, 'src', 'router', 'index.js')];
const projectsRoot = path.join(projectRoot, 'projects');
if (fs.existsSync(projectsRoot)) {
  for (const entry of fs.readdirSync(projectsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const packageRoot = path.join(projectsRoot, entry.name);
    const manifestPath = path.join(packageRoot, 'project.json');
    if (!fs.existsSync(manifestPath)) continue;
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!manifest.features?.legacyI18n) continue;
    sourceRoots.push(path.join(packageRoot, 'views'));
    sourceScripts.push(path.resolve(packageRoot, manifest.pageDefinitions || 'page-definitions.js'));
  }
}
const outputRoot = path.join(projectRoot, 'src', 'i18n', 'catalog');
const attributeNames = new Set([
  'label',
  'placeholder',
  'title',
  'empty-text',
  'content',
  'confirm-button-text',
  'cancel-button-text',
  'alt',
  'aria-label',
]);
const chinesePattern = /[\u3400-\u9fff]/;

function listVueFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) return listVueFiles(target);
    return entry.isFile() && entry.name.endsWith('.vue') ? [target] : [];
  });
}

function addCopy(catalog, value) {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  if (normalized && chinesePattern.test(normalized)) catalog.add(normalized);
}

function collectExpressionStrings(catalog, expression) {
  try {
    const ast = babelParser.parseExpression(expression, { plugins: ['typescript'] });
    const visit = (node) => {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'StringLiteral') addCopy(catalog, node.value);
      if (node.type === 'TemplateElement') addCopy(catalog, node.value.cooked);
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(visit);
        else visit(value);
      }
    };
    visit(ast);
  } catch {
    // Vue expressions can contain syntax Babel does not understand; static text is still collected separately.
  }
}

function collectScriptCopy(catalog, source) {
  const ast = babelParser.parse(source, { sourceType: 'module' });
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'StringLiteral') addCopy(catalog, node.value);
    if (node.type === 'TemplateElement') addCopy(catalog, node.value.cooked);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else visit(value);
    }
  };
  visit(ast);
}

function collectTemplateCopy(catalog, template) {
  const root = parseTemplate(template, { comments: false });
  const visit = (node) => {
    if (node.type === 2) addCopy(catalog, node.content);
    if (node.type === 1) {
      for (const prop of node.props) {
        if (prop.type === 6 && attributeNames.has(prop.name)) addCopy(catalog, prop.value?.content);
        if (prop.type === 7 && prop.exp?.content) collectExpressionStrings(catalog, prop.exp.content);
      }
    }
    if (node.children) node.children.forEach(visit);
    if (node.branches) node.branches.forEach(visit);
  };
  visit(root);
}

function readJson(file) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const catalog = new Set();
for (const file of sourceRoots.flatMap(listVueFiles)) {
  const source = fs.readFileSync(file, 'utf8');
  const parsed = parseSfc(source, { filename: file });
  if (parsed.errors.length || !parsed.descriptor.template) continue;
  collectTemplateCopy(catalog, parsed.descriptor.template.content);
}
for (const file of sourceScripts) {
  if (fs.existsSync(file)) collectScriptCopy(catalog, fs.readFileSync(file, 'utf8'));
}

const phrases = [...catalog].sort((left, right) => left.localeCompare(right, 'zh-CN'));
fs.mkdirSync(outputRoot, { recursive: true });
const localeFiles = {
  'zh-CN': path.join(outputRoot, 'zh-CN.json'),
  'zh-TW': path.join(outputRoot, 'zh-TW.json'),
  'en-US': path.join(outputRoot, 'en-US.json'),
};
const existingTraditional = readJson(localeFiles['zh-TW']);
const existingEnglish = readJson(localeFiles['en-US']);
const simplified = Object.fromEntries(phrases.map((phrase) => [phrase, phrase]));
const traditional = Object.fromEntries(phrases.map((phrase) => [phrase, existingTraditional[phrase] || phrase]));
const english = Object.fromEntries(phrases.map((phrase) => [phrase, existingEnglish[phrase] || phrase]));

fs.writeFileSync(localeFiles['zh-CN'], `${JSON.stringify(simplified, null, 2)}\n`, 'utf8');
fs.writeFileSync(localeFiles['zh-TW'], `${JSON.stringify(traditional, null, 2)}\n`, 'utf8');
fs.writeFileSync(localeFiles['en-US'], `${JSON.stringify(english, null, 2)}\n`, 'utf8');
console.log(`已同步 ${phrases.length} 条静态界面文案。`);
