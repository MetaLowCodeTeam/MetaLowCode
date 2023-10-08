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
    name: "barChart-widget",
});
let cutField = ref("");
let loading = ref(false);
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
            type: "bar",
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
        let { chartStyle } = cutField.value.options;
        if (metrics.length < 2 && chartStyle != 1) {
            cutField.value.options.chartStyle = 1;
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
    if (res && res.data) {
        option.xAxis.data = [...res.data.xAxis];
        let { chartStyle, setChartConf, axisCoordinates } =
            cutField.value.options;

        // 如果不是堆叠图，并且设置了Y轴最大值
        if (chartStyle != 3 && axisCoordinates.max > 0) {
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
        option.series = res.data.series.map((el) => {
            el.type = "bar";
            // 堆叠图
            el.stack =
                chartStyle == 1
                    ? null
                    : chartStyle == 2
                    ? "普通堆叠"
                    : "百分比堆叠";
            // 数值是否展示
            el.label = {
                show: setChartConf.numShow,
                color: "#FFF",
                formatter: function (param) {
                    return param.value + (chartStyle == 3 ? "%" : "");
                },
            };
            return el;
        });
    }
    loading.value = false;
};

</script>
