<!-- 用于发送查询请求的前置事件，用户可以通过JS代码修改请求数据格式。 -->
<template>
	<el-form-item label="onBeforeListQuery" label-width="150px">
		<el-button type="info" icon="el-icon-edit" plain round :class="[eventHandled ? 'button-text-highlight' : '']"
				   @click="editEventHandler('onBeforeListQuery', eventParams)">
			{{ i18nt('designer.setting.addEventHandler') }}
		</el-button>
	</el-form-item>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
const { i18n, eventMixin } = VisualDesign.VFormSDK

export default {
	name: "onBeforeListQuery-editor",
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
			eventParams: ['headers', 'params', 'body'],
		}
	}
}
</script>

<style scoped>

</style>
