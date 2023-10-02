<template>
    <div class="bar-chart" v-resize="handleResize">
        <scEcharts class="chart" ref="scEchartsRefs" :option="option"></scEcharts>
    </div>
    <!--  -->
</template>

<script setup>
import scEcharts from "@/components/scEcharts/index.vue";
import { reactive, ref } from "vue";

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
let scEchartsRefs = ref();
const handleResize = () => {
    scEchartsRefs.value.myChart.resize();
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