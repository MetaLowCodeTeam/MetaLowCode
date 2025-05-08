<!--
 * @DesCription: 自定义流程表单编辑弹框。
 * 
-->
<template>
	<!--  -->
	<EntityListEdit ref="EntityListEditRefs" :editConf="editConf">
		<!-- 更多插槽看 第4行 API -->
		<template #beforeConfirmBtn>
			<el-button :loading="loading" type="primary" @click="onSubmit()">
				{{ loading ? "提交中..." : "提交" }}
			</el-button>
		</template>
	</EntityListEdit>
</template>

<script setup>
import { saveRecordAndStartProcess } from "@/api/crud";
import { ElMessage } from "element-plus";
/**
 * 自定义实体详情
 */
// 1 引入详情组件
import EntityListEdit from "@/views/customize-menu/edit.vue";
// 2 定义该详情组件名称
defineOptions({
	name: "custom-glow-form-edit",
});
import { ref } from "vue";

let editConf = ref({
	// 是否显示底部
	showFooter: true,
	// 是否显示确认按钮
	showConfirmBtn: false,
	// 是否显示取消按钮
	showCancelBtn: true,
	showConfirmRefreshBtn: false,
    showConfirmAndSubmitBtn: false,
});
let entityName = ref("");
let approvalConfigId = ref("");
// 打开详情
let EntityListEditRefs = ref();
const openDialog = (tempV) => {
	entityName.value = tempV.entityName;
	approvalConfigId.value = tempV.approvalConfigId;
	EntityListEditRefs.value?.openDialog(tempV);
};

let loading = ref(false);
const onSubmit = () => {
	let vFormRef = EntityListEditRefs.value.getFormRef();

	let listSubForm = [];
	vFormRef.getContainerWidgets().forEach((el) => {
		if (el.type == "list-sub-form") {
			listSubForm.push(el.name);
		}
	});
	vFormRef.getFormData().then(async (formData) => {
		if (formData) {
			listSubForm.forEach((el) => {
				delete formData[el];
			});
			loading.value = true;
			EntityListEditRefs.value.loading = loading.value;
			let saveRes = await saveRecordAndStartProcess(
				entityName.value,
				null,
				approvalConfigId.value,
				formData
			);
			if (saveRes && (saveRes.data?.code == 200 || saveRes.code == 200)) {
				ElMessage.success("提交成功");
				EntityListEditRefs.value?.cancel();
			}
			loading.value = false;
			EntityListEditRefs.value.loading = loading.value;
		}
	});
};

defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped></style>
