import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import 'vue3-manner-report/lib/style.css';
import scui from './ml'
import i18n from './locales'
import router from './router'
import App from './App.vue'
import pinia from './store'
import ResizeObserver from 'resize-observer-polyfill'
import 'virtual:svg-icons-register'
import VueSmartWidget from 'ml-vue-smart-widget'
import '@/../lib/vue-smart-widiget.css'
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
import '@/../lib/visual-design/designer.style.css'
import * as MetaFlowDesigner from "@/../lib/flow-designer/meta-flow-designer.umd.cjs";
// console.log(MetaFlowDesigner,'MetaFlowDesigner')
import {loadExtensionWidgets} from "@/views/system/form-design/extension/extension-widgets-loader";
import {loadChartsExtension} from "@/views/system/dashboard-design/charts/charts-loader";
import VueResizeObserver from "vue-resize-observer";
import VueAMap, {initAMapApiLoader} from '@vuemap/vue-amap';
import '@vuemap/vue-amap/dist/style.css'
// park-icon 样式
import '@icon-park/vue-next/styles/index.css';
import eventBus from "@/utils/event-bus";
import dayjs from "dayjs";

import { registerCustomDetailCmp } from '@/views/custom-page/customDetailEntry.js';
import { registerCustomEditCmp } from '@/views/custom-page/customEditEntry.js';
import { registerCustomListSubFormCmp } from '@/views/custom-page/ListSubFormCmp/customListSubFormEntry.js';
import { registerCustomServiceTaskCmp } from "@/views/system/approval-process/components/ComplexFlow/customServiceTaskCmp";
// 注册详情自定义组件
import { registerDetailTabCustomComponent } from "@/views/custom-page/CustomDetailTabComponent/index.js";
// console.log("1. 使用路由...",router)
import { getSimplePinYin } from "@/utils/util";
//初始化高德地图组件
initAMapApiLoader({
	key: '487d8f7268cf06102ecd3e637b0f892d',
	securityJsCode: 'd9661ebb4e27ef5683446d960e820e9f' // 新版key需要配合安全密钥使用
})

const app = createApp(App);

app.config.globalProperties.$dayjs = dayjs;
app.config.globalProperties.$getPinYin = getSimplePinYin;
app.config.globalProperties.$eventBus = eventBus;

app.use(VueResizeObserver);
app.use(router);
app.use(pinia);
app.use(ElementPlus);
app.use(VueSmartWidget)
app.use(VisualDesign)
app.use(MetaFlowDesigner)
app.use(VueAMap)
loadExtensionWidgets(app)
loadChartsExtension(app)
registerCustomDetailCmp(app);
registerCustomEditCmp(app);
registerCustomListSubFormCmp(app);
registerCustomServiceTaskCmp(app);
registerDetailTabCustomComponent(app);
// app.use(Vue3MannerReport);
app.use(i18n);
app.use(scui);

//挂载app
app.mount('#app');
window.ResizeObserver = ResizeObserver
