<template>
	<vue-office-pptx
		:src="src"
		style="height: 100vh"
		@rendered="renderedHandler"
		@error="errorHandler"
	/>
</template>

<script setup>
//引入VueOfficeDocx组件
import VueOfficePptx from '@vue-office/pptx'
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
