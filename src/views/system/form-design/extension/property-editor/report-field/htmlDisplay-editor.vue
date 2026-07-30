<template>
	<el-form-item label="是否HTML展示">
		<el-switch v-model="optionModel.htmlDisplayEnabled" @change="handleChange" />
	</el-form-item>
</template>

<script>
export default {
	name: "report-field-htmlDisplay-editor",
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
	methods: {
		handleChange(enabled) {
			if (enabled) {
				this.optionModel.imageDisplayEnabled = false;
			}
		},
	},
};
</script>
