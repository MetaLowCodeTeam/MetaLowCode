<template>
	<ml-dialog v-model="dialogConfig.isShow" title="设置动作">
		<div></div>
		<template #footer>
			<el-button @click="closeDialog">取消</el-button>
			<el-button type="primary" @click="confirmAction">确认</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";

const dialogConfig = ref({
	isShow: false,
	data: {},
});

const openDialog = (data) => {
	dialogConfig.value.data = JSON.parse(JSON.stringify(data));
	dialogConfig.value.isShow = true;
};
const closeDialog = () => {
	dialogConfig.value.isShow = false;
};

const confirmAction = () => {
	console.log(dialogConfig.value.data);
	dialogConfig.value.isShow = false;
};

defineExpose({
	openDialog,
});
</script>

<style scoped>
/* Styles here */
</style>
