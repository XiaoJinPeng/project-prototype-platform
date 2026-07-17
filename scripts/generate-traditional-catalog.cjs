const fs = require('fs');
const path = require('path');
const OpenCC = require('opencc-js');

const catalogRoot = path.resolve(__dirname, '..', 'src', 'i18n', 'catalog');
const source = JSON.parse(fs.readFileSync(path.join(catalogRoot, 'zh-CN.json'), 'utf8'));
const convert = OpenCC.Converter({ from: 'cn', to: 'tw' });
const traditional = Object.fromEntries(
  Object.keys(source).map((phrase) => [phrase, convert(phrase)]),
);

fs.writeFileSync(
  path.join(catalogRoot, 'zh-TW.json'),
  `${JSON.stringify(traditional, null, 2)}\n`,
  'utf8',
);
console.log(`已离线生成 ${Object.keys(traditional).length} 条繁体界面文案。`);
