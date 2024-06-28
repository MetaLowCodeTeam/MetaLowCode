<template>
	<!--  -->
	<el-form-item label="是否显示新建按钮" label-width="120px">
		<el-switch v-model="optionModel.showAddBtn" />
	</el-form-item>
</template>

<script>
export default {
    name: "listSubForm-showAddBtn-editor",
	props: {
		optionModel: Object,
	},
};
</script>

