const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const requiredFiles = [
  'src/styles/tokens.css',
  'src/components/ui/PageHeader.vue',
  'src/components/ui/ContentPanel.vue',
  'src/components/ui/DataTablePanel.vue',
  'src/components/ui/DetailList.vue',
  'src/components/ui/DialogFooter.vue',
  'src/components/ui/EmptyState.vue',
  'src/components/ui/EntityDetailHeader.vue',
  'src/components/ui/FileImportDialog.vue',
  'src/components/ui/FilterBar.vue',
  'src/components/ui/FilterIconButton.vue',
  'src/components/ui/FormDialog.vue',
  'src/components/ui/FormSection.vue',
  'src/components/ui/InfoBanner.vue',
  'src/components/ui/ListActionGroup.vue',
  'src/components/ui/PageLayout.vue',
  'src/components/ui/ReasonConfirmDialog.vue',
  'src/components/ui/StatCard.vue',
  'src/components/ui/StatusTag.vue',
  'src/components/ui/SummaryGrid.vue',
  'src/components/ui/TablePagination.vue',
  'src/components/ui/index.js',
  'src/composables/usePagination.js',
  'src/composables/useResettableFilters.js',
  'src/composables/useSelectableStats.js',
  'src/composables/useDialogState.js',
  'src/composables/useChartRegistry.js',
  'src/views/DesignSystemView.vue',
  'templates/page/PageView.vue.template',
];

const errors = [];

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    errors.push('缺少组件化底座文件：' + relativePath);
  }
}

const componentDir = path.join(root, 'src/components/ui');
if (fs.existsSync(componentDir)) {
  for (const name of fs.readdirSync(componentDir).filter((item) => item.endsWith('.vue'))) {
    const source = fs.readFileSync(path.join(componentDir, name), 'utf8');
    if (!/<style\s+scoped>/.test(source)) {
      errors.push('公共组件样式必须 scoped：src/components/ui/' + name);
    }
  }
}

const routerSource = fs.readFileSync(path.join(root, 'src/router/index.js'), 'utf8');
if (!routerSource.includes("path: '/components'")) {
  errors.push('组件规范页尚未接入 /components 路由');
}

const mainSource = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');
if (!mainSource.includes("./styles/tokens.css")) {
  errors.push('src/main.js 尚未引入设计变量');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('组件治理审计通过：20 个公共组件、5 个 Composables、设计变量、新页面模板及示例路由均已就绪。');
