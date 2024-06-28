<template>
	<!--  -->
	<el-form-item label="是否显示分页" label-width="120px">
		<el-switch v-model="optionModel.showPagination" />
	</el-form-item>
</template>

<script>
export default {
    name: "listSubForm-showPagination-editor",
	props: {
		optionModel: Object,
	},
};
</script>

