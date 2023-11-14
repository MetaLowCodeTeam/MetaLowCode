import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
// import Vue3StarrySky from 'vue3-starry-sky-xq';
// import 'vue3-starry-sky-xq/lib/style.css';
// import Vue3MannerReport from 'vue3-manner-report';
import 'vue3-manner-report/lib/style.css';
import scui from './ml'
import i18n from './locales'
import router from './router'
import App from './App.vue'
import pinia from './store'
import ResizeObserver from 'resize-observer-polyfill'
import 'virtual:svg-icons-register'
import VueSmartWidget from 'vue-smart-widget'
import '@/../lib/vue-smart-widiget.css'
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
import '@/../lib/visual-design/designer.style.css'
import {loadExtensionWidgets} from "@/views/system/form-design/extension/extension-widgets-loader";
import {loadChartsExtension} from "@/views/system/dashboard-design/charts/charts-loader";
import VueResizeObserver from "vue-resize-observer";
const app = createApp(App);
app.use(VueResizeObserver);
app.use(router);
app.use(pinia);
app.use(ElementPlus);
app.use(VueSmartWidget)
app.use(VisualDesign)
loadExtensionWidgets(app)
loadChartsExtension(app)
// app.use(Vue3MannerReport);
app.use(i18n);
app.use(scui);

//挂载app
app.mount('#app');
window.ResizeObserver = ResizeObserver
