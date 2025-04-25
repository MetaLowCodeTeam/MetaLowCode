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
    & > :deep(.is-horizontal) {
        display: none !important;
    }
}

</style>
