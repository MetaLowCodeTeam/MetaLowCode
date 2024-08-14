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
        // 是否显示头部
        showListHeader: true,
        // 是否显示高级查询
        showAdvancedQuery: true,
        // 是否显示快速查询
        showQuickQuery: true,
        // 是否显示更多按钮
        showMoreBtn: true,
        // 是否显示分页
        showPagination: true,
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
        // 启用树模式
        useTreeDataSelect: false, 
        // 树引用字段
        treeCascadeFieldName: "",
        // 树数据源(实体名称)
        treeDataEntityName: "",
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
