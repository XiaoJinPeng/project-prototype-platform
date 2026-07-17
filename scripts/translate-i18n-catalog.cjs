const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const catalogRoot = path.join(projectRoot, 'src', 'i18n', 'catalog');
const source = JSON.parse(fs.readFileSync(path.join(catalogRoot, 'zh-CN.json'), 'utf8'));
const phrases = Object.keys(source);
const targets = [{ locale: 'en-US', language: 'en' }];
const maxBatchCharacters = 2800;
const requestDelayMs = 180;

const exactEnglishOverrides = {
  门市租赁: 'Counter Rental',
  分时租赁: 'Time-share Rental',
  公务车: 'Official Vehicle',
  公务用车: 'Official Vehicle Use',
  同站租还: 'Same-station Return',
  甲租乙还: 'One-way Rental',
  据点: 'Location',
  租车券: 'Rental Ticket',
  行销方案: 'Marketing Plan',
  车辆排程: 'Vehicle Scheduling',
  企业月结: 'Enterprise Monthly Billing',
};

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function createBatches(items) {
  const batches = [];
  let current = [];
  let currentLength = 0;
  items.forEach((phrase, index) => {
    const lineLength = phrase.length + 32;
    if (current.length && currentLength + lineLength > maxBatchCharacters) {
      batches.push(current);
      current = [];
      currentLength = 0;
    }
    current.push({ index, phrase });
    currentLength += lineLength;
  });
  if (current.length) batches.push(current);
  return batches;
}

async function requestTranslation(batch, language, attempt = 1) {
  const query = batch.map((item) => `__TRANSLATION_ITEM_${item.index}__ ${item.phrase}`).join('\n');
  const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=${language}&dt=t&q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const translatedText = payload[0].map((segment) => segment[0]).join('');
    const translations = new Map();
    const expression = /__TRANSLATION_ITEM_(\d+)__\s*([\s\S]*?)(?=\n__TRANSLATION_ITEM_\d+__|$)/g;
    for (const match of translatedText.matchAll(expression)) {
      translations.set(Number(match[1]), match[2].trim());
    }
    if (translations.size !== batch.length) {
      throw new Error(`批量结果不完整：${translations.size}/${batch.length}`);
    }
    return translations;
  } catch (error) {
    if (attempt >= 3) throw error;
    await sleep(1000 * attempt);
    return requestTranslation(batch, language, attempt + 1);
  }
}

async function translateTarget(target) {
  const outputFile = path.join(catalogRoot, `${target.locale}.json`);
  const existing = fs.existsSync(outputFile) ? JSON.parse(fs.readFileSync(outputFile, 'utf8')) : {};
  const result = { ...existing };
  const pending = phrases.filter((phrase) => !result[phrase] || result[phrase] === phrase);
  const batches = createBatches(pending);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
    const batch = batches[batchIndex].map((item) => ({
      index: phrases.indexOf(item.phrase),
      phrase: item.phrase,
    }));
    const translations = await requestTranslation(batch, target.language);
    batch.forEach((item) => {
      result[item.phrase] = translations.get(item.index) || item.phrase;
    });
    fs.writeFileSync(outputFile, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    process.stdout.write(`\r${target.locale}: ${batchIndex + 1}/${batches.length}`);
    await sleep(requestDelayMs);
  }

  if (target.locale === 'en-US') Object.assign(result, exactEnglishOverrides);
  const ordered = Object.fromEntries(phrases.map((phrase) => [phrase, result[phrase] || phrase]));
  fs.writeFileSync(outputFile, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8');
  process.stdout.write(`\n${target.locale}: 完成 ${phrases.length} 条\n`);
}

(async () => {
  if (process.env.ALLOW_PUBLIC_TRANSLATION !== 'yes') {
    throw new Error(
      '未授权向公共翻译服务发送静态界面文案，请先取得明确授权并设置 ALLOW_PUBLIC_TRANSLATION=yes',
    );
  }
  for (const target of targets) await translateTarget(target);
})().catch((error) => {
  console.error(`翻译失败：${error.message}`);
  process.exitCode = 1;
});
