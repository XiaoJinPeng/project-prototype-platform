import { createApp } from 'vue';
import '@fontsource-variable/noto-sans-sc';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './styles/tokens.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import App from './App.vue';
import { i18n } from './i18n';
import { installLegacyLocalizer } from './i18n/legacy-localizer';
import router from './router';
import './styles/tailwind.css';
import './styles/base.css';

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus);
app.use(i18n);
app.use(router);
app.mount('#app');
installLegacyLocalizer();
