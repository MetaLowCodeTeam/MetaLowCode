<template>
	<el-form-item label="父字段">
		<el-input :model-value="optionModel.modelName" disabled />
	</el-form-item>
</template>

<script>
export default {
	name: "modelName-editor",
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
};
</script>
