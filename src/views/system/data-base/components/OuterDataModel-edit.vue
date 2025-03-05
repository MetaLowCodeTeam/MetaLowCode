<template>
	<ml-dialog :title="title" v-model="isShow" appendToBody width="55%">
		<div v-loading="loading">
			<el-form ref="formRef" :model="formData" :rules="rules">
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="模型名称" prop="modelName">
							<el-input
								v-model="formData.modelName"
								placeholder="请输入模型名称"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="数据源" prop="dataSourceLabel">
							<el-input
								v-model="formData.dataSourceLabel"
								placeholder="请选择数据源"
							>
								<template #append>
									<el-button
										type="primary"
										@click="openDataSourceDialog"
										icon="Search"
									/>
								</template>
							</el-input>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="是否禁用" prop="isDisabled">
							<el-radio-group v-model="formData.isDisabled">
								<el-radio :label="true">是</el-radio>
								<el-radio :label="false">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="sql语句" prop="sqlText">
							<el-input v-model="formData.sqlText" />
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</div>
		<template #footer>
			<el-button @click="cancel">取消</el-button>
			<el-button type="primary" @click="confirm" icon="Select">
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
		/>
	</ml-dialog>
	<!-- 引用组件 -->
	<!-- <ReferenceSearchTable
		entity="OuterDataModel"
		refField="dataSource"
		@recordSelected="recordSelected"
	/> -->
</template>
<script setup>
import { ref } from "vue";
// 引用组件
import ReferenceSearchTable from "@/components/mlReferenceSearch/reference-search-table.vue";

let loading = ref(false);
let isShow = ref(false);
let title = ref("");
let detailId = ref("");
let entityName = ref("");

let formData = ref({
	modelName: "",
	dataSource: "",
	dataSourceLabel: "",
	isDisabled: false,
    sqlText:"",
});

let rules = ref({
	modelName: [{ required: true, message: "请输入模型名称", trigger: "blur" }],
	dataSourceLabel: [
		{ required: true, message: "请选择数据源", trigger: "blur" },
	],
	isDisabled: [{ required: true, message: "请选择是否禁用", trigger: "blur" }],
});

const openDialog = (data) => {
	isShow.value = true;
	title.value = data.title;
	detailId.value = data.detailId;
	entityName.value = data.entityName;
	console.log(data, "data");
};

const cancel = () => {
	isShow.value = false;
};

const formRef = ref();
const confirm = () => {
	formRef.value.validate((valid) => {
		if (valid) {
			console.log(formData.value, "formData");
		}
	});
};

let showReferenceDialogFlag = ref(false);
const openDataSourceDialog = () => {
	showReferenceDialogFlag.value = true;
};

const recordSelected = (record) => {
	formData.value.dataSource = record.id;
	formData.value.dataSourceLabel = record.label;
	showReferenceDialogFlag.value = false;
};

defineExpose({
	openDialog,
});
</script>
