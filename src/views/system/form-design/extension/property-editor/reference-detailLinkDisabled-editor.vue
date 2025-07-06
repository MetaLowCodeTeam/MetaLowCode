<template>
	<el-form-item label="查看禁止跳转详情" title="查看状态不显示详情链接" label-width="120px">
		<el-switch v-model="optionModel.detailLinkDisabled" />
	</el-form-item>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, eventMixin, Utils } = VisualDesign.VFormSDK;

export default {
	name: "reference-detailLinkDisabled-editor",
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
