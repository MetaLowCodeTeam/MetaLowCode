import zhLang from './lang/zh-CN'
import enLang from './lang/en-US'
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
import {registerFieldWidgets} from "@/views/system/form-design/extension/field-widgets";
import {checkTagSchema, referenceSchema, locationSchema}
	from "@/views/system/form-design/extension/extension-widgets-schema";
import newTestEditor from './property-editor/newTest-editor.vue'
import CheckTagOptionItemsEditor
	from "@/views/system/form-design/extension/property-editor/check-tag-optionItems-editor.vue";
import checkTagOptionValueTypeEditor
	from "@/views/system/form-design/extension/property-editor/check-tag-optionValueType-editor.vue";
import onRecordSelectedEditor
	from "@/views/system/form-design/extension/property-editor/onRecordSelected-editor.vue";

import searchDialogWidthEditor from '@/views/system/form-design/extension/property-editor/reference-searchDialogWidth-editor.vue';
import referenceFillBackConfigEditor from '@/views/system/form-design/extension/property-editor/reference-fillBackConfig-editor.vue';
import referenceFillBackEnabledEditor from '@/views/system/form-design/extension/property-editor/reference-fillBackEnabled-editor.vue';

const {addBasicFieldSchema, addAdvancedFieldSchema, addCustomWidgetSchema, addZHExtensionLang,
	addENExtensionLang, PERegister} = VisualDesign.VFormSDK

export const loadExtensionWidgets = (app) => {
	//加载语言文件
	addZHExtensionLang(zhLang)
	addENExtensionLang(enLang)

	//注册属性编辑器
	app.component('check-tag-optionItems-editor', CheckTagOptionItemsEditor)
	app.component('check-tag-optionValueType-editor', checkTagOptionValueTypeEditor)

	PERegister.registerCPEditor(app, 'searchDialogWidth', 'reference-searchDialogWidth-editor', searchDialogWidthEditor)
	PERegister.registerCPEditor(app, 'fillBackEnabled', 'reference-fillBackEnabled-editor', referenceFillBackEnabledEditor)
	PERegister.registerCPEditor(app, 'fillBackConfig', 'reference-fillBackConfig-editor', referenceFillBackConfigEditor)
	PERegister.registerEPEditor(app, 'onRecordSelected', 'onRecordSelected-editor', onRecordSelectedEditor)

	//注册扩展字段组件
	registerFieldWidgets(app)

	//注册容器组件（暂无）

	//添加到设计器组件库
	addBasicFieldSchema(checkTagSchema)
	addAdvancedFieldSchema(referenceSchema)
	addAdvancedFieldSchema(locationSchema)

    //PERegister.registerCPEditor(app, 'newTest', 'newTest-editor', newTestEditor)
}
