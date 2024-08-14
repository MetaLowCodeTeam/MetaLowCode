<template>
	<!--  --> 
	<el-form-item label="启用表单回填" label-width="120px" v-if="!optionModel.useTreeDataSelect">
		<el-switch v-model="optionModel.fillBackEnabled" />
	</el-form-item>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, eventMixin, Utils } = VisualDesign.VFormSDK;

export default {
	name: "reference-fillBackEnabled-editor",
	mixins: [i18n, eventMixin, Utils],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},

	data() {
		return {};
	},
	methods: {},
};
</script>
<style lang="scss" scoped>
.form-label {
	line-height: 32px;
	font-size: 14px;
}
</style>
