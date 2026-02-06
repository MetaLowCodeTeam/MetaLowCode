<template>
	<!--  -->
	<el-form-item  label-width="120px">
        <template #label>
            {{ i18nt('extension.setting.listSubFormLayoutCode') }}
            <el-tooltip>
                <template #content>
                    {{ i18nt('extension.setting.listSubFormLayoutCodeInfo') }}
                </template>
                <el-icon class="tip-icon">
                    <WarningFilled />
                </el-icon>
            </el-tooltip>
        </template>
		<el-input v-model="optionModel.listSubFormLayoutCode" />
	</el-form-item>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
const { i18n } = VisualDesign.VFormSDK
export default {
    name: "listSubForm-listSubFormLayoutCode-editor",
	props: {
		optionModel: Object,
	},
    mixins: [i18n],
};
</script>
<style scoped lang="scss">
.tip-icon {
    position: relative;
    top: 4px;
    margin-left: 2px;
    cursor: pointer;
    color: #000;
}
</style>

