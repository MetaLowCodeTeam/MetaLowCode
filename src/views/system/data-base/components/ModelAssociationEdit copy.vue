<template>
	<el-dialog v-model="dialogVisible" width="800px" class="ml-dialog model-association-edit-dialog" append-to-body :close-on-click-modal="false" destroy-on-close>
		<template #header>
			<span class="my-title">{{ dialogTitle }}</span>
		</template>
		<div class="ml-dialog-body" style="max-height: 500px">
			<el-form ref="formRef" :model="formData" :rules="rules" label-position="top" v-loading="loading">
				<el-form-item label="选择主数据模型" prop="mainModel">
					<el-select v-model="formData.mainModel" placeholder="请选择主数据模型" filterable @change="handleMainModelChange" style="width: 100%">
						<el-option v-for="item in mainModelOptions" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
				</el-form-item>
				<el-form-item label="数据关联名称" prop="modelAssociationLabel">
					<el-input v-model="formData.modelAssociationLabel" placeholder="请输入数据关联名称" clearable />
				</el-form-item>
				<el-form-item label="设置数据类型" prop="isArray">
					<el-radio-group v-model="formData.isArray">
						<el-radio :label="false">单条（展示单条记录数据）</el-radio>
						<el-radio :label="true">多条（展示多条记录列表）</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="配置查询字段">
					<el-table :data="configRows" border style="width: 100%">
						<el-table-column label="模型查询字段" width="200">
							<template #default="scope">
								{{ scope.row.paramName }}<span v-if="scope.row.isRequired" class="is-required">*</span>
							</template>
						</el-table-column>
						<el-table-column label="映射方式" width="160">
							<template #default="scope">
							<el-select v-model="scope.row.mappingType" placeholder="请选择" @change="scope.row.mappingValue = ''">
								<el-option label="字段值" value="FIELD_VALUE" />
								<el-option label="固定值" value="FIXED_VALUE" />
								<el-option label="置空" value="NULL_VALUE" />
							</el-select>
							</template>
						</el-table-column>
						<el-table-column label="映射值">
							<template #default="scope">
								<template v-if="scope.row.mappingType === 'FIELD_VALUE'">
									<el-select
										v-model="scope.row.mappingValue"
										placeholder="请选择字段"
										:class="{ 'is-error': scope.row.isError }"
										@focus="scope.row.isError = false"
									>
										<el-option v-for="field in modelFieldOptions" :key="field.value" :label="field.label" :value="field.value" />
									</el-select>
								</template>
								<template v-else-if="scope.row.mappingType === 'FIXED_VALUE'">
									<el-input
										v-model="scope.row.mappingValue"
										placeholder="请输入固定值"
										:class="{ 'is-error': scope.row.isError }"
										@focus="scope.row.isError = false"
									/>
								</template>
							</template>
						</el-table-column>
					</el-table>
				</el-form-item>
			</el-form>
		</div>
		<template #footer>
			<el-button @click="closeDialog">取消</el-button>
			<el-button type="primary" @click="confirm" :loading="loading">保存</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { crudListQuery, queryById } from "@/api/crud";
import http from "@/utils/request";

const emit = defineEmits(["updateList"]);

const dialogVisible = ref(false);
const loading = ref(false);
const dialogTitle = ref("");
const editId = ref("");
const subModelId = ref("");
const subModelName = ref("");

const formData = ref({
	mainModel: "",
	modelAssociationLabel: "",
	isArray: false,
});

const formRef = ref();

const rules = ref({
	mainModel: [{ required: true, message: "请选择主数据模型", trigger: "change" }],
	modelAssociationLabel: [{ required: true, message: "请输入数据关联名称", trigger: "blur" }],
	isArray: [{ required: true, message: "请设置数据类型", trigger: "change" }],
});

const mainModelOptions = ref([]);
const modelFieldOptions = ref([]);
const configRows = ref([]);
const mainModelLabelMap = ref({});

const loadMainModelOptions = async () => {
	try {
		let res = await crudListQuery({
			mainEntity: "OuterDataModel",
			fieldsList: "modelName,outerDataModelId",
			pageNo: 1,
			pageSize: 500,
		});
		if (res?.code == 200) {
			let map = {};
			mainModelOptions.value = (res.data.dataList || []).map((el) => {
				map[el.outerDataModelId] = el.modelName;
				return { label: el.modelName, value: el.outerDataModelId };
			});
			mainModelLabelMap.value = map;
		}
	} catch (error) {
		console.error(error);
	}
};

const loadModelParam = async (id) => {
	try {
		let res = await queryById(id);
		if (res?.code == 200) {
			configRows.value = (res.data.ModelParam || []).map((el) => ({
				queryParamName: el.paramName,
				paramName: el.paramName,
				isRequired: el.isRequired,
				mappingType: "FIELD_VALUE",
				mappingValue: "",
				isError: false,
			}));
		}
	} catch (error) {
		console.error(error);
	}
};

const loadModelField = async (id) => {
	if (!id) {
		modelFieldOptions.value = [];
		return;
	}
	try {
		let res = await queryById(id);
		if (res?.code == 200) {
			modelFieldOptions.value = (res.data.ModelField || []).map((el) => ({
				label: el.fieldLabel || el.fieldName,
				value: el.fieldName,
			}));
		}
	} catch (error) {
		console.error(error);
	}
};

const handleMainModelChange = (val) => {
	loadModelField(val);
};

const openDialog = async (data) => {
	subModelId.value = data.subModelId;
	subModelName.value = data.subModelName;
	editId.value = data.editId || "";

	dialogTitle.value = data.editId ? `编辑 ${data.editLabel || ""}` : "添加数据模型";

	formData.value = {
		mainModel: "",
		modelAssociationLabel: "",
		isArray: false,
	};
	configRows.value = [];
	modelFieldOptions.value = [];

	dialogVisible.value = true;
	loading.value = true;

	await loadMainModelOptions();
	await loadModelParam(subModelId.value);

	if (editId.value) {
		try {
			let res = await queryById(editId.value);
			if (res?.code == 200) {
				formData.value.mainModel = res.data.mainModel?.id || "";
				formData.value.modelAssociationLabel = res.data.modelAssociationLabel || "";
				formData.value.isArray = res.data.isArray ?? false;
				if (res.data.mainModel?.id) {
					loadModelField(res.data.mainModel.id);
				}
				if (res.data.associationConfig) {
					try {
						let parsed = JSON.parse(res.data.associationConfig);
						parsed.forEach((item, index) => {
							if (configRows.value[index]) {
								configRows.value[index].mappingType = item.mappingType || "";
								configRows.value[index].mappingValue = item.mappingValue || "";
							}
						});
					} catch (e) {
						console.error("associationConfig parse error", e);
					}
				}
			}
		} catch (error) {
			console.error(error);
		}
	}

	loading.value = false;
};

const closeDialog = () => {
	dialogVisible.value = false;
};

const confirm = () => {
	formRef.value.validate((valid) => {
		if (!valid) return;

		let hasError = false;
		configRows.value.forEach((row) => {
			row.isError = false;
			if (row.isRequired && row.mappingType !== "NULL_VALUE" && !row.mappingValue) {
				row.isError = true;
				hasError = true;
			}
		});
		if (hasError) return;

		let associationConfig = configRows.value.map((row) => ({
			queryParamName: row.queryParamName,
			mappingType: row.mappingType,
			mappingValue: row.mappingValue,
		}));

		let param = {
			mainModel: formData.value.mainModel,
			subModel: subModelId.value,
			modelAssociationLabel: formData.value.modelAssociationLabel,
			isArray: formData.value.isArray,
			associationConfig: JSON.stringify(associationConfig),
		};

		loading.value = true;
		http.post("/plugins/metaDataWarehouse/outerData/modelAssociation/saveRecord", param, {
			params: {
				modelAssociationId: editId.value || null,
				mainModel: formData.value.mainModel,
				subModel: subModelId.value,
			},
		}).then((res) => {
			if (res?.code == 200) {
				loading.value = false;
				emit("updateList");
				dialogVisible.value = false;
			}
		}).catch(() => {
			loading.value = false;
		});
	});
};

defineExpose({ openDialog });
</script>

<style scoped lang="scss">
.is-required {
	color: #f56c6c;
}
:deep(.is-error) {
	.el-input__wrapper,
	.el-select__wrapper {
		box-shadow: 0 0 0 1px #f56c6c inset !important;
	}
}
</style>

<style lang="scss">
.model-association-edit-dialog .ml-dialog-body {
	padding: 20px;
}
</style>
