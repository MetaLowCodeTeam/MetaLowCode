<template>
    <div class="bar-chart" v-resize="handleResize" @click.stop="setSelected">
        <scEcharts class="chart" ref="scEchartsRefs" :option="myOption" v-if="!myOption.isNoData"></scEcharts>
        <div class="no-data" v-else>清通过维度右侧 <span class="lh">维度指标设置</span> 维度、指标栏来添加数据</div>
    </div>
</template>

<script setup>
import scEcharts from "./index.vue";
import { reactive, ref, watch, onMounted } from "vue";
const props = defineProps({
    option: Object,
    field: Object,
    designer: Object,
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
    scEchartsRefs.value.myChart?.resize();
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
</style>