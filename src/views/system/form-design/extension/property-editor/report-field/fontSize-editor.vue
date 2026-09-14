<template>
	<el-form-item label="字体大小">
		<el-input v-model="optionModel.fontSize" placeholder="默认14px" />
	</el-form-item>
</template>

<script>
export default {
	name: "report-field-fontSize-editor",
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
};
</script>
