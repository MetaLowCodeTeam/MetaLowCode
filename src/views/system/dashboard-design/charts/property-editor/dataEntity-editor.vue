<template>
    <el-form-item label="图表数据实体" v-if="!optionModel.dsEnabled">
        <el-select
            v-model="optionModel.dataEntity"
            filterable
            placeholder="选择实体"
            @change="changeEntity"
            :disabled="!designer.selectedId"
            filter
        >
            <el-option
                :label="op.label"
                :value="op.entityCode"
                v-for="(op,inx) of currentEntityList"
                :key="inx"
            />
        </el-select>
    </el-form-item>
</template>
<script setup>
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { useRouter } from 'vue-router';
const router = useRouter();
// const { allEntityList } = storeToRefs(useCommonStore());
const { queryAllEntityList } = useCommonStore();
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
        initChartStyle();
    },
    { deep: true }
);
onMounted(() => {
    initChartStyle();
});

let currentEntityList = ref("");

// 初始化图表样式
const initChartStyle = () => {
    myOption.value = { ...props.optionModel };
    currentEntityList.value = queryAllEntityList(false, router.currentRoute.value.query.appAbbr);
    currentEntityList.value.unshift({
        label: "审批任务",
        name: "ApprovalTask",
        entityCode: 33,
    });
};
const changeEntity = () => {
    myOption.value.setDimensional.dimension = [];
    myOption.value.setDimensional.metrics = [];
    myOption.value.setDimensional.targetValue = 1;
    myOption.value.setDimensional.showFields = [];
    myOption.value.setDimensional.dimensionRow = [];
    myOption.value.setDimensional.dimensionCol = [];
    myOption.value.setChartFilter = {
        equation: "OR",
        items: [],
    };
    emits("update:optionModel", myOption.value);
};
</script>
<style lang="scss" scoped>
</style>
