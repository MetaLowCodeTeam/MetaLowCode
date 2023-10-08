<template>
    <el-form-item label="图表数据实体">
        <el-select
            v-model="optionModel.dataEntity"
            filterable
            placeholder="选择实体"
            @change="changeEntity"
        >
            <el-option
                :label="op.label"
                :value="op.entityCode"
                v-for="(op,inx) of approveDialogEntityList"
                :key="inx"
            />
        </el-select>
    </el-form-item>
</template>
<script setup>
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { approveDialogEntityList } = storeToRefs(useCommonStore());
import { ref, watch, onMounted } from "vue";
defineOptions({
    name: "dataEntity-editor",
});

const props = defineProps({
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
});
const emits = defineEmits(["update:optionModel"]);
let myOption = ref({});
watch(
    () => props.optionModel,
    () => {
        initchartStyle();
    },
    { deep: true }
);
onMounted(() => {
    initchartStyle();
});

// 初始化图表样式
const initchartStyle = () => {
    myOption.value = { ...props.optionModel };
};
const changeEntity = () => {
    myOption.value.setDimensional.dimension = [];
    myOption.value.setDimensional.metrics = [];
    myOption.value.setDimensional.targetValue = 1;
    myOption.value.setDimensional.showFields = [];
    myOption.value.setDimensional.dimensionRow = [];
    myOption.value.setDimensional.dimensionCol = [];
};
</script>
<style lang="scss" scoped>
</style>
