const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const babelParser = require('@babel/parser');
const { parse, compileScript, compileTemplate } = require('@vue/compiler-sfc');

const projectRoot = path.resolve(__dirname, '..');
const projectsRoot = path.join(projectRoot, 'projects');
const commonViewRoots = [path.join(projectRoot, 'src', 'views', 'auth')];
const prototypeRoot = path.resolve(projectRoot, '..', '02_原型和PRD', '原型');

const rules = [
  ['旧侧栏', /<aside\b/i],
  ['旧顶栏', /<header\b[^>]*class=["'][^"']*(?:topbar|top-bar|app-header|header-bar)/i],
  ['旧全屏外壳', /class=["'][^"']*\bflex\b[^"']*\bh-screen\b/i],
  ['静态入口脚本', /client_portal_switcher/i],
  ['Vue 手动挂载', /(?:createApp\s*\(|app\.mount\s*\()/],
  ['HTML 全局 Vue 命名空间', /\bVue\./],
  ['Element Plus 全局命名空间', /ElementPlus\.(?:ElMessage|ElMessageBox|ElLoading|ElNotification)/],
  ['旧页面跳转', /window\.location(?:\.href)?\s*=/],
  ['旧 HTML 链接', /['"][^'"]+\.html(?:[?#][^'"]*)?['"]/],
  ['外部 CDN', /(?:cdn\.|unpkg|jsdelivr)/i],
  ['模板脚本标签', /<script\b[^>]*src=/i],
  ['旧 Inter 首选字体', /font-family\s*:\s*['"]?Inter\b/i],
];

const expectedDialogCounts = new Map([
  ['MarketingView.vue', 2],
  ['PricingView.vue', 5],
  ['EnterpriseDashboardView.vue', 1],
]);

const expectedDrawerCounts = new Map([['MarketingView.vue', 1]]);

const structuralTags = ['el-dialog', 'el-drawer', 'el-table', 'el-tabs', 'el-form'];

function toPrototypeFileName(file) {
  const baseName = path.basename(file, '.vue').replace(/View$/, '');
  if (baseName === 'EnterpriseDashboard') return 'dashboard.html';
  return `${baseName.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()}.html`;
}

function countOpeningTags(source, tagName) {
  return [...source.matchAll(new RegExp(`<${tagName}\\b`, 'gi'))].length;
}

function listVueFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .flatMap((entry) => {
      const target = path.join(root, entry.name);
      if (entry.isDirectory()) return listVueFiles(target);
      return entry.isFile() && entry.name.endsWith('.vue') ? [target] : [];
    });
}

function getPropertyName(property) {
  if (!property || property.computed) return null;
  if (property.key.type === 'Identifier') return property.key.name;
  if (property.key.type === 'StringLiteral') return property.key.value;
  return null;
}

function getObjectKeys(objectExpression) {
  if (!objectExpression || objectExpression.type !== 'ObjectExpression') return [];
  return objectExpression.properties.map(getPropertyName).filter(Boolean);
}

function isFunctionNode(node) {
  return ['FunctionExpression', 'FunctionDeclaration', 'ArrowFunctionExpression', 'ObjectMethod'].includes(node?.type);
}

function collectReturnedObjectKeys(functionNode, functionMap = new Map(), visited = new Set()) {
  const keys = new Set();
  if (!functionNode || visited.has(functionNode)) return keys;
  visited.add(functionNode);

  function visit(node, isRoot = false) {
    if (!node || typeof node !== 'object') return;
    if (!isRoot && isFunctionNode(node)) return;
    if (node.type === 'ReturnStatement') {
      for (const key of getObjectKeys(node.argument)) keys.add(key);
      if (node.argument?.type === 'CallExpression' && node.argument.callee?.type === 'Identifier') {
        const calledFunction = functionMap.get(node.argument.callee.name);
        for (const key of collectReturnedObjectKeys(calledFunction, functionMap, visited)) keys.add(key);
      }
      return;
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach((item) => visit(item));
      else visit(value);
    }
  }

  visit(functionNode.body, true);
  return [...keys];
}

function getOptionFunction(property, functionMap = new Map()) {
  if (property?.type === 'ObjectMethod') return property;
  if (property?.type === 'ObjectProperty' && isFunctionNode(property.value)) return property.value;
  if (property?.type === 'ObjectProperty' && property.value?.type === 'Identifier') {
    return functionMap.get(property.value.name) || null;
  }
  return null;
}

function collectOptionsApiBindings(scriptSource) {
  const ast = babelParser.parse(scriptSource, { sourceType: 'module' });
  const functionMap = new Map();
  for (const statement of ast.program.body) {
    if (statement.type === 'FunctionDeclaration' && statement.id?.name) {
      functionMap.set(statement.id.name, statement);
    }
    if (statement.type === 'VariableDeclaration') {
      for (const declaration of statement.declarations) {
        if (declaration.id?.type === 'Identifier' && isFunctionNode(declaration.init)) {
          functionMap.set(declaration.id.name, declaration.init);
        }
      }
    }
  }
  const exportDefault = ast.program.body.find((node) => node.type === 'ExportDefaultDeclaration');
  const options = exportDefault?.declaration;
  if (!options || options.type !== 'ObjectExpression') return new Set();

  const bindings = new Set();
  const optionMap = new Map(
    options.properties
      .map((property) => [getPropertyName(property), property])
      .filter(([name]) => name),
  );

  const dataFunction = getOptionFunction(optionMap.get('data'), functionMap);
  if (dataFunction) collectReturnedObjectKeys(dataFunction, functionMap).forEach((name) => bindings.add(name));

  const setupFunction = getOptionFunction(optionMap.get('setup'), functionMap);
  if (setupFunction) collectReturnedObjectKeys(setupFunction, functionMap).forEach((name) => bindings.add(name));

  for (const optionName of ['computed', 'methods']) {
    const property = optionMap.get(optionName);
    if (property?.type === 'ObjectProperty') {
      getObjectKeys(property.value).forEach((name) => bindings.add(name));
    }
  }

  const props = optionMap.get('props');
  if (props?.type === 'ObjectProperty') {
    getObjectKeys(props.value).forEach((name) => bindings.add(name));
  }

  return bindings;
}

async function loadProjectPackages() {
  const entries = fs.existsSync(projectsRoot)
    ? fs.readdirSync(projectsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())
    : [];
  const projects = [];
  for (const entry of entries) {
    const packageRoot = path.join(projectsRoot, entry.name);
    const manifestPath = path.join(packageRoot, 'project.json');
    if (!fs.existsSync(manifestPath)) continue;
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest.id !== entry.name) continue;
    const definitionsPath = path.resolve(packageRoot, manifest.pageDefinitions || 'page-definitions.js');
    const definitionsUrl = pathToFileURL(definitionsPath);
    definitionsUrl.searchParams.set('viewAudit', `${Date.now()}-${entry.name}`);
    const module = await import(definitionsUrl.href);
    projects.push({
      packageRoot,
      manifest,
      definitions: module.clientPageDefinitions || module.default,
    });
  }
  return projects;
}

async function main() {
  const projects = await loadProjectPackages();
  const prototypeSourceFiles = new Map();
  const registeredViews = new Set(commonViewRoots.flatMap(listVueFiles));
  const businessViewRoots = new Set();
  const routePaths = new Set();
  const menuPaths = [];

  for (const project of projects) {
    const packageViewsRoot = path.join(project.packageRoot, 'views');
    if (fs.existsSync(packageViewsRoot)) businessViewRoots.add(packageViewsRoot);
    const compatibilityRoot = project.manifest.compatibility?.legacyViewRoot
      ? path.resolve(projectRoot, project.manifest.compatibility.legacyViewRoot)
      : null;
    for (const client of project.manifest.clients || []) {
      const definition = project.definitions?.[client.id];
      if (!definition) continue;
      if (compatibilityRoot) {
        const clientRoot = path.join(compatibilityRoot, client.id);
        if (fs.existsSync(clientRoot)) businessViewRoots.add(clientRoot);
      }
      for (const page of definition.pages || []) {
        const packageView = path.join(packageViewsRoot, page.view);
        const compatibilityView = compatibilityRoot ? path.join(compatibilityRoot, page.view) : null;
        const viewFile = fs.existsSync(packageView) ? packageView : compatibilityView;
        if (viewFile && fs.existsSync(viewFile)) {
          registeredViews.add(viewFile);
          if (page.prototype?.sourceFile) {
            prototypeSourceFiles.set(
              path.relative(projectRoot, viewFile).replaceAll('\\', '/'),
              page.prototype.sourceFile,
            );
          }
        }
        const fullPath = `/p/${project.manifest.id}/${client.id}/${page.path}`;
        routePaths.add(fullPath);
        if (page.section && page.menu !== false) menuPaths.push(fullPath);
      }
    }
  }

  const files = [...new Set([...commonViewRoots, ...businessViewRoots].flatMap(listVueFiles))];
  const problems = [];

  for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const relativeFile = path.relative(projectRoot, file).replaceAll('\\', '/');
  const parsed = parse(source, {
    filename: relativeFile,
    compilerOptions: { prefixIdentifiers: true },
  });
  const errors = parsed.errors.map((error) => String(error.message || error));
  let bindings = {};
  let templateCode = '';

  if (!errors.length && parsed.descriptor.scriptSetup) {
    try {
      bindings = compileScript(parsed.descriptor, { id: relativeFile }).bindings;
    } catch (error) {
      errors.push(`script 编译失败：${error.message}`);
    }
  }

  if (!errors.length && parsed.descriptor.template) {
    const result = compileTemplate({
      id: relativeFile,
      filename: relativeFile,
      source: parsed.descriptor.template.content,
      compilerOptions: {
        prefixIdentifiers: true,
        bindingMetadata: bindings,
      },
    });
    errors.push(...result.errors.map((error) => String(error.message || error)));
    templateCode = result.code;
  }

  const violations = rules
    .filter(([, expression]) => expression.test(source))
    .map(([label]) => label);

  const clientFolder = file.includes(`${path.sep}operation${path.sep}`)
    ? '营运端'
    : file.includes(`${path.sep}enterprise${path.sep}`)
      ? '企业端'
      : null;
  if (clientFolder) {
    const mappedPrototypeName = prototypeSourceFiles.get(relativeFile);
    const prototypeName = mappedPrototypeName || toPrototypeFileName(file);
    const prototypeFile = path.join(prototypeRoot, clientFolder, prototypeName);
    if (!fs.existsSync(prototypeFile)) {
      if (!mappedPrototypeName) {
        violations.push(`找不到对应 HTML 原型：${path.relative(projectRoot, prototypeFile).replaceAll('\\', '/')}`);
      }
    } else {
      const prototypeSource = fs.readFileSync(prototypeFile, 'utf8');
      for (const tagName of structuralTags) {
        const prototypeCount = countOpeningTags(prototypeSource, tagName);
        const vueCount = countOpeningTags(parsed.descriptor.template?.content || '', tagName);
        if (vueCount < prototypeCount) {
          violations.push(`${tagName} 数量少于原型：HTML ${prototypeCount}，Vue ${vueCount}`);
        }
      }
    }
  }
  const expectedDialogCount = expectedDialogCounts.get(path.basename(file));
  if (expectedDialogCount !== undefined) {
    const actualDialogCount = [...source.matchAll(/<el-dialog\b/gi)].length;
    if (actualDialogCount !== expectedDialogCount) {
      violations.push(`弹窗数量异常：应为 ${expectedDialogCount}，实际为 ${actualDialogCount}`);
    }
  }
  const expectedDrawerCount = expectedDrawerCounts.get(path.basename(file));
  if (expectedDrawerCount !== undefined) {
    const actualDrawerCount = [...source.matchAll(/<el-drawer\b/gi)].length;
    if (actualDrawerCount !== expectedDrawerCount) {
      violations.push(`抽屉数量异常：应为 ${expectedDrawerCount}，实际为 ${actualDrawerCount}`);
    }
  }

  if (parsed.descriptor.scriptSetup && templateCode) {
    const allowedGlobals = new Set(['$attrs', '$emit', '$router', '$route', '$slots']);
    const unresolvedBindings = [
      ...new Set(
        [...templateCode.matchAll(/_ctx\.([A-Za-z_$][\w$]*)/g)]
          .map((match) => match[1])
          .filter((name) => !allowedGlobals.has(name)),
      ),
    ];
    if (unresolvedBindings.length) {
      violations.push(`模板未定义绑定：${unresolvedBindings.join(', ')}`);
    }
  }

  if (parsed.descriptor.script && !parsed.descriptor.scriptSetup && templateCode) {
    try {
      const publicBindings = collectOptionsApiBindings(parsed.descriptor.script.content);
      const unresolvedBindings = [
        ...new Set(
          [...templateCode.matchAll(/_ctx\.([A-Za-z_$][\w$]*)/g)]
            .map((match) => match[1])
            .filter((name) => !name.startsWith('$') && !publicBindings.has(name)),
        ),
      ];
      if (unresolvedBindings.length) {
        violations.push(`Options API 未暴露模板绑定：${unresolvedBindings.join(', ')}`);
      }
    } catch (error) {
      errors.push(`Options API 静态分析失败：${error.message}`);
    }
  }

  if (errors.length || violations.length) {
    problems.push({ file: relativeFile, errors, violations });
  }
  }

  const routerSource = fs.readFileSync(path.join(projectRoot, 'src', 'router', 'index.js'), 'utf8');
  const routeProblems = [];
  const duplicateMenuPaths = [
    ...new Set(menuPaths.filter((pathValue, index) => menuPaths.indexOf(pathValue) !== index)),
  ];
  if (duplicateMenuPaths.length) routeProblems.push('重复菜单路径：' + duplicateMenuPaths.join(', '));
  if (!routerSource.includes('createInstalledProjectRoutes') || !routerSource.includes('createProjectPageRoutes')) {
    routeProblems.push('Router 未使用项目包页面定义生成动态路由');
  }
  if (/PlaceholderView/.test(routerSource)) routeProblems.push('Router 仍引用 PlaceholderView');

  const unregisteredViews = files
    .filter((file) => !registeredViews.has(file))
    .map((file) => path.relative(projectRoot, file).replaceAll('\\', '/'));
  if (unregisteredViews.length) routeProblems.push('页面未注册路由：' + unregisteredViews.join(', '));
  if (routeProblems.length) {
    problems.push({ file: 'projects/*/page-definitions.js', errors: [], violations: routeProblems });
  }

  if (problems.length) {
    console.error(`迁移审计失败：${problems.length}/${files.length} 个页面存在问题。`);
    for (const problem of problems) {
      console.error(`\n${problem.file}`);
      for (const error of problem.errors) console.error(`  - ${error}`);
      for (const violation of problem.violations) console.error(`  - ${violation}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`迁移审计通过：${files.length} 个项目业务页面未发现旧外壳或严格编译问题。`);
  }
}

main().catch((error) => {
  console.error(`迁移审计执行失败：${error.stack || error.message}`);
  process.exitCode = 1;
});
