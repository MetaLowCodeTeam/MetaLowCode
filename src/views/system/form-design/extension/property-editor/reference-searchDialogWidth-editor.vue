<template>
	<el-form-item :label="i18nt('extension.setting.searchDialogWidth')">
		<el-input type="text" v-model="optionModel.searchDialogWidth"></el-input>
	</el-form-item>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

const {i18n} = VisualDesign.VFormSDK

export default {
	name: "reference-searchDialogWidth-editor",
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
