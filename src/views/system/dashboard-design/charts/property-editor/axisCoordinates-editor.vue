<template>
    <div class="chart-styles">
        <div class="c-s-t">
            Y轴坐标
            <el-tooltip effect="dark" content="百分比堆积柱状图不可设置" placement="top">
                <span class="question-icon">
                    <el-icon size="16">
                        <ElIconQuestionFilled />
                    </el-icon>
                </span>
            </el-tooltip>
        </div>
        <el-form-item label="最大值">
            <el-input-number
                :disabled="optionModel.chartStyle == 3"
                style="width:100%"
                :controls="false"
                v-model="optionModel.axisCoordinates.max"
            />
        </el-form-item>
        <el-form-item label="最小值">
            <el-input-number
                :disabled="optionModel.chartStyle == 3"
                style="width:100%"
                :controls="false"
                v-model="optionModel.axisCoordinates.min"
            />
        </el-form-item>
    </div>
</template>
<script setup>
defineOptions({
    name: "axisCoordinates-editor",
});
const props = defineProps({
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
});
</script>
<style lang="scss" scoped>
.chart-styles {
    padding-top: 20px;
    .c-s-t {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 5px;
    }
    .question-icon {
        cursor: pointer;
        margin-left: 5px;
        position: relative;
        top: 3px;
    }
}
:deep(.el-input-number .el-input__inner) {
    text-align: left;
}
</style>
