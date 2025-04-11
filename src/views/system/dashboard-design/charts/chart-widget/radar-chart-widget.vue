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
    name: "radarChart-widget",
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
    grid: {
        left: "3%",
        right: "4%",
        top: "5%",
        containLabel: true,
    },
    tooltip: {
        trigger: "item",
    },
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
let units = ref({});
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
        metrics.forEach((el) => {
            units.value[el.fieldLabel] = {
                showDecimalPlaces: el.showDecimalPlaces,
                decimalPlaces: el.decimalPlaces,
                thousandsSeparator: el.thousandsSeparator,
                numericUnits: el.numericUnits == "无" ? "" : el.numericUnits,
            };
        });
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
    } else {
        isShowEmpty.value = true;
    }
    loading.value = false;
};

const formatData = (options, resData) => {
    let { setChartConf } = options;
    // 图例是否显示
    option.legend = {
        show: setChartConf.chartShow,
        bottom: 5,
    };
    option.grid.bottom = setChartConf.chartShow ? "60px" : "10px";
    option.series[0] = {
        type: "radar",
        data: resData.series.map((el) => {
            return {
                value: el.data,
                name: el.name,
            };
        }),
    };
    let xAxis = resData.xAxis;
    let { dimension, metrics } = options.setDimensional;
    if (metrics.length > 1 && dimension.length == 1) {
        option.tooltip.formatter = (e) => {
            let {
                showDecimalPlaces,
                decimalPlaces,
                thousandsSeparator,
                numericUnits,
            } = units.value[e.name];
            let formatterStr = [];
            e.data.value.forEach((el, inx) => {
                formatterStr.push(
                    xAxis[inx] +
                        "：" +
                        getPreviewNum(
                            showDecimalPlaces,
                            decimalPlaces,
                            thousandsSeparator,
                            el
                        ) +
                        numericUnits
                );
            });
            formatterStr = formatterStr.join("<br />");
            return e.name + "<br />" + formatterStr;
        };
    }else { 
        option.tooltip.formatter = ""
    }

    option.radar.indicator = resData.xAxis.map((el) => {
        return {
            name: el,
        };
    });
}

const getData = () => {
    return option;
}
defineExpose({
    getData
})
</script>
