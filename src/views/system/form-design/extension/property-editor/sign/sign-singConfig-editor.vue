<template>
	<!--  -->
	<el-form-item label="签名宽度">
		<el-input v-model="signConfig.signWidth" @input="onSignWidthChange" />
	</el-form-item>
	<el-form-item label="签名高度">
		<el-input v-model="signConfig.signHeight" @input="onSignHeightChange" />
	</el-form-item>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, eventMixin, Utils } = VisualDesign.VFormSDK;

export default {
	name: "reference-fillBackEnabled-editor",
	mixins: [i18n, eventMixin, Utils],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
	data() {
		return {
			signConfig: {
				signWidth: "",
				signHeight: "",
			},
		};
	},
	watch: {
		optionModel: {
			handler(newVal) {
				this.initSignConfig(newVal.signConfig);
			},
			deep: true,
		},
	},
	mounted() {
		this.initSignConfig(this.optionModel.signConfig);
	},
	methods: {
		initSignConfig(newConfig) {
			this.signConfig = Object.assign(
				{},
				this.signConfig,
				newConfig
			);
			if (this.signConfig.signWidth == "100%") {
				this.signConfig.signWidth = "";
			}
			if (this.signConfig.signHeight == "60px") {
				this.signConfig.signHeight = "";
			}
		},
		onSignWidthChange(value) {
			if (!value) {
				this.optionModel.signConfig.signWidth = "100%";
			} else {
				this.optionModel.signConfig.signWidth = value;
			}
		},
		onSignHeightChange(value) {
			if (!value) {
				this.optionModel.signConfig.signHeight = "60px";
			} else {
				this.optionModel.signConfig.signHeight = value;
			}
		},
	},
};
</script>
<style lang="scss" scoped>
.form-label {
	line-height: 32px;
	font-size: 14px;
}
</style>
