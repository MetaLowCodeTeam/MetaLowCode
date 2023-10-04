<template>
    <div class="chart-styles">
        <div class="c-s-t">图表设置</div>
        <!-- 表格 -->
        <template v-if="optionModel.type == 'listTable' || optionModel.type == 'pivotTable'">
            <el-form-item label="汇总行显示">
                <el-switch v-model="optionModel.setChartConf.showSummary"></el-switch>
            </el-form-item>
            <el-form-item label="汇总列显示">
                <el-switch v-model="optionModel.setChartConf.showSumcol"></el-switch>
            </el-form-item>
        </template>
        <template v-else>
            <el-form-item label="数值显示">
                <el-switch v-model="optionModel.setChartConf.numShow"></el-switch>
            </el-form-item>
            <el-form-item label="图例显示">
                <el-switch v-model="optionModel.setChartConf.chartShow"></el-switch>
            </el-form-item>
        </template>
        <el-form-item label="使用全部数据">
            <el-switch v-model="optionModel.setChartConf.useAllData"></el-switch>
            <el-tooltip effect="dark" content="不启用则只能查看登录用户权限内的数据" placement="top">
                <span class="question-icon">
                    <el-icon size="16">
                        <ElIconQuestionFilled />
                    </el-icon>
                </span>
            </el-tooltip>
        </el-form-item>
    </div>
</template>
<script setup>
defineOptions({
    name: "setChartConf-editor",
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
</style>
