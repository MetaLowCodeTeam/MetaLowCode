<template>
	<ml-dialog :title="title" v-model="isShow" width="400px">
		<el-form>
			<el-form-item label="编码">
				<el-input v-model="fromData.code" clearable />
			</el-form-item>
			<el-form-item label="名称">
				<el-input v-model="fromData.label" clearable />
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button type="primary" @click="onConfirm">确认</el-button>
			<el-button @click="closeDialog">取消</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["confirm"]);

let isShow = ref(false);
let title = ref("");
let fromData = ref({});




const openDialog = (data) => {
	isShow.value = true;
	title.value = data ? "编辑编码单选项" : "新增编码单选项";
	fromData.value = data || {};
};

const closeDialog = () => {
	isShow.value = false;
};

const onConfirm = () => {
	let { code, label } = fromData.value;
	let labelReg = /^[^\s,](?:.*[^\s,])?$/;
	if (!code) {
		ElMessage.warning("编码不能为空");
		return;
	}
	if (!labelReg.test(label)) {
		ElMessage.warning("名称不能包含空格或逗号");
		return;
	}
	if (label.indexOf("/") !== -1) {
		ElMessage.warning("选项名称不能包含【/】");
		return;
	}
	emit("confirm", fromData.value);
};

defineExpose({
	openDialog,
	closeDialog,
});
</script>

<style></style>
