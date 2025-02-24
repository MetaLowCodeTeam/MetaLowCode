<template>
	<el-form-item label="是否二次确认选择">
		<el-switch v-model="optionModel.confirmSelect" />
	</el-form-item>
    <el-form-item label="确认提示内容" v-if="optionModel.confirmSelect">
        <el-input type="text" v-model="optionModel.confirmSelectContent" placeholder="请输入确认提示内容" clearable/>
    </el-form-item>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

const {i18n} = VisualDesign.VFormSDK

export default {
	name: "reference-confirmSelect-editor",
	mixins: [i18n],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
}
</script>

<style lang="scss" scoped>

</style>
