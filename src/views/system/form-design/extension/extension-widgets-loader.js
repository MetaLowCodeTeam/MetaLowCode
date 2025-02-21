import zhLang from './lang/zh-CN'
import enLang from './lang/en-US'
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
import {registerFieldWidgets} from "@/views/system/form-design/extension/field-widgets";
import {
    checkTagSchema,
    referenceSchema,
    referenceListSchema,
    locationSchema,
    // 列表子表单
    listSubFormSchema
} from "@/views/system/form-design/extension/extension-widgets-schema";
import newTestEditor from './property-editor/newTest-editor.vue'
import CheckTagOptionItemsEditor
	from "@/views/system/form-design/extension/property-editor/check-tag/check-tag-optionItems-editor.vue";
import checkTagOptionValueTypeEditor
	from "@/views/system/form-design/extension/property-editor/check-tag/check-tag-optionValueType-editor.vue";
import checkTagShowCheckboxEditor from "@/views/system/form-design/extension/property-editor/check-tag/check-tag-showCheckbox-editor.vue"

import onRecordSelectedEditor
	from "@/views/system/form-design/extension/property-editor/onRecordSelected-editor.vue";
import onAppendButtonClickEditor
	from "@/views/system/form-design/extension/property-editor/onAppendButtonClick-editor.vue";

import searchDialogWidthEditor from '@/views/system/form-design/extension/property-editor/reference-searchDialogWidth-editor.vue';
import referenceUseCurrentUserEditor from '@/views/system/form-design/extension/property-editor/reference-useCurrentUser-editor.vue';
import referenceFillBackConfigEditor from '@/views/system/form-design/extension/property-editor/reference-fillBackConfig-editor.vue';
import referenceFillBackEnabledEditor from '@/views/system/form-design/extension/property-editor/reference-fillBackEnabled-editor.vue';
import referenceFilterConditionsEditor from '@/views/system/form-design/extension/property-editor/reference-filterConditions-editor.vue';
import referenceTreeDataSelectEditor from '@/views/system/form-design/extension/property-editor/reference-treeDataSelect-editor.vue';
import referenceSearchInPlaceEditor from '@/views/system/form-design/extension/property-editor/reference-searchInPlace-editor.vue';
import referenceSortFieldEditor from '@/views/system/form-design/extension/property-editor/reference-sortField-editor.vue';
// 子表单内禁止多选
import referenceDisableMultipleSelectionInSubFormEditor from "@/views/system/form-design/extension/property-editor/reference-disableMultipleSelectionInSubForm-editor.vue";

import listSubFormNameEditor from "@/views/system/form-design/extension/property-editor/container-list-sub-form/list-sub-form-name-editor.vue"

/**
 * 容器组件
 */
// 引入待注册的容器预览组件
import { registerContainerWidgets } from '@/views/system/form-design/extension/container-widgets'
// 引入待注册的容器组件
import { registerContainerItems } from '@/views/system/form-design/extension/container-items'

// 容器组件-列表子表单
import listSubFormWidget from "@/views/system/form-design/extension/container-widgets/list-sub-form-widget.vue";
import listSubFormItem from "@/views/system/form-design/extension/container-items/list-sub-form-item.vue";
// 列表子表单-是否启用高级查询
import listSubFormShowAdvancedQueryEditor from "@/views/system/form-design/extension/property-editor/container-list-sub-form/showAdvancedQuery-editor.vue";
import listSubFormShowHeaderEditor from "@/views/system/form-design/extension/property-editor/container-list-sub-form/showListHeader-editor.vue";
import listSubFormShowQuickQueryEditor from "@/views/system/form-design/extension/property-editor/container-list-sub-form/showQuickQuery-editor.vue";
import listSubFormShowMoreBtnEditor from "@/views/system/form-design/extension/property-editor/container-list-sub-form/showMoreBtn-editor.vue";
import listSubFormShowAddBtnEditor from "@/views/system/form-design/extension/property-editor/container-list-sub-form/showAddBtn-editor.vue";
import listSubFormShowDelBtnEditor from "@/views/system/form-design/extension/property-editor/container-list-sub-form/showDelBtn-editor.vue";
import listSubFormShowBatchUpdateSetEditor from "@/views/system/form-design/extension/property-editor/container-list-sub-form/showBatchUpdateSet-editor.vue";
import listSubFormShowBatchUpdateBtnEditor from "@/views/system/form-design/extension/property-editor/container-list-sub-form/showBatchUpdateBtn-editor.vue";
import listSubFormShowOperateColumnEditor from "@/views/system/form-design/extension/property-editor/container-list-sub-form/showOperateColumn-editor.vue";
import listSubFormShowPaginationEditor from "@/views/system/form-design/extension/property-editor/container-list-sub-form/showPagination-editor.vue";
import listSubFormPaginationSizeEditor from "@/views/system/form-design/extension/property-editor/container-list-sub-form/paginationSize-editor.vue";
import listSubFormListHeightEditor from "@/views/system/form-design/extension/property-editor/container-list-sub-form/listSubFormHeight-editor.vue";

import inputQrCodeOnMobileEnabledEditor from "@/views/system/form-design/extension/property-editor/input/qrCodeOnMobileEnabled-editor.vue";

const {
    addContainerWidgetSchema,
    addBasicFieldSchema,
    addAdvancedFieldSchema,
    addCustomWidgetSchema,
    addZHExtensionLang,
	addENExtensionLang,
    PERegister,
	PEFactory
} = VisualDesign.VFormSDK

export const loadExtensionWidgets = (app) => {
	//加载语言文件
	addZHExtensionLang(zhLang)
	addENExtensionLang(enLang)

	//注册属性编辑器
    app.component('list-sub-form-name-editor', listSubFormNameEditor)
	app.component('check-tag-optionItems-editor', CheckTagOptionItemsEditor)
	app.component('check-tag-optionValueType-editor', checkTagOptionValueTypeEditor)

    PERegister.registerCPEditor(app, 'showCheckbox', 'check-tag-showCheckbox-editor', checkTagShowCheckboxEditor)

    /**
     * 容器组件-列表子表单-字段组件  beg
     */
    PERegister.registerCPEditor(app, 'listSubFormHeight', 'listSubForm-listSubFormHeight-editor', listSubFormListHeightEditor)
    PERegister.registerCPEditor(app, 'showListHeader', 'listSubForm-showListHeader-editor', listSubFormShowHeaderEditor)
    PERegister.registerCPEditor(app, 'showAdvancedQuery', 'listSubForm-showAdvancedQuery-editor', listSubFormShowAdvancedQueryEditor)
    PERegister.registerCPEditor(app, 'showQuickQuery', 'listSubForm-showQuickQuery-editor', listSubFormShowQuickQueryEditor)
    PERegister.registerCPEditor(app, 'showMoreBtn', 'listSubForm-showMoreBtn-editor', listSubFormShowMoreBtnEditor)
    PERegister.registerCPEditor(app, 'showAddBtn', 'listSubForm-showAddBtn-editor', listSubFormShowAddBtnEditor)
    PERegister.registerCPEditor(app, 'showDelBtn', 'listSubForm-showDelBtn-editor', listSubFormShowDelBtnEditor)
    PERegister.registerCPEditor(app, 'showBatchUpdateSet', 'listSubForm-showBatchUpdateSet-editor', listSubFormShowBatchUpdateSetEditor)
    PERegister.registerCPEditor(app, 'showBatchUpdateBtn', 'listSubForm-showBatchUpdateBtn-editor', listSubFormShowBatchUpdateBtnEditor)
    PERegister.registerCPEditor(app, 'showOperateColumn', 'listSubForm-showOperateColumn-editor', listSubFormShowOperateColumnEditor)
    PERegister.registerCPEditor(app, 'showPagination', 'listSubForm-showPagination-editor', listSubFormShowPaginationEditor)
    PERegister.registerCPEditor(app, 'paginationSize', 'listSubForm-paginationSize-editor', listSubFormPaginationSizeEditor)
    /**
     * 容器组件-列表子表单-字段组件  end
     */


	PERegister.registerCPEditor(app, 'searchDialogWidth', 'reference-searchDialogWidth-editor', searchDialogWidthEditor)
	PERegister.registerCPEditor(app, 'useCurrentUser', 'reference-useCurrentUser-editor', referenceUseCurrentUserEditor)
	PERegister.registerCPEditor(app, 'fillBackEnabled', 'reference-fillBackEnabled-editor', referenceFillBackEnabledEditor)
	PERegister.registerCPEditor(app, 'fillBackConfig', 'reference-fillBackConfig-editor', referenceFillBackConfigEditor)
	PERegister.registerCPEditor(app, 'filterConditions', 'reference-filterConditions-editor', referenceFilterConditionsEditor)
	PERegister.registerCPEditor(app, 'sortField', 'reference-sortField-editor', referenceSortFieldEditor)
	PERegister.registerCPEditor(app, 'useTreeDataSelect', 'reference-treeDataSelect-editor', referenceTreeDataSelectEditor)
	PERegister.registerEPEditor(app, 'onRecordSelected', 'onRecordSelected-editor', onRecordSelectedEditor)
	PERegister.registerEPEditor(app, 'onAppendButtonClick', 'onAppendButtonClick-editor', onAppendButtonClickEditor)
	PERegister.registerCPEditor(app, 'openSearchInPlace', 'reference-searchInPlace-editor', referenceSearchInPlaceEditor)
	PERegister.registerCPEditor(app, 'disableMultipleSelectionInSubForm', 'reference-disableMultipleSelectionInSubForm-editor', referenceDisableMultipleSelectionInSubFormEditor)
	PERegister.registerCPEditor(app, 'qrCodeOnMobileEnabled', 'input-qrCodeOnMobileEnabled-editor', inputQrCodeOnMobileEnabledEditor)
	PERegister.registerCPEditor(app, 'positionSelectable', 'location-positionSelectable-editor',
	PEFactory.createBooleanEditor('positionSelectable', 'extension.setting.positionSelectable'))

	// 注册容器组件属性编辑器
	PERegister.registerCPEditor(app, 'listSubFormWidget', 'listSubForm-widget', listSubFormWidget)
	PERegister.registerCPEditor(app, 'listSubFormItem', 'listSubForm-item', listSubFormItem)

	//注册扩展字段组件
	registerFieldWidgets(app)

	//注册容器组件（暂无）
    registerContainerWidgets(app)
    registerContainerItems(app)

	//添加到设计器组件库
	addBasicFieldSchema(checkTagSchema)
	addAdvancedFieldSchema(referenceSchema)
	addAdvancedFieldSchema(referenceListSchema)
	addAdvancedFieldSchema(locationSchema)
    // 添加到容器组件库
    addContainerWidgetSchema(listSubFormSchema)

}
