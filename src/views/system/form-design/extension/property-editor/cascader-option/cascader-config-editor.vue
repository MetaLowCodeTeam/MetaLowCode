<template>
	<el-form-item label="输入框占位符" label-width="120px">
		<el-input
			v-model="cascaderConfig.placeholder"
			@input="onPlaceholderChange"
		/>
	</el-form-item>
	<el-form-item label="组件宽度" label-width="120px">
		<el-input
			v-model="cascaderConfig.compWidth"
			@input="onCompWidthChange"
		/>
	</el-form-item>
	<el-form-item label="是否多选" label-width="120px">
		<el-switch
			v-model="cascaderConfig.multiple"
			@change="onMultipleChange"
		/>
	</el-form-item>
	<el-form-item label="仅显示最后一级" label-width="120px">
		<el-switch
			v-model="cascaderConfig.showAllLevels"
			@change="onShowAllLevelsChange"
			clearable
		/>
	</el-form-item>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, eventMixin, Utils } = VisualDesign.VFormSDK;

export default {
	name: "cascader-config-editor",
	mixins: [i18n, eventMixin, Utils],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},

	data() {
		return {
			cascaderConfig: {
				multiple: false,
				showAllLevels: false,
				placeholder: "请选择",
				compWidth: "",
			},
		};
	},
	watch: {
		optionModel: {
			handler(newVal) {
				this.initCascaderConfig(newVal.cascaderConfig);
			},
			deep: true,
		},
	},
	mounted() {
		this.initCascaderConfig(this.optionModel.cascaderConfig);
	},
	methods: {
		initCascaderConfig(newConfig) {
			this.cascaderConfig = Object.assign(
				{},
				this.cascaderConfig,
				newConfig
			);
			if (this.cascaderConfig.compWidth == "100%") {
				this.cascaderConfig.compWidth = "";
			}
		},
		onMultipleChange(val) {
			this.optionModel.cascaderConfig.multiple = val;
		},
		onShowAllLevelsChange(val) {
			this.optionModel.cascaderConfig.showAllLevels = val;
		},
		onPlaceholderChange(val) {
			this.optionModel.cascaderConfig.placeholder = val;
		},
		onCompWidthChange(val) {
			if (!val) {
				this.optionModel.cascaderConfig.compWidth = "100%";
			} else {
				this.optionModel.cascaderConfig.compWidth = val;
			}
		},
	},
};
</script>
<style lang="scss" scoped></style>
