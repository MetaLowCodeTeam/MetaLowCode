/**
 * 容器组件
 */
export const listSubFormSchema = {
    type: "list-sub-form",
    icon: 'list-sub-form',
    category: 'container',
    commonFlag: true,
    widgetList: [],
    options: {
        name: "",
        label: 'list-sub-form',
        // 是否从实体
        detailEntityFlag: true,
        refEntityBindingField: '',
        // 是否显示新增
        showAddBtn: true,
        // 是否显示删除
        showDelBtn: true,
        // 是否显示头部
        showListHeader: true,
        // 是否显示高级查询
        showAdvancedQuery: true,
        // 是否显示快速查询
        showQuickQuery: true,
        // 是否显示更多按钮
        showMoreBtn: true,
        // 是否显示操作列
        showOperateColumn: true,
        // 是否显示分页
        showPagination: true,
        // 是否显示批量编辑设置
        showBatchUpdateSet: true,
        // 是否显示批量编辑按钮
        showBatchUpdateBtn: true,
        // 分页每页显示多少条
        paginationSize: 20,
        // 列表高度 - 默认294 空状态的高度
        listSubFormHeight: 294,
    },
};

/**
 * 字段组件
 */
export const checkTagSchema = {
	type: 'check-tag',
	icon: 'check-tag-field',
	formItemFlag: true,
	options: {
		name: '',
		keyNameEnabled: false,
		keyName: '',  //数据键值名称
		label: '',
		labelAlign: '',
		defaultValue: null,
		columnWidth: '200px',
		size: '',
		labelWidth: null,
		labelHidden: false,
		labelWrap: false,  //标签超长换行
		disabled: false,
		hidden: false,
		dsEnabled: false, // 是否使用数据源数据
		dsName: '', // 数据源名称
		dataSetName: '',  //数据集名称
		labelKey: 'label',
		valueKey: 'value',
		optionValueType: '',
        showCheckbox: false, // 是否显示为勾选框
        showBorder: false, // 是否显示边框
        showButton: false, // 是否显示为按钮
        showSelect: false, // 是否显示为选择框
		optionItems: [
			{label: 'check 1', value: 1},
			{label: 'check 2', value: 2},
			{label: 'check 3', value: 3},
		],
		required: false,
		requiredHint: '',
		validation: '',
		validationHint: '',
		//-------------------
		customClass: '',  //自定义css类名
		labelIconClass: null,
		labelIconPosition: 'rear',
		labelTooltip: null,
		//-------------------
		onCreated: '',
		onMounted: '',
		onChange: '',
		onValidate: '',
	},
}

export const referenceSchema = {
	type: 'reference',  //引用字段组件
	alias: '',  //组件别名，可以自定义
	icon: 'reference-field',
	formItemFlag: true,
	options: {
		name: '',
		keyNameEnabled: false,
		keyName: '',  //数据键值名称
		label: '',
		labelAlign: '',
		placeholder: '',
		columnWidth: '200px',
		size: '',
		labelWidth: null,
		labelHidden: false,
		labelWrap: false,  //标签超长换行
		disabled: false,
		hidden: false,
		required: false,
		requiredHint: '',
		validation: '',
		validationHint: '',
		searchDialogWidth: '520px',  //搜索弹窗宽度
		useCurrentUser: false,  //默认值使用当前登录用户
		useCurrentDepartment: false,  //默认值使用当前登录用户所属部门
        fillBackEnabled: false,
        // 表单回填
        fillBackConfig: [],
        // 子表单回填
        subFormFillBackConfig: [],
        // 过滤条件
        filterConditions: {},
        // 排序字段
        sortField: "",
        // 排序字段标签
        sortFieldLabel: "",
        // 排序顺序
        sortOrder: "",
        // 启用树模式
        useTreeDataSelect: false,
        // 树引用字段
        treeCascadeFieldName: "",
        // 树数据源(实体名称)
        treeDataEntityName: "",
        // 开启在位输入搜索
        openSearchInPlace: false,
        // 是否二次确认选择
        confirmSelect: false,
        // 确认提示内容
        confirmSelectContent: "",
        // 搜索字段
        searchFields: [],
        // 子表单内禁止多选
        disableMultipleSelectionInSubForm: false,
		//-------------------
		customClass: '',  //自定义css类名
		labelIconClass: null,
		labelIconPosition: 'rear',
		labelTooltip: null,
		prefixIcon: '',
		suffixIcon: '',
		buttonIcon: 'Search',

		//-------------------
		onCreated: '',
		onMounted: '',
		onChange: '',
		onValidate: '',
		onAppendButtonClick: '',  //后置按钮点击事件
		onBeforeDialogOpen: '',  //引用弹窗打开前置事件
		onRecordSelected: '',  //记录选择回填事件
	}
}


export const referenceListSchema = {
	type: 'reference-list',  //引用字段组件
	alias: '',  //组件别名，可以自定义
	icon: 'reference-field',
	formItemFlag: true,
	options: {
		name: '',
		keyNameEnabled: false,
		keyName: '',  //数据键值名称
		label: '',
		labelAlign: '',
		placeholder: '',
		columnWidth: '200px',
		size: '',
		labelWidth: null,
		labelHidden: false,
		labelWrap: false,  //标签超长换行
		disabled: false,
		hidden: false,
		required: false,
		requiredHint: '',
		validation: '',
		validationHint: '',
		searchDialogWidth: '520px',  //搜索弹窗宽度
        // 启用树模式
        useTreeDataSelect: false,
        // 树引用字段
        treeCascadeFieldName: "",
        // 树数据源(实体名称)
        treeDataEntityName: "",
        // 过滤条件
        filterConditions: {},
		//-------------------
		customClass: '',  //自定义css类名
		labelIconClass: null,
		labelIconPosition: 'rear',
		labelTooltip: null,
		prefixIcon: '',
		suffixIcon: '',
		buttonIcon: 'Search',

		//-------------------
		onCreated: '',
		onMounted: '',
		onChange: '',
		onValidate: '',
		onAppendButtonClick: '',  //后置按钮点击事件
		onBeforeDialogOpen: '',  //引用弹窗打开前置事件
		onRecordSelected: '',  //记录选择回填事件
	}
}

export const locationSchema = {
	type: 'location',  //引用字段组件
	alias: '',  //组件别名，可以自定义
	icon: 'location-field',
	formItemFlag: true,
	options: {
		name: '',
		keyNameEnabled: false,
		keyName: '',  //数据键值名称
		label: '',
		labelAlign: '',
		placeholder: '',
		columnWidth: '200px',
		size: '',
		labelWidth: null,
		labelHidden: false,
		labelWrap: false,  //标签超长换行
		disabled: false,
		hidden: false,
		required: false,
		requiredHint: '',
		validation: '',
		validationHint: '',
		searchDialogWidth: '50%',  //定位地图弹窗宽度
		positionSelectable: false,  //是否允许用户手动选择位置
		//-------------------
		customClass: '',  //自定义css类名
		labelIconClass: null,
		labelIconPosition: 'rear',
		labelTooltip: null,
		prefixIcon: '',
		suffixIcon: '',
		buttonIcon: 'AddLocation',

		//-------------------
		onCreated: '',
		onMounted: '',
		onChange: '',
		onValidate: '',
	}
}

// 签名组件
export const signWidgetSchema = {
	type: 'sign',
	icon: 'sign-widget',
	formItemFlag: true,
	options: {
		name: '',
		keyNameEnabled: false,
		keyName: '',  //数据键值名称
		label: '签名',
		labelAlign: '',
		columnWidth: '200px',
		labelWidth: null,
		labelHidden: false,
		labelWrap: false,  //标签超长换行
		disabled: false,
		hidden: false,
		required: false,
		requiredHint: '',
		validation: '',
		validationHint: '',
		// 签名配置
		signConfig: {
			// 签名宽度
			signWidth: '100%',
			// 签名高度
			signHeight: '60px',
		},
		//-------------------
		customClass: '',  //自定义css类名
		labelIconClass: null,
		labelIconPosition: 'rear',
		labelTooltip: null,
		//-------------------
		onCreated: '',
		onMounted: '',
		onChange: '',
		onValidate: '',
	},
}
