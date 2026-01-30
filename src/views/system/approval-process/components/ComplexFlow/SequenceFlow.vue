<template>
    <!-- 线节点 -->
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
                enableSql
                :enableSavePlanQuery="false"
                :enableAdd="false"
            />
        </el-collapse-item>
    </el-collapse>
</template>

<script setup>
import { onMounted, ref, reactive, watch, watchEffect} from "vue";
import { useRouter } from "vue-router";
import { formatFilterConditions } from "@/utils/util";
import useCommonStore from "@/store/modules/common";
const { queryEntityNameByCode } = useCommonStore();
const Router = useRouter();
const props = defineProps({
    formData: { Type: Object, default: () => {} },
});
const emits = defineEmits(["setNodeData"]);
const activeNames = ref(["1"]);
let myFormData = ref({
    // 发起条件
    filter: {
        equation: "",
        items: [],
    },
    // 实体名称
    entityName: "",
});

let conditionConf = ref({});

watch(
    () => props.formData,
    () => {
        myFormData.value = Object.assign(myFormData.value, props.formData);
        let { filter } = JSON.parse(JSON.stringify(myFormData.value));
        conditionConf.value = initFilter(filter);
    },
    { deep: true }
);

let entityCode = ref("");
let entityName = ref("");

onMounted(() => {
    entityCode.value = Router.currentRoute.value.query.entityCode;
    entityName.value = queryEntityNameByCode(entityCode.value);
    myFormData.value = Object.assign(myFormData.value, props.formData);
    let { filter } = JSON.parse(JSON.stringify(myFormData.value));
    conditionConf.value = initFilter(filter);
});

watch(
    () => conditionConf.value,
    () => {
        // console.log(conditionConf.value,'conditionConf.value')
        // if(conditionConf.value.items) {
        //     conditionConf.value.items = formatFilterConditions(JSON.parse(JSON.stringify(conditionConf.value.items)), entityCode.value);
        // }
        // console.log(props.entityName,'props.entityName')
        let { equation, items, type } = conditionConf.value;
        emits("setNodeData", { filter: {
            equation,
            items: formatFilterConditions(JSON.parse(JSON.stringify(items)), entityName.value),
            type,
        } });
    },
    { deep: true }
);




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