<template>
	<vue-office-docx
		:src="src"
		style="height: 100vh"
		@rendered="renderedHandler"
		@error="errorHandler"
	/>
</template>

<script setup>
//引入VueOfficeDocx组件
import VueOfficeDocx from "@vue-office/docx";
//引入相关样式
import "@vue-office/docx/lib/index.css";
const props = defineProps({
	// 文件地址
	src: {
		type: String,
		default: "",
	},
});
const emit = defineEmits(["rendered", "error"]);
const renderedHandler = () => {
	emit("rendered");
};
const errorHandler = () => {
	emit("error");
};
</script>
