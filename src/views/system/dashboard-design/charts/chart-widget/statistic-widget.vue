<template>
	<div
		class="pivot-table-widget"
		@click.stop="setSelected"
		v-loading="loading"
		:class="cutField?.options?.customClass"
	>
		<div
			class="statistic-box"
			:style="{ color: cutField?.options.setChartStyle.useTextColor }"
			v-if="!isNoData"
		>
			<div class="statistic-metrics yichu" :title="metricsNum">
				<span
					class="sub-text"
					:style="{
						'font-size':
							cutField?.options.setChartStyle.currencySymbolSize +
							'px',
					}"
					>{{ cutField?.options.setChartStyle.currencySymbol }}</span
				>
				<span>{{ metricsNum }}</span>
				<span class="sub" v-if="numericUnits">{{ numericUnits }}</span>
			</div>
		</div>
		<div class="no-data" v-else>
			请通过右侧
			<span class="lh">维度指标设置</span> 维度、指标栏来添加数据
		</div>
	</div>
</template>
<script setup>
import { ref, watchEffect } from "vue";
import { queryChartData } from "@/api/chart";
defineOptions({
	name: "statistic-widget",
});
const props = defineProps({
	field: Object,
	designer: Object,
});
let cutField = ref({});
let isNoData = ref(true);
let loading = ref(false);

// 数字量级
let numericUnits = ref("");

let metricsNum = ref("");
const initOption = async () => {
	let { options, type } = cutField.value;
	if (options) {
		let { metrics } = options.setDimensional;
		if (metrics.length < 1) {
			isNoData.value = true;
			return;
		}
		isNoData.value = false;
		numericUnits.value =
			metrics[0].numericUnits == "无" ? "" : metrics[0].numericUnits;
		await getChartData(options, type);
		getPreviewNum(metrics[0]);
	} else {
		isNoData.value = true;
	}
};

const getChartData = async (options, type) => {
	loading.value = true;
	let res = await queryChartData(options, type);
	if (res && res.data) {
		metricsNum.value = res.data.data || 0;
	}
	loading.value = false;
};

// 效果预览
const getPreviewNum = (conf) => {
	let { thousandsSeparator, showDecimalPlaces, decimalPlaces } = conf;
	if (showDecimalPlaces) {
		metricsNum.value = Number(metricsNum.value).toFixed(decimalPlaces);
	}
	if (thousandsSeparator) {
		metricsNum.value = numberToCurrencyNo(metricsNum.value);
	}
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
    // initOption();
};

watchEffect(() => {
	cutField.value = props.field;
	initOption();
});
</script>
<style lang="scss" scoped>
.pivot-table-widget {
	width: 100%;
	height: 100%;
	.statistic-box {
		// width: 10;
		height: 100%;
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		.statistic-dimension {
			font-size: 5cqw;
		}
		.statistic-metrics {
			font-size: 15cqw;
			font-weight: bold;
			padding: 0 20px;
			.sub-text {
				margin-right: 5px;
			}
			.sub {
				font-size: 14px;
				margin-left: 5px;
			}
		}
	}
}
.no-data {
	font-size: 14px;
	.lh {
		color: var(--el-color-primary);
	}
}
</style>
