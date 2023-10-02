<template>
    <div class="bar-chart" v-resize="handleResize" @click.stop="setSelected">
        <scEcharts class="chart" ref="scEchartsRefs" :option="myOption"></scEcharts>
    </div>
    <!--  -->
</template>

<script setup>
import scEcharts from "./index.vue";
import { reactive, ref, watch, onMounted } from "vue";
const props = defineProps({
    option: Object,
    field: Object,
    designer: Object,
});

let myOption = ref();

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
</style>