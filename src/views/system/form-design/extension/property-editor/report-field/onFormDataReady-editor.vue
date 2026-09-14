<template>
	<el-form-item label="onFormDataReady" label-width="150px">
		<el-button type="info" icon="el-icon-edit" plain round :class="[eventHandled ? 'button-text-highlight' : '']"
			@click="editEventHandler('onFormDataReady', eventParams)">
			{{ i18nt('designer.setting.addEventHandler') }}</el-button>
	</el-form-item>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";

const { i18n, eventMixin } = VisualDesign.VFormSDK;

export default {
	name: "report-field-onFormDataReady-editor",
	mixins: [i18n, eventMixin],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
		eventHandled: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		eventParams() {
			return this.selectedWidget?.type === 'ml-text'
				? ['rowData']
				: ['formData', 'key', 'value'];
		},
	},
};
</script>
