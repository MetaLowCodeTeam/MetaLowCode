<style lang="scss" scoped></style>
<!-- 新建、编辑部门 -->
<template>
	<!--  -->
	<EntityListEdit
		ref="editRefs"
		:editConf="editConf"
		:unDisableWidgets="['parentDepartmentId']"
		nameFieldName="departmentName"
	>
		<template #beforeConfirmBtn>
			<el-button type="primary" @click="onSave" :loading="loading">
				保存
			</el-button>
		</template>
	</EntityListEdit>
</template>

<script setup>
import { ref } from "vue";

import EntityListEdit from "@/views/customize-menu/edit.vue";
import { ElMessage } from "element-plus";
import { saveDepartment } from "@/api/user";
const emit = defineEmits(["onRefresh"]);

let editRefs = ref();

let loading = ref(false);

let editConf = ref({
	// 是否显示底部
	showFooter: true,
	// 是否显示确认按钮
	showConfirmBtn: false,
	// 是否显示取消按钮
	showCancelBtn: true,
	showConfirmRefreshBtn: false,
});

let curDepartmentId = ref();

const openDialog = (id, node) => {
	if (id === "0000022-00000000000000000000000000000001") {
		ElMessage.info("根部门不可编辑！");
		return;
	}
	curDepartmentId.value = id;
	let tempV = {
		entityName: "Department",
	};
	// 编辑
	if (id) {
		tempV.detailId = id;
		tempV.localDsv = {
			filterConditions: {
				equal: "OR",
				items: [
					{
						fieldName: "departmentId",
						op: "NBTD",
						value: id,
					},
				],
			},
		};
	}
	// 新建
	else {
		tempV.fieldName = "parentDepartmentId";
		tempV.fieldNameLabel = node?.data?.label;
		tempV.fieldNameVale = node?.data?.id;
	}
	console.log(tempV, "tempV");
	editRefs.value?.openDialog(tempV);
};

const onSave = () => {
	editRefs.value
		.getFormRef()
		.getFormData()
		.then(async (formData) => {
			editRefs.value.loading = true;
			loading.value = true;
			let res = await saveDepartment(
				"Department",
				curDepartmentId.value,
				formData
			);
			if (res && res.data && res.data.code == 200) {
				ElMessage.success("保存成功");
				emit("onRefresh");
				editRefs.value.cancel();
			}
			editRefs.value.loading = false;
			loading.value = false;
		})
		.catch((err) => {
			console.log(err, "err");
			ElMessage.error("数据校验失败");
		});
};

defineExpose({
	openDialog,
});
</script>
