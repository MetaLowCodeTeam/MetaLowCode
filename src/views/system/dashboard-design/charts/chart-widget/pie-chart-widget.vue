

<style>
</style>

<template>
    <div class="bar-chart" v-resize="handleResize">
        <scEcharts class="chart" ref="scEchartsRefs" :option="option"></scEcharts>
    </div>
</template>
<script setup>
import scEcharts from "@/components/scEcharts/index.vue";
import { reactive, ref } from "vue";

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
    series: [
        {
            name: "Access From",
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
let scEchartsRefs = ref();
const handleResize = () => {
    scEchartsRefs.value.myChart?.resize();
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