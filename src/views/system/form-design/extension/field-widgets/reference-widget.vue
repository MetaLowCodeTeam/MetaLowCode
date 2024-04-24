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
				v-show="!isReadMode"
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
						v-if="!!displayValue && !isReadMode"
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
				<span class="readonly-mode-field" @click.stop="openRefDialog"
					>{{ contentForReadMode }}
					<el-button
						v-if="fieldModel && fieldModel.id"
						type="primary"
						circle
						size="small"
						class="small-circle-button"
						title="打开详情弹窗"
					>
						<el-icon>
							<TopRight />
						</el-icon>
					</el-button>
				</span>
			</template>
		</form-item-wrapper>
		<el-dialog
			title="请选择"
			v-if="showReferenceDialogFlag"
			v-model="showReferenceDialogFlag"
			:show-close="true"
			class="small-padding-dialog"
			:width="dialogWidth"
			draggable
			:close-on-click-modal="false"
			:close-on-press-escape="false"
			:append-to-body="true"
		>
			<ReferenceSearchTable
				ref="referST"
				:entity="entity"
				:refField="curRefField"
				:extraFilter="searchFilter"
				@recordSelected="setReferRecord"
				:gDsv="gDsv"
			></ReferenceSearchTable>
		</el-dialog>
	</div>
	<Detail ref="detailRef" />
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
import ReferenceSearchTable from "@/components/mlReferenceSearch/reference-search-table.vue";
import Detail from "@/views/customize-menu/detail.vue";

const { FormItemWrapper, emitter, i18n, fieldMixin } = VisualDesign.VFormSDK;

export default {
	name: "reference-widget",
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
	components: {
		FormItemWrapper,
		ReferenceSearchTable,
		Detail,
	},
	data() {
		return {
			oldFieldValue: null, //field组件change之前的值
			fieldModel: null,
			displayValue: "",
			rules: [],

			showReferenceDialogFlag: false,
			entity: null,
			curRefField: null,
			searchFilter: "",
			gDsv: {},
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
	},

	beforeUnmount() {
		this.unregisterFromRefList();
	},

	methods: {
		onAppendButtonClick() {
			this.curRefField = this.field.options.name;
			this.showReferenceDialogFlag = true;
		},

		handleClearEvent() {
			this.fieldModel = null;
			this.handleChangeEvent(this.fieldModel);
		},

		setReferRecord(recordObj, selectedRow) {
			this.fieldModel = {
				id: recordObj.id,
				name: recordObj.label,
			};
			this.handleChangeEvent(this.fieldModel);
			this.handleRecordSelectedEvent(selectedRow);
			this.doFillBack(recordObj, selectedRow);

			this.showReferenceDialogFlag = false;
		},

		doFillBack(recordObj, selectedRow) {
			// 判断是否启用回填
			if (this.field.options.fillBackEnabled) {
				let { fillBackConfig } = this.field.options;
				fillBackConfig.forEach((el) => {
					// 非子表单
					if (!el.targetSubForm) {
						let targetFieldValue = this.getWidgetRef(
							el.targetField
						).getValue();
						// 如果目标字段有值 且 不是强制回填 不往下执行
						if (targetFieldValue && JSON.stringify(targetFieldValue) !== "{}" && !el.forceFillBack) {
							return;
						}

						// 执行回填操作
						this.getWidgetRef(el.targetField).setValue(
							selectedRow[el.sourceField]
						);
					} else {
						const targetFieldName = el.targetField + '@row' + this.subFormRowId
						let targetFieldValue = this.getWidgetRef(
							targetFieldName
						).getValue();
						// 如果目标字段有值 且 不是强制回填 不往下执行
						if (targetFieldValue && JSON.stringify(targetFieldValue) !== "{}" && !el.forceFillBack) {
							return;
						}

						// 执行回填操作
						this.getWidgetRef(targetFieldName).setValue(
							selectedRow[el.sourceField]
						);
					}
				});
			}
		},

		setFilter(newFilter) {
			this.searchFilter = newFilter;
		},

		getFilter() {
			return this.searchFilter;
		},

		handleRecordSelectedEvent(selectedRow) {
			if (!!this.designState) {
				//设计状态不触发事件
				return;
			}

			if (!!this.field.options.onRecordSelected) {
				let customFn = new Function(
					"selectedRow",
					this.field.options.onRecordSelected
				);
				customFn.call(this, selectedRow);
			}
		},

		openRefDialog() {
			let refId = this.fieldModel ? this.fieldModel.id : null;
			if (refId && this.$refs.detailRef) {
				this.$refs.detailRef.openDialog(refId);
			}
		},
	},
};
</script>

<style lang="scss" scoped></style>

<style lang="scss">
.small-padding-dialog .el-dialog__body {
	padding: 0 10px 10px 10px !important;
}

.readonly-mode-field {
	cursor: pointer;

	.small-circle-button {
		height: 16px !important;
		width: 16px !important;
	}
}
</style>
