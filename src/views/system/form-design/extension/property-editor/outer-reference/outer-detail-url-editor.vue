<template>
    <el-form-item label="外部引用详情URL" v-if="!optionModel.detailLinkDisabled">
        <div class="input-with-icon">
            <el-input type="text" v-model="optionModel.outerDetailURL" placeholder="请输入外部引用详情URL" clearable/>
            <el-tooltip content="示例：https://test.com/some/detail/{code}" placement="top">
                <el-icon class="icon-info">
                    <InfoFilled />
                </el-icon>
            </el-tooltip>
        </div>
    </el-form-item>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

const {i18n} = VisualDesign.VFormSDK

export default {
	name: "outer-detail-url-editor",
	mixins: [i18n],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
}
</script>

<style lang="scss" scoped>
.input-with-icon {
    display: flex;
    align-items: center;
    .el-input {
        flex: 1;
    }
    .icon-info {
        margin-left: 5px;
        cursor: pointer;
    }
}
</style>
