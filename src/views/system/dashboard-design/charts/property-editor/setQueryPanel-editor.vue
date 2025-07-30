<template>
	<el-form-item label="设置查询面板" v-if="optionModel.showHeader">
		123
	</el-form-item>
</template>

<script>
export default {
	name: "setQueryPanel-editor",
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},

}
</script>

<style scoped>

</style>
