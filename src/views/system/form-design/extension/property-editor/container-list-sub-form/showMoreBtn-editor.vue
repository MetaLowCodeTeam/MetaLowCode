<template>
	<!--  -->
	<el-form-item label="是否显示更多按钮" label-width="120px">
		<el-switch v-model="optionModel.showMoreBtn" />
	</el-form-item>
</template>

<script>
export default {
    name: "listSubForm-showMoreBtn-editor",
	props: {
		optionModel: Object,
	},
};
</script>

