<template>
    <el-form-item label="过滤条件">
        <el-button @click="setCondition">{{ getSetConditionText() }}</el-button>
        <!-- <div class="ml-a-span" @click="setCondition" v-else></div> -->
    </el-form-item>
    <mlDialog title="过滤条件" append-to-body width="37%" v-model="dialogIsShow">
        <mlSetConditions
            v-model="conditionConf"
            footer
            @cancel="dialogIsShow = false"
            @confirm="conditionConfirm"
            :entityName="allEntityName[cutOption.dataEntity]"
        />
    </mlDialog>
</template>
<script setup>
import { ref, watch, onMounted,inject } from "vue";
const $ElMessage = inject("$ElMessage");
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { allEntityName } = storeToRefs(useCommonStore());
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
    // console.log(cutOption,'cutOption')
});

/***
 *  ****************************************** 过滤条件相关 beg
 */

let conditionConf = ref({});
let dialogIsShow = ref(false);
// 设置条件
const setCondition = () => {
    if(!props.optionModel.dataEntity){
        $ElMessage.warning("请先选择图标数据实体")
        return
    }
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
    emits("update:optionModel", cutOption.value);
};

/***
 *  ****************************************** 过滤条件相关 end
 */
</script>
<style lang="scss" scoped>
</style>
