<template>
    <myEcharts
        :option="myOption"
        :field="field"
        :designer="designer"
        v-if="props.field.options.chartStyle !=2 || myOption.isNoData"
        v-loading="loading"
    />
    <div class="bar-progress" @click.stop="setSelected" v-loading="loading" v-else>
        <el-progress
            :text-inside="true"
            :stroke-width="36"
            :percentage="percentage"
            :format="formatText"
            style="width: 100%;"
        />
    </div>
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
    name: "progressbar-widget",
});

let cutField = ref("");
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
let donutChartOption = reactive({
    title: {
        text: "30%",
        x: "center",
        y: "center",
        textStyle: {
            fontWeight: "normal",
            color: "#29EEF3",
            fontSize: "15",
        },
    },
    legend: {
        show: false,
        bottom: 0,
    },
    grid: {
        containLabel: true,
    },
    tooltip: {
        formatter: function (params) {
            return params.name + "：" + params.percent + " %";
        },
    },
    series: [
        {
            name: "circle",
            type: "pie",
            radius: ["70%", "86%"],
            itemStyle: {
                label: {
                    show: false,
                },
                labelLine: {
                    show: false,
                },
            },
            data: [
                {
                    value: 30,
                    name: "占比",
                    itemStyle: {
                        color: {
                            // 颜色渐变
                            colorStops: [
                                {
                                    offset: 0,
                                    color: "#4FADFD", // 0% 处的颜色
                                },
                                {
                                    offset: 1,
                                    color: "#28E8FA", // 100% 处的颜色1
                                },
                            ],
                        },
                        label: {
                            show: false,
                        },
                        labelLine: {
                            show: false,
                        },
                    },
                    label: {
                        show: false,
                    },
                },
                {
                    name: "剩余",
                    value: 70,
                    itemStyle: {
                        color: "#E1E8EE",
                    },
                    label: {
                        show: false,
                    },
                },
            ],
        },
    ],
});

let wavesChart = reactive({
    title: {
        show: true,
        text: "进度",
        x: "48%",
        y: "50%",
        z: 10,
        textAlign: "center",
        textStyle: {
            color: "#ffffff",
            fontSize: 15,
            fontWeight: 500,
        },
    },
    grid: {
        containLabel: true,
    },
    legend: {
        show: false,
        bottom: 0,
    },
    series: [
        {
            type: "liquidFill", //水位图
            radius: "90%", //显示比例
            center: ["50%", "50%"], //中心点
            amplitude: 10, //水波振幅
            data: [0.1, 0.1, 0.1], // data个数代表波浪数
            color: [
                {
                    type: "linear",
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                        {
                            offset: 0,
                            color: "#446bf5",
                        },
                        {
                            offset: 1,
                            color: "#2ca3e2",
                        },
                    ],
                    globalCoord: false,
                },
            ], //波浪颜色
            backgroundStyle: {
                borderWidth: 1, //外边框
                // borderColor: '#23cc72', //边框颜色
                color: "RGBA(51, 66, 127, 0.7)", //边框内部填充部分颜色
            },
            label: {
                //标签设置
                position: ["50%", "45%"],
                formatter: "10%", //显示文本,
                fontSize: "20px", //文本字号,
                color: "#fff",
            },
            outline: {
                // show: false
                borderDistance: 0,
                itemStyle: {
                    borderWidth: 2,
                    borderColor: "#112165",
                },
            },
        },
    ],
});

let myOption = ref({});
// 进度条当前进度 %
let percentage = ref();
// 进度条文本
let progressText = ref("");
let loading = ref(false);
const initOption = () => {
    let { options } = cutField.value;
    if (options) {
        let { setDimensional } = options;
        let { metrics } = setDimensional;
        //
        if (metrics.length < 1) {
            myOption.value.isNoData = true;
            return;
        }

        getChartData(options);
        myOption.value.isNoData = false;
    } else {
        myOption.value.isNoData = true;
    }
};
const getChartData = async (options) => {
    loading.value = true;
    let res = await queryChartData(options);
    if (res && res.data) {
        let { chartStyle, setDimensional, setChartConf } = options;
        let { targetValue, metrics } = setDimensional;
        myOption.value = chartStyle == 1 ? donutChartOption : wavesChart;
        let maxNum = targetValue || 1;
        let cutNum = res.data.data;
        let point = Math.round((cutNum / maxNum) * 100);

        percentage.value = point;
        progressText.value = setChartConf.numShow ? metrics[0].alias : null;
        // 图例是否显示
        myOption.value.legend.show = setChartConf.chartShow;

        if (chartStyle == 1) {
            myOption.value.title.text = `${point}%`;
            myOption.value.series[0].data[0].value = cutNum;
            myOption.value.series[0].data[0].name =
                metrics[0].alias + "：" + cutNum;
            myOption.value.series[0].data[1].value = maxNum - cutNum;
            myOption.value.series[0].data[1].name =
                "剩余：" + (maxNum - cutNum);
            myOption.value.series[0].data[0].label.show = setChartConf.numShow;
            myOption.value.series[0].data[1].label.show = setChartConf.numShow;
        } else {
            myOption.value.series[0].data = [
                point / 100,
                point / 100,
                point / 100,
            ];
            myOption.value.series[0].label.formatter = point + "%";
            myOption.value.title.text = metrics[0].alias;
            myOption.value.title.show = setChartConf.numShow;
            myOption.value.series[0].label.show = setChartConf.numShow;
        }
    }
    loading.value = false;
};

// 格式化进度条显示文字
const formatText = (num) => {
    return progressText.value ? progressText.value + " " + num + "%" : "";
};
const setSelected = () => {
    props.designer?.setSelected(props.field);
};
</script>
<style lang="scss" scoped>
.bar-progress {
    display: flex;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>