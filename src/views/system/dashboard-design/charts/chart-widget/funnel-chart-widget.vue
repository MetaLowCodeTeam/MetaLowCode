<template>
    <myEcharts
        :isShowEmpty="dataList.length < 1"
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
    name: "funnelChart-widget",
});
let option = reactive({
    grid: {
        left: "3%",
        right: "4%",
        top: "5%",
        containLabel: true,
    },
    isNoData: true,
    tooltip: {
        trigger: "item",
    },
    series: [
        {
            type: "funnel",
            left: "10%",
            top: 60,
            bottom: 60,
            width: "80%",
            minSize: "0%",
            maxSize: "100%",
            sort: "descending",
            gap: 2,
            label: {
                show: true,
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
            data: [],
        },
    ],
});
let cutField = ref("");
let loading = ref(false);
let dataList = ref([]);
let units = ref({});
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
            formatData(options, resData)
        }
        loading.value = false;
        option.isNoData = false;
        return;
    }
    if (options) {
        let { metrics } = options.setDimensional;
        if (metrics.length < 1) {
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
    dataList.value = [];
    let res = await queryChartData(options, type);
    if (res && res.data) {
        formatData(options, res.data);
        loading.value = false;
    } else {
        loading.value = false;
    }
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
    dataList.value = data || [];
    if (dataList.value.length > 0) {
        option.tooltip.formatter = (e) => {
            let other = e.data.other;
            let formatterStr = [];
            for (const key in other) {
                if(units.value[key]) {
                    if (Object.hasOwnProperty.call(other, key)) {
                        const element = other[key];
                        let {
                            showDecimalPlaces,
                            decimalPlaces,
                            thousandsSeparator,
                            numericUnits,
                        } = units.value[key];
                        formatterStr.push(key + "：" + getPreviewNum(showDecimalPlaces,decimalPlaces,thousandsSeparator,element) + numericUnits);
                    }
                }else {
                    formatterStr.push(key + "：" + other[key]);
                }
            }
            formatterStr = formatterStr.join("<br />");
            return e.name + "<br />" + formatterStr;
        };
    }

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


