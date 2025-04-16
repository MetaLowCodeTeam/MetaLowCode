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
import useChartSourceData from "@/hooks/ChartSourceData";
const { getDataSourceData } = useChartSourceData();
const getFormConfig = inject('getFormConfig');
import { useRefreshDashboard } from '@/hooks/useRefreshDashboard';
const props = defineProps({
    field: Object,
    designer: Object,
});
defineOptions({
    name: "lineChart-widget",
});

let loading = ref(false);
let cutField = ref("");
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
let option = reactive({
    isNoData: true,
    tooltip: {
        trigger: "axis",
    },
    grid: {
        left: "3%",
        right: "4%",
        top: "5%",
        containLabel: true,
    },
    xAxis: {
        type: "category",
        data: [],
    },
    yAxis: {
        type: "value",
    },
    series: [
        {
            data: [],
            type: "line",
        },
    ],
});

const initOption = async () => {
    let { options, type } = cutField.value;
    let { dsEnabled, dsName, dataSetName } = options;
    if(dsEnabled && dsName) {
        loading.value = true;
        let res = await getDataSourceData(options, getFormConfig()); 
        if(res) {
            let resData = dataSetName ? res[dataSetName] : res;
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
        getChartData(options, type);
        option.isNoData = false;
    } else {
        option.isNoData = true;
    }
};

const getChartData = async (options, type) => {
    loading.value = true;
    let res = await queryChartData(options, type);
    if (res && res.data) {
        formatData(options, res.data);
        isShowEmpty.value = false;
    } else {
        isShowEmpty.value = true;
    }
    loading.value = false;
};

const formatData = (options, data) => {
    let { chartStyle, setChartConf, axisCoordinates } = options;
    // 如果设置了Y轴最大值
    if (axisCoordinates.max > 0) {
        option.yAxis.min = axisCoordinates.min;
        option.yAxis.max = axisCoordinates.max;
    } else {
        option.yAxis = {
            type: "value",
        };
    }
    // 图例是否显示
    option.legend = {
        show: setChartConf.chartShow,
        bottom: 5,
    };
    option.grid.bottom = setChartConf.chartShow ? "50px" : "10px";
    option.xAxis.data = [...data.xAxis];
    option.series = data.series.map((el) => {
        el.type = "line";
        el.smooth = chartStyle == 2;
        // 数值是否展示
        el.label = {
            show: setChartConf.numShow,
            position: "top",
        };
        return el;
    });
}

// 监听mitt事件触发
useRefreshDashboard(props, initOption);

const getData = () => {
    return option;
}
defineExpose({
    getData
})
</script>


