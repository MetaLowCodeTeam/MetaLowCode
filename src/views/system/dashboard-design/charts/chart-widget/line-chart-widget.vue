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
    let { chartStyle } = cutField.value.options;
    if (res && res.data) {
        option.xAxis.data = [...res.data.xAxis];
        option.series = res.data.series.map((el) => {
            el.type = "line";
            el.smooth = chartStyle == 2;
            return el;
        });
    }
    loading.value = false;
};
// 格式化图表option
// const formatOption = (x, y) => {
//     let { chartStyle } = cutField.value.options;
//     option.xAxis.data = x[0].list.map((el) => el.name);
//     option.series = [];
//     y.forEach((el) => {
//         let metricsObj = {
//             data: el.list.map((subel) => subel.name),
//             type: "line",
//             name: el.alias,
//             smooth: chartStyle == 2,
//         };
//         option.series.push(metricsObj);
//     });
// };
</script>


