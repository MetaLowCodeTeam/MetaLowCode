<template>
    <myEcharts
        :option="myOption"
        :field="field"
        :designer="designer"
        v-if="props.field.options.chartStyls !=2 || myOption.isNoData"
    />
    <div class="bar-progress" @click.stop="setSelected" v-else>
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
                },
                {
                    name: "剩余",
                    value: 70,
                    itemStyle: {
                        color: "#E1E8EE",
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
const initOption = () => {
    let { options } = cutField.value;
    if (options) {
        let { chartStyls, setDimensional } = options;
        let { metrics, targetValue } = setDimensional;
        myOption.value = chartStyls == 1 ? donutChartOption : wavesChart;
        if (metrics.length < 1 || targetValue.length < 1) {
            myOption.value.isNoData = true;
            return;
        }
        let maxNum = targetValue[0]?.num || 100;
        let cutNum = metrics[0]?.num || 66;
        let point = Math.round((cutNum / maxNum) * 100);
        percentage.value = point;
        progressText.value = metrics[0].alias;
        if (chartStyls == 1) {
            myOption.value.title.text = `${point}%`;
            myOption.value.series[0].data[0].value = cutNum;
            myOption.value.series[0].data[0].name = metrics[0].alias;
            myOption.value.series[0].data[1].value = maxNum - cutNum;
        } else {
            myOption.value.series[0].data = [
                point / 100,
                point / 100,
                point / 100,
            ];
            myOption.value.series[0].label.formatter = point + "%";
            myOption.value.title.text = metrics[0].alias;
        }
        myOption.value.isNoData = false;
    } else {
        myOption.value.isNoData = true;
    }
};
// 格式化进度条显示文字
const formatText = (num) => {
    return progressText.value + " " + num + "%";
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