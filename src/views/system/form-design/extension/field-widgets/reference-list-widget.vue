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
                multiline
			>
				<template #suffix>
                    <el-icon
						title="查看"
						v-if="displayValue.length > 0"
						class="el-input__icon"
						@click="handleViewEvent"
					>
                        <TopRight />
					</el-icon>
					<el-icon
						title="清除"
						v-if="displayValue.length > 0 && !isReadMode && !field.options.disabled"
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
				<span
                    class="readonly-mode-field"
				>
                    {{ contentForReadMode }}
                    <el-button
						v-if="fieldModel && fieldModel.length > 0"
						type="primary"
						circle
						size="small"
						class="small-circle-button"
						title="打开详情弹窗"
                        @click="handleViewEvent"
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
				:gDsv="gDsv"
                showCheckBox
                :showMultipleSelectConfirm="false"
                :defaultSelected="fieldModel"
                v-if="referenceDialogType == 'table'"
			></ReferenceSearchTable>
            <ReferenceSearchTree
                v-else
                ref="referTree"
                :treeConf="treeDialogConf"
                :defaultSelected="fieldModel"
                show-checkbox
            />
            <template #footer>
                <el-button @click="showReferenceDialogFlag = false">取消</el-button>
                <el-button type="primary" @click="treeDialogConfirm">确认</el-button>
            </template>
		</ml-dialog>
        <ml-dialog
            title="查看字段内容"
            v-model="viewDialogConf.show"
            :append-to-body="true"
            width="520px"
            showFullScreen
        >
            <el-input
                class="mb-10"
                v-model="viewDialogConf.search"
                placeholder="请输入关键词搜索"
                clearable
                @input="filterFieldModel"
            />
            <el-scrollbar max-height="500px">
                <el-tag
                    v-for="(tag,inx) in viewDialogConf.data"
                    :key="inx"
                    class="mr-5 mb-10"
                    @close="delField(tag)"
                    :closable="!isReadMode && !field.options.disabled"
                    size="large"
                >
                    {{ tag.name }}
                </el-tag>
            </el-scrollbar>
            <template #footer v-if="!isReadMode && !field.options.disabled">
                <div class="fl pl-20" style="font-size: 14px">
                    <span>已选</span>
                    <span>{{ viewDialogConf.sourceData.length }}</span>
                    <span>条</span>
                </div>
                <el-button @click="viewDialogConf.show = false">取消</el-button>
                <el-button
                    type="primary"
                    @click="confirmDelField"
                    v-if="viewDialogConf.sourceData.length != this.fieldModel.length"
                >
                    保存
                </el-button>
            </template>
        </ml-dialog>
	</div>
	<Detail ref="detailRef" />
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
import ReferenceSearchTable from "@/components/mlReferenceSearch/reference-search-table.vue";
import ReferenceSearchTree from "@/components/mlReferenceSearch/reference-search-tree.vue";
import Detail from "@/views/customize-menu/detail.vue";
import { deepClone } from '@/utils/util';
const { FormItemWrapper, emitter, i18n, fieldMixin } = VisualDesign.VFormSDK;

export default {
	name: "reference-list-widget",
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
        ReferenceSearchTree,
		Detail,
	},
	data() {
		return {
			oldFieldValue: null, //field组件change之前的值
			fieldModel: [],
			displayValue: [],
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
            viewDialogConf: {
                show: false,
                search: "",
                data: [],
                sourceData: [],
            },
		};
	},
    watch: {
		fieldModel: {
			deep: true,
			immediate: true,
			handler(val) {
				this.displayValue =  val && val.length > 0 ? val.map(el => el.name) : "";
			},
		},
	},
	computed: {
		inputType() {
			if (this.field.options.type === "number") {
				return "text"; //当input的type设置为number时，如果输入非数字字符，则v-model拿到的值为空字符串，无法实现输入校验！故屏蔽之！！
			}

			return this.field.options.type;
		},

		contentForReadMode() {
            let names = this.fieldModel && this.fieldModel.length > 0 ? this.fieldModel.map(el => el.name) : "";
			return names.length > 0 ? names.join(",") : "--";
		},

		dialogWidth() {
			return this.field.options.searchDialogWidth || "520px";
		},
	},
	// },
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

        this.registerToRefList();
		this.initFieldModel();
		this.initEventHandler();
		this.buildFieldRules();
		this.handleOnCreated();
	},

	mounted() {
		this.setDefaultValue()
	},

	beforeUnmount() {
		this.unregisterFromRefList();
	},

	methods: {
		setDefaultValue() {
			if (this.field.options.disabled || this.isReadMode) {
				return
			}

			if (this.getValue()) {
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
				customFn.call(this);
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
                            return
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
            this.showReferenceDialogFlag = true;
		},

		handleClearEvent() {
			this.fieldModel = [];
            this.onFieldChangeEvent(this.fieldModel);
		},

        // 树选择回填
        treeDialogConfirm() {
            if(this.referenceDialogType === 'tree') {
                let selectedNodes = this.$refs.referTree?.getSelectedNode();
                if(selectedNodes.length < 1) {
                    this.fieldModel = [];
                    this.showReferenceDialogFlag = false;
                    this.onFieldChangeEvent(this.fieldModel);
                    return
                }
                this.fieldModel = selectedNodes.map(el => {
                    return {
                        id: el.id,
                        name: el.label
                    }
                });
                this.onFieldChangeEvent(this.fieldModel);
				this.handleRecordSelectedEvent(selectedNodes);
            }else {
                let fieldNames = this.$refs.referST?.getIdNameField() || {};
                let rows = this.$refs.referST?.getMultipleSelection() || [];
                this.fieldModel = rows.map(el => {
                    return {
                        id: el[fieldNames.idField],
                        name: el[fieldNames.nameField]
                    }
                });
                this.onFieldChangeEvent(this.fieldModel);
				this.handleRecordSelectedEvent(rows);
            }
            this.showReferenceDialogFlag = false;
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

        handleViewEvent() {
            this.viewDialogConf.show = true;
            this.viewDialogConf.sourceData = deepClone(this.fieldModel);
            this.filterFieldModel();
        },
        filterFieldModel() {
            let { search, sourceData } = this.viewDialogConf;
            if(search) {
                this.viewDialogConf.data = sourceData.filter(el => {
                    return el.name.indexOf(this.viewDialogConf.search) != -1
                })
            }else {
                this.viewDialogConf.data = deepClone(sourceData)
            }
        },
        // 删除Field
        delField(field){
            let { sourceData } = this.viewDialogConf;
            for (let index = 0; index < sourceData.length; index++) {
                const element = sourceData[index];
                if(field.id == element.id){
                    sourceData.splice(index,1)
                }
            }
            this.filterFieldModel();
        },
        // 确认删除
        confirmDelField(){
            this.fieldModel = deepClone(this.viewDialogConf.sourceData);
            this.onFieldChangeEvent(this.fieldModel);
            this.viewDialogConf.show = false;
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
.el-input__icon {
    cursor: pointer;
}
</style>
