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
						title="查看"
						class="el-input__icon"
						@click="openDetailDialog"
                        v-if="!!displayValue && !field.options.detailLinkDisabled"
					>
                        <TopRight />
					</el-icon>
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
                    <template v-if="!field.options.detailLinkDisabled">
						<el-button
							v-if="fieldModel && fieldModel.code"
							type="primary"
							circle
							size="small"
							class="small-circle-button"
							title="打开详情弹窗"
                            @click="openDetailDialog"
						>
							<el-icon>
								<TopRight />
							</el-icon>
						</el-button>
					</template>
				</span>
			</template>
		</form-item-wrapper>
        <ml-dialog
            v-model="showReferenceDialogFlag"
            title="请选择"
            :width="field.options.searchDialogWidth"
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
        <ReferenceOuterDetailDialog ref="outerDetailDialog" />
	</div>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
import ReferenceSearchTable from "@/components/mlReferenceSearch/reference-search-table.vue";
import ReferenceOuterDetailDialog from "@/components/mlReferenceSearch/reference-outerDetail-dialog.vue";
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
        ReferenceOuterDetailDialog,
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
            let { name, outerDialogSetting, onBeforeListQuery, onAfterListQuery } = this.field.options;
            this.curRefField = name;
            if(!outerDialogSetting || !outerDialogSetting.requestUrl) {
                this.$message.error("请先配置弹窗设置");
                return;
            }
            let { sortField } = outerDialogSetting;
            // 设置排序
            if(sortField) {
                this.extraSort = `${sortField.fieldName} ${sortField.type}`;
            }
            this.curOuterReferenceConfig = outerDialogSetting;
            this.curOuterReferenceConfig.onBeforeListQuery = onBeforeListQuery;
            this.curOuterReferenceConfig.onAfterListQuery = onAfterListQuery;
            this.showReferenceDialogFlag = true;
		},
		handleClearEvent() {
			this.fieldModel = null;
			this.onFieldChangeEvent(this.fieldModel);
		},
        // 选中回填
        beforeSetReferRecord(record, selectedRow) {
            this.fieldModel = {
                code: record.id,
                name: record.label,
            };
			this.onFieldChangeEvent(this.fieldModel);
            // 回填
			this.doFillBack(record, selectedRow);
			this.showReferenceDialogFlag = false;
        },
        // 回填
        async doFillBack(recordObj, selectedRow) {
            // 判断是否启用回填
			if (this.field.options.fillBackEnabled) {
				let { fillBackConfig } = this.field.options;
				fillBackConfig.forEach((el) => {
					// 非子表单
					if (!el.targetSubForm) {
						let targetFieldValue = this.getWidgetRef(
							el.targetField
						)?.getValue();
						// 如果目标字段有值 且 不是强制回填 不往下执行
						if (targetFieldValue && JSON.stringify(targetFieldValue) !== "{}" && !el.forceFillBack) {
							return;
						}
						// 执行回填操作
                        let targetWidgetRef = this.getWidgetRef(el.targetField);
                        if (targetWidgetRef) {
                            targetWidgetRef.setValue(
                                selectedRow[el.sourceField]
                            );
                        } else {
                            this.$message.error("目标组件不存在：" + el.targetField);
                        }
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
                        let targetWidgetRef = this.getWidgetRef(targetFieldName);
                        if (targetWidgetRef) {
                            targetWidgetRef.setValue(
                                selectedRow[el.sourceField]
                            );
                        } else {
                            this.$message.error("目标组件不存在：" + targetFieldName);
                        }
					}
				});
                let { subFormFillBackConfig } = this.field.options;
                // 没有回填数据
                if(subFormFillBackConfig.length < 1){
                    return
                }
                let subFormFields = [];
                subFormFillBackConfig.forEach(el => {
                    subFormFields.push({
                        entityName: el.sourceWidget.entityName,
                        queryFields: el.fllBackItems.map(el => el.sourceField).join(',')
                    })
                })
                let res = await queryById(recordObj.id, "", { queryDetailList: subFormFields });
                if(res){
                    let resData = res.data || {};
                    subFormFillBackConfig.forEach(el => {
                        let subFormCom = this.getWidgetRef(el.targetWidget.name);
                        if(el.fllBackItems){
                            let subFormFllBackItems = [];
                            resData[el.sourceWidget.entityName].forEach(fllBackEl => {
                                let fllBackItem = {};
                                el.fllBackItems.forEach(subEl => {
                                    fllBackItem[subEl.targetField] = fllBackEl[subEl.sourceField];
                                })
                                subFormFllBackItems.push(fllBackItem)
                            })
                            // 如果是覆盖模式
                            if(el.forceFillBack){
                                subFormCom.setSubFormValues(subFormFllBackItems)
                            }
                            // 追加模式
                            else {
                                let subFormValues = subFormCom.getSubFormValues();
                                subFormValues.push(...subFormFllBackItems);
                                subFormCom.setSubFormValues(subFormValues);
                            }
                        }
                    })
                }
			}
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
        openDetailDialog() {
            let { outerDetailURL } = this.field.options;
            if(!outerDetailURL) {
                this.$message.error("请先配置详情跳转地址");
                return;
            }
            let { code } = this.fieldModel;
            let url = outerDetailURL.replace("{code}", code);
            this.$refs.outerDetailDialog.openDialog({ url });
        },
	},
};
</script>

<style lang="scss" scoped>
.full-width {
	width: 100%;
}
:deep(.hide-spin-button) {
    &.is-disabled {
        position: relative;
        .el-input__suffix .el-input__suffix-inner{
            position: absolute;
            right: 10px;
            top: 8px;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            background: var(--el-color-primary);
            z-index: 1;
            .el-input__icon {
                margin-left: 0px;
                cursor: pointer;
            }
        }
    }
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
