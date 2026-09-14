<template>
	<el-form-item label="元数据">
		<el-input :model-value="displayValue" disabled />
	</el-form-item>
</template>

<script>
export default {
	name: "report-field-modelName-editor",
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
	computed: {
		displayValue() {
			return this.optionModel.modelLabel || this.optionModel.modelName || "";
		},
	},
};
</script>
