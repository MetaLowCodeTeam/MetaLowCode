<template>
	<vue-office-pdf
		:src="src"
		style="height: 100vh"
		@rendered="renderedHandler"
		@error="errorHandler"
	/>
</template>

<script setup>
import { ref, watch } from "vue";
//引入VueOfficeDocx组件
import VueOfficePdf from "@vue-office/pdf";
const props = defineProps({
	// 文件地址
	src: {
		type: String,
		default: "",
	},
});
const emit = defineEmits(["rendered", "error"]);
const hasRendered = ref(false);
const renderedHandler = () => {
	// PDF 组件可能按页面多次触发 rendered，只向上层通知一次。
	if (hasRendered.value) return;
	hasRendered.value = true;
	emit("rendered");
};
const errorHandler = () => {
	emit("error");
};

watch(
	() => props.src,
	() => {
		hasRendered.value = false;
	}
);
</script>
