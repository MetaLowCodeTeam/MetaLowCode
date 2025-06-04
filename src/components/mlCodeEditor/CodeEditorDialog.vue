<template>
	<ml-dialog
		v-model="isShow"
		:title="title"
		:width="dialogWidth"
		:height="dialogHeight"
	>
		<mlCodeEditor
			v-model="currentCode"
			:mode="mode"
			:funcParam="funcParam"
			:disabled="disabled"
			:height="height"
		/>
		<template #footer>
			<el-button @click="closeCodeEditorDialog">取消</el-button>
			<el-button type="primary" @click="confirmCode">确认</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import mlCodeEditor from "./index.vue";
const props = defineProps({
	title: {
		type: String,
		default: "代码编辑器",
	},
	dialogWidth: {
		type: String,
		default: "500px",
	},
	dialogHeight: {
		type: String,
		default: "400px",
	},
	mode: {
		type: String,
		default: "javascript",
	},
	funcParam: {
		type: String,
		default: "",
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	height: {
		type: [String, Number],
		default: 300,
	},
});
const emit = defineEmits(["confirm"]);

let isShow = ref(false);
let currentCode = ref("");

const openCodeEditorDialog = (code) => {
	isShow.value = true;
	currentCode.value = code;
};

const closeCodeEditorDialog = () => {
	isShow.value = false;
};

const confirmCode = () => {
	isShow.value = false;
	emit("confirm", currentCode.value);
};

defineExpose({
	openCodeEditorDialog,
});
</script>

<style scoped>
/* Styles here */
</style>
