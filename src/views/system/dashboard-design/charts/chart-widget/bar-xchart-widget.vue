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
    name: "barXChart-widget",
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
        type: "value",
    },
    yAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
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
        getChartData(options);
        // if (dimension.length == 1) {
        //     formatOption(dimension, metrics);
        // } else {
        //     formatOption(metrics, dimension);
        // }

        option.isNoData = false;
    } else {
        option.isNoData = true;
    }
};

const getChartData = async (options) => {
    loading.value = true;
    let res = await queryChartData(options);
    if (res && res.data) {
        option.yAxis.data = [...res.data.xAxis];

        option.series = res.data.series.map((el) => {
            el.type = "bar";
            return el;
        });
        console.log(option, "option");
    }
    loading.value = false;
};

// 格式化图表option
// const formatOption = (x, y) => {
//     let { chartStyle } = cutField.value.options;
//     option.yAxis.data = x[0].list.map((el) => el.name);
//     option.series = [];
//     y.forEach((el) => {
//         let metricsObj = {
//             data: el.list.map((subel) => subel.name),
//             type: "bar",
//             name: el.alias,
//             stack:
//                 chartStyle == 1
//                     ? null
//                     : chartStyle == 2
//                     ? "普通堆叠"
//                     : "百分比堆叠",
//         };
//         option.series.push(metricsObj);
//     });
// };
</script>
