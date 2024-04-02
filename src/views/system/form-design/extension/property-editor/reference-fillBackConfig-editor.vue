<template>
	<!--  -->
	<el-form-item
		label="表单回填"
		label-width="120px"
		v-if="optionModel.fillBackEnabled"
	>
		<el-button class="w-100" @click="openFillBackDialog"
			>表单设置</el-button
		>
	</el-form-item>
	<!--  -->
	<mlDialog v-model="fillBackDialogConf.isShow" title="表单回填" width="730">
		<div v-loading="fillBackDialogConf.loading">
			<el-form-item
				label-width="75"
				:class="{
					'has-row': fillBackDialogConf.fllBackItems.length > 0,
				}"
			>
				<template #label>
					<span class="form-label"> 回填规则 </span>
					<el-tooltip
						class="box-item"
						effect="dark"
						placement="bottom"
					>
						<template #content>
							1. 引用字段可以回填引用字段、文本字段； <br />
							2. 单选项可以回填单选项、文本字段； <br />
							3. 多选项可以回填多选项、文本字段； <br />
							4. 其他字段只可回填同类型字段。
						</template>
						<span class="fillBack-help-icon">
							<el-icon><QuestionFilled /></el-icon>
						</span>
					</el-tooltip>
				</template>
				<div class="row-box">
					<el-scrollbar max-height="365px">
						<div
							v-for="(
								item, inx
							) of fillBackDialogConf.fllBackItems"
							:key="inx"
							:gutter="20"
							class="mb-10"
						>
							<!-- 源字段 -->
							<el-select
								v-model="item.sourceField"
								placeholder="请选择源字段"
								style="width: 200px"
								size="default"
								:class="{ 'is-error': item.sourceError }"
								@focus="item.sourceError = false"
								clearable
								filterable
								@change="sourceFieldChange(item, inx)"
							>
								<el-option
									v-for="sourceOp in sourceColumn"
									:key="sourceOp.prop"
									:label="
										sourceOp.label +
										'(' +
										sourceOp.formFieldType +
										')'
									"
									:value="sourceOp.prop"
								/>
							</el-select>
							<!-- 标签 -->
							<div class="item-icon-div">
								<span class="item-icon-span">
									<el-icon><DArrowRight /></el-icon>
								</span>
							</div>
							<!-- 目标字段 -->
							<el-select
								v-model="item.targetField"
								placeholder="请选择目标字段"
								style="width: 200px"
								size="default"
								:class="{ 'is-error': item.targetError }"
								@focus="item.targetError = false"
								clearable
								filterable
								@change="targetFieldChange(item)"
							>
								<el-option
									v-for="targetOp in targetColumn"
									:key="targetOp.name"
									:label="
										targetOp.label +
										'(' +
										targetOp.fieldType +
										')'
									"
									:disabled="
										selectedTargetColumn.includes(
											targetOp.name
										) ||
										!item.targetTypes.includes(
											targetOp.fieldType
										)
									"
									:value="targetOp.name"
								/>
							</el-select>
							<!-- 是否强制回填 -->
							<el-checkbox
								v-model="item.forceFillBack"
								size="default"
								class="force-fllbacl"
							>
								强制回填
								<el-tooltip
									class="box-item"
									effect="dark"
									content="勾选后无论目标字段是否有值都将强制回填"
									placement="bottom"
								>
									<span class="question-icon">
										<el-icon><QuestionFilled /></el-icon>
									</span>
								</el-tooltip>
							</el-checkbox>
							<!-- 删除 -->
							<div class="delete-btn" @click="delFllBack(inx)">
								<span class="delete-span-icon">
									<el-icon><Delete /></el-icon>
								</span>
							</div>
						</div>
					</el-scrollbar>
				</div>
				<div class="row-box row-btn">
					<span class="ml-a-span" @click="addFllBack">+ 添加</span>
				</div>
			</el-form-item>
		</div>
		<template #footer>
			<el-button
				@click="fillBackDialogConf.isShow = false"
				:loading="fillBackDialogConf.loading"
				size="default"
			>
				取消
			</el-button>
			<el-button
				type="primary"
				@click="confirmFllBack"
				size="default"
				:loading="fillBackDialogConf.loading"
			>
				确认
			</el-button>
		</template>
	</mlDialog>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, eventMixin, Utils } = VisualDesign.VFormSDK;
import { refFieldQuery } from "@/api/crud";
import { formFieldMapping } from "@/views/system/form-design/formFieldMapping";
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
            subFormName:"",
			defaultFllBackItem: {
				// 源字段
				sourceField: "",
				// 原字段类型
				sourceFieldType: "",
				sourceError: false,
				// 目标字段
				targetField: "",
				targetError: false,
				// 是否强制回填
				forceFillBack: false,
				// 明细实体名称
				targetSubForm: "",
				// 目标字段下拉选项
				targetTypes: [],
			},
			// 源列
			sourceColumn: [],
			// 目标列
			targetColumn: [],
			// 已选目标列
			selectedTargetColumn: [],
			// 回填弹框配置
			fillBackDialogConf: {
				isShow: false,
				loading: false,
				fllBackItems: [],
			},
		};
	},
	inject: ["isSubFormChildWidget"],
	methods: {
		// 打开回填弹框
		openFillBackDialog() {
			this.fillBackDialogConf.isShow = true;
			let optionFillBackConfig = this.optionModel.fillBackConfig || [];
			// 加载已有数据
			this.fillBackDialogConf.fllBackItems = optionFillBackConfig.map(
				(el) => {
					this.selectedTargetColumn.push(el.targetField);
					let newItem = Object.assign({}, el);
					el.sourceError = false;
					el.targetError = false;
					return newItem;
				}
			);
            // 加载第二列数据
			this.loadTargetColumn();
			// 加载第一列数据
			this.loadSourceColumn();
			
		},
		// 加载第一列数据
		async loadSourceColumn() {
			this.fillBackDialogConf.loading = true;
			let entity = this.subFormName || this.$route.query.entity;
			let refField = this.optionModel.name;
			let res = await refFieldQuery(entity, refField, 1, 10, "");
			if (res) {
				this.sourceColumn = res.data.columnList.map((el) => {
					el.formFieldType = formFieldMapping[el.type]?.type;
					return el;
				});
			}
			this.fillBackDialogConf.loading = false;
		},
		// 加载第二列数据
		loadTargetColumn() {
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
			allContainerWidgets.forEach((el) => {
				if (el.type == "sub-form" || el.type == "grid-sub-form") {
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
			// 第2列字段
			let widgetList = [];
			// 取选中字段
			let selectedId = this.designer.selectedId;
			// 如果不是子表单 并且 多行子表单里没有这个选中的组件
			if (
				!this.isSubFormChildWidget() &&
				!gridSubFormIds.includes(selectedId)
			) {
				// 遍历所有字段，把自己和子表单字段排除
				allFieldWidgets.forEach((el) => {
					if (
						el.field.id != selectedId &&
						!subFormFieldIds.includes(el.field.id)
					) {
						widgetList.push({
							name: el.name,
							label: el.field.options.label,
							targetSubForm: "",
							fieldType: el.field.type,
						});
					}
				});
			}
			// 如果是子表单
			else {
				// 取当前子表单名称
				let targetSubForm = "";
				subFormWidgets.forEach((el) => {
					if (el.id == selectedId) {
						targetSubForm = el.targetSubForm;
                        this.subFormName = el.targetSubForm;
					}
				});
				// 取自身子表单所有字段组件，且把自身过滤掉
				subFormWidgets.forEach((el) => {
					if (
						el.targetSubForm == targetSubForm &&
						el.id != selectedId
					) {
						widgetList.push(el);
					}
				});
			}
			this.targetColumn = [...widgetList];
		},
		// 源字段切换
		sourceFieldChange(item, inx) {
			let findColumn = this.sourceColumn.filter(
				(el) => el.prop == item.sourceField
			);
			item.sourceFieldType = findColumn[0]
				? findColumn[0].formFieldType
				: "";
			this.selectedTargetColumn.splice(inx, 1);
			// 字段一对一(只能回填类型跟他一样的)
			item.targetTypes = [item.sourceFieldType];
			item.targetField = "";
		},
		// 目标字段切换
		targetFieldChange(item) {
			let findColumn = this.targetColumn.filter(
				(el) => el.name == item.targetField
			);
			item.targetSubForm = findColumn[0]
				? findColumn[0].targetSubForm
				: "";
			this.selectedTargetColumn.push(item.targetField);
		},
		// 首字母大写
		capitalizeFirstLetter(string) {
			if (!string) {
				return "";
			}
			return string.charAt(0).toUpperCase() + string.slice(1);
		},
		// 添加回填
		addFllBack() {
			this.fillBackDialogConf.fllBackItems.push(
				JSON.parse(JSON.stringify(this.defaultFllBackItem))
			);
		},
		// 删除回填
		delFllBack(inx) {
			this.fillBackDialogConf.fllBackItems.splice(inx, 1);
			this.selectedTargetColumn.splice(inx, 1);
		},
		// 回填弹框确认
		confirmFllBack() {
			// 把至少选了1个的给过滤出来
			let fllBackItems = this.fillBackDialogConf.fllBackItems.filter(
				(el) => el.sourceField || el.targetField
			);
			// 如果有数据
			if (fllBackItems.length > 0) {
				// 遍历数据
				for (let index = 0; index < fllBackItems.length; index++) {
					const el = fllBackItems[index];
					// 如果源字段为空，标红
					if (!el.sourceField) {
						el.sourceError = true;
						return;
					}
					// 如果目标字段为空，标红
					if (!el.targetField) {
						el.targetError = true;
						return;
					}
				}
				this.optionModel.fillBackConfig = fllBackItems.map((el) => {
					let newItem = Object.assign({}, el);
					delete newItem.sourceError;
					delete newItem.targetError;
					return newItem;
				});
			} else {
				this.optionModel.fillBackConfig = [];
			}
			this.fillBackDialogConf.isShow = false;
		},
	},
};
</script>
<style lang="scss" scoped>
:deep(.el-form-item__label) {
	height: 32px;
}
.fillBack-help-icon {
	position: relative;
	top: 5px;
	margin-left: 3px;
	cursor: pointer;
	font-size: 14px;
}
.form-label {
	line-height: 32px;
	font-size: 14px;
	position: relative;
}
.has-row {
	.form-label {
		top: 3px;
	}
	.fillBack-help-icon {
		top: 8px;
	}
}

.row-box {
	width: 100%;
	box-sizing: border-box;
	line-height: 32px;
	font-size: 14px;
	&.row-btn {
		padding-left: 10px;
	}
	.item-icon-div {
		display: inline-block;
		height: 32px;
		width: 40px;
		text-align: center;
		.item-icon-span {
			position: relative;
			top: 4px;
		}
	}
	.force-fllbacl {
		margin-left: 20px;
		position: relative;
		top: 3px;
		.question-icon {
			position: relative;
			top: 1px;
		}
	}
	.delete-btn {
		float: right;
		width: 23px;
		height: 23px;
		box-sizing: border-box;
		border: 1px solid #747679;
		margin-top: 8px;
		border-radius: 50%;
		text-align: center;
		font-size: 13px;
		cursor: pointer;
		.delete-span-icon {
			color: #747679;
			position: relative;
			top: -3px;
		}
		&:hover {
			background: #747679;
			.delete-span-icon {
				color: #fff;
			}
		}
	}
}
</style>
