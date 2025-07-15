<template>
	<ml-dialog
		v-model="isShow"
		:title="dialogTitle"
		width="55%"
		append-to-body
		bodyNoPadding
		showFullScreen
		scrollbarMinHeight="500px"
	>
		<div
			class="iframe-container"
			v-loading="loading"
			element-loading-text="加载中..."
		>
			<iframe
				:src="detailUrl"
				frameborder="0"
				width="100%"
				height="100%"
				style="min-height: 500px"
				@load="handleIframeLoad"
                @error="handleIframeError"
			></iframe>
		</div>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
let isShow = ref(false);
let detailUrl = ref("");
let dialogTitle = ref("");
let loading = ref(false);

// 加载成功
const handleIframeLoad = () => {
	loading.value = false;
    console.log('iframe 内容加载成功！');
};

// 加载失败
const handleIframeError = (err) => {
	loading.value = false;
    ElMessage.error('iframe 内容加载失败！请检查 URL 或网络。');
};

const openDialog = ({ url, title }) => {
	detailUrl.value = url;
	loading.value = true;
	dialogTitle.value = title || "外部引用详情";
	isShow.value = true;
};

defineExpose({
	openDialog,
});
</script>
<style scoped>
.iframe-container {
	width: 100%;
	height: calc(100% - 5px);
	min-height: 500px;
}
</style>
