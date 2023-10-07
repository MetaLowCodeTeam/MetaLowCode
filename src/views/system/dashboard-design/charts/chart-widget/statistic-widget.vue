<template>
    <div class="pivot-table-widget" @click.stop="setSelected" v-loading="loading">
        <div
            class="statistic-box"
            :style="{'color':cutField?.options.setChartStyle.useTextColor}"
            v-if="!isNoData"
        >
            <div class="statistic-dimension" v-if="dimensionName">{{ dimensionName }}</div>
            <div class="statistic-metrics yichu" :title="metricsNum">
                <span
                    class="sub-text"
                    :style="{'font-size':cutField?.options.setChartStyle.currencySymbolSize + 'px'}"
                >{{ cutField?.options.setChartStyle.currencySymbol }}</span>
                <span>{{ metricsNum }}</span>
            </div>
        </div>
        <div class="no-data" v-else>
            请通过右侧
            <span class="lh">维度指标设置</span> 维度、指标栏来添加数据
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
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

let dimensionName = ref("");
let metricsNum = ref("");
const initOption = () => {
    let { options } = cutField.value;
    if (options) {
        let { metrics } = options.setDimensional;
        if (metrics.length < 1) {
            isNoData.value = true;
            return;
        }

        isNoData.value = false;

        getChartData(options);
    } else {
        isNoData.value = true;
    }
};

const getChartData = async (options) => {
    loading.value = true;
    let res = await queryChartData(options);
    if (res) {
        metricsNum.value = res.data.data;
    }
    loading.value = false;
};

// 效果预览
const getPreviewNum = (item) => {
    let { thousandsSeparator, showDecimalPlaces, decimalPlaces } = item;
    let previewStr = item.num;
    if (showDecimalPlaces) {
        previewStr = Number(previewStr).toFixed(decimalPlaces);
    }
    if (thousandsSeparator) {
        previewStr = numberToCurrencyNo(previewStr);
    }
    return previewStr;
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
    // localStorage.setItem("widget__list__selected", JSON.stringify(props.field));
};
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
                position: relative;
                top: -5px;
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
