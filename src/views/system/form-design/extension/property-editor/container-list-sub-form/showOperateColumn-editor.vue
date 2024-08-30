<template>
	<!--  -->
	<el-form-item :label="i18nt('extension.setting.showOperateColumn')" label-width="120px">
		<el-switch v-model="optionModel.showOperateColumn" />
	</el-form-item>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
const { i18n } = VisualDesign.VFormSDK
export default {
    name: "listSubForm-showOperateColumn-editor",
	props: {
		optionModel: Object,
	},
    mixins: [i18n],
};
</script>

