<template>
	<el-form-item label="字体粗细">
		<el-radio-group v-model="optionModel.fontWeight">
			<el-radio-button value="normal">正常</el-radio-button>
			<el-radio-button value="bold">加粗</el-radio-button>
		</el-radio-group>
	</el-form-item>
</template>

<script>
export default {
	name: "report-field-fontWeight-editor",
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
};
</script>
