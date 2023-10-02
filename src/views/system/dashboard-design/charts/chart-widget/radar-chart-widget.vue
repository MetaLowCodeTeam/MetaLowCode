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
    name: "radarChart-widget",
});
let option = reactive({
    grid: {
        left: "3%",
        right: "4%",
        top: "5%",
        containLabel: true,
    },
    radar: {
        indicator: [
            { name: "Sales" },
            { name: "Administration" },
            { name: "Information Technology" },
            { name: "Customer Support" },
            { name: "Development" },
            { name: "Marketing" },
        ],
    },
    series: [
        {
            name: "Budget vs spending",
            type: "radar",
            data: [
                {
                    value: [4200, 3000, 20000, 35000, 50000, 18000],
                    name: "Allocated Budget",
                },
                {
                    value: [5000, 14000, 28000, 26000, 42000, 21000],
                    name: "Actual Spending",
                },
            ],
        },
    ],
});
</script>
