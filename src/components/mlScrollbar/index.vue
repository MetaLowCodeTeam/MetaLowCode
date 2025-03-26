<template>
	<el-scrollbar
		style="width: 100%"
		:height="height"
		:min-height="minHeight"
		:max-height="maxHeight"
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
:deep(.is-horizontal) {
	display: none !important;
}
</style>
