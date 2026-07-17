import { watch } from 'vue';

import enUSCatalog from './catalog/en-US.json';
import zhCNCatalog from './catalog/zh-CN.json';
import zhTWCatalog from './catalog/zh-TW.json';
import { i18n } from './index';

const catalogs = {
  'zh-CN': zhCNCatalog,
  'zh-TW': zhTWCatalog,
  'en-US': enUSCatalog,
};
const translatedAttributes = ['placeholder', 'title', 'aria-label', 'alt'];
const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const ignoredParents = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE']);

function preserveWhitespace(source, replacement) {
  const leading = source.match(/^\s*/)?.[0] || '';
  const trailing = source.match(/\s*$/)?.[0] || '';
  return `${leading}${replacement}${trailing}`;
}

export function translateStaticCopy(value, locale = i18n.global.locale.value) {
  if (typeof value !== 'string') return value;
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return value;
  return catalogs[locale]?.[normalized] || value;
}

function localizeTextNode(node, locale) {
  if (ignoredParents.has(node.parentElement?.tagName)) return;
  if (!originalText.has(node)) originalText.set(node, node.nodeValue || '');
  const source = originalText.get(node);
  const translated = translateStaticCopy(source, locale);
  const nextValue = translated === source ? source : preserveWhitespace(source, translated);
  if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
}

function localizeElement(element, locale) {
  if (!originalAttributes.has(element)) originalAttributes.set(element, new Map());
  const attributes = originalAttributes.get(element);
  translatedAttributes.forEach((name) => {
    if (!element.hasAttribute(name) && !attributes.has(name)) return;
    if (!attributes.has(name)) attributes.set(name, element.getAttribute(name) || '');
    const source = attributes.get(name);
    const translated = translateStaticCopy(source, locale);
    if (element.getAttribute(name) !== translated) element.setAttribute(name, translated);
  });
}

function localizeTree(root, locale) {
  if (root.nodeType === Node.TEXT_NODE) {
    localizeTextNode(root, locale);
    return;
  }
  if (!(root instanceof Element) && !(root instanceof DocumentFragment) && root !== document) return;
  if (root instanceof Element) localizeElement(root, locale);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) localizeTextNode(node, locale);
    else localizeElement(node, locale);
    node = walker.nextNode();
  }
}

export function installLegacyLocalizer() {
  let scheduled = false;
  const localizeDocument = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      localizeTree(document.body, i18n.global.locale.value);
    });
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => localizeTree(node, i18n.global.locale.value));
      if (mutation.type === 'attributes') localizeElement(mutation.target, i18n.global.locale.value);
    });
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: translatedAttributes,
  });

  watch(() => i18n.global.locale.value, localizeDocument, { immediate: true });
  return () => observer.disconnect();
}
