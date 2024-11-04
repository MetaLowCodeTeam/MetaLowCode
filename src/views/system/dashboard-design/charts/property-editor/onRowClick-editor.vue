<template>
	<el-form-item label="onRowClick" label-width="150px">
		<el-button type="info" icon="el-icon-edit" plain round :class="[eventHandled ? 'button-text-highlight' : '']"
				   @click="editEventHandler('onRowClick', eventParams)">
			{{ i18nt('designer.setting.addEventHandler') }}
		</el-button>
	</el-form-item>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
const { i18n, eventMixin } = VisualDesign.VFormSDK

export default {
	name: "listTable-onRowClick-editor",
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
	data() {
		return {
			eventParams: ['row', 'column', 'event', 'detailRef', 'router'],
		}
	}
}
</script>

<style scoped>

</style>
