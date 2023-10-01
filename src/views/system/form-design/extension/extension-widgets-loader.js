import zhLang from './lang/zh-CN'
import enLang from './lang/en-US'
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
import {registerFieldWidgets} from "@/views/system/form-design/extension/field-widgets";
import {referenceSchema} from "@/views/system/form-design/extension/extension-widgets-schema";
import newTestEditor from './property-editor/newTest-editor.vue'

const {addAdvancedFieldSchema, addCustomWidgetSchema, addZHExtensionLang,
	addENExtensionLang, PERegister} = VisualDesign.VFormSDK

export const loadExtensionWidgets = (app) => {
	//加载语言文件
	addZHExtensionLang(zhLang)
	addENExtensionLang(enLang)

	//注册扩展字段组件
	registerFieldWidgets(app)
	//注册容器组件

	//添加到设计器组件库
	addAdvancedFieldSchema(referenceSchema)

    PERegister.registerCPEditor(app, 'newTest', 'newTest-editor', newTestEditor)
}
