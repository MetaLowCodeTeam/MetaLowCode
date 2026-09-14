<template>
	<div v-if="optionModel.echartsConfig">
		<el-form-item label="宽度">
			<el-input v-model="optionModel.echartsConfig.width" placeholder="100%" />
		</el-form-item>
		<el-form-item label="高度">
			<el-input-number v-model="optionModel.echartsConfig.height" :min="120" :max="1200" style="width: 100%" />
		</el-form-item>
	</div>
</template>

<script>
export default {
	name: 'echartsConfig-editor',
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
}
</script>
