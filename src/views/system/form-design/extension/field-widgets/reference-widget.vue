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
			<ReferenceSearchRemote
                ref="referRemote"
                v-if="!isReadMode && field.options.openSearchInPlace"
                :entity="entity"
				:refField="field.options.name"
                :searchFields="field.options.searchFields"
                :dialogWidth="field.options.searchDialogWidth"
                :disabled="field.options.disabled"
                :fieldModel="fieldModel"
                :extraFilter="searchFilter"
                :size="field.options.size || globalConfig.size"
                @onSelectedRemote="onSelectedRemote"
                @onAppendButtonClick="onAppendButtonClick"
                @onFocus="onReferRemoteFocus"
            />
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
		<ml-dialog
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
            scrollbarMaxHeight="600px"
		>
			<ReferenceSearchTable
				ref="referST"
				:entity="entity"
				:refField="curRefField"
				:extraFilter="searchFilter"
                :extraSort="extraSort"
                :filterConditions="filterConditions"
				@recordSelected="beforeSetReferRecord"
                @multipleRecordSelected="beforeMultipleSetReferRecord"
				:gDsv="gDsv"
                :showCheckBox="subFormItemFlag && !field.options.disableMultipleSelectionInSubForm && gDsv.formStatus != 'approval'"
                :showMultipleSelectConfirm="subFormItemFlag && !field.options.disableMultipleSelectionInSubForm && gDsv.formStatus != 'approval'"
                :defaultSelected="fieldModel"
                v-if="referenceDialogType == 'table'"
			></ReferenceSearchTable>
            <ReferenceSearchTree
                v-else
                ref="referTree"
                :treeConf="treeDialogConf"
                :defaultSelected="fieldModel"
            />
            <template #footer v-if="referenceDialogType == 'tree'">
                <el-button @click="showReferenceDialogFlag = false">取消</el-button>
                <el-button type="primary" @click="beforeTreeDialogConfirm">确认</el-button>
            </template>
		</ml-dialog>
	</div>
	<Detail ref="detailRef" />
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
import ReferenceSearchTable from "@/components/mlReferenceSearch/reference-search-table.vue";
import ReferenceSearchTree from "@/components/mlReferenceSearch/reference-search-tree.vue";
import ReferenceSearchRemote from "@/components/mlReferenceSearch/reference-search-remote.vue";

import Detail from "@/views/customize-menu/detail.vue";
import { queryById } from "@/api/crud";
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
    inject: ['getFormConfig'],
	components: {
		FormItemWrapper,
		ReferenceSearchTable,
        ReferenceSearchTree,
		Detail,
		ReferenceSearchRemote,
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
		this.setDefaultValue();
        this.globalConfig = this.getFormConfig();
	},

	beforeUnmount() {
		this.unregisterFromRefList();
	},

	methods: {
		setDefaultValue() {
			if (this.isReadMode || this.getValue()) {
				return
			}

			let loginUser = null
			if (localStorage.getItem('USER_INFO')) {
				loginUser = JSON.parse(localStorage.getItem('USER_INFO')).content
			}
			if (loginUser && this.field.options.useCurrentUser) {
				if (loginUser.userId) {
					this.setValue({
						id: loginUser.userId,
						name: loginUser.userName
					})
				}
			}
			if (loginUser && this.field.options.useCurrentDepartment) {
				if (loginUser.departmentId) {
					this.setValue({
						id: loginUser.departmentId,
						name: loginUser.departmentName
					})
				}
			}
		},
        onReferRemoteFocus() {
            if (this.designState) {
                return
            }
            if(!this.checkFilterConditions()){
                this.$refs.referRemote.setFilterConditions(null, false);
                return
            }
            this.$refs.referRemote.setFilterConditions(this.filterConditions, true);
        },
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
            // 默认树
            this.referenceDialogType = 'table';
            let { name, useTreeDataSelect, treeCascadeFieldName, treeDataEntityName } = this.field.options;
			this.curRefField = name;
            // 如果启用了树形数据选择弹框，且选择了父子级联字段
            if(useTreeDataSelect && treeCascadeFieldName) {
                this.referenceDialogType = 'tree';
                this.showReferenceDialogFlag = true;
                this.treeDialogConf = {
                    treeCascadeFieldName,
                    treeDataEntityName
                };
                return
            }
            if(!this.checkFilterConditions()){
                return
            }
            // 如果有可视化排序配置
            if(this.field.options?.sortField){
                this.extraSort = `${this.field.options.sortField} ${this.field.options.sortOrder}`;
            }
			this.showReferenceDialogFlag = true;
		},
        // 检测过滤条件
        checkFilterConditions() {
            let optionsFilterConditions = {};
            if(this.field.options?.filterConditions){
                optionsFilterConditions = JSON.parse(JSON.stringify(this.field.options?.filterConditions));
            }
            // 获取过滤参数
            let filterConditions = Object.assign(
                {
					type: 1,
					equation: "",
					items: [],
				},
                optionsFilterConditions
            )
            for (let index = 0; index < filterConditions.items.length; index++) {
                const el = filterConditions.items[index];
                let fieldWidget;
                if(el.value.indexOf('.') == -1){
                    fieldWidget = this.getWidgetRef(el.value);
                }else {
                    let subFormFieldName = el.value.split(".")[1];
                    fieldWidget = this.getWidgetRef(subFormFieldName + '@row' + this.subFormRowId);
                }
                if(fieldWidget){
                    let fieldType = fieldWidget.field.type;
                    let fieldLabel = fieldWidget.field.options.label;
                    let fieldValue = fieldWidget.getValue();
                    // 如果是单选
                    if(fieldType == "radio"){
                        el.value = fieldValue || false;
                    }else {
                        if(!fieldValue){
                            this.$message.error("请填写：" + fieldLabel);
                            return false;
                        }
                        el.value = fieldValue;
                        if(typeof fieldValue == 'object'){
                            if(fieldType == "select"){
                                el.value = fieldValue.value
                            }else {
                                el.value = fieldValue.id;
                            }
                        }
                    }
                }
            }
            if (filterConditions.items.length > 0) {
                this.filterConditions = filterConditions;
            } else {
                this.filterConditions = null;
            }
            let filedName = this.field.options.name;
            if(this.gDsv[filedName]){
                this.filterConditions = Object.assign({}, this.filterConditions, this.gDsv[filedName].filterConditions);
            }
            return true;
        },
		handleClearEvent() {
			this.fieldModel = null;
			this.onFieldChangeEvent(this.fieldModel);
		},
        beforeMultipleSetReferRecord(recordObj, rows) {
            let { confirmSelect, confirmSelectContent } = this.field.options;
            if(confirmSelect) {
                this.$confirm(confirmSelectContent || "确定选择该记录吗？", '操作确认', {
                    type: 'warning'
                }).then(() => {
                    this.multipleSetReferRecord(recordObj, rows);
                })
            }else {
                this.multipleSetReferRecord(recordObj, rows);
            }
        },
        // 多选数据回填
        multipleSetReferRecord(recordObj, rows) {
            // 通过子表名称取子表组件
            let subFormCom = this.getWidgetRef(this.getSubFormName());
            // 取字表所有数据
            let subFormValues = subFormCom.getSubFormValues();
            let sourceSubFormValues = subFormValues.map(el => el[this.fieldKeyName]?.id);
            // 是否有重复的
            let hasRepeat = false;
            rows.forEach(el => {
                if(sourceSubFormValues.includes(el[recordObj.id])){
                    hasRepeat = true;
                }
            })
            // 是否存在重复的
            if(hasRepeat){
                this.$confirm(
                    "选中的记录在表单数据中已存在，是否再次追加？不追加则仅回填表单中不存在的记录。",
                    '操作确认',
                    {
                        distinguishCancelAndClose: true,
                        confirmButtonText: '追加回填',
                        cancelButtonText: '不追加回填',
                        type: "warning"
                    }
                ).then(() => {
                    this.doMultipleFillBack(rows, recordObj, subFormCom, subFormValues, sourceSubFormValues, true);
					if (subFormCom.recalculateFormula) {
						subFormCom.recalculateFormula()
					}
                }).catch((action) => {
                    if(action == 'cancel'){
                        this.doMultipleFillBack(rows, recordObj, subFormCom, subFormValues, sourceSubFormValues, false);
                    }
                })
            } else {
                this.doMultipleFillBack(rows, recordObj, subFormCom, subFormValues, sourceSubFormValues, true);
				if (subFormCom.recalculateFormula) {
					subFormCom.recalculateFormula()
				}
            }

        },
        doMultipleFillBack(rows, recordObj, subFormCom, subFormValues, sourceSubFormValues, isAll) {
            // 是否追加回填
            if (isAll) {
                rows.forEach((selectedRow,subInx) => {
                    // 把后面的数据已追加的方式追加进去。
                    if (subInx === 0) {
                        let res = this.handleRecordSelectedEvent(selectedRow, rows);
                        if(res === false){
                            return
                        }
                        // 赋值当前选中数据
                        this.fieldModel = {
                            id: selectedRow[recordObj.id],
                            name: selectedRow[recordObj.label],
                        };
                        // 第一条选中数据回填
                        this.doFillBack(this.fieldModel, selectedRow);
						this.syncUpdateFormModel(this.fieldModel);
                        this.onFieldChangeEvent(this.fieldModel);
                    } else {
                        let temp = {};
                        temp[this.fieldKeyName] = {
                            id: selectedRow[recordObj.id],
                            name: selectedRow[recordObj.label],
                        };
                        // 如果设置了回填
                        if(this.field.options.fillBackEnabled){
                            let { fillBackConfig } = this.field.options;
                            fillBackConfig.forEach((el) => {
                                temp[el.targetField] = selectedRow[el.sourceField];
                            });
                        }
                        subFormValues.push(temp);
                    }
                })
            }
            // 不追加回填
            else {
                // 如果第一条数据不存在
                if(!sourceSubFormValues.includes(rows[0][recordObj.id])){
                    let res = this.handleRecordSelectedEvent(rows[0], [rows[0]]);
                    if(res === false){
                        return
                    }
                    // 赋值当前选中数据
                    this.fieldModel = {
                        id: rows[0][recordObj.id],
                        name: rows[0][recordObj.label],
                    };
					this.syncUpdateFormModel(this.fieldModel);
                    // 第一条选中数据回填
                    this.doFillBack(this.fieldModel, rows[0]);
                    this.onFieldChangeEvent(this.fieldModel);
                }
                rows.forEach((selectedRow,subInx) => {
                    // 把后面的数据已追加的方式追加进去。
                    if(subInx != 0 && !sourceSubFormValues.includes(selectedRow[recordObj.id])){
                        let temp = {};
                        temp[this.fieldKeyName] = {
                            id: selectedRow[recordObj.id],
                            name: selectedRow[recordObj.label],
                        };
                        // 如果设置了回填
                        if(this.field.options.fillBackEnabled){
                            let { fillBackConfig } = this.field.options;
                            fillBackConfig.forEach((el) => {
                                temp[el.targetField] = selectedRow[el.sourceField];
                            });
                        }
                        subFormValues.push(temp);
                    }
                })
            }

            subFormCom.setSubFormValues(subFormValues);

            // 关闭弹框
            this.showReferenceDialogFlag = false;
        },
        beforeSetReferRecord(recordObj, selectedRow) {
            let { confirmSelect, confirmSelectContent } = this.field.options;
            if(confirmSelect) {
                this.$confirm(confirmSelectContent || "确定选择该记录吗？", '操作确认', {
                    type: 'warning'
                }).then(() => {
                    this.setReferRecord(recordObj, selectedRow);
                })
            }else {
                this.setReferRecord(recordObj, selectedRow);
            }
        },
        // 单选回填
		setReferRecord(recordObj, selectedRow) {
            let res = this.handleRecordSelectedEvent(selectedRow, [selectedRow]);
            if(res === false){
                return
            }
			this.fieldModel = {
				id: recordObj.id,
				name: recordObj.label,
			};
			this.onFieldChangeEvent(this.fieldModel);
            // 回填
			this.doFillBack(recordObj, selectedRow);
			this.showReferenceDialogFlag = false;
		},
        // 二次确认选择
        beforeTreeDialogConfirm() {
            let { confirmSelect, confirmSelectContent } = this.field.options;
            if(confirmSelect) {
                this.$confirm(confirmSelectContent || "确定选择该记录吗？", '操作确认', {
                    type: 'warning'
                }).then(() => {
                    this.treeDialogConfirm();
                })
            }else {
                this.treeDialogConfirm();
            }
        },
        // 树选择回填
        treeDialogConfirm() {
            let selectedNodes = this.$refs.referTree?.getSelectedNode();
            if(selectedNodes.length < 1) {
                this.fieldModel = null;
                this.showReferenceDialogFlag = false;
                return
            }
            this.fieldModel = {
				id: selectedNodes[0].id,
				name: selectedNodes[0].label,
			};
			this.onFieldChangeEvent(this.fieldModel);
            this.showReferenceDialogFlag = false;
        },
		async doFillBack(recordObj, selectedRow) {
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

		handleRecordSelectedEvent(selectedRow, allSelectedRows) {
			if (!!this.designState) {
				//设计状态不触发事件
				return;
			}

			if (!!this.field.options.onRecordSelected) {
				let customFn = new Function(
					"selectedRow",
                    "allSelectedRows",
					this.field.options.onRecordSelected
				);
				return customFn.call(this, selectedRow, allSelectedRows);
			}
		},

		openRefDialog() {
			let refId = this.fieldModel ? this.fieldModel.id : null;
			if (refId && this.$refs.detailRef) {
				this.$refs.detailRef.openDialog(refId);
			}
		},
        onSelectedRemote({record, selectedRow}) {
            this.setReferRecord(record, selectedRow);
        }
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
