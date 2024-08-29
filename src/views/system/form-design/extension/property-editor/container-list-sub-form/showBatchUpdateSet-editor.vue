<template>
	<!--  -->
	<el-form-item
		:label="i18nt('extension.setting.showBatchUpdateSet')"
		label-width="120px"
	>
		<el-switch v-model="optionModel.showBatchUpdateSet" :disabled="!optionModel.showMoreBtn"/>
		<el-tooltip
			class="box-item"
			effect="dark"
			:content="i18nt('extension.setting.batchUpdateSetInfo')"
			placement="top"
		>
			<span class="ml-5 help-icon">
				<el-icon size="16"><WarningFilled /></el-icon>
			</span>
		</el-tooltip>
	</el-form-item>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n } = VisualDesign.VFormSDK;
export default {
	name: "listSubForm-showBatchUpdateSet-editor",
	props: {
		optionModel: Object,
	},
	mixins: [i18n],
};
</script>
<style lang="scss" scoped>
.help-icon {
    cursor: pointer;
    position: relative;
    top: 3px;
}
</style>
