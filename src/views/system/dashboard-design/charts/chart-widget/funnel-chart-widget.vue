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
import { onMounted, reactive, ref, watch } from "vue";
import { queryChartData } from "@/api/chart";
import { getPreviewNum } from "@/utils/util";
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

const initOption = () => {
    let { options, type } = cutField.value;
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
        let { setChartConf } = cutField.value.options;
        // 图例是否显示
        option.legend = {
            show: setChartConf.chartShow,
            bottom: 5,
        };
        option.grid.bottom = setChartConf.chartShow ? "60px" : "10px";
        option.series[0].data = res.data;
        dataList.value = res.data || [];
        if (dataList.value.length > 0) {
            option.tooltip.formatter = (e) => {
                let other = e.data.other;
                let formatterStr = [];
                for (const key in other) {
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
        loading.value = false;
    } else {
        loading.value = false;
    }
};

const getData = () => {
    return option;
}
defineExpose({
    getData
})
</script>


