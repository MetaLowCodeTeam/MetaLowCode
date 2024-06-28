<template>
	<!--  -->
	<el-form-item :label="i18nt('extension.setting.listSubFormHeight')" label-width="120px">
		<el-input-number v-model="optionModel.listSubFormHeight" :min="294" />
        <span class="info-text ml-5">PX</span>
	</el-form-item>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
const { i18n } = VisualDesign.VFormSDK
export default {
	name: "listSubForm-listSubFormHeight-editor",
	props: {
		optionModel: Object,
	},
    mixins: [i18n],
};
</script>
