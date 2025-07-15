<template>
	<el-scrollbar
		style="width: 100%"
		:height="height"
		:min-height="minHeight"
		:max-height="maxHeight"
        class="ml-scrollbar"
	>
		<div class="content">
			<slot />
		</div>
	</el-scrollbar>
</template>

<script setup>
const props = defineProps({
	height: {
		type: String,
		default: "",
	},
	minHeight: {
		type: String,
		default: "",
	},
	maxHeight: {
		type: String,
		default: "",
	},
});
</script>

<style scoped lang="scss">
.ml-scrollbar{
    // overflow: hidden;
    :deep(.el-scrollbar__view) {
        // height: 100%;
    }
    & > :deep(.is-horizontal) {
        display: none !important;
    }
    .content {
        overflow-x: hidden;
        height: 100%;
    }
}

</style>
