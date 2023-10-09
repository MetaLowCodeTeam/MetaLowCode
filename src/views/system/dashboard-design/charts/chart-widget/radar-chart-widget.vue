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
    name: "radarChart-widget",
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
            // name: "Budget vs spending",
            type: "radar",
            data: [
                {
                    value: ["1", "6", "6", "6", "1", "1", "3"],
                    name: "公司名称",
                },
                // {
                //     value: [5000, 14000, 28000, 26000, 42000, 21000],
                //     name: "状态2",
                // },
            ],
        },
    ],
});

const initOption = () => {
    let { options,type } = cutField.value;
    if (options) {
        let { dimension, metrics } = options.setDimensional;
        if (dimension.length < 1 || metrics.length < 1) {
            option.isNoData = true;
            return;
        }
        getChartData(options,type);
        option.isNoData = false;
    } else {
        option.isNoData = true;
    }
};
const getChartData = async (options,type) => {
    loading.value = true;
    let res = await queryChartData(options,type);
    if (res && res.data) {
        let { setChartConf } = cutField.value.options;
        // 图例是否显示
        option.legend = {
            show: setChartConf.chartShow,
            bottom: 5,
        };
        option.grid.bottom = setChartConf.chartShow ? "60px" : "10px";
        option.series[0] = {
            type: "radar",
            data: res.data.series.map((el) => {
                return {
                    value: el.data,
                    name: el.name,
                };
            }),
        };
        option.radar.indicator = res.data.xAxis.map((el) => {
            return {
                name: el,
            };
        });
    }
    loading.value = false;
};
</script>
