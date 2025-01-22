<template>
	<MlOfficePreview
		:src="query.url"
		@rendered="renderedHandler"
		@error="errorHandler"
	/>
</template>

<script setup>
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import MlOfficePreview from "./Index.vue";
import { ElMessage } from "element-plus";
const router = useRouter();
let query = ref({});
onMounted(() => {
	query.value = router.currentRoute.value.query;
});
const renderedHandler = () => {
	console.log("渲染完成");
    ElMessage.success("渲染完成");
};
const errorHandler = () => {
	console.log("渲染失败");
    ElMessage.error("渲染失败");
};
</script>

<style></style>
