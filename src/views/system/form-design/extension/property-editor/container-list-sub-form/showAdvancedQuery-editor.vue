<template>
	<!--  -->
	<el-form-item label="是否显示高级查询" label-width="120px">
		<el-switch v-model="optionModel.showAdvancedQuery" />
	</el-form-item>
</template>

<script>
export default {
    name: "listSubForm-showAdvancedQuery-editor",
	props: {
		optionModel: Object,
	},
};
</script>

