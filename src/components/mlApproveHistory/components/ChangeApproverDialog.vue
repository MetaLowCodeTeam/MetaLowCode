<template>
	<!--  -->
	<ml-dialog title="修改审批人" v-model="isShow" appendToBody width="500">
		<div v-loading="loading" element-loading-text="数据保存中...">
			<mlSelectUser v-model="userList" multiple clearable type="User" />
		</div>
		<template #footer>
			<el-button @click="isShow = false" :loading="loading">
				取 消
			</el-button>
			<el-button type="primary" @click="onSubmit" :loading="loading">
				保 存
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
/**
 * API
 */
import { updateApprovalUser } from "@/api/approval";
import { ElMessage } from "element-plus";
const emit = defineEmits('onChange')
let loading = ref(false);
let isShow = ref(false);
let approvalTaskId = ref("");
let userList = ref([]);
const openDialog = (activity) => {
	isShow.value = true;
	approvalTaskId.value = activity.approvalTaskId;
	userList.value = JSON.parse(JSON.stringify(activity.stepUserList));
};

const onSubmit = async () => {
	loading.value = true;
    let res = await updateApprovalUser(approvalTaskId.value, userList.value.map(el => el.id));
    if(res && res.code == 200){
        ElMessage.success("修改成功");
        emit('onChange')
		isShow.value = false;
    }
    loading.value = false;
};

defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped></style>
