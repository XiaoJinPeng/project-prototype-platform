import { createI18n } from 'vue-i18n';

import enUS from './locales/en-US';
import zhCN from './locales/zh-CN';
import zhTW from './locales/zh-TW';

export const DEFAULT_LOCALE = 'zh-CN';
export const LOCALE_STORAGE_KEY = 'prototype-locale';
export const localeOptions = [
  { label: '简中', value: 'zh-CN' },
  { label: '繁中', value: 'zh-TW' },
  { label: 'English', value: 'en-US' },
];

function readStoredLocale() {
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeLocale(locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Local storage is optional; the selected locale remains active for the current page.
  }
}

const savedLocale = readStoredLocale();
const initialLocale = localeOptions.some((option) => option.value === savedLocale)
  ? savedLocale
  : DEFAULT_LOCALE;

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale,
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'en-US': enUS,
  },
});

export function setLocale(locale) {
  const nextLocale = localeOptions.some((option) => option.value === locale) ? locale : DEFAULT_LOCALE;
  i18n.global.locale.value = nextLocale;
  storeLocale(nextLocale);
  if (typeof document !== 'undefined') document.documentElement.lang = nextLocale;
}

setLocale(initialLocale);
