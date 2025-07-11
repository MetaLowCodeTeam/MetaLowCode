<template>
	<div class="full-width">
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
        <ml-dialog
            v-model="showReferenceDialogFlag"
            title="请选择"
            width="520px"
            append-to-body
        >
            <ReferenceSearchTable
				ref="referST"
				:entity="entity"
				:refField="curRefField"
				:extraFilter="searchFilter"
                :extraSort="extraSort"
                :filterConditions="filterConditions"
				@recordSelected="beforeSetReferRecord"
				:gDsv="gDsv"
                :defaultSelected="fieldModel"
                :outerReferenceConfig="curOuterReferenceConfig"
                isOuterReference
			></ReferenceSearchTable>
        </ml-dialog>
	</div>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
import ReferenceSearchTable from "@/components/mlReferenceSearch/reference-search-table.vue";
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
        ReferenceSearchTable,
	},
	data() {
		return {
			oldFieldValue: null, //field组件change之前的值
			fieldModel: null,
			displayValue: "",
			rules: [],
			entity: null,
			gDsv: {},
            globalConfig: {},
            // 是否显示弹窗
            showReferenceDialogFlag: false,
            // 当前引用字段
            curRefField: "",
            // 排序
            extraSort: "",
            // 查询条件---通过this.setFilter设置
            searchFilter: "",
            // 过滤条件
            filterConditions: {},
            // 外部引用配置
            curOuterReferenceConfig: null,
		};
	},
	computed: {

		contentForReadMode() {
			return this.fieldModel ? this.fieldModel.name : "--";
		},
	},
	watch: {
		fieldModel: {
			deep: true,
			immediate: true,
			handler(val) {
				this.displayValue = val ? val.name : "";
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
            // 检查是否配置了弹窗设置
            let { name, outerDialogSetting } = this.field.options;
            this.curRefField = name;
            if(!outerDialogSetting || !outerDialogSetting.requestUrl) {
                this.$message.error("请先配置弹窗设置");
                return;
            }
            let { sortField } = outerDialogSetting;
            // 设置排序
            if(sortField) {
                this.extraSort = `${sortField.fieldName} ${sortField.type}`;
                console.log(this.extraSort, '----排序')
            }
            this.curOuterReferenceConfig = outerDialogSetting;
            this.showReferenceDialogFlag = true;
		},
		handleClearEvent() {
			this.fieldModel = null;
			this.onFieldChangeEvent(this.fieldModel);
		},
        // 选中回填
        beforeSetReferRecord(record, selectedRow) {
            console.log(record,'record')
            this.fieldModel = {
                code: record.id,
                name: record.label,
            };
			this.onFieldChangeEvent(this.fieldModel);
            // 回填
			// this.doFillBack(recordObj, selectedRow);
			this.showReferenceDialogFlag = false;
        },
        // 设置查询条件
        setFilter(newFilter) {
			this.searchFilter = newFilter;
		},
        // 获取查询条件
		getFilter() {
			return this.searchFilter;
		},
        // 设置排序
        setSort(newSort) {
            this.extraSort = newSort;
        },
        // 获取排序
        getSort() {
            return this.extraSort;
        },
	},
};
</script>

<style lang="scss" scoped>
.full-width {
	width: 100%;
}
</style>

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
