import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { prdContentPlugin } from './plugins/prd-content-plugin.js';
import { pageTransferPlugin } from './plugins/page-transfer-plugin.js';
import { projectPackagesPlugin } from './plugins/project-packages-plugin.js';

const projectsRoot = fileURLToPath(new URL('./projects/', import.meta.url));

export default defineConfig({
  plugins: [
    vue(),
    projectPackagesPlugin({ projectsRoot }),
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
