import zhLang from './lang/zh-CN'
import enLang from './lang/en-US'
import {
	ext_chart_containers as EC_CONS,
	ext_charts_widgets as EC_WS
} from "./charts-schema.js";

import dsEnabledEditor from "./property-editor/dsEnabled-editor.vue"; // 数据源

import onRowClickEditor from "./property-editor/onRowClick-editor.vue";

import DashboardContainerWidget from "./dashboard-container/dashboard-container-widget.vue";
import DashboardContainerItem from "./dashboard-container/dashboard-container-item.vue";
import SectionWidget from "./section/section-widget.vue";
import SectionItem from "./section/section-item.vue";
import {registerChartWidgets} from "./chart-widget/index.js";
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
import {registerChartLibProperties, registerPEWidgets} from "@/views/system/dashboard-design/charts/property-editor";

const {
	addChartContainerSchema, addChartSchema, addZHExtensionLang, addENExtensionLang,
	PERegister
} = VisualDesign.VFormSDK




export const loadChartsExtension = function (app) {
	//加载语言文件
	addZHExtensionLang(zhLang)
	addENExtensionLang(enLang)
	registerChartLibProperties(app, PERegister)

    PERegister.registerEPEditor(app, 'listTable-onRowClick', 'listTable-onRowClick-editor', onRowClickEditor)
    PERegister.registerCPEditor(app, 'dsEnabled', 'dsEnabled-editor', dsEnabledEditor)

	EC_CONS.forEach(con => {
		addChartContainerSchema(con)
	})
	app.component(DashboardContainerWidget.name, DashboardContainerWidget)
	app.component(DashboardContainerItem.name, DashboardContainerItem)
	app.component(SectionWidget.name, SectionWidget)  //注册设计期的容器组件
	app.component(SectionItem.name, SectionItem)  //注册运行期的容器组件

	EC_WS.forEach(wgt => {
		addChartSchema(wgt)
	})
	registerChartWidgets(app)

}
