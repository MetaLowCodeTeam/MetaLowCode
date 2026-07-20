<template>
	<el-form-item label="字体样式">
		<el-radio-group v-model="optionModel.fontStyle">
			<el-radio-button value="normal">正常</el-radio-button>
			<el-radio-button value="italic">斜体</el-radio-button>
		</el-radio-group>
	</el-form-item>
</template>

<script>
export default {
	name: "report-field-fontStyle-editor",
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
};
</script>
