<template>
	<el-form-item label="外部引用弹窗设置" label-width="120px">
		<el-button @click="openOuterDialogSetting" class="w-100">打开设置</el-button>
	</el-form-item>
    
    <SettingDialog ref="settingDialog" @confirm="confirmSetting" />
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, eventMixin, Utils } = VisualDesign.VFormSDK;
import SettingDialog from "./components/SettingDialog.vue";
export default {
	name: "cascader-config-editor",
	mixins: [i18n, eventMixin, Utils],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
    components: {
        SettingDialog,
    },
	data() {
		return {
			outerDialogSetting: {},
		};
	},
	watch: {
		
	},
	mounted() {
		
	},
	methods: {
        openOuterDialogSetting() {
            this.$refs.settingDialog?.openDialog(this.optionModel.outerDialogSetting);
        },
        confirmSetting(setting) {
            this.optionModel.outerDialogSetting = setting;
        },
	},
};
</script>
<style lang="scss" scoped></style>
