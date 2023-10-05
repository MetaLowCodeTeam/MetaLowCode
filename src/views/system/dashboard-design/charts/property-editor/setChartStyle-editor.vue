<template>
    <div class="chart-styles">
        <div class="c-s-t">图表样式</div>
        <el-form-item label="颜色选择">
            <el-color-picker v-model="optionModel.setChartStyle.useTextColor" />
        </el-form-item>
        <el-form-item label="货币符号">
            <div class="w-100 currency-symbol">
                <div class="user-left">
                    <el-select
                        v-model="optionModel.setChartStyle.currencySymbol"
                        filterable
                        placeholder
                        allow-create
                        default-first-option
                    >
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </div>
                <el-tooltip effect="dark" content="显示在数值后" placement="top">
                    <span class="question-icon">
                        <el-icon size="16">
                            <ElIconQuestionFilled />
                        </el-icon>
                    </span>
                </el-tooltip>
            </div>
        </el-form-item>
        <el-form-item label="货币符号尺寸">
            <el-input-number class="w-100" v-model="optionModel.setChartStyle.currencySymbolSize" :min="14" />
        </el-form-item>
    </div>
</template>
<script setup>
import { ref } from "vue";

defineOptions({
    name: "setChartStyle-editor",
});
const props = defineProps({
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
});
let options = ref([
    {
        value: "元",
        label: "元",
    },
    {
        value: "万元",
        label: "万元",
    },
    {
        value: "亿",
        label: "亿",
    },
    {
        value: "美元",
        label: "美元",
    },
    {
        value: "个",
        label: "个",
    },
    {
        value: "位",
        label: "位",
    },
    {
        value: "天",
        label: "天",
    },
]);
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
        top: 4px;
    }
    .currency-symbol {
        .user-left {
            display: inline-block;
            width: calc(100% - 25px);
        }
    }
}
</style>
