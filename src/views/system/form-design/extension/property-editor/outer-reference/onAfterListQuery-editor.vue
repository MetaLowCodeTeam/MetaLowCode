<!-- 用于拦截查询接口返回的数据对象，用户可以修改数据格式，然后返回给列表渲染。 -->
<template>
	<el-form-item label="onAfterListQuery" label-width="150px">
		<el-button type="info" icon="el-icon-edit" plain round :class="[eventHandled ? 'button-text-highlight' : '']"
				   @click="editEventHandler('onAfterListQuery', eventParams)">
			{{ i18nt('designer.setting.addEventHandler') }}
		</el-button>
	</el-form-item>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
const { i18n, eventMixin } = VisualDesign.VFormSDK

export default {
	name: "onAfterListQuery-editor",
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
			eventParams: ['resData'],
		}
	}
}
</script>

<style scoped>

</style>
