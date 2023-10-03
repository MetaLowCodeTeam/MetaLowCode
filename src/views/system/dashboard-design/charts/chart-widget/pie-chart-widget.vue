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
    name: "pieChart-widget",
});
let option = reactive({
    grid: {
        left: "3%",
        right: "4%",
        top: "5%",
        containLabel: true,
    },
    isNoData: true,
    tooltip: {},
    series: [
        {
            type: "pie",
            radius: "50%",
            data: [
                { value: 1048, name: "Search Engine" },
                { value: 735, name: "Direct" },
                { value: 580, name: "Email" },
                { value: 484, name: "Union Ads" },
                { value: 300, name: "Video Ads" },
            ],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)",
                },
            },
        },
    ],
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

const initOption = () => {
    let { options } = cutField.value;
    if (options) {
        let { dimension, metrics } = options.setDimensional;
        if (dimension.length < 1 || metrics.length < 1) {
            option.isNoData = true;
            return;
        }
        option.series[0].data = [];
        dimension[0].list.forEach((el, inx) => {
            option.series[0].data.push({
                name: el.name,
                value: metrics[0].list[inx].name,
            });
        });
        let { chartStyls } = cutField.value.options;
        option.series[0].radius = chartStyls == 1? '50%' : ['40%', '70%'];
        option.isNoData = false;
    } else {
        option.isNoData = true;
    }
};
</script>
<style lang="scss" scoped>
.bar-chart {
    width: 100%;
    height: 100%;
    .chart {
        width: 100%;
        height: 100%;
    }
}
</style>
