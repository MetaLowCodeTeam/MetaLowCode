<template>
	<!--  -->
	<el-form-item
		:label="i18nt('extension.setting.showAddBtn')"
		label-width="120px"
	>
		<el-switch v-model="optionModel.showAddBtn" />
		<el-tooltip
			class="box-item"
			effect="dark"
			:content="i18nt('extension.setting.addBtnInfo')"
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
	name: "listSubForm-showAddBtn-editor",
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
