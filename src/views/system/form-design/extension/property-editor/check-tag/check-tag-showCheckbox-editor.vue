<template>
	<!--  --> 
	<el-form-item label="启用勾选框" label-width="120px">
		<el-switch v-model="optionModel.showCheckbox" @change="onCheckboxChange"/>
	</el-form-item>
    <el-form-item 
        :label="i18nt('extension.setting.showBorder')" 
        label-width="120px"
    >
		<el-switch v-model="optionModel.showBorder"/>
        <el-tooltip :content="i18nt('extension.setting.borderInfo')" placement="top">
            <el-icon class="ml-5" :size="16" color="#999">
                <QuestionFilled />
            </el-icon>
        </el-tooltip>
	</el-form-item>
    <el-form-item
        :label="i18nt('extension.setting.showButton')"
        label-width="120px"
    >
        <el-switch v-model="optionModel.showButton" @change="onButtonChange"/>
    </el-form-item>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, eventMixin, Utils } = VisualDesign.VFormSDK;

export default {
	name: "check-tag-showCheckbox-editor",
	mixins: [i18n, eventMixin, Utils],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},

	data() {
		return {};
	},
	methods: {
        onCheckboxChange() {
            if(!this.optionModel.showCheckbox) {
                this.optionModel.showBorder = false;
            }else {
                this.optionModel.showButton = false;
            }
        },
        onButtonChange() {
            if(this.optionModel.showButton) {
                this.optionModel.showCheckbox = false;
            }
        }
    },
};
</script>
<style lang="scss" scoped>
.form-label {
	line-height: 32px;
	font-size: 14px;
}
</style>
