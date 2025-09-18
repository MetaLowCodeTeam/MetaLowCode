<template>
    <div class="chart-styles">
        <div class="c-s-t">图表样式</div>
        <el-form-item label="颜色选择">
            <el-color-picker v-model="optionModel.setChartStyle.useTextColor" show-alpha :predefine="getElColorPickerPredefineColors()" />
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
                        clearable
                    >
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </div>
                <el-tooltip effect="dark" content="显示在数值前" placement="top">
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
import { getElColorPickerPredefineColors } from "@/utils/util";
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
        value: "￥",
        label: "￥",
    },
    {
        value: "$",
        label: "$",
    },
    {
        value: "€",
        label: "€",
    },
    {
        value: "￡",
        label: "￡",
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
