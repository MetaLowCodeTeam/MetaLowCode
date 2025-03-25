<template>
	<!--  -->
	<el-form-item label="过滤条件" label-width="120px" v-if="!optionModel.useTreeDataSelect">
		<el-button class="w-100" @click="openFilterDialog" v-if="!optionModel.filterConditions?.items || optionModel.filterConditions?.items?.length == 0">
			设置过滤条件
		</el-button>
        <el-button class="w-100" @click="openFilterDialog" v-else>
			已设置条件（{{ optionModel.filterConditions?.items?.length }}）
		</el-button>
	</el-form-item>
	<!--  -->
	<mlDialog
		v-model="filterDialogConf.isShow"
		title="设置过滤条件"
		width="760"
	>
		<div v-loading="filterDialogConf.loading">
			<el-scrollbar max-height="400px">
				<el-row
					v-for="(item, inx) of conditionConf.items"
					:key="inx"
					class="mb-10 ml-conditions-list"
					:gutter="10"
				>
                    <template v-if="item.op == 'SQL'">
                        <el-col :span="24">
                            <div class="field-one">
                                <span class="field-inx">{{ inx+1 }}</span>
                                <el-icon size="18" class="remove-icon" @click="delConditions(inx)">
                                    <ElIconRemoveFilled />
                                </el-icon>
                            </div>
                            <el-input 
                                class="field-select field-input" 
                                placeholder="请输入SQL" 
                                v-model="item.value" 
                                clearable
                                size="default"
                            />
                        </el-col>
                    </template>
                    <template v-else>
                        <!-- 字段名 -->
                        <el-col :span="10">
                            <div class="field-one">
                                <span class="field-inx">{{ inx + 1 }}</span>
                                <el-icon
                                    size="18"
                                    class="remove-icon"
                                    @click="delConditions(inx)"
                                >
                                    <ElIconRemoveFilled />
                                </el-icon>
                            </div>
                            <el-select
                                class="field-select"
                                v-model="item.fieldName"
                                @change="fieldChange(item)"
                                filterable
                                no-match-text="无匹配文本"
                                size="default"
                            >
                                <el-option
                                    v-for="op in refFieldList"
                                    :key="op.fieldName"
                                    :label="
                                        op.label +
                                        (op.targetType
                                            ? '（' + op.targetType + '）'
                                            : '')
                                    "
                                    :value="op.fieldName"
                                />
                            </el-select>
                        </el-col>
                        <!-- 条件类型 -->
                        <el-col :span="4">
                            <el-select v-model="item.op" size="default">
                                <el-option
                                    v-for="op in getSelectOp(item)"
                                    :key="op"
                                    :label="op_type[op]"
                                    :value="op"
                                />
                            </el-select>
                        </el-col>
                        <!-- 条件值 -->
                        <el-col :span="10">
                            <el-select
                                class="field-select"
                                v-model="item.value"
                                filterable
                                no-match-text="无匹配文本"
                                size="default"
                                :class="{ 'is-error': item.isError }"
                                v-if="!op_no_value.includes(item.op)"
                                @focus="clearError(item)"
                            >
                                <el-option
                                    v-for="op in targetFieldList"
                                    :key="op.name"
                                    :label="op.label + '（' + op.fieldType + '）'"
                                    :value="op.name"
                                    :disabled="op.fieldType != item.targetType"
                                /> 
                            </el-select>
                        </el-col>
                    </template>
				</el-row>
			</el-scrollbar>
			<!-- 添加条件 -->
			<div class="ml-add-condition">
				<span class="ml-a-span" @click="addConditions">
					<el-icon size="18" class="add-icon">
						<ElIconCirclePlusFilled />
					</el-icon>
					<span class="ml-8">添加条件</span>
				</span>
                <span class="ml-a-span ml-10" @click="addSql">
                    <el-icon size="18" class="add-icon">
                        <ElIconCirclePlusFilled />
                    </el-icon>
                    <span class="ml-8">添加SQL条件</span>
                </span>
			</div>
			<div class="ml-conditions-mode mt-10">
				<el-radio-group
					v-model="conditionConf.type"
					@change="conditionTypeChange"
					size="default"
				>
					<el-radio :value="1">符合任一</el-radio>
					<el-radio :value="2">符合全部</el-radio>
					<el-radio :value="3">高级表达式</el-radio>
				</el-radio-group>
				<el-input
					class="mt-5"
					v-if="conditionConf.type == 3"
					v-model="conditionConf.equation"
					clearable
					:placeholder="getPlaceholder()"
					size="default"
					:class="{ 'is-error': errorEquation }"
				></el-input>
			</div>
		</div>
		<template #footer>
			<el-button
				@click="filterDialogConf.isShow = false"
				:loading="filterDialogConf.loading"
				size="default"
			>
				取消
			</el-button>
			<el-button
				type="primary"
				@click="confirm"
				size="default"
				:loading="filterDialogConf.loading"
			>
				确认
			</el-button>
		</template>
	</mlDialog>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, eventMixin, Utils } = VisualDesign.VFormSDK;
/**
 * API
 */
// 获取引用字段的引用实体
import { getRefFieldExtras } from "@/api/system-manager";
// 配置文件
import conditionsConfig from "@/config/conditionsConfig";
// 类型映射
import { formFieldMapping } from "@/views/system/form-design/formFieldMapping";
import { checkIsSubForm } from '@/utils/util';
export default {
	name: "reference-fillBackConfig-editor",
	mixins: [i18n, eventMixin, Utils],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
	data() {
		return {
			// // 当前实体
			// curEntity: "",
			// // 引用字段
			// refFields: "",
			// // 引用实体
			// refEntity: "",
			// 过滤弹框配置
			filterDialogConf: {},
			// 条件list
			conditionConf: {
				items: [],
			},
			// 引用实体字段
			refFieldList: [],
			// 最多可添加多少个条件
			maxConditionsLength: 9,
			// 条件值
			targetFieldList: [],
			// 错误表达式
			errorEquation: false,
			// 条件类型
			op_type: {},
			// 不需要条件值的条件类型
			op_no_value: [
				"NL",
				"NT",
				"SFU",
				"SFB",
				"SFD",
				"YTA",
				"TDA",
				"TTA",
				"CUW",
				"CUM",
				"CUQ",
				"CUY",
			],
            subFormName: "",
		};
	},
	inject: ["isSubFormChildWidget"],
	methods: {
		// 打开过滤条件弹框
		async openFilterDialog() {
            let paramEntity = "";
            // 1 获取表单上的字段组件
			let allFieldWidgets = Utils.getAllFieldWidgets(
				this.designer.widgetList
			);
			// 2. 用getAllContainerWidgets获取表达上的容器组件；
			let allContainerWidgets = Utils.getAllContainerWidgets(
				this.designer.widgetList
			);
            // 3. 遍历上述容器组件，找出子表单容器，type是sub-form或grid-sub-form；获取到子表单内部的字段组件；
			// 所有子表单字段组件
			let subFormWidgets = [];
			// 所有子表单字段名称
			let subFormFieldIds = [];
			// 多行子表单字段
			let gridSubFormIds = [];
            // 所有子表单组件
            this.allSubFormWidgets = [];
			allContainerWidgets.forEach((el) => {
				if (checkIsSubForm(el.type)) {
                    this.allSubFormWidgets.push(el);
					Utils.traverseFieldWidgetsOfContainer(
						el.container,
						(fw) => {
							let subFw = {
								name: fw.options.name,
								label: fw.options.label,
								targetSubForm: el.container.options.name,
								fieldType: fw.type,
								id: fw.id,
							};
							subFormWidgets.push(subFw);
							subFormFieldIds.push(fw.id);
							if (el.type == "grid-sub-form") {
								gridSubFormIds.push(fw.id);
							}
						}
					);
				}
			});
			// 取选中字段
			let selectedId = this.designer.selectedId;
			// 如果不是子表单 并且 多行子表单里没有这个选中的组件
			if (
				!this.isSubFormChildWidget() &&
				!gridSubFormIds.includes(selectedId)
			) {
				paramEntity = this.$route.query.entity;
			}
			// 如果是子表单
			else {
				subFormWidgets.forEach((el) => {
					if (el.id == selectedId) {
                        paramEntity = el.targetSubForm;
					}
				});
			}
			this.filterDialogConf.isShow = true;
			this.filterDialogConf.loading = true;
			// 通过引入字段，当前实体获取引入字段的实体
			let refRes = await getRefFieldExtras(
				this.optionModel.name,
				paramEntity
			);
			if (refRes) {
				// 引用实体
				let entity = refRes.data.currentRefEntity;
				// 通过引入实体获取该实体所有字段
				let fieldListRes = await this.$API.common.getFieldListOfFilter({
					entity,
				});
				if (fieldListRes) {
					let list = fieldListRes.data ? fieldListRes.data.filter(el => el.type != 'ReferenceList') : [];
					this.refFieldList = list.map((el) => {
						return {
							fieldName: el.name,
							op: "",
							value: "",
							isError: false,
							type: el.type,
							label: el.label,
							targetType: formFieldMapping[el.type]?.type,
                            subFormName: "",
						};
					});
					// 初始化回填已有字段
					// if (
					//     this.conditionConf.items &&
					//     this.conditionConf.items.length > 0
					// ) {
					//     this.initConditionList();
					// }
				}
				// console.log(this.refFieldList, "this.refFieldList");
			}
			// 所有类型
			this.op_type = { ...conditionsConfig.op_type };
            
			// 加载当前引用组件所属的表单所有字段组件
			this.loadFormFieldWidgets();
			this.conditionConf = Object.assign(
				{
					type: 1,
					equation: "",
					items: [],
				},
				this.optionModel.filterConditions
			);
			this.filterDialogConf.loading = false;
			// let async = await
			// let optionFillBackConfig = this.optionModel.fillBackConfig || [];
			// // 加载已有数据
			// this.filterDialogConf.fllBackItems = optionFillBackConfig.map(
			// 	(el) => {
			// 		this.selectedTargetColumn.push(el.targetField);
			// 		let newItem = Object.assign({}, el);
			// 		el.sourceError = false;
			// 		el.targetError = false;
			// 		return newItem;
			// 	}
			// );
			// 加载
		},

		// 添加条件
		addConditions() {
			if (this.refFieldList.length < 1) {
				this.$message.error("暂未获取到条件字段，请尝试刷新页面后重试");
				return;
			}
			if (
				this.conditionConf.items.length >
				this.maxConditionsLength - 1
			) {
				this.$message.warning(
					`最多可添加 ${this.maxConditionsLength} 个条件`
				);
				return;
			}
			let condition = this.$CloneDeep(this.refFieldList[0]);
			this.conditionConf.items.push(condition);
			this.fieldChange(condition);
		},
        // 添加SQL
        addSql() {
            this.conditionConf.items.push({
                fieldName: "sql",
                op: "SQL",
                value: "",
            });
        },
		// 删除条件
		delConditions(inx) {
			this.conditionConf.items.splice(inx, 1);
		},
		// 字段切换
		fieldChange(item) {
			let metadata = this.refFieldList.filter(
				(res) => res.fieldName === item.fieldName
			);
			item = Object.assign(item, metadata[0]);
			item.op = this.getSelectOp(item)[0];
		},
		// 获取条件op
		getSelectOp(item) {
			let { type, referTo } = item;
			let op = [];
			// 如果是引用类型
			if (type == "Reference") {
				let referenceObj = { ...conditionsConfig[type] };
				// 有单独设定的 条件
				if (referenceObj.referenceFilters.includes(referTo)) {
					op = [...referenceObj[referTo]];
				} else {
					op = [...referenceObj.All];
				}
			} else {
				op = conditionsConfig[type] ? [...conditionsConfig[type]] : [];
			}
			return op;
		},
		clearError(item) {
			item.isError = false;
		},
		// 条件类型切换
		conditionTypeChange(type) {
			this.errorEquation = false;
			if (type === 1) {
				this.conditionConf.equation = "OR";
			} else if (type === 2) {
				this.conditionConf.equation = "AND";
			} else {
				this.conditionConf.equation = "";
			}
		},
		// 获取高级表达式底纹
		getPlaceholder() {
			let conditionList = [];
			this.conditionConf.items.forEach((el, inx) => {
				conditionList.push(inx + 1);
			});
			return conditionList.join(" or ");
		},
		// 确认
		async confirm() {
			let { items, equation, type } = this.conditionConf;

			if (!this.checkConditionList()) {
				return;
			}
			if (type === 3 && equation) {
				await this.checkEquation();
				if (this.errorEquation) {
					return;
				}
			}
			// console.log(this.conditionConf,'this.conditionConf')
			this.optionModel.filterConditions = Object.assign(
				{},
				this.conditionConf
			);
			this.filterDialogConf.isShow = false;
		},
		/**
		 *
		 *
		 */
		// 加载当前引用组件所属的表单所有字段组件
		loadFormFieldWidgets() {
			// 1 获取表单上的字段组件
			let allFieldWidgets = Utils.getAllFieldWidgets(
				this.designer.widgetList
			);
			// 2. 用getAllContainerWidgets获取表达上的容器组件；
			// 2.1 此方法是用来获取子表单里的所有字段组件
			let allContainerWidgets = Utils.getAllContainerWidgets(
				this.designer.widgetList
			);
			// 取选中字段
			let selectedId = this.designer.selectedId;
			// 子表单字段组件
			let subFromWidgets = [];
			// 子表单组件ID
			let subFormFieldIds = [];
			// 当前组件所在的父容器名称
			let targetSubForm = "";
			allContainerWidgets.forEach((el) => {
				if (checkIsSubForm(el.type)) {
					Utils.traverseFieldWidgetsOfContainer(
						el.container,
						(fw) => {
							let subFw = {
								name: el.container.options.name + "." + fw.options.name,
								label: el.container.options.label + '.' +fw.options.label,
								targetSubForm: el.container.options.name,
								fieldType: fw.type,
								id: fw.id,
							};
							subFromWidgets.push(subFw);
							subFormFieldIds.push(fw.id);
							if (selectedId == fw.id) {
								targetSubForm = subFw.targetSubForm;
							}
						}
					);
				}
			});
			this.targetFieldList = [];
			// 是在子表单
			if (this.isSubFormChildWidget()) {
                // 所有主表单字段
                allFieldWidgets.forEach(el => {
                    if(!subFormFieldIds.includes(el.field.id)){
                        this.targetFieldList.push({
							name: el.name,
							label: el.field.options.label,
							targetSubForm: "",
							fieldType: el.field.type,
							id: el.field.id,
						});
                    }
                })
                subFromWidgets.forEach(el => {
                    if(el.targetSubForm == targetSubForm && selectedId != el.id){
                        this.targetFieldList.push(el);
                    }
                })
			}
			// 不是在子表单
			else {
                this.conditionConf.subFormName = "";
				// 遍历所有字段，把自己和子表单字段排除
				allFieldWidgets.forEach((el) => {
					if (
						el.field.id != selectedId &&
						!subFormFieldIds.includes(el.field.id)
					) {
						this.targetFieldList.push({
							name: el.name,
							label: el.field.options.label,
							targetSubForm: "",
							fieldType: el.field.type,
							id: el.field.id,
						});
					}
				});
			}
		},
		// 检测条件
		checkConditionList() {
			let flag = true;
			if (this.conditionConf.items.length > 0) {
				this.conditionConf.items.forEach((el) => {
					el.isError = false;
					if (!el.value && !this.op_no_value.includes(el.op)) {
						flag = false;
						el.isError = true;
					}
				});
				if (!flag) {
					this.$message.error("部分条件设置有误，请检查");
					return;
				}
			}
			return flag;
		},
		// 检测高级表达式是否成立
		async checkEquation() {
			let param = {
				equation: this.conditionConf.equation,
			};
			let res = await this.$API.common.isEquation(param);
			this.errorEquation = !res;
		},
	},
};
</script>
<style lang="scss" scoped>
.ml-add-condition {
	height: 40px;
	line-height: 40px;
	border-bottom: 1px solid #eee;
	font-size: 14px;
	padding: 0 8px;
	.add-icon {
		// margin-top: 10px;
		position: relative;
		top: 4px;
	}
}
.ml-conditions-list {
	.field-one {
		display: inline-block;
		width: 20px;
		text-align: center;
		height: 28px;
		line-height: 28px;
		margin-right: 5px;
		.field-inx {
			font-size: 12px;
			// display: none;
		}
		.remove-icon {
			display: none;
			position: relative;
			// left: 5px;
			top: 4px;
			cursor: pointer;
		}
	}
	.field-select {
		width: calc(100% - 25px);
	}
	.field-input {
		width: calc(100% - 50px);
	}
	&:hover {
		.field-inx {
			display: none;
		}
		.remove-icon {
			display: block;
		}
	}
}
.ml-conditions-mode {
	padding: 0 10px;
}
</style>
