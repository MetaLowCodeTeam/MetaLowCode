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
                :disabled="option.chartStyle == 3"
                style="width:100%"
                v-model="option.axisCoordinates.max"
                :min="option.axisCoordinates.min"
            />
        </el-form-item>
        <el-form-item label="最小值">
            <el-input-number
                :disabled="option.chartStyle == 3"
                style="width:100%"
                :min="0"
                :max="option.axisCoordinates.max"
                v-model="option.axisCoordinates.min"
            />
        </el-form-item>
    </div>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
defineOptions({
    name: "axisCoordinates-editor",
});
const props = defineProps({
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
});
const emits = defineEmits(["update:optionModel"]);
let option = ref({
    axisCoordinates: {},
});
watch(
    () => props.optionModel,
    () => {
        initchartStyle();
    },
    { deep: true }
);
onMounted(() => {
    initchartStyle();
});
// 初始化图表样式
const initchartStyle = () => {
    option.value = props.optionModel;
};

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
