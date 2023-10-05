<template>
    <el-form-item label="过滤条件">
        <el-button @click="setCondition" v-if="getSetConditionText() == '点击设置'">点击设置</el-button>
        <div class="ml-a-span" @click="setCondition" v-else>{{ getSetConditionText() }}</div>
    </el-form-item>
    <mlDialog title="过滤条件" append-to-body width="37%" v-model="dialogIsShow">
        <mlSetConditions
            v-model="conditionConf"
            footer
            @cancel="dialogIsShow = false"
            @confirm="conditionConfirm"
            :entityName="cutOption.dataEntity"
        />
    </mlDialog>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
defineOptions({
    name: "setChartFilter-editor",
});
const props = defineProps({
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
});
const emits = defineEmits(["update:optionModel"]);
let cutOption = ref({});
watch(
    () => props.optionModel,
    () => {
        cutOption.value = props.optionModel;
    },
    { deep: true }
);
onMounted(() => {
    cutOption.value = props.optionModel;
});

/***
 *  ****************************************** 过滤条件相关 beg
 */

let conditionConf = ref({});
let dialogIsShow = ref(false);
// 设置条件
const setCondition = () => {
    let actionFilter = initFilter({ ...cutOption.value?.setChartFilter });
    conditionConf.value = JSON.parse(JSON.stringify(actionFilter));
    dialogIsShow.value = true;
};
// 初始化条件
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

// 获取设置条件文案
const getSetConditionText = () => {
    let actionFilter = { ...cutOption.value?.setChartFilter };
    let length =
        actionFilter && actionFilter?.items ? actionFilter?.items.length : 0;
    return length > 0 ? `已设置条件（${length}）` : "点击设置";
};

// 确认设置条件
const conditionConfirm = (e) => {
    cutOption.value.setChartFilter = Object.assign({}, e);
    dialogIsShow.value = false;
    emit("update:optionModel", cutOption.value);
};

/***
 *  ****************************************** 过滤条件相关 end
 */
</script>
<style lang="scss" scoped>
</style>
