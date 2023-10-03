<template>
    <myEcharts :option="option" :field="field" :designer="designer" />
</template>

<script setup>
import myEcharts from "@/components/scEcharts/chart-widget.vue";
import { onMounted, reactive, ref, watch } from "vue";
const props = defineProps({
    field: Object,
    designer: Object,
});
defineOptions({
    name: "barChart-widget",
});
let cutField = ref("");
let isNoData = ref(true);
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
        // axisPointer: {
        //     type: "shadow",
        // },
        // formatter: function (params) {
        //     console.log(params, "params");
        //     var tar = params[1];
        //     return tar.name + "<br/>" + tar.seriesName + " : " + tar.value;
        // },
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
        let { chartStyls } = options;
        let { dimension, metrics } = options.setDimensional;
        if (dimension.length < 1 || metrics.length < 1) {
            option.isNoData = true;
            return;
        }
        if (dimension.length == 1) {
            option.xAxis.data = dimension[0].list.map((el) => el.name);
            option.series = [];
            metrics.forEach((el) => {
                let metricsObj = {
                    data: el.list.map((subel) => subel.name),
                    type: "bar",
                    name: el.alias,
                    stack:
                        chartStyls == 1
                            ? null
                            : chartStyls == 2
                            ? "普通堆叠"
                            : "百分比堆叠",
                };
                option.series.push(metricsObj);
            });
        }
        option.isNoData = false;
    } else {
        option.isNoData = true;
    }
    // option.xAxis =
};
</script>
