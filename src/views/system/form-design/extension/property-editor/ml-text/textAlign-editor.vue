<template>
	<el-form-item label="文字对齐">
		<el-radio-group v-model="optionModel.textAlign">
			<el-radio-button value="left">居左</el-radio-button>
			<el-radio-button value="center">居中</el-radio-button>
			<el-radio-button value="right">居右</el-radio-button>
		</el-radio-group>
	</el-form-item>
</template>

<script>
export default {
	name: "ml-text-textAlign-editor",
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
};
</script>
