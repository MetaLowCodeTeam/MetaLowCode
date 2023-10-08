<template>
    <myEcharts :option="option" :field="field" :designer="designer" v-loading="loading" />
</template>

<script setup>
import myEcharts from "@/components/scEcharts/chart-widget.vue";
import { onMounted, reactive, ref, watch } from "vue";
import { queryChartData } from "@/api/chart";
const props = defineProps({
    field: Object,
    designer: Object,
});
defineOptions({
    name: "lineChart-widget",
});

let loading = ref(false);
let cutField = ref("");
watch(
    () => props.field,
    () => {
        cutField.value = props.field;
        initOption();
    },
    { deep: true }
);
onMounted(() => {
    cutField.value = props.field;
    initOption();
});
let option = reactive({
    isNoData: true,
    tooltip: {
        trigger: "axis",
    },
    grid: {
        left: "3%",
        right: "4%",
        top: "5%",
        containLabel: true,
    },
    xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
        type: "value",
    },
    series: [
        {
            data: [120, 200, 150, 80, 70, 110, 130],
            type: "line",
        },
    ],
});

const initOption = () => {
    let { options } = cutField.value;
    if (options) {
        let { dimension, metrics } = options.setDimensional;
        if (dimension.length < 1 || metrics.length < 1) {
            option.isNoData = true;
            return;
        }
        getChartData(options);
        option.isNoData = false;
    } else {
        option.isNoData = true;
    }
};

const getChartData = async (options) => {
    loading.value = true;
    let res = await queryChartData(options);
    let { chartStyle, setChartConf, axisCoordinates } = cutField.value.options;
    // 如果设置了Y轴最大值
    if (axisCoordinates.max > 0) {
        option.yAxis.min = axisCoordinates.min;
        option.yAxis.max = axisCoordinates.max;
    }else {
        option.yAxis = {
            type: "value",
        };
    }
    // 图例是否显示
    option.legend = {
        show: setChartConf.chartShow,
        bottom: 5,
    };
    option.grid.bottom = setChartConf.chartShow ? "50px" : "10px";
    if (res && res.data) {
        option.xAxis.data = [...res.data.xAxis];
        option.series = res.data.series.map((el) => {
            el.type = "line";
            el.smooth = chartStyle == 2;
            // 数值是否展示
            el.label = {
                show: setChartConf.numShow,
                position: "top",
            };
            return el;
        });
    }
    loading.value = false;
};
</script>


