<template>
    <div 
        class="bar-chart" 
        v-resize="handleResize" 
        @click.stop="setSelected"
        :class="field?.options?.customClass"
    >
        <template v-if="isShowEmpty">
            <div class="empty-div">
                <span>暂无数据</span>
            </div>
        </template>
        <template v-else>
            <scEcharts
                class="chart"
                ref="scEchartsRefs"
                :option="myOption"
                v-if="!myOption.isNoData"
            ></scEcharts>
            <div class="no-data" v-else>
                请通过右侧
                <span class="lh">维度指标设置</span> 维度、指标栏来添加数据
            </div>
        </template>
    </div>
</template>

<script setup>
import scEcharts from "./index.vue";
import { reactive, ref, watch, onMounted } from "vue";
const props = defineProps({
    option: Object,
    field: Object,
    designer: Object,
    isShowEmpty: { type: Boolean, default: false },
});

let myOption = ref({
    isNoData: true,
});

watch(
    () => props.option,
    () => {
        myOption.value = props.option;
    },
    { deep: true }
);
onMounted(() => {
    myOption.value = props.option;
});
let scEchartsRefs = ref();
const handleResize = () => {
    if (!myOption.value.isNoData) {
        scEchartsRefs.value.myChart?.resize();
    }
};
const setSelected = () => {
    props.designer?.setSelected(props.field);
};
</script>
<style lang="scss" scoped>
.bar-chart {
    width: 100%;
    height: 100%;
    .chart {
        width: 100%;
        height: 100%;
    }
}
.no-data {
    font-size: 14px;
    .lh {
        color: var(--el-color-primary);
    }
}
.empty-div {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    container-type: inline-size;
    span {
        font-size: 8cqw;
        color: var(--el-text-color-secondary);
    }
}
</style>