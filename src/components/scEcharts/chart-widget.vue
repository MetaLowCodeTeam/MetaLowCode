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
import { reactive, ref, watch, onMounted, defineAsyncComponent } from "vue";

// 异步加载 scEcharts 组件
const scEcharts = defineAsyncComponent({
    loader: () => import("./index.vue"),
    loadingComponent: {
        template: `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #999; border: 1px dashed #d9d9d9; border-radius: 4px;">
                <div v-loading="true" element-loading-text="正在加载图表组件..." style="width: 100%; height: 100%; min-height: 100px;"></div>
            </div>
        `
    },
    errorComponent: {
        template: `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border: 1px dashed #ff4d4f; border-radius: 4px;">
                <el-alert title="图表组件加载失败" type="error" description="请检查网络连接后重试" show-icon />
            </div>
        `
    },
    delay: 200,
    timeout: 30000
});
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