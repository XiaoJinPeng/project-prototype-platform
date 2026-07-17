const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'src', 'i18n', 'catalog');
const locales = ['zh-CN', 'zh-TW', 'en-US'];
const catalogs = Object.fromEntries(locales.map((locale) => [
  locale,
  JSON.parse(fs.readFileSync(path.join(root, `${locale}.json`), 'utf8')),
]));
const sourceKeys = Object.keys(catalogs['zh-CN']);
const sourceSet = new Set(sourceKeys);
const chinesePattern = /[\u3400-\u9fff]/;
let failed = false;

for (const locale of locales.slice(1)) {
  const keys = Object.keys(catalogs[locale]);
  const missing = sourceKeys.filter((key) => !(key in catalogs[locale]));
  const extra = keys.filter((key) => !sourceSet.has(key));
  const untranslated = sourceKeys.filter((key) => (
    chinesePattern.test(key) && catalogs[locale][key] === key
  ));
  const stillChinese = locale === 'en-US'
    ? sourceKeys.filter((key) => chinesePattern.test(catalogs[locale][key] || ''))
    : [];

  if (missing.length || extra.length) failed = true;
  console.log(`${locale}: ${keys.length} 条，缺少 ${missing.length}，多余 ${extra.length}，未转换 ${untranslated.length}`);
  if (stillChinese.length) console.warn(`  英文词库仍有 ${stillChinese.length} 条中文文案。`);
}

if (failed) {
  console.error('多语言词库键集合不一致，请先执行 npm run i18n:sync。');
  process.exitCode = 1;
} else {
  console.log(`词库结构检查通过：${sourceKeys.length} 个静态界面文案键。`);
}
