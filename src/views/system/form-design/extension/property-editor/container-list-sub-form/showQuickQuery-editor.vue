<template>
	<!--  -->
	<el-form-item label="是否显示快速查询" label-width="120px">
		<el-switch v-model="optionModel.showQuickQuery" />
	</el-form-item>
</template>

<script>
export default {
    name: "listSubForm-showQuickQuery-editor",
	props: {
		optionModel: Object,
	},
};
</script>

