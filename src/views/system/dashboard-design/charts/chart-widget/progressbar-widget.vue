<template>
	<myEcharts
		:isShowEmpty="isShowEmpty"
		:option="myOption"
		:field="field"
		:designer="designer"
		v-if="props.field.options.chartStyle != 2 || myOption.isNoData"
		v-loading="loading"
	/>
	<div
		class="bar-progress"
		@click.stop="setSelected"
		v-loading="loading"
        :class="cutField?.options?.customClass"
		v-else
	>
		<el-progress
			:text-inside="true"
			:stroke-width="36"
			:percentage="percentage"
			:format="formatText"
			style="width: 100%"
		/>
	</div>
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
			radius: ["30%", "50%"],
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
let percentage = ref(0);
// 实际完成进度
let metePercentage = ref(0);
// 进度条文本
let progressText = ref("");
let loading = ref(false);
let isShowEmpty = ref(false);
// 当前已完成
let cutCompleted = ref();
// 数字量级
let numericUnits = ref("");
let metricsConf = ref({});
const initOption = async () => {
	let { options, type } = cutField.value;
    let { dsEnabled, dsName, dataSetName } = options;
    if(dsEnabled && dsName) {
        loading.value = true;
        let res = await getDataSourceData(options, getFormConfig());
        if(res) {
            let resData = dataSetName ? res[dataSetName] : res;
            formatData(options, resData.value, resData.targetValue, resData.label);
        }
        loading.value = false;
        myOption.value.isNoData = false;
        return;
    }
	if (options) {
		let { setDimensional } = options;
		let { metrics } = setDimensional;
		if (metrics.length < 1) {
			myOption.value.isNoData = true;
			return;
		}
		metricsConf.value = metrics[0];
		numericUnits.value =
			metrics[0].numericUnits == "无" ? "" : metrics[0].numericUnits;
		getChartData(options, type);
		myOption.value.isNoData = false;
	} else {
		myOption.value.isNoData = true;
	}
};
const getChartData = async (options, type) => {
	loading.value = true;
	let res = await queryChartData(options, type);
	if (res && res.data) {
        formatData(options, res.data.data)
		isShowEmpty.value = false;
	} else {
		isShowEmpty.value = true;
	}
	loading.value = false;
};

// 格式化数据
const formatData = (options, cutNum, maxValue, alias) => {
    let { chartStyle, setDimensional, setChartConf } = options;
    let { targetValue, metrics } = setDimensional;
    myOption.value = chartStyle == 1 ? donutChartOption : wavesChart;
    let maxNum = maxValue || targetValue || 1;
    cutCompleted.value = cutNum;
    let point = Math.round((cutNum / maxNum) * 100);
    percentage.value = point > 100 ? 100 : point;
    metePercentage.value = point;
    let currentAlias = alias || (metrics && metrics.length > 0 ? metrics[0].alias : null);
    progressText.value = currentAlias;
    // 图例是否显示
    myOption.value.legend.show = setChartConf.chartShow;

    if (chartStyle == 1) {
        myOption.value.title.text = `${point}%`;
        myOption.value.series[0].data[0].value = cutNum;
        myOption.value.series[0].data[0].name =
            currentAlias +
            "：" +
            getPreviewNum(cutNum) +
            (numericUnits.value ? numericUnits.value : "");
        myOption.value.series[0].data[1].value = maxNum - cutNum;
        myOption.value.series[0].data[1].name =
            "剩余：" +
            getPreviewNum(maxNum - cutNum) +
            (numericUnits.value ? numericUnits.value : "");
        myOption.value.series[0].data[0].label.show = setChartConf.numShow;
        myOption.value.series[0].data[1].label.show = setChartConf.numShow;
    } else { 
        myOption.value.series[0].data = [
            point / 100,
            point / 100,
            point / 100,
        ];
        myOption.value.series[0].label.formatter = point + "%";
        myOption.value.title.text =
            currentAlias +
            "（已完成：" +
            getPreviewNum(cutCompleted.value) +
            (numericUnits.value ? numericUnits.value : "") +
            "） ";
        myOption.value.title.show = setChartConf.numShow;
        myOption.value.series[0].label.show = setChartConf.numShow;
    }
}

// 格式化进度条显示文字
const formatText = () => {
	return progressText.value
		? progressText.value +
				"（已完成：" +
				getPreviewNum(cutCompleted.value) +
				(numericUnits.value ? numericUnits.value : "") +
				"） " +
				metePercentage.value +
				"%"
		: "";
};

// 效果预览
const getPreviewNum = (val) => {
	let { thousandsSeparator, showDecimalPlaces, decimalPlaces } =
		metricsConf.value;
	let newVal = val;

	if (showDecimalPlaces) {
		newVal = Number(newVal).toFixed(decimalPlaces);
	}
	if (thousandsSeparator) {
		newVal = numberToCurrencyNo(newVal);
	}
	return newVal;
};
const numberToCurrencyNo = (value) => {
	if (!value) return 0;
	// 获取整数部分
	const intPart = Math.trunc(value);
	// 整数部分处理，增加,
	const intPartFormat = intPart
		.toString()
		.replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
	// 预定义小数部分
	let floatPart = "";
	// 将数值截取为小数部分和整数部分
	const valueArray = value.toString().split(".");
	if (valueArray.length === 2) {
		// 有小数部分
		floatPart = valueArray[1].toString(); // 取得小数部分
		return intPartFormat + "." + floatPart;
	}
	return intPartFormat + floatPart;
};

const setSelected = () => {
	props.designer?.setSelected(props.field);
};

// 监听mitt事件触发
useRefreshDashboard(props, initOption);


const getData = () => {
    return cutCompleted.value;
}
defineExpose({
    getData
})
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
