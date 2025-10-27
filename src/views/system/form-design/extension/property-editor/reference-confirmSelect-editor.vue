<template>
	<el-form-item label="是否二次确认选择" v-if="!isDashboard">
		<el-switch v-model="optionModel.confirmSelect" />
	</el-form-item>
    <el-form-item label="确认提示内容" v-if="optionModel.confirmSelect">
        <el-input type="text" v-model="optionModel.confirmSelectContent" placeholder="请输入确认提示内容" clearable/>
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

const {i18n} = VisualDesign.VFormSDK

export default {
	name: "reference-confirmSelect-editor",
	mixins: [i18n],
    inject: ["getDesignerConfig"],
    computed: {
        isDashboard() {
            return this.getDesignerConfig().isDashboard;
        }
    },
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
}
</script>

<style lang="scss" scoped>

</style>
