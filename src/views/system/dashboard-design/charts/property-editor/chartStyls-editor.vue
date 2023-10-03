<template>
    <div class="chart-styles">
        <div class="c-s-t">图表样式</div>
        <template v-for="(style,styleInx) of stylesList">
            <div class="c-s-c" v-if="style.type == option.type" :key="styleInx">
                <div
                    class="prive-box"
                    v-for="(item,inx) of style.list"
                    :key="inx"
                    :title="item.label"
                    :class="{'is-active':option.chartStyls == item.type,'is-disabled': checkIsDisabled(item,style.type)}"
                    @click="checkIsDisabled(item,style.type) ? ()=> {} : chartStylsChange(item)"
                >
                    <div class="icon-box">
                        <SvgIcon class="sort-icon ml-3" :icon-name="item.icon" />
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";

defineOptions({
    name: "chartStyls-editor",
});
const props = defineProps({
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
});
const emits = defineEmits(["update:optionModel"]);
let option = ref({});
let stylesList = ref([
    {
        type: "barChart",
        list: [
            {
                type: 1,
                label: "普通柱状图",
                icon: "barChart",
            },
            {
                type: 2,
                label: "堆积状态图",
                icon: "stacking",
            },
            {
                type: 3,
                label: "百分比堆积状态图",
                icon: "stacking",
            },
        ],
    },
    {
        type: "barXChart",
        list: [
            {
                type: 1,
                label: "普通条形图",
                icon: "barXChart",
            },
            {
                type: 2,
                label: "堆积条形图",
                icon: "stacking-x",
            },
            {
                type: 3,
                label: "百分比堆积条形图",
                icon: "stacking-x",
            },
        ],
    },
    {
        type: "lineChart",
        list: [
            {
                type: 1,
                label: "折线图",
                icon: "lineChart",
            },
            {
                type: 2,
                label: "曲线图",
                icon: "graph",
            },
        ],
    },
    {
        type: "pieChart",
        list: [
            {
                type: 1,
                label: "实心",
                icon: "pieChart",
            },
            {
                type: 2,
                label: "环形",
                icon: "donutChart",
            },
        ],
    },
]);
watch(
    () => props.optionModel,
    () => {
        initChartStyls();
    },
    { deep: true }
);
onMounted(() => {
    initChartStyls();
});

// 初始化图表样式
const initChartStyls = () => {
    option.value = props.optionModel;
};
// 检测禁用
const checkIsDisabled = (item, chartType) => {
    let { dimension, metrics } = option.value.setDimensional;
    // 如果是柱状图，并且不是基础柱状图 并且 维度大于1
    if (
        (chartType == "barChart" || chartType == "barXChart") &&
        item.type != 1 &&
        (dimension.length > 1 || metrics.length < 2)
    ) {
        return true;
    }
    return false;
};
// 切换图表样式
const chartStylsChange = (item) => {
    if (option.value.chartStyls == item.type) {
        return;
    }
    option.value.chartStyls = item.type;
    emits("update:optionModel", option.value);
};
</script>
<style lang="scss" scoped>
.chart-styles {
    .c-s-t {
        font-size: 14px;
        font-weight: bold;
    }
    .c-s-c {
        .prive-box {
            width: 30px;
            height: 30px;
            display: inline-block;
            border: 3px solid #fff;
            text-align: center;
            cursor: pointer;
            .icon-box {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 30px;
                width: 30px;
                .sort-icon {
                    color: #707070;
                }
            }

            &.is-active {
                border-color: var(--el-color-primary);
                .sort-icon {
                    color: var(--el-color-primary);
                }
            }
            &.is-disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }
        }
    }
}
</style>
