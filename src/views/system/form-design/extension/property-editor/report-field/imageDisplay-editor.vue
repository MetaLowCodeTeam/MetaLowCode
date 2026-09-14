<template>
	<el-form-item label="是否图片展示">
		<el-switch v-model="optionModel.imageDisplayEnabled" @change="handleChange" />
	</el-form-item>
	<template v-if="optionModel.imageDisplayEnabled">
		<el-form-item label="图片宽度">
			<el-input v-model="optionModel.imageWidth" placeholder="默认80px" />
		</el-form-item>
		<el-form-item label="图片高度">
			<el-input v-model="optionModel.imageHeight" placeholder="默认100px" />
		</el-form-item>
	</template>
</template>

<script>
export default {
	name: "report-field-imageDisplay-editor",
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
	methods: {
		handleChange(enabled) {
			if (enabled) {
				this.optionModel.htmlDisplayEnabled = false;
			}
		},
	},
};
</script>
