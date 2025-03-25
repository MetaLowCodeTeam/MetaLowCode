<template>
	<el-form-item label="显示分页">
		<el-switch v-model="optionModel.showTablePagination"></el-switch>
	</el-form-item>
</template>

<script>
export default {
	name: "showTablePagination-editor",
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},

}
</script>

<style scoped>

</style>
