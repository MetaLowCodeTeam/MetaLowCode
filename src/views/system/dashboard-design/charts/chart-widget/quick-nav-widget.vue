<template>
    <div class="pivot-table-widget" @click.stop="setSelected" v-loading="loading">
        <div class="no-data">
            请通过右侧
            <span class="lh">维度指标设置</span> 维度、指标栏来添加数据
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { queryChartData } from "@/api/chart";
defineOptions({
    name: "quickNav-widget",
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
        console.log("有变化")
        initOption();
    },
    { deep: true }
);
onMounted(() => {
    cutField.value = props.field;
    console.log("初始化")
    initOption();
});

const initOption = ()=>{
    console.log(cutField.value);
}


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
                margin-right: 5px;
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
