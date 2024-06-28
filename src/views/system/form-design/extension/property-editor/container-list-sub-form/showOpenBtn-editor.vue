<template>
	<!--  -->
	<el-form-item label="是否显示打开按钮" label-width="120px">
		<el-switch v-model="optionModel.showOpenBtn" />
	</el-form-item>
</template>

<script>
export default {
    name: "listSubForm-showOpenBtn-editor",
	props: {
		optionModel: Object,
	},
};
</script>

