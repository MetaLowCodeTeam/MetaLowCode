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
    name: "funnelChart-widget",
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
            type: "funnel",
            left: "10%",
            top: 60,
            bottom: 60,
            width: "80%",
            min: 0,
            max: 10,
            minSize: "0%",
            maxSize: "100%",
            sort: "descending",
            gap: 2,
            label: {
                show: true,
                // position: "inside",
            },
            labelLine: {
                length: 10,
                lineStyle: {
                    width: 1,
                    type: "solid",
                },
            },
            itemStyle: {
                borderColor: "#fff",
                borderWidth: 1,
            },
            emphasis: {
                label: {
                    fontSize: 20,
                },
            },
            data: [
                { value: 60, name: "Visit" },
                { value: 40, name: "Inquiry" },
                { value: 20, name: "Order" },
                { value: 80, name: "Click" },
                { value: 100, name: "Show" },
            ],
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
        if (dimension.length < 1 && metrics.length < 2) {
            option.isNoData = true;
            return;
        }
        option.series[0].data = [];
        if (dimension.length == 1) {
            dimension[0].list.forEach((el, inx) => {
                option.series[0].data.push({
                    name: el.name,
                    value: metrics[0].list[inx].name,
                });
            });
        } else {
            metrics.forEach((el) => {
                option.series[0].data.push({
                    name: el.alias,
                    value: 100,
                });
            });
        }

        option.isNoData = false;
    } else {
        option.isNoData = true;
    }
};
</script>


