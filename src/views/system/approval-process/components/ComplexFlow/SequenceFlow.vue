<template>
    <!--  -->
    <el-collapse v-model="activeNames">
        <el-collapse-item name="1">
            <template #title>
                <h3>审批设置</h3>
            </template>
            <mlSetConditions
                v-if="entityCode"
                ref="mlSetConditionsRef"
                v-model="conditionConf"
                :entityName="entityCode"
            />
        </el-collapse-item>
    </el-collapse>
</template>

<script setup>
import { onMounted, ref, reactive, watch } from "vue";
import { useRouter } from "vue-router";
const Router = useRouter();
const props = defineProps({
    formData: { Type: Object, default: () => {} },
});
const activeNames = ref(["1"]);
let myFormData = ref({
    // 发起条件
    filter: {
        equation: "",
        items: [],
    },
});

watch(
    () => props.formData,
    () => {
        myFormData.value = Object.assign(myFormData.value, props.formData);
        let { filter } = JSON.parse(JSON.stringify(myFormData.value))
        conditionConf.value = initFilter(filter);
    },
    { deep: true }
);

let entityCode = ref("");

let conditionConf = ref({});

onMounted(() => {
    entityCode.value = Router.currentRoute.value.query.entityCode;
    myFormData.value = Object.assign(myFormData.value, props.formData);
    let { filter } = JSON.parse(JSON.stringify(myFormData.value));
    conditionConf.value = initFilter(filter);
});
const initFilter = (filter) => {
    let { equation } = filter;
    if (!equation || equation === "OR") {
        filter.type = 1;
        filter.equation = "OR";
    } else if (equation === "AND") {
        filter.type = 2;
        filter.equation = "AND";
    } else {
        filter.type = 3;
    }
    return filter;
};

let mlSetConditionsRef = ref("");
const checkConditionList = () => {
    mlSetConditionsRef.value.checkConditionList(true);
};

/**
 * 结束 获取数据
 */
const getFormData = () => {
    checkConditionList();
    return { ...myFormData.value };
};

defineExpose({
    getFormData,
});
</script>
<style lang='scss' scoped>
</style>