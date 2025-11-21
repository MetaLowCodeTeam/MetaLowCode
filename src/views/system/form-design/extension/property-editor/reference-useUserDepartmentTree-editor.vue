<template>
	<el-form-item v-if="refUserFlag" :label="i18nt('extension.setting.useUserDepartmentTree')">
		<el-switch v-model="optionModel.useUserDepartmentTree"></el-switch>
	</el-form-item>
    <el-form-item label="隐藏保存查询面板">
        <el-switch v-model="optionModel.hideSavePlanQueryButton" />
    </el-form-item>
    <el-form-item label="隐藏新建按钮">
        <el-switch v-model="optionModel.hideAddButton" />
    </el-form-item>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
const { i18n } = VisualDesign.VFormSDK

export default {
	name: "reference-useUserDepartmentTree-editor",
	componentName: 'PropertyEditor',
	mixins: [i18n],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
	computed: {
		refUserFlag() {
			return !!this.designer.selectedWidget.refUserFlag || this.designer?.selectedWidget?.refEntities == 'User'
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
