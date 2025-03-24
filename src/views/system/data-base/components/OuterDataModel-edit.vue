<template>
	<ml-dialog
		:title="title"
		v-model="isShow"
		appendToBody
		width="55%"
		:show-close="!loading"
		scrollbarHeight="500px"
	>
		<div v-loading="loading">
			<el-form ref="formRef" :model="formData" :rules="rules">
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="模型名称" prop="modelName">
							<el-input
								v-model="formData.modelName"
								placeholder="请输入模型名称"
								:disabled="isView"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="数据源" prop="dataSourceLabel">
							<el-input
								v-model="formData.dataSourceLabel"
								placeholder="请选择数据源"
								:disabled="isView"
							>
								<template #append>
									<el-button
										type="primary"
										@click="openDataSourceDialog"
										icon="Search"
										:disabled="isView"
									/>
								</template>
							</el-input>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="是否禁用" prop="isDisabled">
							<el-radio-group
								v-model="formData.isDisabled"
								:disabled="isView"
							>
								<el-radio :label="true">是</el-radio>
								<el-radio :label="false">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="SQL文本" prop="sqlText">
							<div class="w-100">
								<mlCodeEditor
									v-model="formData.sqlText"
									mode="sql"
									height="200"
									:disabled="isView"
								/>
							</div>
							<div class="mt-10">
								<el-button
									type="success"
									@click="testSql"
									:disabled="isView"
								>
									SQL解析
								</el-button>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-collapse v-model="activeNames">
							<el-collapse-item title="SQL参数" name="sqlParams">
								<el-table
									:data="formData.sqlParams"
									:border="true"
									max-height="300"
								>
									<el-table-column prop="name">
										<template #header>
											<span class="is-required">*</span>
											参数显示名称
										</template>
										<template #default="scope">
											<el-input
												v-model="scope.row.paramLabel"
												:class="{
													'is-error':
														scope.row
															.paramLabelError,
												}"
												@focus="
													scope.row.paramLabelError = false
												"
												:disabled="isView"
												clearable
											/>
										</template>
									</el-table-column>
									<el-table-column prop="code">
										<template #header>
											<span class="is-required">*</span>
											参数名称
										</template>
										<template #default="scope">
											<el-input
												v-model="scope.row.paramName"
												disabled
											/>
										</template>
									</el-table-column>
									<el-table-column prop="type">
										<template #header>
											<span class="is-required">*</span>
											参数类型
										</template>
										<template #default="scope">
											<el-select
												v-model="scope.row.paramType"
												placeholder="请选择参数类型"
												:class="{
													'is-error':
														scope.row
															.paramTypeError,
												}"
												@focus="
													scope.row.paramTypeError = false
												"
												:disabled="isView"
											>
												<el-option
													v-for="item in optionItems"
													:key="item.value"
													:label="item.label"
													:value="item.value"
												/>
											</el-select>
										</template>
									</el-table-column>
									<el-table-column prop="isRequired">
										<template #header>
											<span class="is-required">*</span>
											必填
										</template>
										<template #default="scope">
											<el-radio-group
												v-model="scope.row.isRequired"
												:disabled="isView"
											>
												<el-radio :label="true">
													是
												</el-radio>
												<el-radio :label="false">
													否
												</el-radio>
											</el-radio-group>
										</template>
									</el-table-column>
									<el-table-column
										prop="defaultValue"
										label="默认值"
									>
										<template #default="scope">
											<el-input
												v-model="scope.row.defaultValue"
												clearable
												:disabled="isView"
											/>
										</template>
									</el-table-column>
								</el-table>
							</el-collapse-item>
							<el-collapse-item
								title="查询字段"
								name="queryFields"
							>
								<el-table
									:data="formData.queryFields"
									:border="true"
									max-height="300"
								>
									<el-table-column
										prop="fieldName"
										label="字段名"
									/>
									<el-table-column
										prop="fieldLabel"
										label="显示名称"
									>
										<template #default="scope">
											<el-input
												v-model="scope.row.fieldLabel"
												clearable
												:disabled="isView"
											/>
										</template>
									</el-table-column>
								</el-table>
							</el-collapse-item>
						</el-collapse>
					</el-col>
				</el-row>
			</el-form>
		</div>
		<template #footer>
			<el-button @click="cancel" :loading="loading">取消</el-button>
			<el-button
				type="primary"
				@click="confirm"
				icon="Select"
				:loading="loading"
				v-if="!isView"
			>
				保存
			</el-button>
		</template>
	</ml-dialog>
	<ml-dialog
		title="请选择数据源"
		width="540"
		draggable
		appendToBody
		v-model="showReferenceDialogFlag"
	>
		<ReferenceSearchTable
			entity="OuterDataModel"
			refField="dataSource"
			@recordSelected="recordSelected"
            :filterConditions="filterConditions"
		/>
	</ml-dialog>
</template>
<script setup>
import { ref, watch, reactive } from "vue";
// 引用组件
import ReferenceSearchTable from "@/components/mlReferenceSearch/reference-search-table.vue";
// 代码编辑器
import mlCodeEditor from "@/components/mlCodeEditor/index.vue";
// 消息提示
import { ElMessage } from "element-plus";
// 接口
import { queryModelField } from "@/api/plugins";
import { getOptionItems } from "@/api/system-manager";
import { queryById, saveRecord } from "@/api/crud";

const emit = defineEmits(["updateData"]);

let loading = ref(false);
let isShow = ref(false);
let title = ref("");
let detailId = ref("");
let entityName = ref("");
let isView = ref(false);

const defaultData = reactive({
	modelName: "",
	dataSource: "",
	dataSourceLabel: "",
	isDisabled: false,
	sqlText: "",
	queryFields: [],
	sqlParams: [],
	// sql解析状态
	sqlTestStatus: false,
});

let formData = ref({});

let rules = ref({
	modelName: [{ required: true, message: "请输入模型名称", trigger: "blur" }],
	dataSourceLabel: [
		{ required: true, message: "请选择数据源", trigger: "blur" },
	],
	isDisabled: [
		{ required: true, message: "请选择是否禁用", trigger: "blur" },
	],
	sqlText: [{ required: true, message: "请输入SQL语句", trigger: "blur" }],
});

const openDialog = (data) => {
	isShow.value = true;
	title.value = data.title;
	detailId.value = data.detailId;
	entityName.value = data.entityName;
	formData.value = Object.assign({}, defaultData);
	isView.value = data.type == "view";
	loadOptionItems();
};

const optionItems = ref([]);
// 加载参数选项
const loadOptionItems = async () => {
	loading.value = true;
	let res = await getOptionItems("ModelParam", "paramType");
	if (res && res.data) {
		optionItems.value = res.data;
	}
	if (detailId.value) {
		let res = await queryById(detailId.value);
		if (res && res.code == 200) {
			formData.value = Object.assign({}, defaultData, {
				modelName: res.data.modelName,
				dataSource: res.data.dataSource.id,
				dataSourceLabel: res.data.dataSource.name,
				isDisabled: res.data.isDisabled,
				sqlText: res.data.sqlText,
				queryFields: [...res.data.ModelField],
				sqlParams: res.data.ModelParam.map((el) => {
					el.paramLabelError = false;
					el.paramTypeError = false;
					return el;
				}),
			});
		}
	}
	loading.value = false;
};

const cancel = () => {
	isShow.value = false;
};

const formRef = ref();
// 保存
const confirm = () => {
	formRef.value.validate(async (valid) => {
		if (valid) {
			// 检查SQL解析状态
			if (!formData.value.sqlTestStatus) {
				ElMessage.error("请先解析SQL");
				return;
			}
			// 检查SQL参数是否全部填写
			let allParamsFilled = true;
			formData.value.sqlParams.forEach((param) => {
				if (!param.paramType || !param.paramLabel) {
					allParamsFilled = false;
					if (!param.paramType) {
						param.paramTypeError = true;
					}
					if (!param.paramLabel) {
						param.paramLabelError = true;
					}
				}
			});

			if (!allParamsFilled) {
				ElMessage.error("请填写所有必填的SQL参数");
				return;
			}

			let params = {
				modelName: formData.value.modelName,
				dataSource: formData.value.dataSource,
				isDisabled: formData.value.isDisabled,
				sqlText: formData.value.sqlText,
				ModelParam: formData.value.sqlParams,
				ModelField: formData.value.queryFields,
			};
			loading.value = true;
			let res = await saveRecord(
				"OuterDataModel",
				detailId.value,
				params
			);
			if (res && res.code == 200) {
				ElMessage.success("保存成功");
				loading.value = false;
				isShow.value = false;
				emit("updateData");
			}
		}
	});
};

// 测试SQL
const testSql = () => {
	formRef.value.validate(async (valid) => {
		if (valid) {
			loading.value = true;
			let params = {
				sqlText: formData.value.sqlText,
				sourceId: formData.value.dataSource,
			};
			let res = await queryModelField(params);
			if (res && res.code == 200) {
				if (!res.data.fieldList || res.data.fieldList.length == 0) {
					ElMessage.error("未查询到有效字段");
					return;
				}
				// 使用新的通用函数处理字段和参数
				formData.value.queryFields = mapFieldsAndParams(
					res.data.fieldList,
					formData.value.queryFields,
					"fieldName",
					{
						fieldLabel: "",
					}
				);
				formData.value.sqlParams = mapFieldsAndParams(
					res.data.paramList,
					formData.value.sqlParams,
					"paramName",
					{
						paramLabel: "",
						paramLabelError: false,
						paramType: "",
						paramTypeError: false,
						isRequired: true,
						defaultValue: "",
					}
				);
				formData.value.sqlTestStatus = true;
				ElMessage.success("SQL解析成功");
			}

			loading.value = false;
		}
	});
};

// 新增通用函数
function mapFieldsAndParams(dataList, existingList, key, defaultValues) {
	if (!dataList || dataList.length === 0) {
		return [];
	}
	let newMap = {};
	existingList.forEach((el) => {
		newMap[el[key]] = el;
	});
	return dataList.map((el) => {
		if (newMap[el]) {
			return newMap[el];
		} else {
			return {
				[key]: el,
				...defaultValues,
			};
		}
	});
}
// 过滤条件
const filterConditions = ref({});
// 打开选择数据源弹框
let showReferenceDialogFlag = ref(false);
const openDataSourceDialog = () => {
    filterConditions.value = {
        equation: "OR",
		items: [
            {
                fieldName: 'isDisabled',
                value: false,
                op: "EQ",
            }
        ],
    };
	showReferenceDialogFlag.value = true;
};
// 确认选择数据源
const recordSelected = (record) => {
	formData.value.dataSource = record.id;
	formData.value.dataSourceLabel = record.label;
	showReferenceDialogFlag.value = false;
};

// 监听数据源和SQL文本的变化 如果有变化就改变状态
watch([() => formData.value.dataSource, () => formData.value.sqlText], () => {
	formData.value.sqlTestStatus = false;
});

const activeNames = ref(["sqlParams", "queryFields"]); // 默认展开的项

defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped>
:deep(.el-form-item) {
	align-items: initial !important;
}
.is-required {
	color: #f56c6c;
}
</style>
