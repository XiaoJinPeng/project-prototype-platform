import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { prdContentPlugin } from './plugins/prd-content-plugin.js';
import { pageTransferPlugin } from './plugins/page-transfer-plugin.js';
import { htmlPrototypePlugin } from './plugins/html-prototype-plugin.js';
import { projectPackagesPlugin } from './plugins/project-packages-plugin.js';
import { platformSettingsPlugin } from './plugins/platform-settings-plugin.js';

const projectsRoot = fileURLToPath(new URL('./projects/', import.meta.url));
const platformSettingsPath = fileURLToPath(new URL('./platform-settings.json', import.meta.url));
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [
    vue(),
    platformSettingsPlugin({ settingsPath: platformSettingsPath }),
    projectPackagesPlugin({ projectsRoot }),
    htmlPrototypePlugin({ projectsRoot }),
    prdContentPlugin({ projectsRoot }),
    pageTransferPlugin(),
  ],
  server: {
    host: '127.0.0.1',
    port: 5188,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/', import.meta.url)),
    },
  },
});
