<template>
    <!--  -->
    <mlSetConditions
        v-if="entityCode"
        ref="mlSetConditionsRef"
        v-model="conditionConf"
        :entityName="entityCode"
    />
</template>

<script setup>
import { onMounted, ref, reactive } from "vue";
import { useRouter } from "vue-router";
const Router = useRouter();
const props = defineProps({
    formData: { Type: Object, default: () => {} },
});

let myFormData = ref({
    // 发起条件
    filter: {
        equation: "",
        items: [],
    },
});

let entityCode = ref("");

let conditionConf = reactive({});

onMounted(() => {
    entityCode.value = Router.currentRoute.value.query.entityCode;
    myFormData.value = Object.assign(myFormData.value, props.formData);
    console.log(myFormData.value, "myFormData.value");
    let { filter } = { ...myFormData.value };
    conditionConf = initFilter(filter);
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
    mlSetConditionsRef.value.checkConditionList(true)
};

/**
 * 结束 获取数据
 */
const getFormData = () => {
    checkConditionList();
    return { ...myFormData.value };
};

defineExpose({
    getFormData
});
</script>
<style lang='scss' scoped>

</style>