<template>
    <div class="pivot-table-widget" @click.stop="setSelected" v-loading="loading">
        <div
            class="statistic-box"
            :style="{'color':cutField?.options.setChartStyle.useTextColor}"
            v-if="!isNoData"
        >
            <div class="statistic-dimension" v-if="dimensionName">{{ dimensionName }}</div>
            <div class="statistic-metrics">
                <span>{{ metricsNum }}</span>
                <span class="sub-text" :style="{'font-size':cutField?.options.setChartStyle.currencySymbolSize + 'px'}">{{ cutField?.options.setChartStyle.currencySymbol }}</span>
            </div>
        </div>
        <div class="no-data" v-else>
            请通过右侧
            <span class="lh">维度指标设置</span> 维度、指标栏来添加数据
        </div>
    </div>
</template>
<script setup>
import { onMounted, reactive, ref, watch } from "vue";
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
let metricsNum = ref(0);

const initOption = () => {
    let { options } = cutField.value;
    if (options) {
        let { dimension, metrics } = options.setDimensional;
        if (metrics.length < 1) {
            isNoData.value = true;
            return;
        }
        if (dimension.length > 0) {
            dimensionName.value = dimension[0].alias;
        }

        metricsNum.value = metrics[0].num
            ? Number.isNaN(metrics[0].num)
                ? "N/A"
                : metrics[0].num
            : "N/A";
        isNoData.value = false;
    } else {
        isNoData.value = true;
    }
};

const setSelected = () => {
    props.designer?.setSelected(props.field);
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
