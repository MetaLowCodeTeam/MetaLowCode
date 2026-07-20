<template>
	<el-form-item label="父字段">
		<el-input :model-value="optionModel.modelName" disabled />
	</el-form-item>
	<el-form-item label="文字对齐">
		<el-radio-group v-model="optionModel.textAlign">
			<el-radio value="left">居左</el-radio>
			<el-radio value="center">居中</el-radio>
			<el-radio value="right">居右</el-radio>
		</el-radio-group>
	</el-form-item>
	<el-form-item label="字体大小">
		<el-input v-model="optionModel.fontSize" placeholder="默认14px" />
	</el-form-item>
	<el-form-item label="字体样式">
		<el-select v-model="optionModel.fontStyle">
			<el-option label="正常" value="normal" />
			<el-option label="斜体" value="italic" />
		</el-select>
	</el-form-item>
	<el-form-item label="字体粗细">
		<el-select v-model="optionModel.fontWeight">
			<el-option label="正常" value="normal" />
			<el-option label="加粗" value="bold" />
		</el-select>
	</el-form-item>
</template>

<script>
export default {
	name: "report-field-editor",
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
};
</script>
