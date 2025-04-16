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
    name: "barChart-widget",
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
            type: "bar",
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
        let { chartStyle } = cutField.value.options;
        if (metrics.length < 2 && chartStyle != 1) {
            cutField.value.options.chartStyle = 1;
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
        formatData(options, res.data)
        isShowEmpty.value = false;
    }else{
        isShowEmpty.value = true;
    }
    loading.value = false;
};

const formatData = (options, data) => {
    option.xAxis.data = [...data.xAxis];
    let { chartStyle, setChartConf, axisCoordinates } = options;
    // 如果不是堆叠图，并且设置了Y轴最大值
    if (chartStyle != 3 && axisCoordinates.max > 0) {
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
    option.series = data.series.map((el) => {
        el.type = "bar";
        // 堆叠图
        el.stack =
            chartStyle == 1
                ? null
                : chartStyle == 2
                ? "普通堆叠"
                : "百分比堆叠";
        // 数值是否展示
        el.label = {
            show: setChartConf.numShow,
            color: "#FFF",
            formatter: function (param) {
                return param.value + (chartStyle == 3 ? "%" : "");
            },
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
