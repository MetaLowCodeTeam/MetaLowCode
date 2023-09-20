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
		readonly: false,
		disabled: false,
		hidden: false,
		clearable: true,
		required: false,
		requiredHint: '',
		validation: '',
		validationHint: '',
		//-------------------
		customClass: '',  //自定义css类名
		labelIconClass: null,
		labelIconPosition: 'rear',
		labelTooltip: null,
		prefixIcon: '',
		suffixIcon: '',
		buttonIcon: 'custom-search',
		//-------------------
		onCreated: '',
		onMounted: '',
		onChange: '',
		onValidate: '',
	}
}
