import { reactive } from 'vue';

export const platformSettings = reactive({
  developerMode: false,
  loaded: false,
});

let loadingPromise;

function applySettings(value) {
  platformSettings.developerMode = Boolean(value?.developerMode);
  platformSettings.loaded = true;
  return platformSettings;
}

export function loadPlatformSettings() {
  if (platformSettings.loaded) return Promise.resolve(platformSettings);
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const endpoints = ['/__platform/settings', '/platform-settings.json'];
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { cache: 'no-store' });
        if (!response.ok) continue;
        return applySettings(await response.json());
      } catch {
        // 继续尝试静态配置文件；离线导出页面则使用默认关闭状态。
      }
    }
    return applySettings({});
  })().finally(() => {
    loadingPromise = undefined;
  });

  return loadingPromise;
}

export async function setPlatformDeveloperMode(enabled) {
  const response = await fetch('/__platform/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ developerMode: Boolean(enabled) }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || '共享开发模式保存失败。');
  return applySettings(payload.settings);
}

if (import.meta.hot) {
  import.meta.hot.on('platform-settings:changed', (payload) => {
    applySettings(payload);
  });
}
