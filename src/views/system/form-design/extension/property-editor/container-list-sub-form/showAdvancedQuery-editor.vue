<template>
	<!--  -->
  <el-form-item :label="i18nt('extension.setting.showChangeQueryPanel')" label-width="120px">
		<el-switch v-model="optionModel.showChangeQueryPanel" />
	</el-form-item>
	<el-form-item :label="i18nt('extension.setting.showAdvancedQuery')" label-width="120px">
		<el-switch v-model="optionModel.showAdvancedQuery" />
	</el-form-item>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
const { i18n } = VisualDesign.VFormSDK
export default {
    name: "listSubForm-showAdvancedQuery-editor",
	props: {
		optionModel: Object,
	},
    mixins: [i18n],
};
</script>

