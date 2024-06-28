<template>
	<!--  -->
	<el-form-item label="是否显示编辑按钮" label-width="120px">
		<el-switch v-model="optionModel.showEditBtn" />
	</el-form-item>
</template>

<script>
export default {
    name: "listSubForm-showEditBtn-editor",
	props: {
		optionModel: Object,
	},
};
</script>

