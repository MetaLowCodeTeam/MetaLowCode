<template>
	<el-dialog v-model="dialogVisible" width="800px" class="ml-dialog model-association-edit-dialog" append-to-body :close-on-click-modal="false" destroy-on-close>
		<template #header>
			<span class="my-title">{{ dialogTitle }}</span>
		</template>
		<div class="ml-dialog-body" style="max-height: 500px">
			<el-form ref="formRef" :model="formData" :rules="rules" label-position="top" v-loading="loading">
				<el-form-item label="选择数据模型" prop="mainModel">
					<el-select v-model="formData.mainModel" placeholder="请选择数据模型" filterable :disabled="isEditMode" style="width: 100%">
						<el-option v-for="item in mainModelOptions" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
				</el-form-item>
				<el-form-item label="数据别名" prop="modelAssociationLabel">
					<el-input v-model="formData.modelAssociationLabel" placeholder="请输入数据别名" clearable />
				</el-form-item>
				<el-form-item label="设置数据类型" prop="isArray">
					<el-radio-group v-model="formData.isArray" :disabled="isEditMode">
						<el-radio :label="false">单条（展示单条记录数据）</el-radio>
						<el-radio :label="true">多条（展示多条记录列表）</el-radio>
					</el-radio-group>
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
import { computed, ref } from "vue";
import { crudListQuery } from "@/api/crud";
import { getGuid } from "@/utils/util";

const emit = defineEmits(["save"]);

const dialogVisible = ref(false);
const loading = ref(false);
const dialogTitle = ref("");
const editId = ref("");
const subModelId = ref("");
const subModelName = ref("");

const formData = ref({
	dataCode: "",
	mainModel: "",
	modelAssociationLabel: "",
	isArray: false,
});

const formRef = ref();

const rules = ref({
	mainModel: [{ required: true, message: "请选择数据模型", trigger: "change" }],
	modelAssociationLabel: [{ required: true, message: "请输入数据别名", trigger: "blur" }],
	isArray: [{ required: true, message: "请设置数据类型", trigger: "change" }],
});

const mainModelOptions = ref([]);
const mainModelLabelMap = ref({});

const isEditMode = computed(() => !!editId.value);

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

const openDialog = async (data) => {
	subModelId.value = data.subModelId || "";
	subModelName.value = data.subModelName;
	editId.value = data.editId || "";

	dialogTitle.value = data.editId ? `编辑 ${data.editLabel || ""}` : "添加数据模型";

	formData.value = {
		dataCode: data.dataCode || getGuid(),
		mainModel: data.mainModel || "",
		modelAssociationLabel: data.modelAssociationLabel || "",
		isArray: data.isArray ?? false,
	};

	dialogVisible.value = true;
	loading.value = true;

	await loadMainModelOptions();

	loading.value = false;
};

const closeDialog = () => {
	dialogVisible.value = false;
};

const confirm = () => {
	formRef.value.validate((valid) => {
		if (!valid) return;
		emit("save", {
			dataCode: formData.value.dataCode,
			mainModel: formData.value.mainModel,
			modelAssociationLabel: formData.value.modelAssociationLabel,
			isArray: formData.value.isArray,
		});
		dialogVisible.value = false;
	});
};

defineExpose({ openDialog });
</script>

<style lang="scss">
.model-association-edit-dialog .ml-dialog-body {
	padding: 20px;
}
</style>
