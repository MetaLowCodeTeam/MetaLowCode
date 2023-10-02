<template>
    <div class="bar-chart">
        123
    </div>
    <!-- <scEcharts height="100%" :option="option"></scEcharts> -->
</template>

<script setup>
import scEcharts from '@/components/scEcharts/index.vue'
import { reactive } from "vue";

defineOptions({
    name: "barChart-widget",
});
let option = reactive({
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
</script>
<style lang="scss" scoped>
.bar-chart {
    width: 100%;
    height: 100%;
    background: green;
}
</style>