import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
// import Vue3StarrySky from 'vue3-starry-sky-xq';
// import 'vue3-starry-sky-xq/lib/style.css';
import Vue3MannerReport from 'vue3-manner-report';
import 'vue3-manner-report/lib/style.css';
import scui from './ml'
import i18n from './locales'
import router from './router'
import App from './App.vue'
import pinia from './store'
const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(ElementPlus);
app.use(Vue3MannerReport);
app.use(i18n);
app.use(scui);

//挂载app
app.mount('#app');
