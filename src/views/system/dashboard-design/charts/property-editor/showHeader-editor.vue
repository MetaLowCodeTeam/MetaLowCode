<template>
	<el-form-item label="显示标题栏">
		<el-switch v-model="optionModel.showHeader"></el-switch>
	</el-form-item>
</template>

<script>
export default {
	name: "showHeader-editor",
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},

}
</script>

<style scoped>

</style>
