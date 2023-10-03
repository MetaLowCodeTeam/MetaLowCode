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
    name: "radarChart-widget",
});
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
    grid: {
        left: "3%",
        right: "4%",
        top: "5%",
        containLabel: true,
    },
    tooltip: {},
    radar: {
        indicator: [
            { name: "测试1" },
            { name: "测试2" },
            { name: "测试3" },
            { name: "测试4" },
            { name: "测试5" },
            { name: "测试6" },
        ],
    },
    series: [
        {
            name: "Budget vs spending",
            type: "radar",
            data: [
                {
                    value: [4200, 3000, 20000, 35000, 50000, 18000],
                    name: "状态1",
                },
                {
                    value: [5000, 14000, 28000, 26000, 42000, 21000],
                    name: "状态2",
                },
            ],
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
        if (dimension.length == 1) {
            formatOption(dimension, metrics);
        } else {
            formatOption(metrics, dimension);
        }

        option.isNoData = false;
    } else {
        option.isNoData = true;
    }
};
// 格式化图表option
const formatOption = (x, y) => {
    option.radar.indicator = x[0].list.map((el) => {
        return { name: el.name };
    });
    option.series[0].data = [];

    y.forEach((el) => {
        let metricsObj = {
            value: el.list.map((subel) => subel.name),
            name: el.alias,
        };
        option.series[0].data.push(metricsObj);
    });
};
</script>
