<template>
    <myEcharts
        :isShowEmpty="isShowEmpty"
        :option="option"
        :field="field"
        :designer="designer"
        v-loading="loading"
    />
</template>

<script setup>
import myEcharts from "@/components/scEcharts/chart-widget.vue";
import { onMounted, reactive, ref, watch, inject } from "vue";
import { queryChartData } from "@/api/chart";
import { getPreviewNum } from "@/utils/util";
import useChartSourceData from "@/hooks/ChartSourceData";
const { getDataSourceData } = useChartSourceData();
const getFormConfig = inject('getFormConfig');
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
        // top: "20%",
        containLabel: true,
    },
    isNoData: true,
    tooltip: {
        trigger: "item",
    },
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
let loading = ref(false);
let isShowEmpty = ref(false);
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

const initOption = async () => {
    let { options, type } = cutField.value;
    let { dsEnabled, dsName, dataSetName } = options;
    if(dsEnabled && dsName) {
        loading.value = true;
        let res = await getDataSourceData(options, getFormConfig()); 
        if(res) {
            let resData = dataSetName ? res[dataSetName] : res;
            if(!resData.length) {
                option.isNoData = true;
                loading.value = false;
                return;
            }
            option.tooltip.formatter = (e) => {
                let other = e.data.other;
                let result = "";
                for (const key in other) {
                    if (other.hasOwnProperty(key)) {
                        result += e.name + "<br />" + key + "：" + other[key] + "\n";
                    }
                }
                result = result.trim();
                return result;
            };
            formatData(options, resData)
        }
        loading.value = false;
        option.isNoData = false;
        return;
    }
    if (options) {
        let { dimension, metrics } = options.setDimensional;
        if (dimension.length < 1 || metrics.length < 1) {
            option.isNoData = true;
            return;
        }
        let { showDecimalPlaces, decimalPlaces, thousandsSeparator } =
            metrics[0];
        let { chartStyle } = cutField.value.options;
        option.tooltip.formatter = (e) => {
            return (
                e.name + "：" + getPreviewNum(showDecimalPlaces,decimalPlaces,thousandsSeparator,e.value) + " (" + e.percent + "%)"
            );
        };
        option.series[0].radius = chartStyle == 1 ? "60%" : ["40%", "60%"];
        getChartData(options, type);
        option.isNoData = false;
    } else {
        option.isNoData = true;
    }
};
const getChartData = async (options, type) => {
    loading.value = true;
    let res = await queryChartData(options, type);
    if (res && res.data && res.data.length > 0) {
        formatData(options, res.data);
        isShowEmpty.value = false;
    } else {
        isShowEmpty.value = true;
    }
    loading.value = false;
};

const formatData = (options, data) => {
    let { setChartConf } = options;
    // 图例是否显示
    option.legend = {
        show: setChartConf.chartShow,
        bottom: 5,
    };
    option.grid.bottom = setChartConf.chartShow ? "60px" : "10px";
    option.series[0].data = data;
    option.series[0].label = {
        show: setChartConf.numShow,
        formatter: function (param) {
            return param.value;
        },
        position: "inside",
    };
}

const getData = () => {
    return option;
}
defineExpose({
    getData
})
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
