<template>
	<el-form-item v-if="refUserFlag" :label="i18nt('extension.setting.useCurrentUser')">
		<el-switch v-model="optionModel.useCurrentUser"></el-switch>
	</el-form-item>
	<el-form-item v-if="refDepartmentFlag" :label="i18nt('extension.setting.useCurrentDepartment')">
		<el-switch v-model="optionModel.useCurrentDepartment"></el-switch>
	</el-form-item>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
const { i18n } = VisualDesign.VFormSDK

export default {
	name: "reference-useCurrentUser-editor",
	componentName: 'PropertyEditor',
	mixins: [i18n],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
	computed: {
		refUserFlag() {
			return !!this.designer.selectedWidget.refUserFlag
		},

		refDepartmentFlag() {
			return !!this.designer.selectedWidget.refDepartmentFlag
		},

	},
	created() {
		//
	},
	mounted() {
		//
	},
}
</script>

<style scoped lang="scss">

</style>
