<template>
	<!--  -->
	<el-form-item label="是否显示头部" label-width="120px">
		<el-switch v-model="optionModel.showListHeader" />
	</el-form-item>
</template>

<script>
export default {
    name: "listSubForm-showListHeader-editor",
	props: {
		optionModel: Object,
	},
};
</script>

