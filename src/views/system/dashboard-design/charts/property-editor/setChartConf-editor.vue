<template>
    <div class="chart-styles">
        <div class="c-s-t">图表设置</div>
        <!-- 表格 -->
        <template v-if="selectedWidget.type == 'listTable' || selectedWidget.type == 'pivotTable'">
            <el-form-item label="最大展示条数" v-if="selectedWidget.type == 'listTable'">
                <el-input-number v-model="optionModel.setChartConf.pageSize" :min="1" :max="999" />
            </el-form-item>
            <el-form-item label="汇总行显示">
                <el-switch v-model="optionModel.setChartConf.showSummary"></el-switch>
            </el-form-item>
            <el-form-item label="汇总列显示">
                <el-switch v-model="optionModel.setChartConf.showSumcol"></el-switch>
            </el-form-item>
        </template>
        <template v-else>
            <el-form-item label="数值显示" v-if="selectedWidget.type != 'radarChart'">
                <el-switch v-model="optionModel.setChartConf.numShow"></el-switch>
            </el-form-item>
            <el-form-item label="图例显示" >
                <el-switch v-model="optionModel.setChartConf.chartShow" :disabled="selectedWidget.type == 'progressbar' && optionModel.chartStyle != 1"></el-switch>
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
