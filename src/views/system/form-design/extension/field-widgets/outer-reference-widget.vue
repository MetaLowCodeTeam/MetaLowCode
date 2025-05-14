<template>
	<div>
		<form-item-wrapper
			:designer="designer"
			:field="field"
			:rules="rules"
			:design-state="designState"
			:parent-widget="parentWidget"
			:parent-list="parentList"
			:index-of-parent-list="indexOfParentList"
			:sub-form-row-index="subFormRowIndex"
			:sub-form-col-index="subFormColIndex"
			:sub-form-row-id="subFormRowId"
		>
			<el-input
				ref="fieldEditor"
				v-model="displayValue"
				v-show="!isReadMode && !field.options.openSearchInPlace"
				:disabled="field.options.disabled"
				readonly
				:size="field.options.size"
				class="hide-spin-button"
				:type="'text'"
				:placeholder="field.options.placeholder"
				:prefix-icon="field.options.prefixIcon"
				:suffix-icon="field.options.suffixIcon"
			>
				<template #suffix>
					<el-icon
						title="清除"
						v-if="!!displayValue && !isReadMode && !field.options.disabled"
						class="el-input__icon"
						@click="handleClearEvent"
					>
						<Close />
					</el-icon>
				</template>
				<template #append>
					<el-button
						:disabled="field.options.disabled"
						@click="onAppendButtonClick"
					>
						<el-icon>
							<component :is="field.options.buttonIcon" />
						</el-icon>
					</el-button>
				</template>
			</el-input>
            <template v-if="isReadMode">
				<span class="readonly-mode-field">
                    {{ contentForReadMode }}
				</span>
			</template>
		</form-item-wrapper>
		
	</div>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";

const { FormItemWrapper, emitter, i18n, fieldMixin } = VisualDesign.VFormSDK;

export default {
	name: "outer-reference-widget",
	componentName: "FieldWidget", //必须固定为FieldWidget，用于接收父级组件的broadcast事件
	mixins: [emitter, fieldMixin, i18n],
	props: {
		field: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,
		designer: Object,

		designState: {
			type: Boolean,
			default: false,
		},

		subFormRowIndex: {
			/* 子表单组件行索引，从0开始计数 */ type: Number,
			default: -1,
		},
		subFormColIndex: {
			/* 子表单组件列索引，从0开始计数 */ type: Number,
			default: -1,
		},
		subFormRowId: {
			/* 子表单组件行Id，唯一id且不可变 */ type: String,
			default: "",
		},
	},
    inject: ['getFormConfig'],
	components: {
		FormItemWrapper,
	},
	data() {
		return {
			oldFieldValue: null, //field组件change之前的值
			fieldModel: null,
			displayValue: "",
			rules: [],
            // 引用组件弹框类型，table与tree
            referenceDialogType: 'table',
			showReferenceDialogFlag: false,
            treeDialogConf: {},
			entity: null,
			curRefField: null,
			searchFilter: "",
            extraSort: "",
            filterConditions:{},
			gDsv: {},
            globalConfig: {},
		};
	},
	computed: {
		inputType() {
			if (this.field.options.type === "number") {
				return "text"; //当input的type设置为number时，如果输入非数字字符，则v-model拿到的值为空字符串，无法实现输入校验！故屏蔽之！！
			}

			return this.field.options.type;
		},

		contentForReadMode() {
			return this.fieldModel ? this.fieldModel.name : "--";
		},

		dialogWidth() {
			return this.field.options.searchDialogWidth || "520px";
		},
	},
	watch: {
		fieldModel: {
			deep: true,
			immediate: true,
			handler(val) {
				this.displayValue = !!val ? val.name : "";
			},
		},
	},
	beforeCreate() {
		/* 这里不能访问方法和属性！！ */
	},

	created() {
		this.gDsv = this.getGlobalDsv();
		this.entity =
			this.gDsv["formEntity"] ||
			this.$route.query.entity ||
			this.$route.meta.entityName;
		if (!!this.subFormItemFlag) {
			//设置为明细实体名称！！
			this.entity = this.subFormName;
		}

		/* 注意：子组件mounted在父组件created之后、父组件mounted之前触发，故子组件mounted需要用到的prop
		   需要在父组件created中初始化！！ */
		this.registerToRefList();
		this.initFieldModel();
		this.initEventHandler();
		this.buildFieldRules();

		this.handleOnCreated();
	},

	mounted() {
		this.handleOnMounted();
        this.globalConfig = this.getFormConfig();
	},

	beforeUnmount() {
		this.unregisterFromRefList();
	},

	methods: {
       
		onAppendButtonClick() {
            if (this.designState) {
                return
            }

			if (this.field.options.onAppendButtonClick) {  //自定义引用弹窗实现
				let customFn = new Function(
					this.field.options.onAppendButtonClick
				);
				customFn.call(this);
				return
			}

			if (this.field.options.onBeforeDialogOpen) {  //引用弹窗打开前置事件
				let customFn = new Function(
					this.field.options.onBeforeDialogOpen
				);
				if (customFn.call(this) === false) {
					return;
				}
			}

		},
		handleClearEvent() {
			this.fieldModel = null;
			this.onFieldChangeEvent(this.fieldModel);
		},
		setFilter(newFilter) {
			this.searchFilter = newFilter;
		},

		getFilter() {
			return this.searchFilter;
		},
        setSort(newSort) {
            this.extraSort = newSort;
        },

        getSort() {
            return this.extraSort;
        },

        
	},
};
</script>

<style lang="scss" scoped></style>

<style lang="scss">
.small-padding-dialog .el-dialog__body {
	padding: 10px !important;
}

.readonly-mode-field {
	cursor: pointer;

	.small-circle-button {
		height: 16px !important;
		width: 16px !important;
	}
}
</style>
