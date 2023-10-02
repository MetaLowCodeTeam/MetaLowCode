<template>
    <myEcharts :option="option" :field="field" :designer="designer" />
</template>

<script setup>
import myEcharts from "@/components/scEcharts/chart-widget.vue";
import { reactive } from "vue";
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
    series: [
        {
            name: "Funnel",
            type: "funnel",
            left: "10%",
            top: 60,
            bottom: 60,
            width: "80%",
            min: 0,
            max: 100,
            minSize: "0%",
            maxSize: "100%",
            sort: "descending",
            gap: 2,
            label: {
                show: true,
                position: "inside",
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
</script>


