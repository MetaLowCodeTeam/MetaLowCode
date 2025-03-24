<template>
	<ml-dialog
		v-model="isShow"
		:title="title"
		width="500px"
		draggable
		:show-close="!loading"
	>
		<div v-loading="loading" element-loading-text="加载中...">
			<el-form
				ref="formRef"
				:model="form"
				:rules="rules"
				label-width="80px"
			>
				<el-form-item label="租户名称" prop="tenantName">
					<el-input
						v-model="form.tenantName"
						clearable
						maxlength="255"
					/>
				</el-form-item>
				<el-form-item label="租户编码" prop="tenantCode">
					<el-input
						v-model="form.tenantCode"
						clearable
						maxlength="255"
					/>
				</el-form-item>
				<el-form-item label="启用" prop="isDisabled">
					<el-switch v-model="form.isDisabled" :active-value="false" :inactive-value="true" />
				</el-form-item>
			</el-form>
		</div>
		<template #footer>
			<el-button type="primary" @click="beforeSave">保存</el-button>
			<el-button @click="isShow = false">取消</el-button>
		</template>
	</ml-dialog>
</template>
<script setup>
import { ref } from "vue";
import { saveTenantRecord } from "@/api/plugins";
import { ElMessage } from "element-plus";
const emits = defineEmits(["refresh"]);
let isShow = ref(false);
let loading = ref(false);
let title = ref("");
let form = ref({
	tenantName: "",
	tenantCode: "",
	isDisabled: false,
});
let rules = ref({
	tenantName: [
		{ required: true, message: "请输入租户名称", trigger: "blur" },
	],
	tenantCode: [
		{ required: true, message: "请输入租户编码", trigger: "blur" },
	],
});

const openDialog = (row) => {
	isShow.value = true;
	title.value = row.tenantId ? "编辑" + row.tenantName : "新增租户";
	if (row.tenantId) {
		form.value = {
			tenantName: row.tenantName,
			tenantCode: row.tenantCode,
			isDisabled: row.isDisabled,
			tenantId: row.tenantId,
		};
	}
};
const formRef = ref("");
const beforeSave = () => {
	formRef.value.validate(async (valid) => {
		if (valid) {
			onSave(form.value);
		}
	});
};

const onSave = async (data) => {
	loading.value = true;
	let res = await saveTenantRecord('Tenant', data.tenantId, data);
	if (res && res.code == 200) {
		ElMessage.success("保存成功");
		isShow.value = false;
        emits("refresh");
	}
	loading.value = false;
};

defineExpose({
	openDialog,
    onSave
});
</script>
