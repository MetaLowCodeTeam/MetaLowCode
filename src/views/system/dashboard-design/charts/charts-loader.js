import zhLang from './lang/zh-CN'
import enLang from './lang/en-US'
import {
	ext_chart_containers as EC_CONS,
	ext_charts_widgets as EC_WS
} from "./charts-schema.js";
import SectionWidget from "./section/section-widget.vue";
import SectionItem from "./section/section-item.vue";
import {registerChartWidgets} from "./chart-widget/index.js";
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

const {
	addChartContainerSchema, addChartSchema, addZHExtensionLang, addENExtensionLang
} = VisualDesign.VFormSDK

export const loadChartsExtension = function (app) {
	//加载语言文件
	addZHExtensionLang(zhLang)
	addENExtensionLang(enLang)


	EC_CONS.forEach(con => {
		addChartContainerSchema(con)
	})
	app.component(SectionWidget.name, SectionWidget)  //注册设计期的容器组件
	app.component(SectionItem.name, SectionItem)  //注册运行期的容器组件

	EC_WS.forEach(wgt => {
		addChartSchema(wgt)
	})
	registerChartWidgets(app)

}
